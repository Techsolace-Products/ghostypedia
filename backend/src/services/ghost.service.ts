import {
  ghostRepository,
  GhostEntity,
  SearchFilters,
  PaginationParams,
  PaginatedResult,
} from '../repositories/ghost.repository';
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from '../config/redis';

export interface GhostSearchOptions {
  query?: string;
  categories?: string[];
  dangerLevel?: number;
  culturalContext?: string;
  tags?: string[];
  sortBy?: 'name' | 'type' | 'dangerLevel' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GhostService {
  searchGhosts(options: GhostSearchOptions): Promise<PaginatedResult<GhostEntity>>;
  getGhostById(ghostId: string): Promise<GhostEntity | null>;
  getGhostsByCategory(category: string, page?: number, limit?: number): Promise<PaginatedResult<GhostEntity>>;
  getRelatedGhosts(ghostId: string): Promise<GhostEntity[]>;
}

class GhostServiceImpl implements GhostService {
  /**
   * Search ghosts with query parsing, filtering, sorting, and pagination
   */
  async searchGhosts(options: GhostSearchOptions): Promise<PaginatedResult<GhostEntity>> {
    const {
      query = '',
      categories,
      dangerLevel,
      culturalContext,
      tags,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
    } = options;

    // Build cache key
    const filterString = JSON.stringify({
      categories,
      dangerLevel,
      culturalContext,
      tags,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const cacheKey = CacheKeys.ghostSearch(query, filterString);

    // Check cache
    const cached = await cacheGet<PaginatedResult<GhostEntity>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build filters
    const filters: SearchFilters = {};
    if (categories && categories.length > 0) {
      filters.categories = categories;
    }
    if (dangerLevel !== undefined) {
      filters.dangerLevel = dangerLevel;
    }
    if (culturalContext) {
      filters.culturalContext = culturalContext;
    }
    if (tags && tags.length > 0) {
      filters.tags = tags;
    }

    // Build pagination
    const pagination: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)), // Cap at 100
    };

    // Execute search
    let result = await ghostRepository.searchGhosts(query, filters, pagination);

    // Apply sorting (repository returns sorted by name ASC by default)
    if (sortBy !== 'name' || sortOrder !== 'asc') {
      result.data = this.sortGhostEntities(result.data, sortBy, sortOrder);
    }

    // Cache the result
    await cacheSet(cacheKey, result, CacheTTL.ghostEntities);

    return result;
  }

  /**
   * Get ghost entity by ID
   */
  async getGhostById(ghostId: string): Promise<GhostEntity | null> {
    return ghostRepository.getGhostById(ghostId);
  }

  /**
   * Get ghosts by category with pagination
   */
  async getGhostsByCategory(
    category: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResult<GhostEntity>> {
    // Build cache key
    const cacheKey = CacheKeys.ghostEntitiesByCategory(category, page);

    // Check cache
    const cached = await cacheGet<PaginatedResult<GhostEntity>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build pagination
    const pagination: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)), // Cap at 100
    };

    // Execute query
    const result = await ghostRepository.getGhostsByCategory(category, pagination);

    // Cache the result
    await cacheSet(cacheKey, result, CacheTTL.ghostEntities);

    return result;
  }

  /**
   * Get related ghost entities
   */
  async getRelatedGhosts(ghostId: string): Promise<GhostEntity[]> {
    return ghostRepository.getRelatedGhosts(ghostId);
  }

  /**
   * Sort ghost entities by specified criteria
   */
  private sortGhostEntities(
    entities: GhostEntity[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): GhostEntity[] {
    const sorted = [...entities];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'dangerLevel':
          comparison = a.dangerLevel - b.dangerLevel;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
}

export const ghostService = new GhostServiceImpl();
