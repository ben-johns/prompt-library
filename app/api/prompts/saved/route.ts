import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { savedPromptOperations } from '@/lib/database';

// GET /api/prompts/saved - Get current user's saved prompts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const savedPrompts = savedPromptOperations.findByUser(session.user.id);
    return NextResponse.json(savedPrompts);
  } catch (error) {
    console.error('Error fetching saved prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved prompts' },
      { status: 500 }
    );
  }
} 