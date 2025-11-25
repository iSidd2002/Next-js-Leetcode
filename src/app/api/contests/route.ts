import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contest from '@/models/Contest';
import { authenticateRequest } from '@/lib/auth';
import { sanitizeQueryParam, sanitizeString, sanitizeUrl, sanitizeInteger } from '@/lib/input-validation';
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

    const contests = await Contest.find(filter)
      .sort({ startTime: -1 })
      .limit(limit)
      .skip(offset);

    // Convert to frontend format
    const formattedContests = contests.map(c => ({
      id: c._id.toString(),
      name: c.name,
      platform: c.platform,
      startTime: c.startTime,
      duration: c.duration,
      url: c.url,
      rank: c.rank,
      problemsSolved: c.problemsSolved,
      totalProblems: c.totalProblems,
      status: c.status
    }));

    return NextResponse.json({
      success: true,
      data: formattedContests
    });

  } catch (error) {
    console.error('Get contests error:', error);
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

    const contestData = await request.json();

    // Validation
    if (!contestData.name || !contestData.platform) {
      return NextResponse.json({
        success: false,
        error: 'Name and platform are required'
      }, { status: 400 });
    }

    // Sanitize inputs
    let sanitizedName: string;
    let sanitizedPlatform: string;
    let sanitizedUrl: string;
    let sanitizedStatus: string;
    
    try {
      sanitizedName = sanitizeString(contestData.name, 'Name');
      sanitizedPlatform = sanitizeString(contestData.platform, 'Platform');
      sanitizedUrl = contestData.url ? sanitizeUrl(contestData.url) : '';
      sanitizedStatus = contestData.status ? sanitizeString(contestData.status, 'Status') : 'scheduled';
      
      // Validate lengths
      if (sanitizedName.length > 500) {
        throw new Error('Name must not exceed 500 characters');
      }
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid input'
      }, { status: 400 });
    }

    const contest = new Contest({
      userId: user.id,
      name: sanitizedName,
      platform: sanitizedPlatform,
      startTime: contestData.startTime || new Date().toISOString(),
      duration: contestData.duration || 120, // Default 2 hours
      url: sanitizedUrl,
      rank: contestData.rank,
      problemsSolved: contestData.problemsSolved || 0,
      totalProblems: contestData.totalProblems,
      status: sanitizedStatus
    });

    await contest.save();

    const formattedContest = {
      id: contest._id.toString(),
      name: contest.name,
      platform: contest.platform,
      startTime: contest.startTime,
      duration: contest.duration,
      url: contest.url,
      rank: contest.rank,
      problemsSolved: contest.problemsSolved,
      totalProblems: contest.totalProblems,
      status: contest.status
    };

    return NextResponse.json({
      success: true,
      data: formattedContest
    }, { status: 201 });

  } catch (error) {
    console.error('Create contest error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
