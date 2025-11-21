import { Router, Request, Response } from 'express';
import { userService } from '../services/user.service';
import { preferencesService } from '../services/preferences.service';
import { authenticateSession } from '../middleware/auth.middleware';
import { cacheResponse } from '../middleware/cache.middleware';
import { PreferenceProfileUpdate } from '../repositories/preferences.repository';
import { CacheTTL } from '../config/redis';

const router = Router();

/**
 * GET /api/users/:userId
 * Get user profile (authenticated)
 */
router.get('/:userId', authenticateSession, cacheResponse(CacheTTL.default), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own profile
    if (req.user!.id !== userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/users/:userId/preferences
 * Get user preferences (authenticated)
 */
router.get('/:userId/preferences', authenticateSession, cacheResponse(CacheTTL.default), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own preferences
    if (req.user!.id !== userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const preferences = await preferencesService.getPreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch preferences',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * PUT /api/users/:userId/preferences
 * Update user preferences (authenticated)
 */
router.put('/:userId/preferences', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user can only update their own preferences
    if (req.user!.id !== userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const updates: PreferenceProfileUpdate = req.body;

    const updatedPreferences = await preferencesService.updatePreferences(userId, updates);

    res.status(200).json({
      success: true,
      data: updatedPreferences,
    });
  } catch (error: any) {
    console.error('Error updating preferences:', error);

    // Handle validation errors
    if (error.message && (
      error.message.includes('Spookiness level') ||
      error.message.includes('Invalid content types')
    )) {
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
        message: 'Failed to update preferences',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * DELETE /api/users/:userId
 * Delete user account (authenticated)
 */
router.delete('/:userId', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user can only delete their own account
    if (req.user!.id !== userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    await userService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    if (error.message === 'User not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete user',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

export default router;
