// Environment configuration
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'ghostypedia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400000'),
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:5000',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT || '3000'),
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@ghostypedia.com',
  },
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  
  cache: {
    ttlDefault: parseInt(process.env.CACHE_TTL_DEFAULT || '3600'),
    ttlGhostEntities: parseInt(process.env.CACHE_TTL_GHOST_ENTITIES || '7200'),
    ttlStories: parseInt(process.env.CACHE_TTL_STORIES || '7200'),
    ttlRecommendations: parseInt(process.env.CACHE_TTL_RECOMMENDATIONS || '1800'),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
