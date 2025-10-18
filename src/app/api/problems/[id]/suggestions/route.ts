/**
 * GET /api/problems/[id]/suggestions
 * Retrieves cached suggestions for a problem
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { suggestionService } from '@/services/suggestionService';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get userId from query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Verify user owns this problem
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
    });

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    if (problem.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get cached suggestions
    const suggestions = await suggestionService.getSuggestions(userId, params.id);

    if (!suggestions) {
      return NextResponse.json(
        { success: false, error: 'No suggestions found or expired' },
        { status: 404 }
      );
    }

    // Get suggestion metadata
    const suggestionRecord = await prisma.userProblemSuggestion.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: params.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        generatedAt: suggestionRecord?.generatedAt,
        expiresAt: suggestionRecord?.expiresAt,
        failureReason: suggestionRecord?.failureReason,
        confidence: suggestionRecord?.confidence,
      },
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

