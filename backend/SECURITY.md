# Security Implementation Guide

This document describes the security features implemented in the Ghostypedia Backend and how to use them.

## Overview

The backend implements multiple layers of security:

1. **Rate Limiting** - Prevents abuse by limiting request rates
2. **Input Validation & Sanitization** - Prevents injection attacks
3. **Security Headers** - Protects against common web vulnerabilities
4. **HTTPS Enforcement** - Ensures encrypted communication
5. **CORS Configuration** - Controls cross-origin access
6. **Request Logging** - Tracks security-relevant events

## Rate Limiting

### Usage

Rate limiting is implemented using Redis and can be applied at different levels:

```typescript
import { rateLimiters, createRateLimiter } from './middleware';

// Use pre-configured rate limiters
router.use(rateLimiters.auth);        // For authentication endpoints (10 req/15min)
router.use(rateLimiters.search);      // For search endpoints (30 req/min)
router.use(rateLimiters.ai);          // For AI endpoints (10 req/min)
router.use(rateLimiters.readOnly);    // For read-only endpoints (60 req/min)
router.use(rateLimiters.standard);    // For standard endpoints (100 req/15min)

// Create custom rate limiter
const customLimiter = createRateLimiter({
  windowMs: 60000,        // 1 minute
  maxRequests: 20,        // 20 requests
  keyGenerator: (req) => req.user?.id || req.ip, // Custom key
});
```

### Rate Limit Headers

All rate-limited responses include these headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the rate limit resets
- `Retry-After`: Seconds to wait before retrying (when limit exceeded)

### Response Format (429 Too Many Requests)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 100,
      "windowMs": 900000,
      "retryAfter": 847
    },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid-here"
  }
}
```

## Input Validation & Sanitization

### Usage

Use the `ValidationRules` and `validate` helper:

```typescript
import { ValidationRules, validate } from './middleware';

router.post(
  '/register',
  validate([
    ValidationRules.email(),
    ValidationRules.password(),
    ValidationRules.username(),
  ]),
  async (req, res) => {
    // Request body is validated and sanitized
    const { email, password, username } = req.body;
    // ...
  }
);
```

### Available Validation Rules

- `email()` - Validates and normalizes email addresses
- `password()` - Enforces strong password requirements (min 8 chars, uppercase, lowercase, number)
- `username()` - Validates username format (3-30 chars, alphanumeric + underscore/hyphen)
- `uuidParam(name)` - Validates UUID parameters
- `searchQuery()` - Validates search queries (max 200 chars)
- `pagination()` - Validates page and limit parameters
- `category()` - Validates category names
- `sort(allowedFields)` - Validates sort parameters
- `progressPercentage()` - Validates progress (0-100)
- `tags()` - Validates tag arrays (max 20 tags, 50 chars each)
- `preferences()` - Validates preference profile data
- `message()` - Validates message content (1-2000 chars)

### SQL Injection Prevention

The `preventSQLInjection` middleware automatically checks for common SQL injection patterns:

```typescript
import { preventSQLInjection } from './middleware';

// Applied globally in index.ts
app.use(preventSQLInjection);
```

### XSS Prevention

The `preventXSS` middleware sanitizes HTML content:

```typescript
import { preventXSS } from './middleware';

// Applied globally in index.ts
app.use(preventXSS);
```

## Security Headers

### Helmet Configuration

The following security headers are automatically applied:

- **Content-Security-Policy**: Prevents XSS and injection attacks
- **X-Frame-Options**: Prevents clickjacking (set to DENY)
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Strict-Transport-Security**: Enforces HTTPS (1 year max-age)
- **Referrer-Policy**: Controls referrer information (no-referrer)
- **Permissions-Policy**: Restricts browser features

### CORS Configuration

CORS is configured to allow specific origins:

```typescript
// In .env file
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

In development mode, all origins are allowed. In production, only whitelisted origins are permitted.

### Request ID Tracking

Every request is assigned a unique ID for tracking:

```typescript
// Access request ID in your code
const requestId = (req as any).requestId;

// Request ID is also in response headers
// X-Request-ID: uuid-here
```

## HTTPS Enforcement

In production, all HTTP requests are automatically redirected to HTTPS:

```typescript
// Automatically applied in production
app.use(enforceHTTPS);
```

## Security Logging

Security-relevant events are automatically logged:

- 401/403 responses (unauthorized access attempts)
- 429 responses (rate limit exceeded)
- All 4xx errors (client errors)

Log format:
```json
{
  "requestId": "uuid",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "method": "POST",
  "path": "/api/auth/login",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "userId": "user-id-or-anonymous",
  "statusCode": 401,
  "duration": 123
}
```

## Environment Variables

Add these to your `.env` file:

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100        # 100 requests per window

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info                     # info, debug, warn, error
```

## Best Practices

1. **Always use rate limiting** on authentication endpoints to prevent brute force attacks
2. **Validate all user input** using the validation middleware
3. **Use HTTPS in production** - the middleware enforces this automatically
4. **Monitor security logs** for suspicious activity
5. **Keep dependencies updated** to patch security vulnerabilities
6. **Use strong JWT secrets** in production (change the default!)
7. **Configure CORS properly** - don't allow all origins in production
8. **Implement proper error handling** - don't leak sensitive information in error messages

## Testing Security Features

### Test Rate Limiting

```bash
# Make multiple requests quickly
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
done
```

### Test Input Validation

```bash
# Test with invalid email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"Test123","username":"testuser"}'

# Test with weak password
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak","username":"testuser"}'
```

### Test Security Headers

```bash
# Check security headers
curl -I http://localhost:3000/api/health
```

## Troubleshooting

### Rate Limit Not Working

- Ensure Redis is running and connected
- Check Redis connection in logs
- Verify rate limit configuration in `.env`

### CORS Errors

- Check `ALLOWED_ORIGINS` in `.env`
- Ensure frontend origin is whitelisted
- In development, CORS should allow all origins

### Validation Errors

- Check request payload format
- Ensure all required fields are present
- Verify field values meet validation rules

## Security Checklist for Production

- [ ] Change default JWT secret
- [ ] Configure proper ALLOWED_ORIGINS
- [ ] Enable HTTPS
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limits appropriately
- [ ] Review and test all validation rules
- [ ] Set up security alerts for suspicious activity
- [ ] Regularly update dependencies
- [ ] Implement proper backup and recovery procedures
- [ ] Configure database connection limits
- [ ] Set up Redis persistence
- [ ] Review and test error handling
