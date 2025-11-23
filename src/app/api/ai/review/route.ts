// Review Insights API - Personalized spaced repetition insights
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { getCacheManager, CacheKeys } from '@/lib/ai/cache-manager';
import { PlatformAdapter } from '@/lib/ai/platform-adapter';
import { PromptTemplates, ReviewInsightsRequest, ReviewInsightsResponse } from '@/lib/ai/prompts';
import { authenticateRequest } from '@/lib/auth';

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for AI processing
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Processing review insights request...');

    // SECURITY: Authentication is now REQUIRED (no test user fallback)
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please log in to use AI features.'
      }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();

    // Validate request body
    if (!body.problem || !body.problem.title || !body.problem.platform) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: problem title and platform are required'
      }, { status: 400 });
    }

    if (!body.userHistory) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: userHistory is required'
      }, { status: 400 });
    }

    // Set default values for missing fields
    const userHistory = {
      previousAttempts: body.userHistory.previousAttempts || 1,
      lastSolved: body.userHistory.lastSolved || new Date().toISOString(),
      timeSpent: body.userHistory.timeSpent || 30,
      mistakes: body.userHistory.mistakes || [],
      successRate: body.userHistory.successRate || 0.8
    };

    const reviewContext = {
      daysSinceLastReview: body.reviewContext?.daysSinceLastReview || 7,
      currentStreak: body.reviewContext?.currentStreak || 1,
      upcomingInterviews: body.reviewContext?.upcomingInterviews || false,
      targetDifficulty: body.reviewContext?.targetDifficulty
    };

    // Create normalized problem structure for the prompt
    const normalizedProblem = {
      id: body.problem.id || 'unknown',
      title: body.problem.title,
      platform: body.problem.platform,
      difficulty: {
        original: body.problem.difficulty || 'Medium',
        normalized: 6,
        category: (body.problem.difficulty === 'Easy' ? 'Easy' :
                  body.problem.difficulty === 'Hard' ? 'Hard' : 'Medium') as 'Easy' | 'Medium' | 'Hard'
      },
      topics: body.problem.topics || [],
      description: body.problem.description
    };

    // Create request object
    const reviewRequest: ReviewInsightsRequest = {
      problem: {
        title: normalizedProblem.title,
        platform: normalizedProblem.platform,
        difficulty: normalizedProblem.difficulty,
        topics: normalizedProblem.topics,
        description: normalizedProblem.description
      },
      userHistory,
      reviewContext
    };

    // Check cache first
    const cacheManager = getCacheManager();
    const cacheKey = CacheKeys.reviewInsights(normalizedProblem.id, userId);
    
    console.log(`🔍 Checking cache for key: ${cacheKey}`);
    const cachedResult = cacheManager.get<ReviewInsightsResponse>(cacheKey);
    
    if (cachedResult) {
      console.log('✅ Cache hit - returning cached review insights');
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('❌ Cache miss - generating new review insights');

    // Generate AI insights
    const geminiClient = getGeminiClient();
    
    const systemPrompt = PromptTemplates.reviewInsights.system;
    const userPrompt = PromptTemplates.reviewInsights.user(reviewRequest);
    const schema = PromptTemplates.reviewInsights.schema;

    console.log('🤖 Generating AI review insights...');
    const startTime = Date.now();

    let aiResponse;
    try {
      aiResponse = await geminiClient.generateStructuredResponse<ReviewInsightsResponse>(
        `${systemPrompt}\n\n${userPrompt}`,
        schema,
        {
          userId,
          temperature: 0.6, // Slightly lower temperature for more consistent advice
          maxTokens: 8192 // Further increased token limit to prevent truncation
        }
      );
    } catch (error) {
      console.error('❌ AI Response Error:', error);
      return NextResponse.json({
        success: false,
        error: `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ AI review insights generated in ${processingTime}ms`);

    // Cache the result with shorter TTL since it's user-specific
    cacheManager.set(cacheKey, aiResponse, {
      ttl: 12 * 60 * 60 * 1000, // 12 hours (shorter than similar problems)
      metadata: {
        platform: normalizedProblem.platform,
        userId,
        promptType: 'review-insights',
        cost: 0.0015, // Estimated cost (slightly higher due to longer prompts)
        tokens: 1800 // Estimated tokens
      }
    });

    console.log('💾 Review insights cached successfully');

    // Log analytics
    console.log(`📊 Review insights request completed:
    - User: ${userId}
    - Problem: ${normalizedProblem.title} (${normalizedProblem.platform})
    - Previous attempts: ${userHistory.previousAttempts}
    - Days since last review: ${reviewContext.daysSinceLastReview}
    - Processing time: ${processingTime}ms
    - Cache: MISS`);

    return NextResponse.json({
      success: true,
      data: aiResponse,
      cached: false,
      metadata: {
        processingTime,
        problemId: normalizedProblem.id,
        platform: normalizedProblem.platform,
        userHistory: {
          attempts: userHistory.previousAttempts,
          daysSinceReview: reviewContext.daysSinceLastReview
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Review insights API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate review insights',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for testing with sample data
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing review insights API with sample data...');

    // Sample problem and user history for testing
    const testRequest = {
      problem: {
        id: 'test-two-sum-review',
        title: 'Two Sum',
        platform: 'leetcode',
        difficulty: 'Easy',
        topics: ['Array', 'Hash Table'],
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
      },
      userHistory: {
        previousAttempts: 3,
        lastSolved: '2024-10-22T10:00:00Z', // 7 days ago
        timeSpent: 25,
        mistakes: ['forgot to handle edge cases', 'used O(n²) solution initially'],
        successRate: 0.67
      },
      reviewContext: {
        daysSinceLastReview: 7,
        currentStreak: 5,
        upcomingInterviews: true,
        targetDifficulty: 'Medium'
      }
    };

    // Process the request using the POST logic
    const mockRequest = new Request(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });

    return await POST(mockRequest as NextRequest);

  } catch (error) {
    console.error('❌ Review insights test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
