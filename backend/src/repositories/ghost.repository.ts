import { query } from '../config/database';
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from '../config/redis';

export interface GhostEntity {
  id: string;
  name: string;
  type: string;
  origin: string;
  culturalContext: string;
  description: string;
  characteristics: string[];
  dangerLevel: number;
  imageUrl: string;
  relatedEntityIds: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  categories?: string[];
  dangerLevel?: number;
  culturalContext?: string;
  tags?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface GhostRepository {
  searchGhosts(query: string, filters: SearchFilters, pagination: PaginationParams): Promise<PaginatedResult<GhostEntity>>;
  getGhostById(ghostId: string): Promise<GhostEntity | null>;
  getGhostsByCategory(category: string, pagination: PaginationParams): Promise<PaginatedResult<GhostEntity>>;
  getRelatedGhosts(ghostId: string): Promise<GhostEntity[]>;
}

class GhostRepositoryImpl implements GhostRepository {
  /**
   * Search ghosts with full-text search and filters
   */
  async searchGhosts(
    searchQuery: string,
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<GhostEntity>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Full-text search
    if (searchQuery && searchQuery.trim()) {
      conditions.push(`(
        name ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex} OR
        type ILIKE $${paramIndex} OR
        origin ILIKE $${paramIndex}
      )`);
      params.push(`%${searchQuery.trim()}%`);
      paramIndex++;
    }

    // Category filter (type)
    if (filters.categories && filters.categories.length > 0) {
      conditions.push(`type = ANY($${paramIndex})`);
      params.push(filters.categories);
      paramIndex++;
    }

    // Danger level filter
    if (filters.dangerLevel !== undefined) {
      conditions.push(`danger_level = $${paramIndex}`);
      params.push(filters.dangerLevel);
      paramIndex++;
    }

    // Cultural context filter
    if (filters.culturalContext) {
      conditions.push(`cultural_context ILIKE $${paramIndex}`);
      params.push(`%${filters.culturalContext}%`);
      paramIndex++;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags && $${paramIndex}`);
      params.push(filters.tags);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ghost_entities ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const dataParams = [...params, limit, offset];
    const result = await query<any>(
      `SELECT id, name, type, origin, cultural_context as "culturalContext",
              description, characteristics, danger_level as "dangerLevel",
              image_url as "imageUrl", related_entity_ids as "relatedEntityIds",
              tags, created_at as "createdAt", updated_at as "updatedAt"
       FROM ghost_entities
       ${whereClause}
       ORDER BY name ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataParams
    );

    return {
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Get ghost entity by ID with caching
   */
  async getGhostById(ghostId: string): Promise<GhostEntity | null> {
    // Check cache first
    const cacheKey = CacheKeys.ghostEntity(ghostId);
    const cached = await cacheGet<GhostEntity>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const result = await query<any>(
      `SELECT id, name, type, origin, cultural_context as "culturalContext",
              description, characteristics, danger_level as "dangerLevel",
              image_url as "imageUrl", related_entity_ids as "relatedEntityIds",
              tags, created_at as "createdAt", updated_at as "updatedAt"
       FROM ghost_entities
       WHERE id = $1`,
      [ghostId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const ghostEntity = result.rows[0];

    // Cache the result
    await cacheSet(cacheKey, ghostEntity, CacheTTL.ghostEntities);

    return ghostEntity;
  }

  /**
   * Get ghosts by category with pagination
   */
  async getGhostsByCategory(
    category: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<GhostEntity>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM ghost_entities WHERE type = $1',
      [category]
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const result = await query<any>(
      `SELECT id, name, type, origin, cultural_context as "culturalContext",
              description, characteristics, danger_level as "dangerLevel",
              image_url as "imageUrl", related_entity_ids as "relatedEntityIds",
              tags, created_at as "createdAt", updated_at as "updatedAt"
       FROM ghost_entities
       WHERE type = $1
       ORDER BY name ASC
       LIMIT $2 OFFSET $3`,
      [category, limit, offset]
    );

    return {
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Get related ghost entities
   */
  async getRelatedGhosts(ghostId: string): Promise<GhostEntity[]> {
    // First get the ghost entity to access related_entity_ids
    const ghost = await this.getGhostById(ghostId);
    if (!ghost || !ghost.relatedEntityIds || ghost.relatedEntityIds.length === 0) {
      return [];
    }

    // Query for related entities
    const result = await query<any>(
      `SELECT id, name, type, origin, cultural_context as "culturalContext",
              description, characteristics, danger_level as "dangerLevel",
              image_url as "imageUrl", related_entity_ids as "relatedEntityIds",
              tags, created_at as "createdAt", updated_at as "updatedAt"
       FROM ghost_entities
       WHERE id = ANY($1)
       ORDER BY name ASC`,
      [ghost.relatedEntityIds]
    );

    return result.rows;
  }
}

export const ghostRepository = new GhostRepositoryImpl();
