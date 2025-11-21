import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../config/redis';

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
    const cacheKey = `response:${req.originalUrl || req.url}`;

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
