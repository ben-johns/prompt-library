import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/database';

// POST /api/init - Initialize database tables
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    return NextResponse.json({ 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

// GET /api/init - Check database status
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Database initialization endpoint. Use POST to initialize tables.' 
  });
} 