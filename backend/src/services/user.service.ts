import { userRepository } from '../repositories/user.repository';
import { User } from './auth.service';
import { cacheGet, cacheSet, cacheDelete, CacheKeys, CacheTTL } from '../config/redis';

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
    // Update in database
    const updatedUser = await userRepository.update(userId, updates);

    // Invalidate cache
    const cacheKey = CacheKeys.user(userId);
    await cacheDelete(cacheKey);

    // Store updated user in cache
    await cacheSet(cacheKey, updatedUser, CacheTTL.default);

    return updatedUser;
  }

  /**
   * Delete user with cascade deletion and cache invalidation
   */
  async deleteUser(userId: string): Promise<void> {
    // Delete from database (cascade will handle related records)
    await userRepository.delete(userId);

    // Invalidate all user-related caches
    await cacheDelete(CacheKeys.user(userId));
    await cacheDelete(CacheKeys.userPreferences(userId));
    await cacheDelete(CacheKeys.recommendations(userId));
    await cacheDelete(CacheKeys.bookmarks(userId));
  }
}

export const userService = new UserServiceImpl();
