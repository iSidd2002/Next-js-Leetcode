// Test endpoint for platform normalization
import { NextRequest, NextResponse } from 'next/server';
import { PlatformAdapter } from '@/lib/ai/platform-adapter';

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Platform Adapter...');

    // Sample test data for each platform
    const testData = {
      leetcode: {
        _id: '1',
        title: 'Two Sum',
        difficulty: 'Easy',
        topics: ['Array', 'Hash Table'],
        companies: ['Amazon', 'Google'],
        slug: 'two-sum',
        description: 'Given an array of integers...',
        acceptanceRate: 49.5,
        solvedCount: 1000000
      },
      
      codeforces: {
        contestId: 1234,
        index: 'A',
        name: 'Simple Math Problem',
        rating: 1200,
        tags: ['math', 'implementation'],
        description: 'Calculate the sum...',
        timeLimit: '1000ms',
        memoryLimit: '256MB',
        solvedCount: 5000
      },
      
      atcoder: {
        id: 'abc123_a',
        title: 'Welcome to AtCoder',
        contest: 'abc123',
        index: 'A',
        taskId: 'abc123_a',
        tags: ['implementation'],
        description: 'Print Hello World',
        timeLimit: '2000ms',
        memoryLimit: '1024MB'
      }
    };

    const results: any = {};

    // Test each platform
    for (const [platform, data] of Object.entries(testData)) {
      try {
        console.log(`🔄 Testing ${platform} normalization...`);
        const normalized = PlatformAdapter.normalizeProblem(data, platform);
        results[platform] = {
          success: true,
          original: data,
          normalized: normalized
        };
        console.log(`✅ ${platform} normalization successful`);
      } catch (error) {
        console.error(`❌ ${platform} normalization failed:`, error);
        results[platform] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          original: data
        };
      }
    }

    // Test platform configuration retrieval
    const platformConfigs = PlatformAdapter.getSupportedPlatforms().map(platform => ({
      platform,
      config: PlatformAdapter.getPlatformConfig(platform)
    }));

    console.log('✅ Platform adapter testing completed');

    return NextResponse.json({
      success: true,
      data: {
        testResults: results,
        supportedPlatforms: PlatformAdapter.getSupportedPlatforms(),
        platformConfigs: platformConfigs,
        summary: {
          totalPlatforms: Object.keys(testData).length,
          successfulNormalizations: Object.values(results).filter((r: any) => r.success).length,
          failedNormalizations: Object.values(results).filter((r: any) => !r.success).length
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Platform adapter test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
