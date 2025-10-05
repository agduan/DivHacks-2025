/**
 * Monitoring and structured logging utilities
 * Tracks API performance, errors, and usage metrics
 */

import { FEATURE_FLAGS } from '@/config';

// ==================== TYPES ====================

export interface APIMetric {
  service: string;
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  cached: boolean;
  timestamp: number;
}

export interface ErrorMetric {
  service: string;
  error: string;
  stack?: string;
  context?: any;
  timestamp: number;
}

export interface UsageMetric {
  feature: string;
  count: number;
  timestamp: number;
}

// ==================== MONITORING SERVICE ====================

class MonitoringService {
  private metrics: APIMetric[] = [];
  private errors: ErrorMetric[] = [];
  private usage: Map<string, number> = new Map();

  /**
   * Track an API call
   */
  trackAPICall(metric: Omit<APIMetric, 'timestamp'>): void {
    if (!FEATURE_FLAGS.enableMonitoring) return;

    const fullMetric: APIMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = metric.success ? '✅' : '❌';
      const cacheEmoji = metric.cached ? '💾' : '🌐';
      console.log(
        `${emoji} ${cacheEmoji} [${metric.service}] ${metric.method} ${metric.endpoint} - ${metric.status} - ${metric.duration}ms`
      );
    }

    // In production, you would send to a monitoring service like:
    // - DataDog
    // - New Relic
    // - Sentry
    // - CloudWatch
    // - Your own analytics endpoint
  }

  /**
   * Track an error
   */
  trackError(error: Omit<ErrorMetric, 'timestamp'>): void {
    if (!FEATURE_FLAGS.enableMonitoring) return;

    const fullError: ErrorMetric = {
      ...error,
      timestamp: Date.now(),
    };

    this.errors.push(fullError);

    // Keep only last 500 errors
    if (this.errors.length > 500) {
      this.errors.shift();
    }

    // Log to console
    console.error(`❌ [${error.service}] ${error.error}`, {
      stack: error.stack,
      context: error.context,
    });

    // In production, send to error tracking service
  }

  /**
   * Track feature usage
   */
  trackUsage(feature: string): void {
    if (!FEATURE_FLAGS.enableMonitoring) return;

    const current = this.usage.get(feature) || 0;
    this.usage.set(feature, current + 1);
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    averageResponseTime: number;
    successRate: number;
    cacheHitRate: number;
    totalRequests: number;
    errorRate: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
        totalRequests: 0,
        errorRate: 0,
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const successCount = this.metrics.filter((m) => m.success).length;
    const cachedCount = this.metrics.filter((m) => m.cached).length;
    const totalRequests = this.metrics.length;

    return {
      averageResponseTime: totalDuration / totalRequests,
      successRate: successCount / totalRequests,
      cacheHitRate: cachedCount / totalRequests,
      totalRequests,
      errorRate: this.errors.length / totalRequests,
    };
  }

  /**
   * Get metrics by service
   */
  getMetricsByService(service: string): APIMetric[] {
    return this.metrics.filter((m) => m.service === service);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorMetric[] {
    return this.errors.slice(-limit);
  }

  /**
   * Get usage stats
   */
  getUsageStats(): Map<string, number> {
    return new Map(this.usage);
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clearMetrics(): void {
    this.metrics = [];
    this.errors = [];
    this.usage.clear();
  }
}

// ==================== SINGLETON ====================

export const monitoring = new MonitoringService();

// ==================== HELPER FUNCTIONS ====================

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(
  service: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - start;
    monitoring.trackError({
      service,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      context: { endpoint, duration },
    });
    throw error;
  }
}

/**
 * Structured logger
 */
export const logger = {
  info: (service: string, message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️ [${service}] ${message}`, context || '');
    }
  },

  warn: (service: string, message: string, context?: any) => {
    console.warn(`⚠️ [${service}] ${message}`, context || '');
  },

  error: (service: string, message: string, error?: Error, context?: any) => {
    console.error(`❌ [${service}] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...context,
    });

    monitoring.trackError({
      service,
      error: message,
      stack: error?.stack,
      context,
    });
  },

  debug: (service: string, message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🐛 [${service}] ${message}`, context || '');
    }
  },
};
