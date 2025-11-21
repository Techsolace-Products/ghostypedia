import { Router, Request, Response } from 'express';
import { recommendationService } from '../services/recommendation.service';
import { authenticateSession } from '../middleware/auth.middleware';
import { InteractionType, ContentType } from '../repositories/interaction.repository';
import { FeedbackType } from '../repositories/recommendation.repository';

const router = Router();

/**
 * GET /api/recommendations
 * Get personalized recommendations (authenticated)
 */
router.get('/', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

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

    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);

    res.status(200).json({
      success: true,
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recommendations',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * POST /api/recommendations/interaction
 * Record user interaction (authenticated)
 */
router.post('/interaction', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { contentId, contentType, interactionType } = req.body;

    // Validate required fields
    if (!contentId || !contentType || !interactionType) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'contentId, contentType, and interactionType are required',
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
          message: `Invalid content type. Must be one of: ${Object.values(ContentType).join(', ')}`,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Validate interaction type
    if (!Object.values(InteractionType).includes(interactionType)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid interaction type. Must be one of: ${Object.values(InteractionType).join(', ')}`,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const interaction = await recommendationService.recordInteraction(
      userId,
      contentId,
      contentType,
      interactionType
    );

    res.status(201).json({
      success: true,
      data: interaction,
      message: 'Interaction recorded successfully',
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to record interaction',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * POST /api/recommendations/feedback
 * Submit recommendation feedback (authenticated)
 */
router.post('/feedback', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { recommendationId, feedbackType } = req.body;

    // Validate required fields
    if (!recommendationId || !feedbackType) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'recommendationId and feedbackType are required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Validate feedback type
    if (!Object.values(FeedbackType).includes(feedbackType)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid feedback type. Must be one of: ${Object.values(FeedbackType).join(', ')}`,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    await recommendationService.submitFeedback(userId, recommendationId, feedbackType);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit feedback',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

export default router;
