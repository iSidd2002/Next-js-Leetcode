import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contest from '@/models/Contest';
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    const contest = new Contest({
      userId: user.id,
      name: contestData.name,
      platform: contestData.platform,
      startTime: contestData.startTime || new Date().toISOString(),
      duration: contestData.duration || 120, // Default 2 hours
      url: contestData.url || '',
      rank: contestData.rank,
      problemsSolved: contestData.problemsSolved || 0,
      totalProblems: contestData.totalProblems,
      status: contestData.status || 'scheduled'
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
