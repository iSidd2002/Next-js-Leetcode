import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { validateProblemData, formatValidationErrors } from '@/lib/request-validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

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

    // Update the problem
    const updateData: Record<string, unknown> = {};
    if (problemData.platform !== undefined) updateData.platform = problemData.platform;
    if (problemData.title !== undefined) updateData.title = problemData.title;
    if (problemData.problemId !== undefined) updateData.problemId = problemData.problemId;
    if (problemData.difficulty !== undefined) updateData.difficulty = problemData.difficulty;
    if (problemData.url !== undefined) updateData.url = problemData.url;
    if (problemData.dateSolved !== undefined) updateData.dateSolved = problemData.dateSolved;
    if (problemData.notes !== undefined) updateData.notes = problemData.notes;
    if (problemData.isReview !== undefined) updateData.isReview = problemData.isReview;
    if (problemData.repetition !== undefined) updateData.repetition = problemData.repetition;
    if (problemData.interval !== undefined) updateData.interval = problemData.interval;
    if (problemData.nextReviewDate !== undefined) updateData.nextReviewDate = problemData.nextReviewDate;
    if (problemData.topics !== undefined) updateData.topics = problemData.topics;
    if (problemData.status !== undefined) updateData.status = problemData.status;
    if (problemData.companies !== undefined) updateData.companies = problemData.companies;
    if (problemData.codeSnippet !== undefined) updateData.codeSnippet = problemData.codeSnippet;
    if (problemData.codeLanguage !== undefined) updateData.codeLanguage = problemData.codeLanguage;
    if (problemData.codeFilename !== undefined) updateData.codeFilename = problemData.codeFilename;

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
    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { id } = await params;

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
