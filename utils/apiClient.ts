/**
 * Centralized API client with retry logic, timeout handling, caching, and circuit breaker
 * All API calls should go through this client for consistent error handling
 */

import { RETRY_CONFIG, CIRCUIT_BREAKER_CONFIG, CACHE_CONFIG } from '@/config';

// ==================== TYPES ====================

export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  validateStatus?: (status: number) => boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  source: 'network' | 'cache';
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ==================== CACHE MANAGER ====================

class CacheManager {
  private cache = new Map<string, { data: any; expires: number; size: number }>();
  private totalSize = 0;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number): void {
    const size = this.estimateSize(data);
    
    // Check if we need to evict old entries - FIXED MEMORY LEAK
    while (
      this.cache.size >= CACHE_CONFIG.maxCacheSize ||
      this.totalSize + size > CACHE_CONFIG.maxCacheSizeBytes
    ) {
      this.evictOldest();
    }

    // Delete old entry if exists
    if (this.cache.has(key)) {
      this.delete(key);
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      size,
    });
    this.totalSize += size;
    
    // Schedule cleanup for expired entries
    this.scheduleCleanup();
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestExpires = Infinity;

    // Convert to array to avoid iterator issues
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.expires < oldestExpires) {
        oldestExpires = entry.expires;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1024; // Default 1KB if can't stringify
    }
  }

  private cleanupTimer: NodeJS.Timeout | null = null;

  private scheduleCleanup(): void {
    if (this.cleanupTimer) return; // Already scheduled
    
    this.cleanupTimer = setTimeout(() => {
      this.cleanupExpiredEntries();
      this.cleanupTimer = null;
    }, 60000); // Clean up every minute
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.delete(key);
      }
    }
  }
}

// ==================== CIRCUIT BREAKER ====================

class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private nextAttempt = Date.now();
  private readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new ApiError(
          `Circuit breaker is OPEN for ${this.serviceName}. Service unavailable.`,
          503
        );
      }
      // Try half-open
      this.state = 'HALF_OPEN';
      this.successes = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= CIRCUIT_BREAKER_CONFIG.successThreshold) {
        this.state = 'CLOSED';
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;

    if (this.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + CIRCUIT_BREAKER_CONFIG.timeout;
      console.warn(
        `Circuit breaker OPEN for ${this.serviceName}. Will retry after ${CIRCUIT_BREAKER_CONFIG.timeout}ms`
      );
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
  }
}

// ==================== API CLIENT ====================

export class APIClient {
  private cache = new CacheManager();
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private inflightRequests = new Map<string, Promise<any>>();

  /**
   * Make an API request with retry logic, timeout, caching, and circuit breaker
   */
  async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retries = RETRY_CONFIG.maxRetries,
      cache = false,
      cacheTTL = CACHE_CONFIG.nessieTransactions,
      validateStatus = (status) => status >= 200 && status < 300,
    } = config;

    // Create cache key
    const cacheKey = this.createCacheKey(url, method, body);

    // Check cache
    if (cache && method === 'GET') {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== null) {
        return {
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          source: 'cache',
        };
      }
    }

    // Check for inflight request (deduplication) - FIXED RACE CONDITION
    if (this.inflightRequests.has(cacheKey)) {
      return this.inflightRequests.get(cacheKey)!;
    }

    // Create the request promise
    const requestPromise = this.executeWithRetry<T>(
      url,
      method,
      headers,
      body,
      timeout,
      retries,
      validateStatus
    );

    // Store inflight request BEFORE executing
    this.inflightRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache successful GET requests
      if (cache && method === 'GET' && validateStatus(response.status)) {
        this.cache.set(cacheKey, response.data, cacheTTL);
      }

      return response;
    } finally {
      // Remove inflight request
      this.inflightRequests.delete(cacheKey);
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: any,
    timeout: number,
    retries: number,
    validateStatus: (status: number) => boolean
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;
    let delay = RETRY_CONFIG.initialDelay;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.executeRequest<T>(
          url,
          method,
          headers,
          body,
          timeout,
          validateStatus
        );
        return response;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof ApiError && error.status) {
          if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            throw error;
          }
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          break;
        }

        // Wait before retry with exponential backoff
        await this.sleep(delay);
        delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
      }
    }

    throw lastError || new ApiError('Request failed after retries');
  }

  /**
   * Execute a single request with timeout
   */
  private async executeRequest<T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: any,
    timeout: number,
    validateStatus: (status: number) => boolean
  ): Promise<ApiResponse<T>> {
    // Get or create circuit breaker for this service
    const serviceHost = new URL(url).hostname;
    if (!this.circuitBreakers.has(serviceHost)) {
      this.circuitBreakers.set(serviceHost, new CircuitBreaker(serviceHost));
    }
    const breaker = this.circuitBreakers.get(serviceHost)!;

    return breaker.execute(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!validateStatus(response.status)) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            `API request failed: ${response.statusText}`,
            response.status,
            response.statusText,
            errorData
          );
        }

        const data = await response.json();

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          source: 'network' as const,
        };
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new ApiError(`Request timeout after ${timeout}ms`, 408);
        }

        if (error instanceof ApiError) {
          throw error;
        }

        throw new ApiError(`Network error: ${error.message}`);
      }
    });
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset circuit breaker for a service
   */
  resetCircuitBreaker(serviceHost: string): void {
    const breaker = this.circuitBreakers.get(serviceHost);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Get circuit breaker state for a service
   */
  getCircuitBreakerState(serviceHost: string): string | null {
    const breaker = this.circuitBreakers.get(serviceHost);
    return breaker ? breaker.getState() : null;
  }

  /**
   * Create cache key from request parameters
   */
  private createCacheKey(url: string, method: string, body?: any): string {
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyHash}`;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==================== SINGLETON INSTANCE ====================

export const apiClient = new APIClient();
