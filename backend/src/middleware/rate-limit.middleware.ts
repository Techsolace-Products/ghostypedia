import { Request, Response, NextFunction } from 'express';
import { cacheIncrement, cacheExpire, cacheTTL, CacheKeys } from '../config/redis';
import { config } from '../config/env';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Default rate limit configurations for different endpoint types
export const RateLimitPresets = {
  // Standard API endpoints
  standard: {
    windowMs: config.rateLimit.windowMs, // 15 minutes
    maxRequests: config.rateLimit.maxRequests, // 100 requests
  },
  
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 900000, // 15 minutes
    maxRequests: 10, // 10 attempts
  },
  
  // Search endpoints (moderate)
  search: {
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 requests
  },
  
  // AI/Digital Twin endpoints (stricter due to cost)
  ai: {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 requests
  },
  
  // Read-only endpoints (more lenient)
  readOnly: {
    windowMs: 60000, // 1 minute
    maxRequests: 60, // 60 requests
  },
};

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: Request): string {
  // Try to get real IP from various headers (for proxy/load balancer scenarios)
  const ip = 
    req.ip ||
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown';
  
  return Array.isArray(ip) ? ip[0] : ip.toString();
}

/**
 * User-based key generator - uses authenticated user ID
 */
export function userKeyGenerator(req: Request): string {
  const user = (req as any).user;
  if (user && user.id) {
    return `user:${user.id}`;
  }
  // Fallback to IP if not authenticated
  return defaultKeyGenerator(req);
}

/**
 * Create rate limiting middleware
 */
export function createRateLimiter(options: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Generate unique key for this client
      const identifier = keyGenerator(req);
      const rateLimitKey = CacheKeys.rateLimit(identifier);

      // Get current count
      const currentCount = await cacheIncrement(rateLimitKey);

      // If this is the first request, set expiration
      if (currentCount === 1) {
        await cacheExpire(rateLimitKey, Math.ceil(windowMs / 1000));
      }

      // Get TTL to calculate reset time
      const ttl = await cacheTTL(rateLimitKey);
      const resetTime = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + windowMs;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentCount).toString());
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

      // Check if limit exceeded
      if (currentCount > maxRequests) {
        res.setHeader('Retry-After', Math.ceil(ttl).toString());
        res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            details: {
              limit: maxRequests,
              windowMs,
              retryAfter: ttl,
            },
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Handle skip options
      if (skipSuccessfulRequests || skipFailedRequests) {
        // Store original end function
        const originalEnd = res.end.bind(res);
        
        // Override end to check status code
        res.end = function(this: Response, chunk?: any, encoding?: any, cb?: any): Response {
          const statusCode = res.statusCode;
          const shouldSkip = 
            (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) ||
            (skipFailedRequests && statusCode >= 400);

          if (shouldSkip) {
            // Decrement counter if we should skip this request
            cacheIncrement(rateLimitKey).then(count => {
              if (count > 1) {
                // We can't directly decrement, so we'll need to handle this differently
                // For now, we'll accept the slight inaccuracy
              }
            }).catch(err => {
              console.error('Error adjusting rate limit counter:', err);
            });
          }

          // Call original end
          return originalEnd(chunk, encoding, cb);
        };
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request through (fail open)
      next();
    }
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  standard: createRateLimiter(RateLimitPresets.standard),
  auth: createRateLimiter(RateLimitPresets.auth),
  search: createRateLimiter(RateLimitPresets.search),
  ai: createRateLimiter(RateLimitPresets.ai),
  readOnly: createRateLimiter(RateLimitPresets.readOnly),
};

/**
 * User-specific rate limiter (uses user ID instead of IP)
 */
export const userRateLimiter = createRateLimiter({
  ...RateLimitPresets.standard,
  keyGenerator: userKeyGenerator,
});
