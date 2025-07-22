import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promptOperations } from '@/lib/database';

// GET /api/prompts - Get all prompts with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'approved'; // Default to approved prompts

    const filters: { department?: string; category?: string; status?: string } = { status };
    if (department) {
      filters.department = department;
    }
    if (category) {
      filters.category = category;
    }

    const prompts = await promptOperations.findAll(filters);
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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

    const result = await promptOperations.create({
      title,
      description,
      department,
      category,
      prompt,
      creator_id: session.user.id,
      status: 'pending' // New prompts start as pending
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Prompt created successfully', id: result.id, prompt: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
} 