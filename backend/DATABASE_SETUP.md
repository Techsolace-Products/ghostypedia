# Database and Caching Infrastructure Setup

This document describes the database and caching infrastructure implemented for Ghostypedia Backend.

## Overview

The infrastructure consists of:
- **PostgreSQL**: Primary data store with connection pooling
- **Redis**: Caching layer and session management
- **Migration System**: Database schema versioning and management

## Files Created

### Database Configuration
- `src/config/database.ts` - PostgreSQL connection pool and transaction helpers
- `src/config/schema.sql` - Complete database schema definition
- `src/config/migrations.ts` - Migration management utilities
- `src/scripts/migrate.ts` - Migration runner script

### Redis Configuration
- `src/config/redis.ts` - Redis client and caching utilities

## Database Schema

The schema includes the following tables:

1. **users** - User accounts with authentication credentials
2. **preference_profiles** - User preferences for personalization
3. **ghost_entities** - Paranormal entity records with full-text search
4. **stories** - Narrative content about paranormal entities
5. **story_ghost_entities** - Many-to-many relationship between stories and ghosts
6. **ghost_entity_relationships** - Related ghost entities
7. **reading_progress** - User reading progress tracking
8. **bookmarks** - User bookmarks with polymorphic content references
9. **interactions** - User interaction tracking for recommendations
10. **recommendations** - AI-generated recommendations
11. **recommendation_feedback** - User feedback on recommendations
12. **conversation_messages** - Digital twin conversation history
13. **sessions** - User session management with expiration

### Key Features
- UUID primary keys for all tables
- Automatic timestamp management with triggers
- Full-text search indexes on ghost entities
- GIN indexes for array fields (tags, characteristics)
- Foreign key constraints with CASCADE deletion
- Check constraints for data validation

## Usage

### Running Migrations

```bash
# Run migrations (create schema)
npm run migrate:up

# Rollback migrations (drop schema)
npm run migrate:down

# Check migration status
npm run migrate:status
```

### Database Connection

The database connection pool is automatically initialized when the server starts. Configuration is managed through environment variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ghostypedia
DB_USER=postgres
DB_PASSWORD=your_password
DB_MAX_CONNECTIONS=20
```

### Transaction Helper

Use the `executeInTransaction` helper for operations requiring atomicity:

```typescript
import { executeInTransaction } from './config/database';

const result = await executeInTransaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO preference_profiles ...');
  return { success: true };
});
```

### Redis Caching

Redis is automatically connected when the server starts. Use the caching utilities:

```typescript
import { cacheGet, cacheSet, cacheDelete, CacheKeys, CacheTTL } from './config/redis';

// Set cache with TTL
await cacheSet(CacheKeys.user(userId), userData, CacheTTL.default);

// Get from cache
const userData = await cacheGet(CacheKeys.user(userId));

// Delete from cache
await cacheDelete(CacheKeys.user(userId));
```

### Cache Key Patterns

Predefined cache key generators are available in `CacheKeys`:
- `user(userId)` - User data
- `userPreferences(userId)` - User preferences
- `ghostEntity(ghostId)` - Ghost entity data
- `story(storyId)` - Story data
- `recommendations(userId)` - User recommendations
- And more...

### Health Checks

The `/health` endpoint checks both database and Redis connectivity:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "message": "Ghostypedia Backend",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **8.2**: Database transaction rollback on failures
- **1.1, 2.1, 3.1, 4.1, 5.2, 6.4, 9.2, 10.1**: Complete schema for all features
- **7.2, 7.3, 8.5**: Redis caching infrastructure with TTL configuration

## Next Steps

1. Ensure PostgreSQL is installed and running
2. Ensure Redis is installed and running
3. Copy `.env.example` to `.env` and configure database credentials
4. Run `npm run migrate:up` to create the schema
5. Start the development server with `npm run dev`
