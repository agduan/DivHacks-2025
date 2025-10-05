/**
 * Security utilities for API protection
 * Rate limiting, input validation, and security headers
 */

import { NextRequest } from 'next/server';

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    blockDurationMs: number = 60 * 60 * 1000 // 1 hour
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
        blocked: false,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    // Check if blocked
    if (entry.blocked && now < entry.resetTime) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Reset if window expired
    if (now >= entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + this.windowMs;
      entry.blocked = false;
      this.requests.set(identifier, entry);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      entry.blocked = true;
      entry.resetTime = now + this.blockDurationMs;
      this.requests.set(identifier, entry);
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime && !entry.blocked) {
        this.requests.delete(key);
      }
    }
  }
}

// ==================== INPUT VALIDATION ====================

/**
 * Validate and sanitize API input
 */
export function validateAPIInput(input: any, rules: ValidationRules): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};

  for (const [key, rule] of Object.entries(rules)) {
    const value = input[key];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    if (value === undefined || value === null) {
      continue; // Skip optional fields
    }

    // Type validation
    if (rule.type && typeof value !== rule.type) {
      errors.push(`${key} must be of type ${rule.type}`);
      continue;
    }

    // String validation
    if (rule.type === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${key} must be at least ${rule.minLength} characters`);
        continue;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${key} must be at most ${rule.maxLength} characters`);
        continue;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${key} format is invalid`);
        continue;
      }
    }

    // Number validation
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${key} must be at least ${rule.min}`);
        continue;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${key} must be at most ${rule.max}`);
        continue;
      }
    }

    // Sanitize value
    sanitized[key] = sanitizeValue(value, rule);
  }

  return {
    valid: errors.length === 0,
    errors,
    data: sanitized,
  };
}

/**
 * Sanitize input value based on rules - ENHANCED SECURITY
 */
function sanitizeValue(value: any, rule: ValidationRule): any {
  if (rule.type === 'string') {
    // Remove potentially dangerous characters
    let sanitized = String(value).trim();
    
    // Remove script tags and other dangerous content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // Remove SQL injection patterns
    sanitized = sanitized.replace(/['";\\]/g, '');
    sanitized = sanitized.replace(/union\s+select/gi, '');
    sanitized = sanitized.replace(/drop\s+table/gi, '');
    sanitized = sanitized.replace(/delete\s+from/gi, '');
    
    // Remove XSS patterns
    sanitized = sanitized.replace(/<iframe/gi, '');
    sanitized = sanitized.replace(/<object/gi, '');
    sanitized = sanitized.replace(/<embed/gi, '');
    
    return sanitized;
  }

  if (rule.type === 'number') {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  return value;
}

/**
 * Enhanced input sanitization for user data
 */
export function sanitizeUserInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/['";\\]/g, '')
      .replace(/union\s+select/gi, '')
      .replace(/drop\s+table/gi, '')
      .replace(/delete\s+from/gi, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeUserInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeUserInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// ==================== SECURITY HEADERS ====================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(headers: Headers): void {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Content-Security-Policy', "default-src 'self'");
}

// ==================== TYPES ====================

interface ValidationRule {
  type?: 'string' | 'number' | 'boolean';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: any;
}

// ==================== EXPORTS ====================

export const rateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  parseInt(process.env.RATE_LIMIT_BLOCK_DURATION_MS || '3600000') // 1 hour
);

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Add user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || '';
  const hash = Buffer.from(ip + userAgent).toString('base64').slice(0, 16);
  
  return hash;
}

/**
 * Check rate limit for request
 */
export function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
  const identifier = getClientIdentifier(request);
  return rateLimiter.isAllowed(identifier);
}

// Clean up rate limiter every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);
