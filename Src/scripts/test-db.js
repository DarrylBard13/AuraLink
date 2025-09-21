import { neon } from '@neondatabase/serverless';

// Test database connection
async function testDatabase() {
  try {
    console.log('Testing database connection...');

    const connectionString = process.env.DATABASE_URL ||
                           'postgresql://neondb_owner:npg_1yZfDWB2CoAj@ep-restless-snow-adx8ymcm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

    const sql = neon(connectionString);

    // Test basic connectivity
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    console.log('✅ Database connected successfully!');
    console.log('Current time:', result[0].current_time);
    console.log('PostgreSQL version:', result[0].postgres_version);

    // Test users table creation
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        preferred_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created/verified');

    // Check if table exists and show structure
    const tableInfo = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    console.log('📋 Users table structure:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabase();