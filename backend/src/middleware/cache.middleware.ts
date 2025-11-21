import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from '../config/redis';

/**
 * Generate cache key from request
 * Includes user ID for authenticated requests to ensure user-specific caching
 */
export function generateCacheKey(req: Request): string {
  const url = req.originalUrl || req.url;
  const userId = req.user?.id;
  
  // Include user ID in cache key for authenticated requests
  if (userId) {
    return `response:user:${userId}:${url}`;
  }
  
  return `response:${url}`;
}

/**
 * Response caching middleware for GET requests
 * Caches the response body based on the request URL and query parameters
 */
export function cacheResponse(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Generate cache key from URL and query params
    const cacheKey = generateCacheKey(req);

    try {
      // Check if response is cached
      const cachedResponse = await cacheGet<any>(cacheKey);
      
      if (cachedResponse) {
        // Return cached response
        res.status(cachedResponse.status || 200).json(cachedResponse.body);
        return;
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function (body: any): Response {
        // Cache the response
        const responseData = {
          status: res.statusCode,
          body,
        };
        
        // Only cache successful responses (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSet(cacheKey, responseData, ttlSeconds).catch((err) => {
            console.error('Error caching response:', err);
          });
        }

        // Call original json method
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Cache invalidation helpers
 */
export const CacheInvalidation = {
  /**
   * Invalidate all cached responses for a specific user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const pattern = `response:user:${userId}:*`;
    await cacheDeletePattern(pattern);
  },

  /**
   * Invalidate cached responses for a specific endpoint pattern
   */
  async invalidateEndpointCache(pattern: string): Promise<void> {
    await cacheDeletePattern(`response:*${pattern}*`);
  },

  /**
   * Invalidate a specific cache key
   */
  async invalidateSpecificCache(key: string): Promise<void> {
    await cacheDelete(key);
  },

  /**
   * Invalidate all ghost-related caches
   */
  async invalidateGhostCaches(ghostId?: string): Promise<void> {
    if (ghostId) {
      await cacheDeletePattern(`response:*/api/ghosts/${ghostId}*`);
    } else {
      await cacheDeletePattern('response:*/api/ghosts*');
    }
  },

  /**
   * Invalidate all story-related caches
   */
  async invalidateStoryCaches(storyId?: string): Promise<void> {
    if (storyId) {
      await cacheDeletePattern(`response:*/api/stories/${storyId}*`);
    } else {
      await cacheDeletePattern('response:*/api/stories*');
    }
  },

  /**
   * Invalidate all bookmark-related caches for a user
   */
  async invalidateBookmarkCaches(userId: string): Promise<void> {
    await cacheDeletePattern(`response:user:${userId}:*/api/bookmarks*`);
  },

  /**
   * Invalidate all recommendation caches for a user
   */
  async invalidateRecommendationCaches(userId: string): Promise<void> {
    await cacheDeletePattern(`response:user:${userId}:*/api/recommendations*`);
  },
};
