import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { savedPromptOperations, promptOperations } from '@/lib/database';

// POST /api/prompts/[id]/save - Save a prompt
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const promptId = parseInt(params.id);
    if (isNaN(promptId)) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      );
    }

    // Check if prompt exists
    const prompt = await promptOperations.findById(promptId);
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const alreadySaved = await savedPromptOperations.isSaved(session.user.id, promptId);
    if (alreadySaved) {
      return NextResponse.json(
        { error: 'Prompt already saved' },
        { status: 400 }
      );
    }

    await savedPromptOperations.save(session.user.id, promptId);
    return NextResponse.json({ message: 'Prompt saved successfully' });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id]/save - Unsave a prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const promptId = parseInt(params.id);
    if (isNaN(promptId)) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      );
    }

    await savedPromptOperations.unsave(session.user.id, promptId);
    return NextResponse.json({ message: 'Prompt unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving prompt:', error);
    return NextResponse.json(
      { error: 'Failed to unsave prompt' },
      { status: 500 }
    );
  }
} 