import { Router, Request, Response } from 'express';
import { storyService } from '../services/story.service';
import { authenticateSession } from '../middleware/auth.middleware';
import { cacheResponse } from '../middleware/cache.middleware';
import { CacheTTL } from '../config/redis';

const router = Router();

/**
 * GET /api/stories/ghost/:ghostId
 * Get all stories for a ghost entity
 */
router.get('/ghost/:ghostId', cacheResponse(CacheTTL.stories), async (req: Request, res: Response): Promise<void> => {
  try {
    const { ghostId } = req.params;

    const stories = await storyService.getStoriesByGhostId(ghostId);

    res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error('Error fetching stories by ghost ID:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch stories',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/stories/:storyId
 * Get a specific story by ID
 */
router.get('/:storyId', cacheResponse(CacheTTL.stories), async (req: Request, res: Response): Promise<void> => {
  try {
    const { storyId } = req.params;

    const story = await storyService.getStoryById(storyId);

    if (!story) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Story not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch story',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * PUT /api/stories/:storyId/progress
 * Update reading progress for a story (authenticated)
 */
router.put('/:storyId/progress', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const { storyId } = req.params;
    const { progressPercentage, lastReadPosition } = req.body;
    const userId = req.user!.id;

    // Validate input
    if (progressPercentage === undefined || lastReadPosition === undefined) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'progressPercentage and lastReadPosition are required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    if (typeof progressPercentage !== 'number' || typeof lastReadPosition !== 'number') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'progressPercentage and lastReadPosition must be numbers',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const progress = await storyService.updateReadingProgress(
      userId,
      storyId,
      progressPercentage,
      lastReadPosition
    );

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Error updating reading progress:', error);
    
    if (error.message && (error.message.includes('must be between') || error.message.includes('must be non-negative'))) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update reading progress',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/stories/:storyId/progress
 * Get reading progress for a story (authenticated)
 */
router.get('/:storyId/progress', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const { storyId } = req.params;
    const userId = req.user!.id;

    const progress = await storyService.getReadingProgress(userId, storyId);

    if (!progress) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Reading progress not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch reading progress',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * POST /api/stories/:storyId/mark-read
 * Mark a story as completed (authenticated)
 */
router.post('/:storyId/mark-read', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const { storyId } = req.params;
    const userId = req.user!.id;

    const progress = await storyService.markStoryAsRead(userId, storyId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error marking story as read:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark story as read',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

export default router;
