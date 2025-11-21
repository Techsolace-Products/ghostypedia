import { readFileSync } from 'fs';
import { join } from 'path';
import pool, { query } from './database';

// Migration tracking table
const createMigrationsTable = `
  CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

// Check if migration has been executed
async function isMigrationExecuted(name: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM migrations WHERE name = $1',
    [name]
  );
  return result.rows.length > 0;
}

// Record migration execution
async function recordMigration(name: string): Promise<void> {
  await query(
    'INSERT INTO migrations (name) VALUES ($1)',
    [name]
  );
}

// Run initial schema migration
export async function runInitialMigration(): Promise<void> {
  try {
    // Create migrations tracking table
    await query(createMigrationsTable);
    
    const migrationName = 'initial_schema';
    
    // Check if already executed
    if (await isMigrationExecuted(migrationName)) {
      console.log('Initial schema migration already executed');
      return;
    }
    
    // Read and execute schema
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    await query(schema);
    await recordMigration(migrationName);
    
    console.log('Initial schema migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Rollback function (drops all tables)
export async function rollbackInitialMigration(): Promise<void> {
  try {
    const dropTables = `
      DROP TABLE IF EXISTS recommendation_feedback CASCADE;
      DROP TABLE IF EXISTS recommendations CASCADE;
      DROP TABLE IF EXISTS interactions CASCADE;
      DROP TABLE IF EXISTS bookmarks CASCADE;
      DROP TABLE IF EXISTS reading_progress CASCADE;
      DROP TABLE IF EXISTS story_ghost_entities CASCADE;
      DROP TABLE IF EXISTS ghost_entity_relationships CASCADE;
      DROP TABLE IF EXISTS stories CASCADE;
      DROP TABLE IF EXISTS ghost_entities CASCADE;
      DROP TABLE IF EXISTS conversation_messages CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS preference_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    `;
    
    await query(dropTables);
    await query('DELETE FROM migrations WHERE name = $1', ['initial_schema']);
    
    console.log('Initial schema rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

// Get list of executed migrations
export async function getExecutedMigrations(): Promise<string[]> {
  try {
    await query(createMigrationsTable);
    const result = await query('SELECT name FROM migrations ORDER BY executed_at');
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error('Failed to get executed migrations:', error);
    return [];
  }
}

// Close database connection
export async function closeMigrationConnection(): Promise<void> {
  await pool.end();
}
