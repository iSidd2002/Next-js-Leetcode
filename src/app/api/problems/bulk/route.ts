import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';

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

    const { problems } = await request.json();

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Problems array is required and must not be empty'
      }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const createdProblems = [];

    for (const problemData of problems) {
      try {
        // Check if problem already exists for this user
        const existingProblem = await Problem.findOne({
          userId: user.id,
          url: problemData.url
        });

        if (existingProblem) {
          skipped++;
          continue;
        }

        // Create new problem
        const problem = new Problem({
          userId: user.id,
          platform: problemData.platform || 'leetcode',
          title: problemData.title || '',
          problemId: problemData.problemId || '',
          difficulty: problemData.difficulty || '',
          url: problemData.url || '',
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
        created++;

        createdProblems.push({
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
        });

      } catch (error) {
        console.error('Error creating individual problem:', error);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        created,
        skipped,
        problems: createdProblems
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Bulk create problems error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
