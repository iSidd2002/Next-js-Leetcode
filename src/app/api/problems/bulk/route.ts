import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { sanitizeString, sanitizeUrl, sanitizeStringArray } from '@/lib/input-validation';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

// Maximum number of problems per bulk request
const MAX_BULK_SIZE = 100;

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

    const { problems } = await request.json();

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Problems array is required and must not be empty'
      }, { status: 400 });
    }

    // Limit bulk size to prevent DoS
    if (problems.length > MAX_BULK_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Maximum ${MAX_BULK_SIZE} problems per bulk request`
      }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const createdProblems = [];

    for (const problemData of problems) {
      try {
        // Sanitize inputs for each problem
        const sanitizedPlatform = problemData.platform ? sanitizeString(problemData.platform, 'Platform') : 'leetcode';
        const sanitizedTitle = problemData.title ? sanitizeString(problemData.title, 'Title') : '';
        const sanitizedProblemId = problemData.problemId ? sanitizeString(problemData.problemId, 'Problem ID') : '';
        const sanitizedDifficulty = problemData.difficulty ? sanitizeString(problemData.difficulty, 'Difficulty') : '';
        let sanitizedUrl = '';
        try {
          sanitizedUrl = problemData.url ? sanitizeUrl(problemData.url) : '';
        } catch {
          // Skip problems with invalid URLs
          skipped++;
          continue;
        }
        const sanitizedNotes = problemData.notes ? sanitizeString(problemData.notes, 'Notes') : '';
        const sanitizedTopics = sanitizeStringArray(problemData.topics, 'Topics');
        const sanitizedCompanies = sanitizeStringArray(problemData.companies, 'Companies');
        const sanitizedStatus = problemData.status ? sanitizeString(problemData.status, 'Status') : 'active';

        // Check if problem already exists for this user
        const existingProblem = await Problem.findOne({
          userId: user.id,
          url: sanitizedUrl
        });

        if (existingProblem) {
          skipped++;
          continue;
        }

        // Create new problem with sanitized data
        const problem = new Problem({
          userId: user.id,
          platform: sanitizedPlatform,
          title: sanitizedTitle,
          problemId: sanitizedProblemId,
          difficulty: sanitizedDifficulty,
          url: sanitizedUrl,
          dateSolved: problemData.dateSolved || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          notes: sanitizedNotes,
          isReview: Boolean(problemData.isReview),
          repetition: typeof problemData.repetition === 'number' ? problemData.repetition : 0,
          interval: typeof problemData.interval === 'number' ? problemData.interval : 0,
          nextReviewDate: problemData.nextReviewDate || null,
          topics: sanitizedTopics,
          status: sanitizedStatus,
          companies: sanitizedCompanies
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
