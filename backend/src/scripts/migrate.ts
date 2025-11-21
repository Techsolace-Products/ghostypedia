// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import {
  migrateUp,
  migrateDown,
  migrateToVersion,
  getMigrationStatus,
  resetDatabase,
  closeMigrationConnection
} from '../config/migration-runner';

const command = process.argv[2];
const arg = process.argv[3];

async function main() {
  try {
    switch (command) {
      case 'up':
        // Run all pending migrations or up to a specific version
        if (arg) {
          const targetVersion = parseInt(arg, 10);
          if (isNaN(targetVersion)) {
            console.error('Invalid version number');
            process.exit(1);
          }
          await migrateUp(targetVersion);
        } else {
          await migrateUp();
        }
        break;
      
      case 'down':
        // Rollback migrations (default: 1 step)
        const steps = arg ? parseInt(arg, 10) : 1;
        if (isNaN(steps)) {
          console.error('Invalid number of steps');
          process.exit(1);
        }
        await migrateDown(steps);
        break;
      
      case 'to':
        // Migrate to a specific version (up or down)
        if (!arg) {
          console.error('Version number required');
          process.exit(1);
        }
        const version = parseInt(arg, 10);
        if (isNaN(version)) {
          console.error('Invalid version number');
          process.exit(1);
        }
        await migrateToVersion(version);
        break;
      
      case 'status':
        // Show migration status
        await getMigrationStatus();
        break;
      
      case 'reset':
        // Reset database (rollback all migrations)
        await resetDatabase();
        break;
      
      default:
        console.log('Ghostypedia Migration Tool\n');
        console.log('Usage: npm run migrate:<command> [args]\n');
        console.log('Commands:');
        console.log('  up [version]     - Run all pending migrations or up to specific version');
        console.log('  down [steps]     - Rollback migrations (default: 1 step)');
        console.log('  to <version>     - Migrate to a specific version (up or down)');
        console.log('  status           - Show migration status');
        console.log('  reset            - Reset database (rollback all migrations)');
        console.log('\nExamples:');
        console.log('  npm run migrate:up           # Run all pending migrations');
        console.log('  npm run migrate:up 3         # Run migrations up to version 3');
        console.log('  npm run migrate:down         # Rollback last migration');
        console.log('  npm run migrate:down 2       # Rollback last 2 migrations');
        console.log('  npm run migrate:to 5         # Migrate to version 5');
        console.log('  npm run migrate:status       # Show current status');
        console.log('  npm run migrate:reset        # Reset database');
        process.exit(1);
    }
    
    await closeMigrationConnection();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await closeMigrationConnection();
    process.exit(1);
  }
}

main();
