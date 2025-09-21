import { createUsersTable } from '../lib/database.js';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await createUsersTable();
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();