import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promptOperations } from '@/lib/database';

// GET /api/prompts/my - Get current user's created prompts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const prompts = promptOperations.findByCreator(session.user.id);
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching user prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
} 