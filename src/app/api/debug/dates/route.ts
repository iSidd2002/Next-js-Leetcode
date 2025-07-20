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

    // Find all problems for this user
    const problems = await Problem.find({ userId: user.id });

    // Check for invalid dates
    const invalidDateProblems = problems.filter(p => {
      if (!p.nextReviewDate) return false;
      const date = new Date(p.nextReviewDate);
      return isNaN(date.getTime());
    });

    const dateStats = {
      totalProblems: problems.length,
      problemsWithReviewDates: problems.filter(p => p.nextReviewDate).length,
      invalidDateProblems: invalidDateProblems.length,
      invalidDates: invalidDateProblems.map(p => ({
        id: p._id.toString(),
        title: p.title,
        nextReviewDate: p.nextReviewDate,
        isReview: p.isReview
      }))
    };

    return NextResponse.json({
      success: true,
      data: dateStats
    });

  } catch (error) {
    console.error('Debug dates error:', error);
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

    // Find and fix all problems with invalid dates
    const problems = await Problem.find({ userId: user.id });

    let fixedCount = 0;
    const fixedProblems = [];

    for (const problem of problems) {
      if (problem.nextReviewDate) {
        const date = new Date(problem.nextReviewDate);
        if (isNaN(date.getTime())) {
          // Fix the invalid date
          problem.nextReviewDate = null;
          problem.isReview = false;
          problem.repetition = 0;
          problem.interval = 0;
          
          await problem.save();
          fixedCount++;
          fixedProblems.push({
            id: problem._id.toString(),
            title: problem.title
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Fixed ${fixedCount} problems with invalid dates`,
        fixedProblems
      }
    });

  } catch (error) {
    console.error('Fix dates error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
