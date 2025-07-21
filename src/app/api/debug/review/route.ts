import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';
import Problem from '@/models/Problem';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get all problems for the user
    const allProblems = await Problem.find({ userId: user.id }).lean();
    
    // Filter review problems
    const reviewProblems = allProblems.filter(p => p.isReview);
    
    // Check for problems due for review
    const now = new Date();
    const dueForReview = reviewProblems.filter(p => {
      if (!p.nextReviewDate) return false;
      try {
        const reviewDate = new Date(p.nextReviewDate);
        return reviewDate <= now;
      } catch (error) {
        console.error('Invalid date format:', p.nextReviewDate);
        return false;
      }
    });

    // Check for invalid dates
    const invalidDates = reviewProblems.filter(p => {
      if (!p.nextReviewDate) return false;
      try {
        const date = new Date(p.nextReviewDate);
        return isNaN(date.getTime());
      } catch {
        return true;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalProblems: allProblems.length,
          reviewProblems: reviewProblems.length,
          dueForReview: dueForReview.length,
          invalidDates: invalidDates.length
        },
        reviewProblems: reviewProblems.map(p => ({
          id: p._id.toString(),
          title: p.title,
          isReview: p.isReview,
          repetition: p.repetition,
          interval: p.interval,
          nextReviewDate: p.nextReviewDate,
          isDue: p.nextReviewDate ? new Date(p.nextReviewDate) <= now : false
        })),
        dueForReview: dueForReview.map(p => ({
          id: p._id.toString(),
          title: p.title,
          nextReviewDate: p.nextReviewDate,
          daysPastDue: p.nextReviewDate ? 
            Math.floor((now.getTime() - new Date(p.nextReviewDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
        })),
        invalidDates: invalidDates.map(p => ({
          id: p._id.toString(),
          title: p.title,
          nextReviewDate: p.nextReviewDate
        })),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
          mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
          currentTime: now.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Review debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}

// Fix invalid review dates
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

    // Find problems with invalid dates
    const problems = await Problem.find({ userId: user.id, isReview: true });
    
    let fixedCount = 0;
    const fixedProblems = [];

    for (const problem of problems) {
      if (problem.nextReviewDate) {
        try {
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
        } catch (error) {
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
        message: `Fixed ${fixedCount} problems with invalid review dates`,
        fixedProblems
      }
    });

  } catch (error) {
    console.error('Review fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
