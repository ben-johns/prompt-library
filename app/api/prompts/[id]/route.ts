import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promptOperations } from '@/lib/database';

// GET /api/prompts/[id] - Get a specific prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = parseInt(params.id);
    if (isNaN(promptId)) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      );
    }

    const prompt = promptOperations.findById(promptId);
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[id] - Update a prompt
export async function PUT(
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

    // Check if prompt exists and user owns it
    const existingPrompt = promptOperations.findById(promptId);
    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (existingPrompt.creator_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only edit your own prompts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, department, category, prompt } = body;

    // Validate required fields
    if (!title || !description || !department || !category || !prompt) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    promptOperations.update(promptId, {
      title,
      description,
      department,
      category,
      prompt,
      // Reset to pending when edited
      status: 'pending'
    });

    return NextResponse.json({ message: 'Prompt updated successfully' });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete a prompt
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

    // Check if prompt exists and user owns it
    const existingPrompt = promptOperations.findById(promptId);
    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (existingPrompt.creator_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only delete your own prompts' },
        { status: 403 }
      );
    }

    promptOperations.delete(promptId);
    return NextResponse.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
} 