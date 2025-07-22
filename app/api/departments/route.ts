import { NextRequest, NextResponse } from 'next/server';
import { promptOperations } from '@/lib/database';

// GET /api/departments - Get department information with prompt counts
export async function GET(request: NextRequest) {
  try {
    const counts = await promptOperations.countByDepartment();
    
    // Default departments with their information
    const departments = [
      { id: "project-management", name: "Project Management", count: counts["project-management"] || 0 },
      { id: "marketing", name: "Marketing", count: counts["marketing"] || 0 },
      { id: "sales", name: "Sales", count: counts["sales"] || 0 },
      { id: "engineering", name: "Engineering", count: counts["engineering"] || 0 },
      { id: "hr", name: "Human Resources", count: counts["hr"] || 0 },
      { id: "finance", name: "Finance", count: counts["finance"] || 0 },
      { id: "design", name: "Design", count: counts["design"] || 0 },
      { id: "customer-support", name: "Customer Support", count: counts["customer-support"] || 0 },
      { id: "executive", name: "Executive", count: counts["executive"] || 0 },
      { id: "operations", name: "Operations", count: counts["operations"] || 0 },
    ];

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching department counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department information' },
      { status: 500 }
    );
  }
} 