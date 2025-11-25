import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { validateProblemData, formatValidationErrors } from '@/lib/request-validation';
import { sanitizeString, sanitizeUrl, sanitizeStringArray, isValidObjectId } from '@/lib/input-validation';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid problem ID format'
      }, { status: 400 });
    }

    // Validation - Request size limits
    const sizeErrors = validateProblemData(problemData);
    if (sizeErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Request data exceeds size limits',
        details: formatValidationErrors(sizeErrors)
      }, { status: 413 }); // 413 Payload Too Large
    }

    // Check if problem exists and belongs to user
    const existingProblem = await Problem.findOne({
      _id: id,
      userId: user.id
    });

    if (!existingProblem) {
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    // Sanitize and update the problem
    const updateData: Record<string, unknown> = {};
    try {
      if (problemData.platform !== undefined) updateData.platform = sanitizeString(problemData.platform, 'Platform');
      if (problemData.title !== undefined) updateData.title = sanitizeString(problemData.title, 'Title');
      if (problemData.problemId !== undefined) updateData.problemId = sanitizeString(problemData.problemId, 'Problem ID');
      if (problemData.difficulty !== undefined) updateData.difficulty = sanitizeString(problemData.difficulty, 'Difficulty');
      if (problemData.url !== undefined) updateData.url = problemData.url ? sanitizeUrl(problemData.url) : '';
      if (problemData.dateSolved !== undefined) updateData.dateSolved = problemData.dateSolved;
      if (problemData.notes !== undefined) updateData.notes = sanitizeString(problemData.notes, 'Notes');
      if (problemData.isReview !== undefined) updateData.isReview = problemData.isReview;
      if (problemData.repetition !== undefined) updateData.repetition = problemData.repetition;
      if (problemData.interval !== undefined) updateData.interval = problemData.interval;
      if (problemData.nextReviewDate !== undefined) updateData.nextReviewDate = problemData.nextReviewDate;
      if (problemData.topics !== undefined) updateData.topics = sanitizeStringArray(problemData.topics, 'Topics');
      if (problemData.status !== undefined) updateData.status = sanitizeString(problemData.status, 'Status');
      if (problemData.companies !== undefined) updateData.companies = sanitizeStringArray(problemData.companies, 'Companies');
      if (problemData.codeSnippet !== undefined) updateData.codeSnippet = problemData.codeSnippet ? sanitizeString(problemData.codeSnippet, 'Code Snippet') : undefined;
      if (problemData.codeLanguage !== undefined) updateData.codeLanguage = problemData.codeLanguage ? sanitizeString(problemData.codeLanguage, 'Code Language') : undefined;
      if (problemData.codeFilename !== undefined) updateData.codeFilename = problemData.codeFilename ? sanitizeString(problemData.codeFilename, 'Code Filename') : undefined;
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid input'
      }, { status: 400 });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(id, updateData, { new: true });

    const formattedProblem = {
      id: updatedProblem!._id.toString(),
      platform: updatedProblem!.platform,
      title: updatedProblem!.title,
      problemId: updatedProblem!.problemId,
      difficulty: updatedProblem!.difficulty,
      url: updatedProblem!.url,
      dateSolved: updatedProblem!.dateSolved,
      createdAt: updatedProblem!.createdAt,
      notes: updatedProblem!.notes,
      isReview: updatedProblem!.isReview,
      repetition: updatedProblem!.repetition,
      interval: updatedProblem!.interval,
      nextReviewDate: updatedProblem!.nextReviewDate,
      topics: updatedProblem!.topics,
      status: updatedProblem!.status,
      companies: updatedProblem!.companies,
      codeSnippet: updatedProblem!.codeSnippet,
      codeLanguage: updatedProblem!.codeLanguage,
      codeFilename: updatedProblem!.codeFilename
    };

    return NextResponse.json({
      success: true,
      data: formattedProblem
    });

  } catch (error) {
    console.error('Update problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid problem ID format'
      }, { status: 400 });
    }

    // Check if problem exists and belongs to user
    const existingProblem = await Problem.findOne({
      _id: id,
      userId: user.id
    });

    if (!existingProblem) {
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    await Problem.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Problem deleted successfully'
    });

  } catch (error) {
    console.error('Delete problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
