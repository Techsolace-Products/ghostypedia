import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { authenticateSession } from '../middleware/auth.middleware';
import { rateLimiters, ValidationRules, validate } from '../middleware';
import {
  validateRegistrationData,
  validateLoginData,
  validatePasswordResetRequest,
  validatePasswordReset,
} from '../utils/validation';

const router = Router();

// Apply auth-specific rate limiting to all routes in this router
router.use(rateLimiters.auth);

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post(
  '/register',
  validate([
    ValidationRules.email(),
    ValidationRules.password(),
    ValidationRules.username(),
  ]),
  async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Registration request received:', { email: req.body.email, username: req.body.username });
    
    // Validate input
    const validationErrors = validateRegistrationData(req.body);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration data',
          details: validationErrors,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const { email, password, username } = req.body;

    // Register user
    console.log('Calling authService.register...');
    const user = await authService.register({ email, password, username });
    console.log('User registered successfully:', user.id);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle duplicate email/username errors
    if (error.code === '23505') {
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Email or username already exists',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to register user',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post(
  '/login',
  validate([
    ValidationRules.email(),
    ValidationRules.password(),
  ]),
  async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validationErrors = validateLoginData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid login data',
          details: validationErrors,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const { email, password } = req.body;

    // Login user
    const session = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      data: {
        token: session.token,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to login',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * POST /api/auth/logout
 * End user session
 */
router.post('/logout', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing authorization header',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    await authService.logout(token);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to logout',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Request password reset or complete password reset
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if this is a reset request or reset completion
    if (req.body.token && req.body.newPassword) {
      // Complete password reset
      const validationErrors = validatePasswordReset(req.body);
      if (validationErrors.length > 0) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid password reset data',
            details: validationErrors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } else {
      // Request password reset
      const validationErrors = validatePasswordResetRequest(req.body);
      if (validationErrors.length > 0) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid password reset request',
            details: validationErrors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      const { email } = req.body;
      const resetToken = await authService.generatePasswordResetToken(email);

      // In production, this would be sent via email
      // For now, return it in the response (NOT SECURE - for development only)
      res.status(200).json({
        success: true,
        message: 'Password reset token generated',
        data: {
          resetToken, // Remove this in production
        },
      });
    }
  } catch (error: any) {
    if (error.message === 'User not found') {
      // Don't reveal if user exists for security
      res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
      return;
    }

    if (error.message === 'Invalid or expired reset token') {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process password reset',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/auth/validate
 * Validate session token
 */
router.get('/validate', authenticateSession, async (req: Request, res: Response): Promise<void> => {
  // If we reach here, the session is valid (middleware validated it)
  res.status(200).json({
    success: true,
    data: {
      userId: req.user!.id,
      email: req.user!.email,
      username: req.user!.username,
    },
  });
});

export default router;
