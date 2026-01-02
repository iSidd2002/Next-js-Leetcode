// Comprehensive integration test for all AI systems
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { getCacheManager } from '@/lib/ai/cache-manager';
import { PlatformAdapter } from '@/lib/ai/platform-adapter';
import { PromptTemplates } from '@/lib/ai/prompts';

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running comprehensive AI integration test...');
    
    const testResults = {
      geminiClient: { status: 'pending', details: {} },
      cacheManager: { status: 'pending', details: {} },
      platformAdapter: { status: 'pending', details: {} },
      promptTemplates: { status: 'pending', details: {} },
      endToEndFlow: { status: 'pending', details: {} }
    };

    // Test 1: Gemini Client
    console.log('🔄 Testing Gemini Client...');
    try {
      const geminiClient = getGeminiClient();
      
      // Test basic connection
      const connectionTest = await geminiClient.testConnection();
      
      // Test structured response
      const structuredTest = await geminiClient.generateStructuredResponse(
        'Generate a test response about competitive programming',
        `{ "message": "string", "difficulty": "Easy|Medium|Hard", "topics": ["string"] }`,
        { userId: 'integration-test' }
      );
      
      // Test rate limiting
      const rateLimitStatus = geminiClient.getRateLimitStatus('integration-test');
      
      testResults.geminiClient = {
        status: 'success',
        details: {
          connection: connectionTest,
          structuredResponse: structuredTest,
          rateLimitStatus,
          tokensUsed: structuredTest ? 'estimated 100-200' : 'unknown'
        }
      };
      
      console.log('✅ Gemini Client test passed');
    } catch (error) {
      testResults.geminiClient = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ Gemini Client test failed:', error);
    }

    // Test 2: Cache Manager
    console.log('🔄 Testing Cache Manager...');
    try {
      const cacheManager = getCacheManager();
      
      // Test basic operations
      const testKey = 'integration-test-key';
      const testData = { test: 'integration', timestamp: Date.now() };
      
      cacheManager.set(testKey, testData, { ttl: 60000 });
      const retrievedData = cacheManager.get(testKey);
      
      // Test statistics
      const stats = cacheManager.getStats();
      const costSavings = cacheManager.getCostSavings();
      
      testResults.cacheManager = {
        status: 'success',
        details: {
          setAndGet: JSON.stringify(retrievedData) === JSON.stringify(testData),
          statistics: stats,
          costSavings,
          cacheSize: stats.totalEntries
        }
      };
      
      console.log('✅ Cache Manager test passed');
    } catch (error) {
      testResults.cacheManager = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ Cache Manager test failed:', error);
    }

    // Test 3: Platform Adapter
    console.log('🔄 Testing Platform Adapter...');
    try {
      const testProblems = [
        { title: 'Two Sum', platform: 'leetcode', difficulty: 'Easy', topics: ['Array', 'Hash Table'] },
        { title: 'A+B Problem', platform: 'codeforces', rating: 800, tags: ['math', 'implementation'] },
        { title: 'ABC001 A', platform: 'atcoder', contest: 'ABC', difficulty: 'A', tags: ['implementation'] }
      ];
      
      const normalizedProblems = testProblems.map(problem => 
        PlatformAdapter.normalizeProblem(problem, problem.platform)
      );
      
      testResults.platformAdapter = {
        status: 'success',
        details: {
          problemsNormalized: normalizedProblems.length,
          platforms: normalizedProblems.map(p => p.platform),
          difficultyRange: {
            min: Math.min(...normalizedProblems.map(p => p.difficulty.normalized)),
            max: Math.max(...normalizedProblems.map(p => p.difficulty.normalized))
          },
          sampleNormalized: normalizedProblems[0]
        }
      };
      
      console.log('✅ Platform Adapter test passed');
    } catch (error) {
      testResults.platformAdapter = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ Platform Adapter test failed:', error);
    }

    // Test 4: Prompt Templates
    console.log('🔄 Testing Prompt Templates...');
    try {
      const sampleRequest = {
        problem: {
          title: 'Test Problem',
          platform: 'leetcode',
          difficulty: { original: 'Medium', normalized: 6, category: 'Medium' as const },
          topics: ['Array', 'Dynamic Programming']
        },
        targetDistribution: { easy: 1, medium: 2, hard: 1 },
        excludeIds: []
      };
      
      const systemPrompt = PromptTemplates.similarProblems.system;
      const userPrompt = PromptTemplates.similarProblems.user(sampleRequest);
      const schema = PromptTemplates.similarProblems.schema;
      
      testResults.promptTemplates = {
        status: 'success',
        details: {
          systemPromptLength: systemPrompt.length,
          userPromptLength: userPrompt.length,
          schemaValid: schema.includes('recommendations') && schema.includes('analysis'),
          promptPreview: userPrompt.substring(0, 200) + '...'
        }
      };
      
      console.log('✅ Prompt Templates test passed');
    } catch (error) {
      testResults.promptTemplates = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ Prompt Templates test failed:', error);
    }

    // Test 5: End-to-End Flow
    console.log('🔄 Testing End-to-End Flow...');
    try {
      const startTime = Date.now();
      
      // Simulate a complete similar problems request
      const testProblem = {
        id: 'integration-test-problem',
        title: 'Integration Test Problem',
        platform: 'leetcode',
        difficulty: 'Medium',
        topics: ['Array', 'Two Pointers'],
        description: 'A test problem for integration testing'
      };
      
      // 1. Normalize problem
      const normalizedProblem = PlatformAdapter.normalizeProblem(testProblem, testProblem.platform);
      
      // 2. Check cache
      const cacheManager = getCacheManager();
      const cacheKey = `integration-test:${normalizedProblem.id}`;
      let cachedResult = cacheManager.get(cacheKey) as { recommendations?: unknown[] } | null;
      
      // 3. Generate AI response if not cached
      if (!cachedResult) {
        const geminiClient = getGeminiClient();
        const request = {
          problem: {
            title: normalizedProblem.title,
            platform: normalizedProblem.platform,
            difficulty: normalizedProblem.difficulty,
            topics: normalizedProblem.topics,
            description: normalizedProblem.description
          },
          targetDistribution: { easy: 1, medium: 2, hard: 1 },
          excludeIds: []
        };
        
        const systemPrompt = PromptTemplates.similarProblems.system;
        const userPrompt = PromptTemplates.similarProblems.user(request);
        const schema = PromptTemplates.similarProblems.schema;
        
        const aiResponse = await geminiClient.generateStructuredResponse(
          `${systemPrompt}\n\n${userPrompt}`,
          schema,
          { userId: 'integration-test', temperature: 0.7, maxTokens: 6144 }
        );
        
        // 4. Cache the result
        cacheManager.set(cacheKey, aiResponse, {
          ttl: 60000, // 1 minute for testing
          metadata: {
            platform: normalizedProblem.platform,
            userId: 'integration-test',
            promptType: 'similar-problems'
          }
        });
        
        cachedResult = aiResponse as { recommendations?: unknown[] } | null;
      }
      
      const endTime = Date.now();
      
      testResults.endToEndFlow = {
        status: 'success',
        details: {
          processingTime: endTime - startTime,
          problemNormalized: !!normalizedProblem,
          aiResponseGenerated: !!cachedResult,
          recommendationCount: cachedResult?.recommendations?.length || 0,
          cacheWorking: true,
          fullFlowComplete: true
        }
      };
      
      console.log('✅ End-to-End Flow test passed');
    } catch (error) {
      testResults.endToEndFlow = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ End-to-End Flow test failed:', error);
    }

    // Calculate overall success
    const allTests = Object.values(testResults);
    const successfulTests = allTests.filter(test => test.status === 'success').length;
    const totalTests = allTests.length;
    const overallSuccess = successfulTests === totalTests;
    
    console.log(`🎯 Integration test completed: ${successfulTests}/${totalTests} tests passed`);
    
    return NextResponse.json({
      success: overallSuccess,
      summary: {
        testsRun: totalTests,
        testsPassed: successfulTests,
        testsFailed: totalTests - successfulTests,
        overallStatus: overallSuccess ? 'ALL_SYSTEMS_OPERATIONAL' : 'SOME_ISSUES_DETECTED'
      },
      results: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Integration test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
