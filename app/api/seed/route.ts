import { NextResponse } from 'next/server';
import { promptOperations, userOperations } from '@/lib/database';

const samplePrompts = [
  {
    title: "Meeting minutes generator",
    description: "Transform rough notes into structured meeting minutes with action items and key decisions",
    department: "project-management",
    category: "documentation",
    prompt: `Please help me transform my rough meeting notes into structured meeting minutes. 

Format the minutes with the following sections:
- Meeting title, date, and attendees
- Agenda items discussed
- Key decisions made
- Action items (with assignee and due date)
- Next steps and follow-ups

My rough notes are as follows:
[PASTE YOUR NOTES HERE]`,
  },
  {
    title: "Project status report",
    description: "Generate a comprehensive project status report with progress, risks, and next steps",
    department: "project-management",
    category: "reporting",
    prompt: `Please help me create a professional project status report for [PROJECT NAME].

Include the following sections:
1. Executive Summary (brief overview of project status)
2. Key Accomplishments (what was completed since last report)
3. Current Status (on track, at risk, or behind schedule)
4. Upcoming Milestones (with target dates)
5. Risks and Issues (current challenges and mitigation plans)
6. Resource Updates (any changes to team or budget)
7. Next Steps

Project details:
[PROVIDE KEY PROJECT DETAILS HERE]`,
  },
  {
    title: "Email response templates",
    description: "Create professional email responses for common project management scenarios",
    department: "project-management",
    category: "email",
    prompt: `Please help me draft a professional email response for the following project management scenario:

Scenario: [DESCRIBE THE SCENARIO - e.g., "A stakeholder is requesting a scope change that would impact the timeline"]

I need a response that is:
- Professional and courteous
- Clear about the implications
- Offers potential solutions
- Maintains good stakeholder relationships

Additional context:
[ADD ANY SPECIFIC DETAILS ABOUT YOUR SITUATION]`,
  },
  {
    title: "Risk assessment matrix",
    description: "Create a structured risk assessment with probability, impact, and mitigation strategies",
    department: "project-management",
    category: "planning",
    prompt: `Please help me create a comprehensive risk assessment matrix for my project.

For each risk I identify, help me structure the following information:
1. Risk description
2. Probability (Low/Medium/High)
3. Impact (Low/Medium/High)
4. Risk score (Probability × Impact)
5. Mitigation strategy
6. Contingency plan
7. Risk owner

The risks I've identified are:
[LIST YOUR RISKS HERE]`,
  },
  {
    title: "Marketing campaign brief",
    description: "Generate a comprehensive marketing campaign brief with objectives, target audience, and strategies",
    department: "marketing",
    category: "planning",
    prompt: `Please help me create a detailed marketing campaign brief for [CAMPAIGN NAME].

Include the following sections:
1. Campaign Overview and Objectives
2. Target Audience (demographics, psychographics, behaviors)
3. Key Messages and Value Propositions
4. Channel Strategy (social media, email, paid ads, etc.)
5. Budget Allocation
6. Timeline and Milestones
7. Success Metrics and KPIs
8. Creative Requirements

Campaign details:
[PROVIDE CAMPAIGN CONTEXT AND GOALS HERE]`,
  },
  {
    title: "Sales outreach email",
    description: "Craft compelling sales outreach emails that generate responses and build relationships",
    department: "sales",
    category: "email",
    prompt: `Please help me write a personalized sales outreach email for [PROSPECT NAME] at [COMPANY NAME].

The email should:
1. Have a compelling subject line
2. Open with personalized context about their company/role
3. Clearly state the value proposition
4. Include a specific call to action
5. Be concise and professional

Prospect information:
- Company: [COMPANY NAME]
- Role: [PROSPECT TITLE]
- Pain point/opportunity: [DESCRIBE WHAT YOU'VE RESEARCHED]
- Our solution: [HOW WE CAN HELP]`,
  },
  {
    title: "Code documentation template",
    description: "Generate comprehensive documentation for software projects and APIs",
    department: "engineering",
    category: "documentation",
    prompt: `Please help me create documentation for [PROJECT/API NAME].

Include the following sections:
1. Overview and Purpose
2. Installation/Setup Instructions
3. API Endpoints (if applicable)
4. Usage Examples
5. Configuration Options
6. Error Handling
7. Contributing Guidelines
8. License Information

Project details:
- Technology stack: [LIST TECHNOLOGIES]
- Main functionality: [DESCRIBE CORE FEATURES]
- Target audience: [WHO WILL USE THIS]`,
  },
];

// POST /api/seed - Seed the database with sample prompts (development only)
export async function POST() {
  // Only allow seeding in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seeding is not allowed in production' },
      { status: 403 }
    );
  }

  try {
    // Create a sample user for seeding
    const sampleUser = {
      id: 'seed-user-123',
      email: 'admin@braze.com',
      name: 'Admin User',
    };

    // Upsert the sample user
    userOperations.upsert(sampleUser);

    // Create sample prompts
    let createdCount = 0;
    for (const promptData of samplePrompts) {
      try {
        promptOperations.create({
          ...promptData,
          creator_id: sampleUser.id,
          status: 'approved', // Auto-approve sample prompts
        });
        createdCount++;
      } catch (error) {
        console.error('Error creating prompt:', error);
      }
    }

    return NextResponse.json({
      message: `Successfully seeded database with ${createdCount} prompts`,
      created: createdCount,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 