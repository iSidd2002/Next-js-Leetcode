import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { LearningPath } from '@/models/StudyFeatures';
import { authenticateRequest } from '@/lib/auth';

// GET /api/study/paths - Get learning paths
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = { userId: user.id };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isActive !== null) query.isActive = isActive === 'true';

    const paths = await LearningPath.find(query)
      .sort({ isActive: -1, updatedAt: -1 });

    return NextResponse.json({
      success: true,
      data: paths
    });

  } catch (error) {
    console.error('Get learning paths error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/study/paths - Create new learning path
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      category, 
      estimatedDuration, 
      difficulty, 
      topics, 
      milestones 
    } = body;

    // Input validation
    if (typeof name !== 'string' || typeof description !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Name and description must be strings'
      }, { status: 400 });
    }

    // Required field validation
    if (!name.trim() || !description.trim() || !category || !difficulty || !estimatedDuration) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, description, category, difficulty, estimatedDuration'
      }, { status: 400 });
    }

    // Category validation
    const validCategories = ['beginner', 'intermediate', 'advanced', 'interview-prep', 'topic-specific'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        success: false,
        error: `Invalid category '${category}'. Must be one of: ${validCategories.join(', ')}`
      }, { status: 400 });
    }

    // Difficulty validation
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json({
        success: false,
        error: `Invalid difficulty '${difficulty}'. Must be one of: ${validDifficulties.join(', ')}`
      }, { status: 400 });
    }

    // Duration validation
    if (typeof estimatedDuration !== 'number' || estimatedDuration < 1) {
      return NextResponse.json({
        success: false,
        error: 'Estimated duration must be a positive number (days)'
      }, { status: 400 });
    }

    // Process milestones
    const processedMilestones = (milestones || []).map((milestone: any, index: number) => ({
      id: `milestone-${index + 1}`,
      title: milestone.title || `Milestone ${index + 1}`,
      description: milestone.description || '',
      requiredProblems: milestone.requiredProblems || 5,
      topics: milestone.topics || [],
      isCompleted: false,
      completedAt: null
    }));

    const path = new LearningPath({
      userId: user.id,
      name: name.trim(),
      description: description.trim(),
      category,
      estimatedDuration,
      difficulty,
      topics: topics || [],
      milestones: processedMilestones,
      progress: {
        currentMilestone: 0,
        completedMilestones: 0,
        totalProblems: processedMilestones.reduce((sum: number, m: any) => sum + m.requiredProblems, 0),
        solvedProblems: 0,
        startedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + estimatedDuration * 24 * 60 * 60 * 1000).toISOString()
      },
      isActive: true
    });

    await path.save();

    return NextResponse.json({
      success: true,
      data: path
    }, { status: 201 });

  } catch (error) {
    console.error('Create learning path error:', error);
    
    // Handle validation errors specifically
    if (error instanceof Error && error.message.includes('validation failed')) {
      const validationError = error.message;
      if (validationError.includes('category')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid category. Must be one of: beginner, intermediate, advanced, interview-prep, topic-specific'
        }, { status: 400 });
      }
      if (validationError.includes('difficulty')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid difficulty. Must be one of: easy, medium, hard'
        }, { status: 400 });
      }
      return NextResponse.json({
        success: false,
        error: 'Validation error: Please check your input data'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
