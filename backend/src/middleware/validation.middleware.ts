import { Request, Response, NextFunction } from 'express';
const expressValidator = require('express-validator');

const { body, param, query, validationResult } = expressValidator;
type ValidationChain = ReturnType<typeof body>;
type ValidationError = any; // express-validator's error type

/**
 * Middleware to handle validation errors
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array().map((err: ValidationError) => ({
          field: err.type === 'field' ? (err as any).path : undefined,
          message: err.msg,
          value: err.type === 'field' ? (err as any).value : undefined,
        })),
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }
  
  next();
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  // Email validation
  email: () =>
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail()
      .escape(),

  // Password validation
  password: () =>
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Username validation
  username: () =>
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
      .escape(),

  // UUID validation for IDs
  uuidParam: (paramName: string) =>
    param(paramName)
      .trim()
      .isUUID()
      .withMessage(`${paramName} must be a valid UUID`)
      .escape(),

  // Search query validation
  searchQuery: () =>
    query('q')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Search query must not exceed 200 characters')
      .escape(),

  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
  ],

  // Category validation
  category: () =>
    query('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category must not exceed 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Category can only contain letters, numbers, underscores, and hyphens')
      .escape(),

  // Sort validation
  sort: (allowedFields: string[]) =>
    query('sort')
      .optional()
      .trim()
      .isIn(allowedFields)
      .withMessage(`Sort must be one of: ${allowedFields.join(', ')}`)
      .escape(),

  // Progress percentage validation
  progressPercentage: () =>
    body('progressPercentage')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Progress percentage must be between 0 and 100')
      .toFloat(),

  // Reading position validation
  lastReadPosition: () =>
    body('lastReadPosition')
      .isInt({ min: 0 })
      .withMessage('Last read position must be a non-negative integer')
      .toInt(),

  // Content type validation
  contentType: (allowedTypes: string[]) =>
    body('contentType')
      .trim()
      .isIn(allowedTypes)
      .withMessage(`Content type must be one of: ${allowedTypes.join(', ')}`)
      .escape(),

  // Tags validation
  tags: () =>
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags: any[]) => {
        if (tags.length > 20) {
          throw new Error('Cannot have more than 20 tags');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.length > 50) {
            throw new Error('Each tag must be a string with max 50 characters');
          }
        }
        return true;
      }),

  // Preference profile validation
  preferences: () => [
    body('favoriteGhostTypes')
      .optional()
      .isArray()
      .withMessage('Favorite ghost types must be an array'),
    body('preferredContentTypes')
      .optional()
      .isArray()
      .withMessage('Preferred content types must be an array'),
    body('culturalInterests')
      .optional()
      .isArray()
      .withMessage('Cultural interests must be an array'),
    body('spookinessLevel')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Spookiness level must be between 1 and 5')
      .toInt(),
  ],

  // Feedback type validation
  feedbackType: () =>
    body('feedbackType')
      .trim()
      .isIn(['like', 'dislike', 'not_interested'])
      .withMessage('Feedback type must be one of: like, dislike, not_interested')
      .escape(),

  // Interaction type validation
  interactionType: () =>
    body('interactionType')
      .trim()
      .isIn(['view', 'click', 'bookmark', 'read', 'share'])
      .withMessage('Interaction type must be one of: view, click, bookmark, read, share')
      .escape(),

  // Message content validation
  message: () =>
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters')
      .escape(),

  // Notes validation
  notes: () =>
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters')
      .escape(),
};

/**
 * SQL Injection prevention - additional layer
 * This checks for common SQL injection patterns
 */
export function preventSQLInjection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|\*|;|'|"|`|\\)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkValue(value[key])) {
          return true;
        }
      }
    }
    return false;
  };

  // Check query parameters
  if (checkValue(req.query)) {
    res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid characters detected in request',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  // Check body parameters
  if (checkValue(req.body)) {
    res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid characters detected in request',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  next();
}

/**
 * XSS prevention - sanitize HTML content
 * This is a basic implementation; for production, consider using a library like DOMPurify
 */
export function preventXSS(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
    /<embed\b/gi,
    /<object\b/gi,
  ];

  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      let sanitized = value;
      for (const pattern of xssPatterns) {
        sanitized = sanitized.replace(pattern, '');
      }
      return sanitized;
    } else if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  // Sanitize query parameters
  req.query = sanitizeValue(req.query);

  // Sanitize body parameters
  req.body = sanitizeValue(req.body);

  next();
}

/**
 * Combine validation rules with error handling
 */
export function validate(validations: ValidationChain[]) {
  return [...validations, handleValidationErrors];
}

// Suppress unused parameter warnings for middleware functions
// These parameters are required by Express middleware signature
export {};
