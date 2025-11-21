import { storyRepository, Story } from '../repositories/story.repository';
import { readingProgressRepository, ReadingProgress } from '../repositories/reading-progress.repository';
import { cacheDelete, CacheKeys } from '../config/redis';

export interface StoryService {
  getStoriesByGhostId(ghostId: string): Promise<Story[]>;
  getStoryById(storyId: string): Promise<Story | null>;
  updateReadingProgress(
    userId: string,
    storyId: string,
    progressPercentage: number,
    lastReadPosition: number
  ): Promise<ReadingProgress>;
  getReadingProgress(userId: string, storyId: string): Promise<ReadingProgress | null>;
  markStoryAsRead(userId: string, storyId: string): Promise<ReadingProgress>;
}

class StoryServiceImpl implements StoryService {
  /**
   * Get all stories for a ghost entity
   */
  async getStoriesByGhostId(ghostId: string): Promise<Story[]> {
    return storyRepository.getStoriesByGhostId(ghostId);
  }

  /**
   * Get a specific story by ID with metadata
   */
  async getStoryById(storyId: string): Promise<Story | null> {
    return storyRepository.getStoryById(storyId);
  }

  /**
   * Update reading progress for a user and story
   */
  async updateReadingProgress(
    userId: string,
    storyId: string,
    progressPercentage: number,
    lastReadPosition: number
  ): Promise<ReadingProgress> {
    // Validate progress percentage
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    // Validate last read position
    if (lastReadPosition < 0) {
      throw new Error('Last read position must be non-negative');
    }

    // Update progress in repository
    const progress = await readingProgressRepository.updateReadingProgress(
      userId,
      storyId,
      progressPercentage,
      lastReadPosition
    );

    // Invalidate story cache if needed
    await cacheDelete(CacheKeys.story(storyId));

    return progress;
  }

  /**
   * Get reading progress for a user and story
   */
  async getReadingProgress(userId: string, storyId: string): Promise<ReadingProgress | null> {
    return readingProgressRepository.getReadingProgress(userId, storyId);
  }

  /**
   * Mark a story as completed
   */
  async markStoryAsRead(userId: string, storyId: string): Promise<ReadingProgress> {
    // Mark as completed in repository
    const progress = await readingProgressRepository.markAsCompleted(userId, storyId);

    // Invalidate story cache if needed
    await cacheDelete(CacheKeys.story(storyId));

    return progress;
  }
}

export const storyService = new StoryServiceImpl();
