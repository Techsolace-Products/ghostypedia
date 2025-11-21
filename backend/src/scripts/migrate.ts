import { runInitialMigration, rollbackInitialMigration, getExecutedMigrations, closeMigrationConnection } from '../config/migrations';

const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'up':
        console.log('Running migrations...');
        await runInitialMigration();
        break;
      
      case 'down':
        console.log('Rolling back migrations...');
        await rollbackInitialMigration();
        break;
      
      case 'status':
        console.log('Checking migration status...');
        const migrations = await getExecutedMigrations();
        console.log('Executed migrations:', migrations);
        break;
      
      default:
        console.log('Usage: npm run migrate [up|down|status]');
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
