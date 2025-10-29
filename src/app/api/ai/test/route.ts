// Test endpoint for Gemini AI client
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Gemini AI client...');
    
    const geminiClient = getGeminiClient();
    
    // Test basic connection
    console.log('📡 Testing connection...');
    const isConnected = await geminiClient.testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Gemini API'
      }, { status: 503 });
    }

    // Test structured response
    console.log('🔧 Testing structured JSON response...');
    const structuredTest = await geminiClient.generateStructuredResponse(
      'Generate a simple test response about LeetCode problems',
      `{
        "message": "string",
        "problemCount": "number",
        "difficulty": "Easy|Medium|Hard",
        "topics": ["string"]
      }`,
      { userId: 'test-user' }
    );

    // Test rate limiting status
    const rateLimitStatus = geminiClient.getRateLimitStatus('test-user');

    console.log('✅ All tests passed!');

    return NextResponse.json({
      success: true,
      data: {
        connectionTest: 'passed',
        structuredResponse: structuredTest,
        rateLimitStatus: {
          remaining: rateLimitStatus.remaining,
          resetTime: new Date(rateLimitStatus.resetTime).toISOString()
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
