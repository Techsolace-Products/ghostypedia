import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configure Helmet for security headers
 */
export const helmetMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: true,
  
  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  
  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: 'same-origin' },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frameguard (X-Frame-Options)
  frameguard: { action: 'deny' },
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff (X-Content-Type-Options)
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  
  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },
  
  // X-XSS-Protection (legacy but still useful)
  xssFilter: true,
});

/**
 * Configure CORS
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In production, whitelist specific origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
  ],
  maxAge: 86400, // 24 hours
});

/**
 * Request ID middleware for tracking and logging
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate or use existing request ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  // Attach to request for use in logging
  (req as any).requestId = requestId;
  
  // Add to response headers
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

/**
 * Security logging middleware
 * Logs security-relevant events for auditing
 */
export function securityLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  
  // Log request details
  const logData = {
    requestId: (req as any).requestId || 'unknown',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id || 'anonymous',
  };

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      ...logData,
      statusCode: res.statusCode,
      duration,
    };

    // Log security-relevant events
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('Security: Unauthorized access attempt', logEntry);
    } else if (res.statusCode === 429) {
      console.warn('Security: Rate limit exceeded', logEntry);
    } else if (res.statusCode >= 400) {
      console.warn('Security: Client error', logEntry);
    } else if (config.logging.level === 'debug') {
      console.log('Security: Request completed', logEntry);
    }
  });

  next();
}

/**
 * HTTPS enforcement middleware (for production)
 */
export function enforceHTTPS(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip in development
  if (config.nodeEnv === 'development') {
    return next();
  }

  // Check if request is secure
  const isSecure = 
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    req.headers['x-forwarded-ssl'] === 'on';

  if (!isSecure) {
    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, httpsUrl);
  }

  next();
}

/**
 * Additional security headers
 */
export function additionalSecurityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Permissions policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );
  
  next();
}

/**
 * Combined security middleware stack
 */
export function securityMiddlewareStack() {
  return [
    requestIdMiddleware,
    helmetMiddleware,
    corsMiddleware,
    additionalSecurityHeaders,
    securityLoggingMiddleware,
    enforceHTTPS,
  ];
}

// Suppress unused parameter warnings for middleware functions
// These parameters are required by Express middleware signature
export {};
