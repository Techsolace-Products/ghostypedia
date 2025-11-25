import { Router, Request, Response } from 'express';
import { ghostService, GhostSearchOptions } from '../services/ghost.service';
import { cacheResponse } from '../middleware/cache.middleware';
import { CacheTTL } from '../config/redis';
import { authenticateSession } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/ghosts
 * Create a new ghost entity (authenticated)
 */
router.post('/', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, origin, culturalContext, description, characteristics, dangerLevel, imageUrl, tags } = req.body;

    // Validate required fields
    if (!name || !type || !description) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, type, and description are required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Validate danger level if provided
    if (dangerLevel !== undefined && (dangerLevel < 1 || dangerLevel > 5)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Danger level must be between 1 and 5',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Get authenticated user ID
    const userId = req.user?.id;

    const ghost = await ghostService.createGhost({
      name,
      type,
      origin,
      culturalContext,
      description,
      characteristics,
      dangerLevel,
      imageUrl,
      tags,
    }, userId);

    // Invalidate cache after creating ghost so it appears immediately in search
    try {
      const { CacheInvalidation } = await import('../middleware/cache.middleware');
      await CacheInvalidation.invalidateGhostCaches();
      console.log('Invalidated all ghost caches after creation');
    } catch (cacheError) {
      console.error('Failed to invalidate cache:', cacheError);
    }

    res.status(201).json({
      success: true,
      data: ghost,
      message: tags && tags.length > 0 
        ? 'Ghost created successfully! Your preferences have been updated based on the tags you added.' 
        : 'Ghost created successfully!',
    });
  } catch (error: any) {
    console.error('Error creating ghost:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to create ghost entity',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/ghosts
 * Search and browse ghost entities with filters
 * Note: Cache disabled temporarily for testing
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query,
      categories,
      dangerLevel,
      culturalContext,
      tags,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    // Build search options
    const options: GhostSearchOptions = {};

    if (query && typeof query === 'string') {
      options.query = query;
    }

    if (categories) {
      options.categories = Array.isArray(categories)
        ? categories as string[]
        : [categories as string];
    }

    if (dangerLevel) {
      const level = parseInt(dangerLevel as string, 10);
      if (!isNaN(level) && level >= 1 && level <= 5) {
        options.dangerLevel = level;
      }
    }

    if (culturalContext && typeof culturalContext === 'string') {
      options.culturalContext = culturalContext;
    }

    if (tags) {
      options.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
    }

    if (sortBy && typeof sortBy === 'string') {
      if (['name', 'type', 'dangerLevel', 'createdAt'].includes(sortBy)) {
        options.sortBy = sortBy as 'name' | 'type' | 'dangerLevel' | 'createdAt';
      }
    }

    if (sortOrder && typeof sortOrder === 'string') {
      if (['asc', 'desc'].includes(sortOrder)) {
        options.sortOrder = sortOrder as 'asc' | 'desc';
      }
    }

    if (page) {
      const pageNum = parseInt(page as string, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        options.page = pageNum;
      }
    }

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        options.limit = limitNum;
      }
    }

    const result = await ghostService.searchGhosts(options);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error searching ghosts:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search ghost entities',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/ghosts/category/:category
 * Get ghosts by category with pagination
 * NOTE: This route must come before /:ghostId to avoid routing conflicts
 */
router.get('/category/:category', cacheResponse(CacheTTL.ghostEntities), async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { page, limit } = req.query;

    let pageNum = 1;
    let limitNum = 50;

    if (page) {
      const parsed = parseInt(page as string, 10);
      if (!isNaN(parsed) && parsed > 0) {
        pageNum = parsed;
      }
    }

    if (limit) {
      const parsed = parseInt(limit as string, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limitNum = parsed;
      }
    }

    const result = await ghostService.getGhostsByCategory(category, pageNum, limitNum);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching ghosts by category:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch ghost entities by category',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/ghosts/:ghostId/related
 * Get related ghost entities
 * NOTE: This route must come before /:ghostId to avoid routing conflicts
 */
router.get('/:ghostId/related', cacheResponse(CacheTTL.ghostEntities), async (req: Request, res: Response): Promise<void> => {
  try {
    const { ghostId } = req.params;

    const relatedGhosts = await ghostService.getRelatedGhosts(ghostId);

    res.status(200).json({
      success: true,
      data: relatedGhosts,
    });
  } catch (error) {
    console.error('Error fetching related ghosts:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch related ghost entities',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/ghosts/:ghostId
 * Get specific ghost entity by ID
 * NOTE: This route must come last to avoid matching other routes
 */
router.get('/:ghostId', cacheResponse(CacheTTL.ghostEntities), async (req: Request, res: Response): Promise<void> => {
  try {
    const { ghostId } = req.params;

    const ghost = await ghostService.getGhostById(ghostId);

    if (!ghost) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Ghost entity not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: ghost,
    });
  } catch (error) {
    console.error('Error fetching ghost:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch ghost entity',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

export default router;
