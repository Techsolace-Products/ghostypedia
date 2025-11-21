import { userRepository } from '../repositories/user.repository';
import { User } from './auth.service';
import { cacheGet, cacheSet, cacheDelete, CacheKeys, CacheTTL } from '../config/redis';
import { CacheInvalidation } from '../middleware/cache.middleware';

export interface UserService {
  getUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}

class UserServiceImpl implements UserService {
  /**
   * Get user by ID with caching
   */
  async getUserById(userId: string): Promise<User | null> {
    // Try to get from cache first
    const cacheKey = CacheKeys.user(userId);
    const cachedUser = await cacheGet<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, fetch from database
    const user = await userRepository.findById(userId);

    if (user) {
      // Store in cache
      await cacheSet(cacheKey, user, CacheTTL.default);
    }

    return user;
  }

  /**
   * Update user with cache invalidation
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const startTime = Date.now();

    // Update in database
    const updatedUser = await userRepository.update(userId, updates);

    // Invalidate caches (must complete within 1 second as per requirement 7.4)
    await this.invalidateUserCaches(userId);

    // Verify invalidation completed within time limit
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > 1000) {
      console.warn(`User cache invalidation took ${elapsedTime}ms, exceeding 1 second limit`);
    }

    // Store updated user in cache
    const cacheKey = CacheKeys.user(userId);
    await cacheSet(cacheKey, updatedUser, CacheTTL.default);

    return updatedUser;
  }

  /**
   * Delete user with cascade deletion and cache invalidation
   */
  async deleteUser(userId: string): Promise<void> {
    const startTime = Date.now();

    // Delete from database (cascade will handle related records)
    await userRepository.delete(userId);

    // Invalidate all user-related caches (must complete within 1 second as per requirement 7.4)
    await this.invalidateUserCaches(userId);

    // Verify invalidation completed within time limit
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > 1000) {
      console.warn(`User deletion cache invalidation took ${elapsedTime}ms, exceeding 1 second limit`);
    }
  }

  /**
   * Invalidate all user-related caches
   * Must complete within 1 second (requirement 7.4)
   */
  private async invalidateUserCaches(userId: string): Promise<void> {
    // Run invalidations in parallel for speed
    await Promise.all([
      // Invalidate user data caches
      cacheDelete(CacheKeys.user(userId)),
      cacheDelete(CacheKeys.userPreferences(userId)),
      cacheDelete(CacheKeys.recommendations(userId)),
      cacheDelete(CacheKeys.bookmarks(userId)),
      
      // Invalidate all cached API responses for this user
      CacheInvalidation.invalidateUserCache(userId),
    ]);
  }
}

export const userService = new UserServiceImpl();
