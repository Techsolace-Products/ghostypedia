import { Router, Request, Response } from 'express';
import { ghostService, GhostSearchOptions } from '../services/ghost.service';

const router = Router();

/**
 * GET /api/ghosts
 * Search and browse ghost entities with filters
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
 * GET /api/ghosts/:ghostId
 * Get specific ghost entity by ID
 */
router.get('/:ghostId', async (req: Request, res: Response): Promise<void> => {
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

/**
 * GET /api/ghosts/category/:category
 * Get ghosts by category with pagination
 */
router.get('/category/:category', async (req: Request, res: Response): Promise<void> => {
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
 */
router.get('/:ghostId/related', async (req: Request, res: Response): Promise<void> => {
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

export default router;
