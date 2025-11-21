import { Router, Request, Response } from 'express';
import { digitalTwinService } from '../services/digital-twin.service';
import { authenticateSession } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/twin/message
 * Send a message to the digital twin (authenticated)
 */
router.post('/message', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { message } = req.body;

    // Validate required fields
    if (!message) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'message is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Validate message length
    if (typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'message must be a non-empty string',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    if (message.length > 1000) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'message must be 1000 characters or less',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const response = await digitalTwinService.sendMessage(userId, message);

    res.status(200).json({
      success: true,
      data: {
        response: response.response,
        contentReferences: response.contentReferences,
        responseTime: response.responseTime,
      },
    });
  } catch (error) {
    console.error('Error sending message to digital twin:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate response',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/twin/history
 * Get conversation history (authenticated)
 */
router.get('/history', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Limit must be between 1 and 100',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const history = await digitalTwinService.getConversationHistory(userId, limit);

    res.status(200).json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch conversation history',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

export default router;
