import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Custom error class with additional context
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Map common error types to HTTP status codes
function getStatusCodeFromError(error: any): number {
  if (error.statusCode) return error.statusCode;
  
  // Database errors
  if (error.code === '23505') return 409; // Unique violation
  if (error.code === '23503') return 400; // Foreign key violation
  if (error.code === '23502') return 400; // Not null violation
  if (error.code === '22P02') return 400; // Invalid text representation
  
  // Default to 500 for unknown errors
  return 500;
}

// Map error types to error codes
function getErrorCode(error: any): string {
  if (error.code && typeof error.code === 'string') {
    // Check if it's already a custom error code
    if (error.code.includes('_')) return error.code;
    
    // Database error codes
    if (error.code === '23505') return 'DUPLICATE_ENTRY';
    if (error.code === '23503') return 'FOREIGN_KEY_VIOLATION';
    if (error.code === '23502') return 'REQUIRED_FIELD_MISSING';
    if (error.code === '22P02') return 'INVALID_INPUT';
  }
  
  return 'INTERNAL_ERROR';
}

// Get user-friendly error message
function getUserMessage(error: any): string {
  // Use custom message if available
  if (error.message && error.isOperational) {
    return error.message;
  }
  
  // Database-specific messages
  if (error.code === '23505') {
    return 'A record with this information already exists';
  }
  if (error.code === '23503') {
    return 'Referenced record does not exist';
  }
  if (error.code === '23502') {
    return 'Required field is missing';
  }
  if (error.code === '22P02') {
    return 'Invalid input format';
  }
  
  // Generic message for unexpected errors
  return 'An unexpected error occurred';
}

// Log error with context
function logError(error: any, req: Request, requestId: string): void {
  const timestamp = new Date().toISOString();
  const userId = (req as any).user?.id || 'anonymous';
  
  const errorLog = {
    timestamp,
    requestId,
    userId,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    errorCode: getErrorCode(error),
    errorMessage: error.message,
    statusCode: getStatusCodeFromError(error),
    stack: error.stack,
  };
  
  // Always log to console for debugging
  console.error('=== ERROR CAUGHT ===');
  console.error('Path:', req.method, req.path);
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('==================');
  
  // Log based on severity
  if (getStatusCodeFromError(error) >= 500) {
    console.error('Server Error:', JSON.stringify(errorLog, null, 2));
  } else {
    console.warn('Client Error:', JSON.stringify(errorLog, null, 2));
  }
}

// Centralized error handling middleware
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Generate request ID if not already present
  const requestId = (req as any).requestId || uuidv4();
  
  // Log the error with context
  logError(error, req, requestId);
  
  // Determine status code and error code
  const statusCode = getStatusCodeFromError(error);
  const errorCode = getErrorCode(error);
  const message = getUserMessage(error);
  
  // Build error response
  const errorResponse: ErrorResponse = {
    error: {
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
  
  // Include details in development mode or for operational errors
  if (process.env.NODE_ENV === 'development' || error.isOperational) {
    if (error.details) {
      errorResponse.error.details = error.details;
    }
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

// Async error wrapper for route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Common error factory functions
export const ErrorFactory = {
  unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  },
  
  forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  },
  
  notFound(resource: string = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
  },
  
  badRequest(message: string, details?: any): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', true, details);
  },
  
  conflict(message: string): AppError {
    return new AppError(message, 409, 'CONFLICT');
  },
  
  tooManyRequests(message: string = 'Too many requests'): AppError {
    return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
  },
  
  serviceUnavailable(service: string): AppError {
    return new AppError(
      `${service} is currently unavailable`,
      503,
      'SERVICE_UNAVAILABLE'
    );
  },
  
  internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500, 'INTERNAL_ERROR', false);
  },
};

// 404 handler for undefined routes
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = ErrorFactory.notFound(`Route ${req.method} ${req.path}`);
  next(error);
}
