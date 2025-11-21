import { Router, Request, Response } from 'express';
import { bookmarkService } from '../services/bookmark.service';
import { ContentType } from '../repositories/bookmark.repository';
import { authenticateSession } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/bookmarks
 * Create a new bookmark (authenticated)
 */
router.post('/', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { contentId, contentType, tags, notes } = req.body;

    // Validate required fields
    if (!contentId || !contentType) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'contentId and contentType are required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Validate content type
    if (!Object.values(ContentType).includes(contentType)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid contentType. Must be one of: ${Object.values(ContentType).join(', ')}`,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const bookmark = await bookmarkService.addBookmark(
      userId,
      contentId,
      contentType,
      tags,
      notes
    );

    res.status(201).json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create bookmark',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/bookmarks
 * Get all bookmarks for the authenticated user
 */
router.get('/', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const bookmarks = await bookmarkService.getUserBookmarks(userId);

    res.status(200).json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch bookmarks',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * DELETE /api/bookmarks/:bookmarkId
 * Delete a bookmark (authenticated)
 */
router.delete('/:bookmarkId', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { bookmarkId } = req.params;

    await bookmarkService.removeBookmark(userId, bookmarkId);

    res.status(200).json({
      success: true,
      message: 'Bookmark deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting bookmark:', error);

    if (error.message === 'Bookmark not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Bookmark not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete bookmark',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * PUT /api/bookmarks/:bookmarkId/organize
 * Update bookmark tags (authenticated)
 */
router.put('/:bookmarkId/organize', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { bookmarkId } = req.params;
    const { tags } = req.body;

    // Validate tags
    if (!Array.isArray(tags)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'tags must be an array',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const bookmark = await bookmarkService.organizeBookmark(userId, bookmarkId, tags);

    res.status(200).json({
      success: true,
      data: bookmark,
    });
  } catch (error: any) {
    console.error('Error organizing bookmark:', error);

    if (error.message === 'Bookmark not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Bookmark not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to organize bookmark',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

export default router;
