import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Test database connection
export async function GET(request: NextRequest) {
  let pool: Pool | null = null;
  
  try {
    // Create connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test query
    const result = await pool.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as postgres_version,
        now() as current_time
    `);

    // Test table creation
    await pool.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Test insert
    await pool.query(`
      INSERT INTO connection_test (test_message) 
      VALUES ('Connection test successful at ' || now())
    `);

    // Test select
    const testResult = await pool.query(`
      SELECT * FROM connection_test 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      connection_info: result.rows[0],
      test_data: testResult.rows,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 30) + '...'
      }
    });

  } catch (error) {
    console.error('Database connection test failed:', error);
    const err = error as any;
    
    return NextResponse.json({
      success: false,
      error: err.message || 'Unknown error',
      error_code: err.code || 'UNKNOWN',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 30) + '...'
      }
    }, { status: 500 });

  } finally {
    // Clean up connection
    if (pool) {
      await pool.end();
    }
  }
} 