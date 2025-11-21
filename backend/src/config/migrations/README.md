# Database Migrations

This directory contains database migration files for the Ghostypedia backend.

## Migration File Naming Convention

Migration files follow this naming pattern:
```
{version}_{description}.sql          # Up migration
{version}_{description}_down.sql     # Down migration (rollback)
```

Example:
- `001_initial_schema.sql` - Creates initial database schema
- `001_initial_schema_down.sql` - Rolls back initial schema
- `002_add_user_roles.sql` - Adds user roles feature
- `002_add_user_roles_down.sql` - Removes user roles feature

## Version Numbers

- Version numbers are 3-digit integers (001, 002, 003, etc.)
- Versions must be sequential
- Each migration must have a unique version number

## Migration Commands

### Run All Pending Migrations
```bash
npm run migrate:up
```

### Run Migrations Up to Specific Version
```bash
npm run migrate:up 3
```

### Rollback Last Migration
```bash
npm run migrate:down
```

### Rollback Multiple Migrations
```bash
npm run migrate:down 2
```

### Migrate to Specific Version
Automatically migrates up or down to reach the target version:
```bash
npm run migrate:to 5
```

### Check Migration Status
```bash
npm run migrate:status
```

### Reset Database (Rollback All)
```bash
npm run migrate:reset
```

## Creating New Migrations

1. Create two files in this directory:
   - `{version}_{description}.sql` - The migration (up)
   - `{version}_{description}_down.sql` - The rollback (down)

2. Write your SQL in the up file:
```sql
-- 002_add_user_roles.sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
```

3. Write the rollback SQL in the down file:
```sql
-- 002_add_user_roles_down.sql
DROP TABLE IF EXISTS user_roles CASCADE;
```

4. Run the migration:
```bash
npm run migrate:up
```

## Best Practices

1. **Always create both up and down migrations** - This allows for easy rollbacks
2. **Test migrations on a development database first**
3. **Keep migrations small and focused** - One feature per migration
4. **Never modify existing migrations** - Create new migrations to fix issues
5. **Use transactions** - The migration runner automatically wraps each migration in a transaction
6. **Include rollback logic** - Always provide a way to undo changes
7. **Document complex migrations** - Add comments explaining non-obvious changes

## Migration Tracking

The system tracks executed migrations in the `migrations` table:
- `version` - Migration version number
- `name` - Migration name/description
- `executed_at` - Timestamp when migration was executed

## Troubleshooting

### Migration Failed Mid-Execution
Migrations run in transactions, so failed migrations are automatically rolled back. Fix the issue and run the migration again.

### Migration Already Executed
The system tracks which migrations have been executed. If you try to run a migration that's already been applied, it will be skipped.

### Need to Rollback Multiple Migrations
Use `npm run migrate:down <number>` to rollback multiple migrations at once.

### Database Out of Sync
Check the current status with `npm run migrate:status` to see which migrations are applied and which are pending.
