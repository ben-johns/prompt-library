import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Public health check endpoint - no authentication required
export async function GET(request: NextRequest) {
  let pool: Pool | null = null;
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL environment variable not set',
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL_SET: false
        }
      }, { status: 500 });
    }

    // Create connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Simple connection test
    const result = await pool.query('SELECT now() as current_time, version() as postgres_version');

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      timestamp: result.rows[0].current_time,
      postgres_version: result.rows[0].postgres_version.split(' ')[0], // Just version number
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: true,
        DATABASE_HOST: process.env.DATABASE_URL.includes('pooler.supabase.com') ? 'supabase-pooler' : 'unknown'
      }
    });

  } catch (error) {
    const err = error as any;
    
    return NextResponse.json({
      success: false,
      error: err.message || 'Unknown error',
      error_code: err.code || 'UNKNOWN',
      error_details: {
        hostname: err.hostname || 'N/A',
        syscall: err.syscall || 'N/A'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_HOST: process.env.DATABASE_URL?.includes('pooler.supabase.com') ? 'supabase-pooler' : 'unknown'
      }
    }, { status: 500 });

  } finally {
    // Clean up connection
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
} 