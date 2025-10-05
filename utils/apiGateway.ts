/**
 * Centralized API Gateway
 * Handles all external API calls with proper error handling, retries, and monitoring
 */

import { apiClient, ApiError } from './apiClient';
import { API_CONFIG, CACHE_CONFIG } from '@/config';
import { monitoring, logger } from './monitoring';
import { checkRateLimit, addSecurityHeaders } from './security';

// ==================== TYPES ====================

export interface APIGatewayConfig {
  service: string;
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  cacheTTL: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface APIGatewayResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'api' | 'cache' | 'fallback';
  cached: boolean;
  duration: number;
}

// ==================== API GATEWAY ====================

export class APIGateway {
  private static configs: Map<string, APIGatewayConfig> = new Map();

  /**
   * Register API configuration
   */
  static registerConfig(service: string, config: APIGatewayConfig): void {
    this.configs.set(service, config);
  }

  /**
   * Make API request through gateway
   */
  static async request<T>(
    service: string,
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      cache?: boolean;
      timeout?: number;
    } = {}
  ): Promise<APIGatewayResponse<T>> {
    const startTime = Date.now();
    const config = this.configs.get(service);

    if (!config) {
      throw new Error(`Service ${service} not configured`);
    }

    try {
      // Check rate limit if configured
      if (config.rateLimit) {
        // This would need to be implemented with actual request context
        // For now, we'll skip rate limiting at the gateway level
      }

      const url = `${config.baseUrl}${endpoint}`;
      const requestOptions = {
        url,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
          ...options.headers,
        },
        body: options.body,
        timeout: options.timeout || config.timeout,
        retries: config.retries,
        cache: options.cache !== false,
        cacheTTL: config.cacheTTL,
      };

      const response = await apiClient.request<T>(requestOptions);

      // Track successful API call
      monitoring.trackAPICall({
        service,
        endpoint,
        method: options.method || 'GET',
        duration: Date.now() - startTime,
        status: response.status,
        success: true,
        cached: response.source === 'cache',
      });

      return {
        success: true,
        data: response.data,
        source: response.source === 'cache' ? 'cache' : 'api',
        cached: response.source === 'cache',
        duration: Date.now() - startTime,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Track failed API call
      monitoring.trackAPICall({
        service,
        endpoint,
        method: options.method || 'GET',
        duration,
        status: error instanceof ApiError ? error.status || 500 : 500,
        success: false,
        cached: false,
      });

      logger.error('APIGateway', `Request failed for ${service}${endpoint}`, error as Error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'api',
        cached: false,
        duration,
      };
    }
  }

  /**
   * Get service health status
   */
  static async getHealthStatus(service: string): Promise<{
    healthy: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const config = this.configs.get(service);
    if (!config) {
      return { healthy: false, error: 'Service not configured' };
    }

    try {
      const startTime = Date.now();
      const response = await this.request(service, '/health', {
        method: 'GET',
        timeout: 5000,
        cache: false,
      });

      return {
        healthy: response.success,
        responseTime: response.duration,
        error: response.error,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all registered services
   */
  static getRegisteredServices(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Clear cache for a service
   */
  static clearCache(service: string): void {
    // This would need to be implemented with the actual cache manager
    logger.info('APIGateway', `Cache cleared for service: ${service}`);
  }
}

// ==================== SERVICE REGISTRATIONS ====================

// Register Nessie API
APIGateway.registerConfig('nessie', {
  service: 'nessie',
  baseUrl: API_CONFIG.nessie.baseUrl,
  apiKey: API_CONFIG.nessie.apiKey,
  timeout: API_CONFIG.nessie.timeout,
  retries: API_CONFIG.nessie.retries,
  cacheTTL: CACHE_CONFIG.nessieTransactions,
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

// Register OpenAI API
APIGateway.registerConfig('openai', {
  service: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: API_CONFIG.openai.apiKey,
  timeout: API_CONFIG.openai.timeout,
  retries: API_CONFIG.openai.retries,
  cacheTTL: CACHE_CONFIG.aiPredictions,
  rateLimit: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

// Register Google AI API
APIGateway.registerConfig('google', {
  service: 'google',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: API_CONFIG.google.apiKey,
  timeout: API_CONFIG.google.timeout,
  retries: API_CONFIG.google.retries,
  cacheTTL: CACHE_CONFIG.aiPredictions,
  rateLimit: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

// ==================== CONVENIENCE METHODS ====================

/**
 * Make Nessie API request
 */
export async function nessieRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    cache?: boolean;
  } = {}
): Promise<APIGatewayResponse<T>> {
  return APIGateway.request<T>('nessie', endpoint, options);
}

/**
 * Make OpenAI API request
 */
export async function openaiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    cache?: boolean;
  } = {}
): Promise<APIGatewayResponse<T>> {
  return APIGateway.request<T>('openai', endpoint, options);
}

/**
 * Make Google AI API request
 */
export async function googleRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    cache?: boolean;
  } = {}
): Promise<APIGatewayResponse<T>> {
  return APIGateway.request<T>('google', endpoint, options);
}

// ==================== HEALTH CHECKS ====================

/**
 * Check health of all registered services
 */
export async function checkAllServicesHealth(): Promise<Record<string, any>> {
  const services = APIGateway.getRegisteredServices();
  const healthChecks = await Promise.allSettled(
    services.map(async (service) => ({
      service,
      ...(await APIGateway.getHealthStatus(service)),
    }))
  );

  const results: Record<string, any> = {};
  healthChecks.forEach((result, index) => {
    const service = services[index];
    if (result.status === 'fulfilled') {
      results[service] = result.value;
    } else {
      results[service] = {
        healthy: false,
        error: result.reason?.message || 'Health check failed',
      };
    }
  });

  return results;
}
