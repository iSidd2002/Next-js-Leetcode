import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { sanitizeQueryParam, sanitizeString, sanitizeUrl, sanitizeInteger, sanitizeStringArray } from '@/lib/input-validation';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(request, RateLimitPresets.API);
    if (rateLimit.limited) {
      const headers = getRateLimitHeaders(rateLimit, RateLimitPresets.API);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      }, { 
        status: 429,
        headers
      });
    }

    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Sanitize query parameters
    const platform = sanitizeQueryParam(searchParams.get('platform'));
    const status = sanitizeQueryParam(searchParams.get('status'));
    const isReviewParam = searchParams.get('isReview');
    const company = sanitizeQueryParam(searchParams.get('company'));
    const topic = sanitizeQueryParam(searchParams.get('topic'));
    
    // Sanitize and validate numeric parameters
    let limit: number;
    let offset: number;
    try {
      limit = sanitizeInteger(searchParams.get('limit') || '100', 1, 1000);
      offset = sanitizeInteger(searchParams.get('offset') || '0', 0, 100000);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid parameters'
      }, { status: 400 });
    }

    // Build filter
    const filter: Record<string, unknown> = { userId: user.id };

    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    if (isReviewParam !== null) filter.isReview = isReviewParam === 'true';
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
      companies: p.companies,
      source: p.source || 'manual' // Default to manual for backward compatibility
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
    // Rate limiting
    const rateLimit = checkRateLimit(request, RateLimitPresets.API);
    if (rateLimit.limited) {
      const headers = getRateLimitHeaders(rateLimit, RateLimitPresets.API);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      }, { 
        status: 429,
        headers
      });
    }

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
    if (!problemData.title || !problemData.platform) {
      return NextResponse.json({
        success: false,
        error: 'Title and platform are required'
      }, { status: 400 });
    }

    // Sanitize inputs
    let sanitizedUrl = '';
    try {
      const title = sanitizeString(problemData.title, 'Title');
      const platform = sanitizeString(problemData.platform, 'Platform');
      const problemId = problemData.problemId ? sanitizeString(problemData.problemId, 'Problem ID') : '';
      const difficulty = problemData.difficulty ? sanitizeString(problemData.difficulty, 'Difficulty') : '';
      sanitizedUrl = problemData.url ? sanitizeUrl(problemData.url) : '';
      const notes = problemData.notes ? sanitizeString(problemData.notes, 'Notes') : '';
      const statusValue = problemData.status ? sanitizeString(problemData.status, 'Status') : 'active';
      const source = problemData.source ? sanitizeString(problemData.source, 'Source') : 'manual';
      const topics = sanitizeStringArray(problemData.topics, 'Topics');
      const companies = sanitizeStringArray(problemData.companies, 'Companies');

      const problem = new Problem({
        userId: user.id,
        platform,
        title,
        problemId,
        difficulty,
        url: sanitizedUrl,
        dateSolved: problemData.dateSolved || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notes,
        isReview: Boolean(problemData.isReview),
        repetition: typeof problemData.repetition === 'number' ? problemData.repetition : 0,
        interval: typeof problemData.interval === 'number' ? problemData.interval : 0,
        nextReviewDate: problemData.nextReviewDate || null,
        topics,
        status: statusValue,
        companies,
        source
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
      companies: problem.companies,
      source: problem.source || 'manual'
    };

      return NextResponse.json({
        success: true,
        data: formattedProblem
      }, { status: 201 });

    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid input'
      }, { status: 400 });
    }

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
