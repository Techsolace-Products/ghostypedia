import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pool, { query, executeInTransaction } from './database';
import { PoolClient } from 'pg';

interface Migration {
  version: number;
  name: string;
  upFile: string;
  downFile: string;
}

// Migration tracking table
const createMigrationsTable = `
  CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    version INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Get all available migrations from the migrations directory
 */
function getAvailableMigrations(): Migration[] {
  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir);
  
  // Group files by version number
  const migrationMap = new Map<number, Partial<Migration>>();
  
  for (const file of files) {
    // Parse migration filename: 001_migration_name.sql or 001_migration_name_down.sql
    const match = file.match(/^(\d+)_(.+?)(_(down|up))?\.sql$/);
    if (!match) continue;
    
    const version = parseInt(match[1], 10);
    const name = match[2];
    const isDown = match[4] === 'down';
    
    if (!migrationMap.has(version)) {
      migrationMap.set(version, { version, name });
    }
    
    const migration = migrationMap.get(version)!;
    if (isDown) {
      migration.downFile = file;
    } else {
      migration.upFile = file;
    }
  }
  
  // Convert to array and validate
  const migrations: Migration[] = [];
  for (const [version, migration] of migrationMap.entries()) {
    if (!migration.upFile) {
      console.warn(`Warning: Migration ${version} missing up file, skipping`);
      continue;
    }
    
    migrations.push({
      version,
      name: migration.name!,
      upFile: migration.upFile,
      downFile: migration.downFile || ''
    });
  }
  
  // Sort by version
  migrations.sort((a, b) => a.version - b.version);
  
  return migrations;
}

/**
 * Get list of executed migrations from database
 */
async function getExecutedMigrations(): Promise<number[]> {
  try {
    await query(createMigrationsTable);
    const result = await query('SELECT version FROM migrations ORDER BY version');
    return result.rows.map(row => row.version);
  } catch (error) {
    console.error('Failed to get executed migrations:', error);
    return [];
  }
}

/**
 * Check if a specific migration has been executed
 */
async function isMigrationExecuted(version: number): Promise<boolean> {
  const result = await query(
    'SELECT id FROM migrations WHERE version = $1',
    [version]
  );
  return result.rows.length > 0;
}

/**
 * Record migration execution
 */
async function recordMigration(client: PoolClient, version: number, name: string): Promise<void> {
  await client.query(
    'INSERT INTO migrations (version, name) VALUES ($1, $2)',
    [version, name]
  );
}

/**
 * Remove migration record
 */
async function removeMigrationRecord(client: PoolClient, version: number): Promise<void> {
  await client.query(
    'DELETE FROM migrations WHERE version = $1',
    [version]
  );
}

/**
 * Run a single migration
 */
async function runMigration(migration: Migration): Promise<void> {
  console.log(`Running migration ${migration.version}: ${migration.name}`);
  
  await executeInTransaction(async (client: PoolClient) => {
    // Check if already executed
    if (await isMigrationExecuted(migration.version)) {
      console.log(`  ⚠ Migration ${migration.version} already executed, skipping`);
      return;
    }
    
    // Read and execute migration file
    const migrationsDir = join(__dirname, 'migrations');
    const migrationPath = join(migrationsDir, migration.upFile);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    await client.query(sql);
    await recordMigration(client, migration.version, migration.name);
    
    console.log(`  ✓ Migration ${migration.version} completed`);
  }, `migration_up_${migration.version}`);
}

/**
 * Rollback a single migration
 */
async function rollbackMigration(migration: Migration): Promise<void> {
  console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
  
  if (!migration.downFile) {
    throw new Error(`Migration ${migration.version} has no rollback file`);
  }
  
  await executeInTransaction(async (client: PoolClient) => {
    // Check if migration was executed
    if (!(await isMigrationExecuted(migration.version))) {
      console.log(`  ⚠ Migration ${migration.version} not executed, skipping`);
      return;
    }
    
    // Read and execute rollback file
    const migrationsDir = join(__dirname, 'migrations');
    const rollbackPath = join(migrationsDir, migration.downFile);
    const sql = readFileSync(rollbackPath, 'utf-8');
    
    await client.query(sql);
    await removeMigrationRecord(client, migration.version);
    
    console.log(`  ✓ Migration ${migration.version} rolled back`);
  }, `migration_down_${migration.version}`);
}

/**
 * Run all pending migrations
 */
export async function migrateUp(targetVersion?: number): Promise<void> {
  console.log('Running migrations...\n');
  
  const availableMigrations = getAvailableMigrations();
  const executedVersions = await getExecutedMigrations();
  
  console.log(`Available migrations: ${availableMigrations.length}`);
  console.log(`Executed migrations: ${executedVersions.length}\n`);
  
  let migrationsRun = 0;
  
  for (const migration of availableMigrations) {
    // Stop if we've reached the target version
    if (targetVersion && migration.version > targetVersion) {
      break;
    }
    
    // Skip if already executed
    if (executedVersions.includes(migration.version)) {
      continue;
    }
    
    await runMigration(migration);
    migrationsRun++;
  }
  
  if (migrationsRun === 0) {
    console.log('No pending migrations to run');
  } else {
    console.log(`\n✅ Successfully ran ${migrationsRun} migration(s)`);
  }
}

/**
 * Rollback migrations
 */
export async function migrateDown(steps: number = 1): Promise<void> {
  console.log(`Rolling back ${steps} migration(s)...\n`);
  
  const availableMigrations = getAvailableMigrations();
  const executedVersions = await getExecutedMigrations();
  
  // Get migrations to rollback (in reverse order)
  const migrationsToRollback = availableMigrations
    .filter(m => executedVersions.includes(m.version))
    .sort((a, b) => b.version - a.version)
    .slice(0, steps);
  
  if (migrationsToRollback.length === 0) {
    console.log('No migrations to roll back');
    return;
  }
  
  for (const migration of migrationsToRollback) {
    await rollbackMigration(migration);
  }
  
  console.log(`\n✅ Successfully rolled back ${migrationsToRollback.length} migration(s)`);
}

/**
 * Rollback to a specific version
 */
export async function migrateToVersion(targetVersion: number): Promise<void> {
  const availableMigrations = getAvailableMigrations();
  const executedVersions = await getExecutedMigrations();
  const currentVersion = executedVersions.length > 0 
    ? Math.max(...executedVersions) 
    : 0;
  
  if (targetVersion === currentVersion) {
    console.log(`Already at version ${targetVersion}`);
    return;
  }
  
  if (targetVersion > currentVersion) {
    // Migrate up
    console.log(`Migrating from version ${currentVersion} to ${targetVersion}\n`);
    await migrateUp(targetVersion);
  } else {
    // Migrate down
    console.log(`Rolling back from version ${currentVersion} to ${targetVersion}\n`);
    
    const migrationsToRollback = availableMigrations
      .filter(m => executedVersions.includes(m.version) && m.version > targetVersion)
      .sort((a, b) => b.version - a.version);
    
    for (const migration of migrationsToRollback) {
      await rollbackMigration(migration);
    }
    
    console.log(`\n✅ Successfully migrated to version ${targetVersion}`);
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<void> {
  const availableMigrations = getAvailableMigrations();
  const executedVersions = await getExecutedMigrations();
  
  console.log('Migration Status:\n');
  console.log('Version | Status    | Name');
  console.log('--------|-----------|---------------------');
  
  for (const migration of availableMigrations) {
    const status = executedVersions.includes(migration.version) ? '✓ Applied' : '✗ Pending';
    console.log(`${String(migration.version).padStart(7)} | ${status.padEnd(9)} | ${migration.name}`);
  }
  
  const currentVersion = executedVersions.length > 0 
    ? Math.max(...executedVersions) 
    : 0;
  const pendingCount = availableMigrations.filter(m => !executedVersions.includes(m.version)).length;
  
  console.log('\nSummary:');
  console.log(`  Current version: ${currentVersion}`);
  console.log(`  Applied: ${executedVersions.length}`);
  console.log(`  Pending: ${pendingCount}`);
  console.log(`  Total: ${availableMigrations.length}`);
}

/**
 * Reset database (rollback all migrations)
 */
export async function resetDatabase(): Promise<void> {
  console.log('Resetting database (rolling back all migrations)...\n');
  
  const availableMigrations = getAvailableMigrations();
  const executedVersions = await getExecutedMigrations();
  
  const migrationsToRollback = availableMigrations
    .filter(m => executedVersions.includes(m.version))
    .sort((a, b) => b.version - a.version);
  
  for (const migration of migrationsToRollback) {
    await rollbackMigration(migration);
  }
  
  console.log('\n✅ Database reset complete');
}

/**
 * Close database connection
 */
export async function closeMigrationConnection(): Promise<void> {
  await pool.end();
}
