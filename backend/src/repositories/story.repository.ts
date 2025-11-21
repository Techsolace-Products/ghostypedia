import { query } from '../config/database';
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from '../config/redis';

export interface Story {
  id: string;
  title: string;
  content: string;
  origin: string;
  culturalContext: string;
  estimatedReadingTime: number;
  tags: string[];
  ghostEntityIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryRepository {
  getStoriesByGhostId(ghostId: string): Promise<Story[]>;
  getStoryById(storyId: string): Promise<Story | null>;
}

class StoryRepositoryImpl implements StoryRepository {
  /**
   * Get all stories associated with a ghost entity
   */
  async getStoriesByGhostId(ghostId: string): Promise<Story[]> {
    // Check cache first
    const cacheKey = CacheKeys.storiesByGhost(ghostId);
    const cached = await cacheGet<Story[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database with many-to-many relationship
    const result = await query<any>(
      `SELECT DISTINCT s.id, s.title, s.content, s.origin, 
              s.cultural_context as "culturalContext",
              s.estimated_reading_time as "estimatedReadingTime",
              s.tags, s.created_at as "createdAt", s.updated_at as "updatedAt",
              ARRAY_AGG(sge.ghost_entity_id) OVER (PARTITION BY s.id) as "ghostEntityIds"
       FROM stories s
       INNER JOIN story_ghost_entities sge ON s.id = sge.story_id
       WHERE sge.ghost_entity_id = $1
       ORDER BY s.created_at DESC`,
      [ghostId]
    );

    const stories = result.rows;

    // Cache the result
    await cacheSet(cacheKey, stories, CacheTTL.stories);

    return stories;
  }

  /**
   * Get a specific story by ID with caching
   */
  async getStoryById(storyId: string): Promise<Story | null> {
    // Check cache first
    const cacheKey = CacheKeys.story(storyId);
    const cached = await cacheGet<Story>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database with ghost entity relationships
    const result = await query<any>(
      `SELECT s.id, s.title, s.content, s.origin,
              s.cultural_context as "culturalContext",
              s.estimated_reading_time as "estimatedReadingTime",
              s.tags, s.created_at as "createdAt", s.updated_at as "updatedAt",
              COALESCE(
                ARRAY_AGG(sge.ghost_entity_id) FILTER (WHERE sge.ghost_entity_id IS NOT NULL),
                '{}'
              ) as "ghostEntityIds"
       FROM stories s
       LEFT JOIN story_ghost_entities sge ON s.id = sge.story_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [storyId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const story = result.rows[0];

    // Cache the result
    await cacheSet(cacheKey, story, CacheTTL.stories);

    return story;
  }
}

export const storyRepository = new StoryRepositoryImpl();
