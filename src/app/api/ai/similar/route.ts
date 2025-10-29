// Similar Problems API - Core AI recommendation feature
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { getCacheManager, CacheKeys } from '@/lib/ai/cache-manager';
import { PlatformAdapter, NormalizedProblem } from '@/lib/ai/platform-adapter';
import { PromptTemplates, SimilarProblemsRequest, SimilarProblemsResponse } from '@/lib/ai/prompts';
import { authenticateRequest } from '@/lib/auth';
import AIDatabaseService from '@/lib/ai/database-service';

// Fallback recommendations for when AI times out
function generateFallbackRecommendations(problem: NormalizedProblem) {
  const fallbackProblems = [
    {
      title: "Two Sum",
      platform: "leetcode",
      difficulty: "Easy",
      topics: ["Array", "Hash Table"],
      similarity_score: 0.7,
      reasoning: "Fundamental array problem for building problem-solving skills",
      estimated_time: "15-20 min",
      key_concepts: ["Array traversal", "Hash maps"]
    },
    {
      title: "A+B Problem",
      platform: "codeforces",
      difficulty: "Easy",
      topics: ["Implementation", "Math"],
      similarity_score: 0.6,
      reasoning: "Basic implementation practice",
      estimated_time: "5-10 min",
      key_concepts: ["Input/Output", "Basic math"]
    },
    {
      title: "ABC001 A - Snowy Day",
      platform: "atcoder",
      difficulty: "Easy",
      topics: ["Implementation"],
      similarity_score: 0.6,
      reasoning: "Simple implementation problem",
      estimated_time: "10-15 min",
      key_concepts: ["Basic logic", "Implementation"]
    }
  ];

  // Return first 3 problems as fallback
  return fallbackProblems.slice(0, 3);
}

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for AI processing (Pro plan)
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Processing similar problems request...');

    // Authenticate user (optional for testing)
    let userId = 'test-user';
    try {
      const authResult = await authenticateRequest(request);
      if (authResult.success && authResult.user) {
        userId = authResult.user.id;
      }
    } catch (error) {
      console.log('⚠️ Authentication failed, using test user for development');
    }
    const body = await request.json();

    // Validate request body
    if (!body.problem || !body.problem.title || !body.problem.platform) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: problem title and platform are required'
      }, { status: 400 });
    }

    // Set default target distribution if not provided
    const targetDistribution = body.targetDistribution || {
      easy: 2,
      medium: 3,
      hard: 1
    };

    // Normalize the input problem using platform adapter
    let normalizedProblem;
    try {
      normalizedProblem = PlatformAdapter.normalizeProblem(body.problem, body.problem.platform);
    } catch (error) {
      console.error('❌ Problem normalization failed:', error);
      // If normalization fails, use the raw problem data
      normalizedProblem = {
        id: body.problem.id || 'unknown',
        title: body.problem.title,
        platform: body.problem.platform,
        difficulty: {
          original: body.problem.difficulty || 'Medium',
          normalized: 6,
          category: 'Medium' as const
        },
        topics: body.problem.topics || [],
        description: body.problem.description
      };
    }

    // Create request object
    const similarRequest: SimilarProblemsRequest = {
      problem: {
        title: normalizedProblem.title,
        platform: normalizedProblem.platform,
        difficulty: normalizedProblem.difficulty,
        topics: normalizedProblem.topics,
        description: normalizedProblem.description
      },
      targetDistribution,
      excludeIds: body.excludeIds || []
    };

    // Check cache first
    const cacheManager = getCacheManager();
    const cacheKey = CacheKeys.similarProblems(normalizedProblem.id, normalizedProblem.platform);
    
    console.log(`🔍 Checking cache for key: ${cacheKey}`);
    const cachedResult = cacheManager.get<SimilarProblemsResponse>(cacheKey);
    
    if (cachedResult) {
      console.log('✅ Cache hit - returning cached similar problems');
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('❌ Cache miss - generating new recommendations');

    // Generate AI recommendations
    const geminiClient = getGeminiClient();
    
    const systemPrompt = PromptTemplates.similarProblems.system;
    const userPrompt = PromptTemplates.similarProblems.user(similarRequest);
    const schema = PromptTemplates.similarProblems.schema;

    console.log('🤖 Generating AI recommendations...');
    const startTime = Date.now();

    // Create a timeout promise for 45 seconds (well before Vercel's limit)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 45000);
    });

    const aiPromise = geminiClient.generateStructuredResponse<SimilarProblemsResponse>(
      `${systemPrompt}\n\n${userPrompt}`,
      schema,
      {
        userId,
        temperature: 0.7,
        maxTokens: 3072 // Further reduced for faster responses
      }
    );

    let aiResponse;
    try {
      aiResponse = await Promise.race([aiPromise, timeoutPromise]);
    } catch (error: any) {
      if (error.message === 'AI_TIMEOUT') {
        console.log('⏰ AI request timed out, returning fallback recommendations');
        return NextResponse.json({
          success: true,
          data: {
            recommendations: generateFallbackRecommendations(normalizedProblem),
            analysis: {
              primary_patterns: normalizedProblem.topics.slice(0, 3),
              progression_path: "Practice similar problems to strengthen core concepts"
            },
            cached: false,
            processingTime: Date.now() - startTime,
            fallback: true
          }
        });
      }
      throw error;
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ AI recommendations generated in ${processingTime}ms`);

    // Cache the result
    cacheManager.set(cacheKey, aiResponse, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      metadata: {
        platform: normalizedProblem.platform,
        userId,
        promptType: 'similar-problems',
        cost: 0.001, // Estimated cost
        tokens: 1500 // Estimated tokens
      }
    });

    console.log('💾 Result cached successfully');

    // Log analytics
    console.log(`📊 Similar problems request completed:
    - User: ${userId}
    - Problem: ${normalizedProblem.title} (${normalizedProblem.platform})
    - Recommendations: ${aiResponse.recommendations.length}
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
        recommendationCount: aiResponse.recommendations.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Similar problems API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate similar problems',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for testing with sample data
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing similar problems API with sample data...');

    // For testing, use a mock user ID
    const userId = 'test-user';

    // Sample problem data for testing
    const sampleProblem = {
      id: 'test-two-sum',
      title: 'Two Sum',
      platform: 'leetcode',
      difficulty: 'Easy',
      topics: ['Array', 'Hash Table'],
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
    };

    // Set default target distribution
    const targetDistribution = {
      easy: 2,
      medium: 2,
      hard: 1
    };

    // Normalize the input problem using platform adapter
    let normalizedProblem;
    try {
      normalizedProblem = PlatformAdapter.normalizeProblem(sampleProblem, sampleProblem.platform);
    } catch (error) {
      console.error('❌ Problem normalization failed:', error);
      normalizedProblem = {
        id: sampleProblem.id,
        title: sampleProblem.title,
        platform: sampleProblem.platform,
        difficulty: {
          original: sampleProblem.difficulty,
          normalized: 3,
          category: 'Easy' as const
        },
        topics: sampleProblem.topics,
        description: sampleProblem.description
      };
    }

    // Create request object
    const similarRequest: SimilarProblemsRequest = {
      problem: {
        title: normalizedProblem.title,
        platform: normalizedProblem.platform,
        difficulty: normalizedProblem.difficulty,
        topics: normalizedProblem.topics,
        description: normalizedProblem.description
      },
      targetDistribution,
      excludeIds: []
    };

    // Check cache first
    const cacheManager = getCacheManager();
    const cacheKey = CacheKeys.similarProblems(normalizedProblem.id, normalizedProblem.platform);

    console.log(`🔍 Checking cache for key: ${cacheKey}`);
    const cachedResult = cacheManager.get<SimilarProblemsResponse>(cacheKey);

    if (cachedResult) {
      console.log('✅ Cache hit - returning cached similar problems');
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('❌ Cache miss - generating new recommendations');

    // Generate AI recommendations
    const geminiClient = getGeminiClient();

    const systemPrompt = PromptTemplates.similarProblems.system;
    const userPrompt = PromptTemplates.similarProblems.user(similarRequest);
    const schema = PromptTemplates.similarProblems.schema;

    console.log('🤖 Generating AI recommendations...');
    const startTime = Date.now();

    const aiResponse = await geminiClient.generateStructuredResponse<SimilarProblemsResponse>(
      `${systemPrompt}\n\n${userPrompt}`,
      schema,
      {
        userId,
        temperature: 0.7,
        maxTokens: 4096 // Reduced for more reliable responses
      }
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ AI recommendations generated in ${processingTime}ms`);

    // Cache the result
    cacheManager.set(cacheKey, aiResponse, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      metadata: {
        platform: normalizedProblem.platform,
        userId,
        promptType: 'similar-problems',
        cost: 0.001,
        tokens: 1500
      }
    });

    console.log('💾 Result cached successfully');

    return NextResponse.json({
      success: true,
      data: aiResponse,
      cached: false,
      metadata: {
        processingTime,
        problemId: normalizedProblem.id,
        platform: normalizedProblem.platform,
        recommendationCount: aiResponse.recommendations.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Similar problems test failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
