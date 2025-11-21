import { preferencesRepository, PreferenceProfile, PreferenceProfileUpdate } from '../repositories/preferences.repository';
import { cacheGet, cacheSet, cacheDelete, CacheKeys, CacheTTL } from '../config/redis';

export interface PreferencesService {
  getPreferences(userId: string): Promise<PreferenceProfile>;
  updatePreferences(userId: string, updates: PreferenceProfileUpdate): Promise<PreferenceProfile>;
}

class PreferencesServiceImpl implements PreferencesService {
  /**
   * Get user preferences with default values for new users
   */
  async getPreferences(userId: string): Promise<PreferenceProfile> {
    // Try to get from cache first
    const cacheKey = CacheKeys.userPreferences(userId);
    const cachedPreferences = await cacheGet<PreferenceProfile>(cacheKey);

    if (cachedPreferences) {
      return cachedPreferences;
    }

    // Try to fetch from database
    let preferences = await preferencesRepository.findByUserId(userId);

    // If not found, create default preferences for new user
    if (!preferences) {
      preferences = await preferencesRepository.create(userId);
    }

    // Store in cache
    await cacheSet(cacheKey, preferences, CacheTTL.default);

    return preferences;
  }

  /**
   * Update preferences with validation and cache invalidation
   */
  async updatePreferences(userId: string, updates: PreferenceProfileUpdate): Promise<PreferenceProfile> {
    // Validate spookiness level if provided
    if (updates.spookinessLevel !== undefined) {
      if (updates.spookinessLevel < 1 || updates.spookinessLevel > 5) {
        throw new Error('Spookiness level must be between 1 and 5');
      }
    }

    // Validate content types if provided
    if (updates.preferredContentTypes !== undefined) {
      const validContentTypes = ['ghost_entity', 'story', 'movie', 'myth'];
      const invalidTypes = updates.preferredContentTypes.filter(
        type => !validContentTypes.includes(type)
      );
      if (invalidTypes.length > 0) {
        throw new Error(`Invalid content types: ${invalidTypes.join(', ')}`);
      }
    }

    // Ensure preferences exist before updating
    let preferences = await preferencesRepository.findByUserId(userId);
    if (!preferences) {
      preferences = await preferencesRepository.create(userId);
    }

    // Update in database
    const updatedPreferences = await preferencesRepository.update(userId, updates);

    // Invalidate caches
    await this.invalidateCaches(userId);

    // Store updated preferences in cache
    const cacheKey = CacheKeys.userPreferences(userId);
    await cacheSet(cacheKey, updatedPreferences, CacheTTL.default);

    return updatedPreferences;
  }

  /**
   * Invalidate all caches related to user preferences
   */
  private async invalidateCaches(userId: string): Promise<void> {
    // Invalidate preference cache
    await cacheDelete(CacheKeys.userPreferences(userId));
    
    // Invalidate recommendation cache (as per requirement 2.3)
    await cacheDelete(CacheKeys.recommendations(userId));
  }
}

export const preferencesService = new PreferencesServiceImpl();
