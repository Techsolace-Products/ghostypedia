# Database Utilities

This document describes the database utilities available for the Ghostypedia backend, including migrations and seeding.

## Table of Contents

- [Migrations](#migrations)
- [Database Seeding](#database-seeding)
- [Common Workflows](#common-workflows)

## Migrations

The migration system provides versioned database schema management with rollback capabilities.

### Migration Commands

#### Run All Pending Migrations
```bash
npm run migrate:up
```
Executes all migrations that haven't been applied yet.

#### Run Migrations Up to Specific Version
```bash
npm run migrate:up 3
```
Runs migrations up to and including version 3.

#### Rollback Last Migration
```bash
npm run migrate:down
```
Rolls back the most recently applied migration.

#### Rollback Multiple Migrations
```bash
npm run migrate:down 2
```
Rolls back the last 2 migrations.

#### Migrate to Specific Version
```bash
npm run migrate:to 5
```
Migrates the database to version 5, automatically running or rolling back migrations as needed.

#### Check Migration Status
```bash
npm run migrate:status
```
Shows which migrations have been applied and which are pending.

#### Reset Database
```bash
npm run migrate:reset
```
Rolls back all migrations, returning the database to an empty state.

### Creating New Migrations

1. Create migration files in `src/config/migrations/`:
   - `{version}_{description}.sql` - The migration
   - `{version}_{description}_down.sql` - The rollback

2. Example migration (003_add_tags_table.sql):
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name);
```

3. Example rollback (003_add_tags_table_down.sql):
```sql
DROP TABLE IF EXISTS tags CASCADE;
```

4. Run the migration:
```bash
npm run migrate:up
```

### Migration Best Practices

- Always create both up and down migrations
- Test on development database first
- Keep migrations focused on a single change
- Never modify existing migrations
- Use descriptive names
- Include comments for complex changes
- Migrations run in transactions automatically

## Database Seeding

The seeding system populates the database with sample data for development and testing.

### Seed Commands

#### Seed Database
```bash
npm run seed
```
Adds sample data to the database:
- 10 ghost entities with varied attributes
- 12 stories linked to ghost entities
- 3 sample user accounts with preferences
- Sample interactions, bookmarks, and reading progress

#### Clear Database
```bash
npm run seed:clear
```
Removes all data from the database while preserving the schema.

#### Reset and Re-seed
```bash
npm run seed:reset
```
Clears all data and re-seeds the database with fresh sample data.

### Sample Data Included

#### Ghost Entities
- Banshee (Irish spirit)
- Yurei (Japanese ghost)
- Poltergeist (German entity)
- La Llorona (Mexican spirit)
- Dullahan (Irish fairy)
- Pontianak (Malaysian vampire)
- Will-o'-the-Wisp (English phenomenon)
- Jiangshi (Chinese undead)
- Draugr (Norse undead)
- Kitsune (Japanese spirit)

#### Sample Users
All users have password: `password123`

1. **alice@example.com** (alice_ghost_hunter)
   - Interests: Irish, Japanese folklore
   - Spookiness level: 4/5

2. **bob@example.com** (bob_paranormal)
   - Interests: Chinese, Norse mythology
   - Spookiness level: 5/5

3. **carol@example.com** (carol_folklore)
   - Interests: English, Mexican folklore
   - Spookiness level: 2/5

### Customizing Seed Data

Edit `src/scripts/seed.ts` to modify the sample data:

```typescript
const ghostEntities = [
  {
    name: 'Your Ghost',
    type: 'Spirit',
    origin: 'Your Country',
    // ... other fields
  }
];
```

## Common Workflows

### Initial Setup

1. Set up the database schema:
```bash
npm run migrate:up
```

2. Seed with sample data:
```bash
npm run seed
```

### Development Workflow

1. Check current migration status:
```bash
npm run migrate:status
```

2. Create and run new migration:
```bash
# Create migration files
# Then run:
npm run migrate:up
```

3. Test with fresh data:
```bash
npm run seed:reset
```

### Testing Workflow

1. Reset to clean state:
```bash
npm run migrate:reset
npm run migrate:up
```

2. Seed test data:
```bash
npm run seed
```

3. Run tests:
```bash
npm test
```

### Rollback Workflow

1. Rollback last migration:
```bash
npm run migrate:down
```

2. Fix the migration files

3. Re-run migration:
```bash
npm run migrate:up
```

### Production Deployment

1. Check migration status:
```bash
npm run migrate:status
```

2. Run pending migrations:
```bash
npm run migrate:up
```

**Note:** Never use seed commands in production!

## Troubleshooting

### Migration Failed
Migrations run in transactions, so failures are automatically rolled back. Fix the SQL and run again.

### Database Out of Sync
```bash
npm run migrate:status
```
This shows which migrations are applied and which are pending.

### Need to Start Fresh
```bash
npm run migrate:reset
npm run migrate:up
npm run seed
```

### Seed Data Conflicts
If seeding fails due to existing data:
```bash
npm run seed:clear
npm run seed
```

## Environment Variables

Ensure these are set in your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ghostypedia
DB_USER=your_user
DB_PASSWORD=your_password
```

## Migration Tracking

The system uses a `migrations` table to track applied migrations:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| version | INTEGER | Migration version number |
| name | VARCHAR(255) | Migration name |
| executed_at | TIMESTAMP | When migration was applied |

## Additional Resources

- [Migration Files](./src/config/migrations/)
- [Migration Runner](./src/config/migration-runner.ts)
- [Seed Script](./src/scripts/seed.ts)
- [Database Schema](./src/config/schema.sql)
