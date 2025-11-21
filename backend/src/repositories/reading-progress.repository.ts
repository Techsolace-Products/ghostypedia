import { query } from '../config/database';
import { cacheGet, cacheSet, cacheDelete, CacheKeys, CacheTTL } from '../config/redis';

export interface ReadingProgress {
  id: string;
  userId: string;
  storyId: string;
  progressPercentage: number;
  lastReadPosition: number;
  isCompleted: boolean;
  lastReadAt: Date;
}

export interface ReadingProgressRepository {
  getReadingProgress(userId: string, storyId: string): Promise<ReadingProgress | null>;
  updateReadingProgress(
    userId: string,
    storyId: string,
    progressPercentage: number,
    lastReadPosition: number
  ): Promise<ReadingProgress>;
  markAsCompleted(userId: string, storyId: string): Promise<ReadingProgress>;
}

class ReadingProgressRepositoryImpl implements ReadingProgressRepository {
  /**
   * Get reading progress for a user and story
   */
  async getReadingProgress(userId: string, storyId: string): Promise<ReadingProgress | null> {
    // Check cache first
    const cacheKey = CacheKeys.readingProgress(userId, storyId);
    const cached = await cacheGet<ReadingProgress>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const result = await query<any>(
      `SELECT id, user_id as "userId", story_id as "storyId",
              progress_percentage as "progressPercentage",
              last_read_position as "lastReadPosition",
              is_completed as "isCompleted",
              last_read_at as "lastReadAt"
       FROM reading_progress
       WHERE user_id = $1 AND story_id = $2`,
      [userId, storyId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const progress = result.rows[0];

    // Cache the result
    await cacheSet(cacheKey, progress, CacheTTL.default);

    return progress;
  }

  /**
   * Update reading progress with upsert logic
   */
  async updateReadingProgress(
    userId: string,
    storyId: string,
    progressPercentage: number,
    lastReadPosition: number
  ): Promise<ReadingProgress> {
    // Upsert reading progress
    const result = await query<any>(
      `INSERT INTO reading_progress (user_id, story_id, progress_percentage, last_read_position, last_read_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, story_id)
       DO UPDATE SET
         progress_percentage = $3,
         last_read_position = $4,
         last_read_at = CURRENT_TIMESTAMP
       RETURNING id, user_id as "userId", story_id as "storyId",
                 progress_percentage as "progressPercentage",
                 last_read_position as "lastReadPosition",
                 is_completed as "isCompleted",
                 last_read_at as "lastReadAt"`,
      [userId, storyId, progressPercentage, lastReadPosition]
    );

    const progress = result.rows[0];

    // Invalidate cache
    const cacheKey = CacheKeys.readingProgress(userId, storyId);
    await cacheDelete(cacheKey);

    return progress;
  }

  /**
   * Mark a story as completed
   */
  async markAsCompleted(userId: string, storyId: string): Promise<ReadingProgress> {
    // Update completion status
    const result = await query<any>(
      `INSERT INTO reading_progress (user_id, story_id, progress_percentage, is_completed, last_read_at)
       VALUES ($1, $2, 100, true, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, story_id)
       DO UPDATE SET
         progress_percentage = 100,
         is_completed = true,
         last_read_at = CURRENT_TIMESTAMP
       RETURNING id, user_id as "userId", story_id as "storyId",
                 progress_percentage as "progressPercentage",
                 last_read_position as "lastReadPosition",
                 is_completed as "isCompleted",
                 last_read_at as "lastReadAt"`,
      [userId, storyId]
    );

    const progress = result.rows[0];

    // Invalidate cache
    const cacheKey = CacheKeys.readingProgress(userId, storyId);
    await cacheDelete(cacheKey);

    return progress;
  }
}

export const readingProgressRepository = new ReadingProgressRepositoryImpl();
