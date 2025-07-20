import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const isReview = searchParams.get('isReview');
    const company = searchParams.get('company');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter
    const filter: Record<string, unknown> = { userId: user.id };

    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    if (isReview !== null) filter.isReview = isReview === 'true';
    if (company) filter.companies = { $in: [company] };
    if (topic) filter.topics = { $in: [topic] };

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Convert to frontend format
    const formattedProblems = problems.map(p => ({
      id: p._id.toString(),
      platform: p.platform,
      title: p.title,
      problemId: p.problemId,
      difficulty: p.difficulty,
      url: p.url,
      dateSolved: p.dateSolved,
      createdAt: p.createdAt,
      notes: p.notes,
      isReview: p.isReview,
      repetition: p.repetition,
      interval: p.interval,
      nextReviewDate: p.nextReviewDate,
      topics: p.topics,
      status: p.status,
      companies: p.companies
    }));

    return NextResponse.json({
      success: true,
      data: formattedProblems
    });

  } catch (error) {
    console.error('Get problems error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const problemData = await request.json();

    // Validation
    if (!problemData.title || !problemData.url || !problemData.platform) {
      return NextResponse.json({
        success: false,
        error: 'Title, URL, and platform are required'
      }, { status: 400 });
    }

    const problem = new Problem({
      userId: user.id,
      platform: problemData.platform,
      title: problemData.title,
      problemId: problemData.problemId || '',
      difficulty: problemData.difficulty || '',
      url: problemData.url,
      dateSolved: problemData.dateSolved || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: problemData.notes || '',
      isReview: problemData.isReview || false,
      repetition: problemData.repetition || 0,
      interval: problemData.interval || 0,
      nextReviewDate: problemData.nextReviewDate || null,
      topics: problemData.topics || [],
      status: problemData.status || 'active',
      companies: problemData.companies || []
    });

    await problem.save();

    const formattedProblem = {
      id: problem._id.toString(),
      platform: problem.platform,
      title: problem.title,
      problemId: problem.problemId,
      difficulty: problem.difficulty,
      url: problem.url,
      dateSolved: problem.dateSolved,
      createdAt: problem.createdAt,
      notes: problem.notes,
      isReview: problem.isReview,
      repetition: problem.repetition,
      interval: problem.interval,
      nextReviewDate: problem.nextReviewDate,
      topics: problem.topics,
      status: problem.status,
      companies: problem.companies
    };

    return NextResponse.json({
      success: true,
      data: formattedProblem
    }, { status: 201 });

  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Problem with this URL already exists'
      }, { status: 409 });
    }

    console.error('Create problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
