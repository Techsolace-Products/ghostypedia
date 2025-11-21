import { query } from '../config/database';

export enum InteractionType {
  VIEW = 'view',
  CLICK = 'click',
  BOOKMARK = 'bookmark',
  READ = 'read',
  SHARE = 'share'
}

export enum ContentType {
  GHOST_ENTITY = 'ghost_entity',
  STORY = 'story',
  MOVIE = 'movie',
  MYTH = 'myth'
}

export interface Interaction {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  interactionType: InteractionType;
  timestamp: Date;
}

export interface InteractionFilters {
  contentType?: ContentType;
  interactionType?: InteractionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface InteractionRepository {
  recordInteraction(
    userId: string,
    contentId: string,
    contentType: ContentType,
    interactionType: InteractionType
  ): Promise<Interaction>;
  getUserInteractions(userId: string, filters?: InteractionFilters): Promise<Interaction[]>;
}

class InteractionRepositoryImpl implements InteractionRepository {
  /**
   * Record a user interaction with timestamp
   */
  async recordInteraction(
    userId: string,
    contentId: string,
    contentType: ContentType,
    interactionType: InteractionType
  ): Promise<Interaction> {
    const result = await query<any>(
      `INSERT INTO interactions (user_id, content_id, content_type, interaction_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id as "userId", content_id as "contentId",
                 content_type as "contentType", interaction_type as "interactionType",
                 timestamp`,
      [userId, contentId, contentType, interactionType]
    );

    return result.rows[0];
  }

  /**
   * Get user interactions with filtering
   */
  async getUserInteractions(userId: string, filters: InteractionFilters = {}): Promise<Interaction[]> {
    const conditions: string[] = ['user_id = $1'];
    const values: any[] = [userId];
    let paramIndex = 2;

    // Build dynamic query based on filters
    if (filters.contentType) {
      conditions.push(`content_type = $${paramIndex}`);
      values.push(filters.contentType);
      paramIndex++;
    }

    if (filters.interactionType) {
      conditions.push(`interaction_type = $${paramIndex}`);
      values.push(filters.interactionType);
      paramIndex++;
    }

    if (filters.startDate) {
      conditions.push(`timestamp >= $${paramIndex}`);
      values.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      conditions.push(`timestamp <= $${paramIndex}`);
      values.push(filters.endDate);
      paramIndex++;
    }

    const limit = filters.limit || 100;
    const limitClause = `LIMIT $${paramIndex}`;
    values.push(limit);

    const result = await query<any>(
      `SELECT id, user_id as "userId", content_id as "contentId",
              content_type as "contentType", interaction_type as "interactionType",
              timestamp
       FROM interactions
       WHERE ${conditions.join(' AND ')}
       ORDER BY timestamp DESC
       ${limitClause}`,
      values
    );

    return result.rows;
  }
}

export const interactionRepository = new InteractionRepositoryImpl();
