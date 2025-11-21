import { createClient, RedisClientType } from 'redis';
import { config } from './env';

// Create Redis client
const redisClient: RedisClientType = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password,
  database: config.redis.db,
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

// Connect to Redis
let isConnected = false;

export async function connectRedis(): Promise<void> {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  if (isConnected) {
    await redisClient.quit();
    isConnected = false;
  }
}

// Cache key generation utilities
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userPreferences: (userId: string) => `user:${userId}:preferences`,
  ghostEntity: (ghostId: string) => `ghost:${ghostId}`,
  ghostEntitiesByCategory: (category: string, page: number) => `ghosts:category:${category}:page:${page}`,
  ghostSearch: (query: string, filters: string) => `ghosts:search:${query}:${filters}`,
  story: (storyId: string) => `story:${storyId}`,
  storiesByGhost: (ghostId: string) => `stories:ghost:${ghostId}`,
  readingProgress: (userId: string, storyId: string) => `progress:${userId}:${storyId}`,
  recommendations: (userId: string) => `recommendations:${userId}`,
  bookmarks: (userId: string) => `bookmarks:${userId}`,
  session: (token: string) => `session:${token}`,
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
};

// Cache get helper
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

// Cache set helper with TTL
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

// Cache delete helper
export async function cacheDelete(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
}

// Cache delete by pattern
export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error(`Cache delete pattern error for pattern ${pattern}:`, error);
  }
}

// Cache exists check
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Cache exists error for key ${key}:`, error);
    return false;
  }
}

// Get TTL for a key
export async function cacheTTL(key: string): Promise<number> {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error(`Cache TTL error for key ${key}:`, error);
    return -1;
  }
}

// Increment counter (for rate limiting)
export async function cacheIncrement(key: string): Promise<number> {
  try {
    return await redisClient.incr(key);
  } catch (error) {
    console.error(`Cache increment error for key ${key}:`, error);
    throw error;
  }
}

// Set expiration on existing key
export async function cacheExpire(key: string, ttlSeconds: number): Promise<void> {
  try {
    await redisClient.expire(key, ttlSeconds);
  } catch (error) {
    console.error(`Cache expire error for key ${key}:`, error);
  }
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Cache TTL configuration
export const CacheTTL = {
  default: config.cache.ttlDefault,
  ghostEntities: config.cache.ttlGhostEntities,
  stories: config.cache.ttlStories,
  recommendations: config.cache.ttlRecommendations,
  session: config.auth.sessionTimeout / 1000, // Convert to seconds
  rateLimit: config.rateLimit.windowMs / 1000, // Convert to seconds
};

export default redisClient;
