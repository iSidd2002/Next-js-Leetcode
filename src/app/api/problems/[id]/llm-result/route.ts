/**
 * POST /api/problems/[id]/llm-result
 * Detects failure and generates suggestions for a problem
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { suggestionService } from '@/services/suggestionService';
import { prisma } from '@/lib/prisma';

interface LLMResultRequest {
  transcript: string;
  userFinalStatus: 'solved' | 'unsolved' | 'partial';
  code?: string;
  problemDescription?: string;
  platform?: string;
  url?: string;
  companies?: string[];
  topics?: string[];
}

const CONFIDENCE_THRESHOLD = 0.6;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { id } = await params;

    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: LLMResultRequest = await request.json();
    const { transcript, userFinalStatus, code, problemDescription, platform, url, companies, topics } = body;

    // Validate required fields
    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: transcript' },
        { status: 400 }
      );
    }

    // Only process if user marked as unsolved
    if (userFinalStatus !== 'unsolved') {
      return NextResponse.json({
        success: true,
        data: null,
        reason: 'Only unsolved problems generate suggestions',
      });
    }

    // Get problem from database (gracefully handle non-ObjectId ids)
    let problem: any = null;
    try {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isValidObjectId) {
        problem = await prisma.problem.findUnique({ where: { id } });
      } else {
        console.warn('Skipping DB lookup for non-ObjectId problem id:', id);
      }
    } catch (lookupError) {
      console.error('Problem lookup error:', lookupError);
    }

    // Derive safe defaults when problem not found
    const problemTitle = problem?.title || problemDescription || `Problem ${id}`;
    const problemDifficulty = problem?.difficulty || 'Medium';

    // Check if suggestions already cached
    const cached = await suggestionService.getSuggestions(user.id, id);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        message: 'Returning cached suggestions',
      });
    }

    // Detect failure
    console.log('Detecting failure for problem:', problemTitle);
    const failureDetection = await suggestionService.detectFailure(
      problemTitle,
      problemDescription || problemTitle,
      transcript,
      code,
      problemDifficulty
    );

    console.log('Failure detection result:', failureDetection);

    // Check confidence threshold
    if (
      !failureDetection.failed ||
      failureDetection.confidence < CONFIDENCE_THRESHOLD
    ) {
      return NextResponse.json({
        success: true,
        data: null,
        reason: `No failure detected or low confidence (${failureDetection.confidence.toFixed(2)})`,
      });
    }

    // Generate suggestions with platform-specific context
    // Use request body data if provided, otherwise use database data
    const finalPlatform = platform || problem?.platform;
    const finalUrl = url || problem?.url;
    const finalCompanies = companies || problem?.companies || [];
    const finalTopics = topics || problem?.topics || [];

    console.log('Generating suggestions for platform:', finalPlatform);
    const suggestions = await suggestionService.generateSuggestions(
      problemTitle,
      problemDifficulty,
      finalTopics,
      failureDetection.missing_concepts,
      failureDetection.failure_reason,
      finalPlatform,
      finalUrl,
      finalCompanies,
      user.id
    );

    console.log('Suggestions generated successfully');

    // Cache suggestions
    await suggestionService.cacheSuggestions(
      user.id,
      id,
      suggestions,
      failureDetection.failure_reason,
      failureDetection.confidence
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
      cached: false,
      failureReason: failureDetection.failure_reason,
      confidence: failureDetection.confidence,
    });
  } catch (error) {
    console.error('LLM result error:', error);

    // Return fallback suggestions on error
    try {
      const fallback = suggestionService.getFallbackSuggestions();
      return NextResponse.json({
        success: true,
        data: fallback,
        note: 'Using fallback suggestions due to LLM error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process LLM result',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}

