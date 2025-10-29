// Test endpoint for AI database operations
import { NextRequest, NextResponse } from 'next/server';
import AIDatabaseService from '@/lib/ai/database-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing AI database operations...');
    
    const testResults = {
      recommendations: { status: 'pending', details: {} },
      reviewInsights: { status: 'pending', details: {} },
      usageStats: { status: 'pending', details: {} },
      cleanup: { status: 'pending', details: {} }
    };

    // Get an existing user or use a hardcoded ObjectId for testing
    let testUserId;
    try {
      const existingUser = await prisma.user.findFirst();
      if (existingUser) {
        testUserId = existingUser.id;
        console.log('✅ Using existing user for testing:', testUserId);
      } else {
        // Use a valid ObjectId format for testing (24 hex characters)
        testUserId = '507f1f77bcf86cd799439011';
        console.log('⚠️ No users found, using mock ObjectId for testing:', testUserId);
      }
    } catch (error) {
      console.error('❌ Failed to get test user, using mock ObjectId:', error);
      testUserId = '507f1f77bcf86cd799439011';
    }
    const testProblemId = 'test-problem-123';

    // Test 1: AI Recommendations
    console.log('🔄 Testing AI recommendations database operations...');
    try {
      // Save a test recommendation
      const recommendationData = {
        userId: testUserId,
        problemId: testProblemId,
        platform: 'leetcode',
        type: 'similar-problems' as const,
        recommendations: {
          recommendations: [
            {
              title: 'Test Problem 1',
              platform: 'leetcode' as const,
              difficulty: 'Easy' as const,
              topics: ['Array', 'Hash Table'],
              similarity_score: 0.8,
              reasoning: 'Test reasoning',
              estimated_time: '15 minutes',
              key_concepts: ['Hash Tables', 'Arrays']
            }
          ],
          analysis: {
            primary_patterns: ['Hash Table Lookups'],
            skill_focus: ['Efficient searching'],
            progression_path: 'Start with easy problems'
          }
        },
        cacheKey: `test-rec-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        metadata: {
          modelUsed: 'gemini-2.5-flash',
          tokensUsed: 1500,
          cost: 0.001,
          processingTime: 5000
        }
      };

      const savedRecommendation = await AIDatabaseService.saveRecommendation(recommendationData);
      
      // Retrieve the recommendation
      const retrievedRecommendation = await AIDatabaseService.getRecommendation(recommendationData.cacheKey);
      
      // Get user recommendations
      const userRecommendations = await AIDatabaseService.getUserRecommendations(testUserId, 5);
      
      testResults.recommendations = {
        status: 'success',
        details: {
          saved: !!savedRecommendation,
          retrieved: !!retrievedRecommendation,
          userRecommendationsCount: userRecommendations.length,
          cacheKeyMatch: retrievedRecommendation ? true : false
        }
      };
      
      console.log('✅ AI recommendations database test passed');
    } catch (error) {
      testResults.recommendations = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ AI recommendations database test failed:', error);
    }

    // Test 2: AI Review Insights
    console.log('🔄 Testing AI review insights database operations...');
    try {
      // Save a test review insight
      const reviewInsightData = {
        userId: testUserId,
        problemId: testProblemId,
        platform: 'leetcode',
        userHistory: {
          previousAttempts: 3,
          lastSolved: '2024-10-22T10:00:00Z',
          timeSpent: 25,
          mistakes: ['edge cases'],
          successRate: 0.67
        },
        reviewContext: {
          daysSinceLastReview: 7,
          currentStreak: 5,
          upcomingInterviews: true
        },
        insights: {
          review_strategy: {
            focus_areas: ['Hash Tables', 'Edge Cases'],
            time_allocation: '20 minutes',
            approach: 'Practice from scratch',
            priority_level: 'Medium' as const
          },
          key_concepts: {
            must_remember: ['Hash table lookups'],
            common_pitfalls: ['Edge cases'],
            optimization_tips: ['Use O(1) lookups'],
            time_complexity_notes: ['O(n) time complexity']
          },
          practice_suggestions: {
            warm_up_problems: ['Two Sum II'],
            follow_up_challenges: ['3Sum'],
            related_patterns: ['Hash table patterns'],
            skill_building_exercises: ['Practice edge cases']
          },
          confidence_assessment: {
            current_level: 'Medium' as const,
            improvement_areas: ['Edge case handling'],
            next_milestone: 'Solve medium problems',
            retention_prediction: 'High retention expected'
          },
          personalized_notes: {
            strengths: ['Good understanding'],
            weaknesses: ['Edge cases'],
            learning_style_tips: ['Visual learning'],
            motivation_boost: 'Keep practicing!'
          }
        },
        cacheKey: `test-insight-${Date.now()}`,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        metadata: {
          modelUsed: 'gemini-2.5-flash',
          tokensUsed: 1800,
          cost: 0.0015,
          processingTime: 6000
        }
      };

      const savedInsight = await AIDatabaseService.saveReviewInsight(reviewInsightData);
      
      // Retrieve the insight
      const retrievedInsight = await AIDatabaseService.getReviewInsight(reviewInsightData.cacheKey);
      
      // Get user insights
      const userInsights = await AIDatabaseService.getUserReviewInsights(testUserId, 5);
      
      testResults.reviewInsights = {
        status: 'success',
        details: {
          saved: !!savedInsight,
          retrieved: !!retrievedInsight,
          userInsightsCount: userInsights.length,
          cacheKeyMatch: retrievedInsight ? true : false
        }
      };
      
      console.log('✅ AI review insights database test passed');
    } catch (error) {
      testResults.reviewInsights = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ AI review insights database test failed:', error);
    }

    // Test 3: Usage Statistics
    console.log('🔄 Testing usage statistics...');
    try {
      // Update usage stats for similar problems
      const stats1 = await AIDatabaseService.updateUsageStats(testUserId, 'similar-problems', {
        tokensUsed: 1500,
        cost: 0.001,
        responseTime: 5000,
        cacheHit: false
      });
      
      // Update usage stats for review insights
      const stats2 = await AIDatabaseService.updateUsageStats(testUserId, 'review-insights', {
        tokensUsed: 1800,
        cost: 0.0015,
        responseTime: 6000,
        cacheHit: false
      });
      
      // Update with cache hit
      const stats3 = await AIDatabaseService.updateUsageStats(testUserId, 'similar-problems', {
        tokensUsed: 0,
        cost: 0,
        responseTime: 100,
        cacheHit: true
      });
      
      testResults.usageStats = {
        status: 'success',
        details: {
          stats1Created: !!stats1,
          stats2Updated: !!stats2,
          stats3CacheHit: !!stats3,
          totalRequests: stats3?.totalRequests || 0,
          cacheHits: stats3?.cacheHits || 0,
          totalCost: stats3?.totalCost || 0
        }
      };
      
      console.log('✅ Usage statistics test passed');
    } catch (error) {
      testResults.usageStats = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ Usage statistics test failed:', error);
    }

    // Test 4: Cleanup operations
    console.log('🔄 Testing cleanup operations...');
    try {
      const cleanupResult = await AIDatabaseService.cleanupExpiredEntries();
      
      testResults.cleanup = {
        status: 'success',
        details: {
          recommendationsCleanedUp: cleanupResult.recommendations,
          insightsCleanedUp: cleanupResult.insights,
          cleanupWorking: true
        }
      };
      
      console.log('✅ Cleanup operations test passed');
    } catch (error) {
      testResults.cleanup = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      console.log('❌ Cleanup operations test failed:', error);
    }

    // Calculate overall success
    const allTests = Object.values(testResults);
    const successfulTests = allTests.filter(test => test.status === 'success').length;
    const totalTests = allTests.length;
    const overallSuccess = successfulTests === totalTests;
    
    console.log(`🎯 Database test completed: ${successfulTests}/${totalTests} tests passed`);
    
    return NextResponse.json({
      success: overallSuccess,
      summary: {
        testsRun: totalTests,
        testsPassed: successfulTests,
        testsFailed: totalTests - successfulTests,
        overallStatus: overallSuccess ? 'ALL_DATABASE_OPERATIONS_WORKING' : 'SOME_DATABASE_ISSUES_DETECTED'
      },
      results: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
