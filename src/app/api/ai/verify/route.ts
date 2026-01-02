// Verify Gemini API key with direct HTTP call
import { NextRequest, NextResponse } from 'next/server';

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      }, { status: 500 });
    }

    console.log('🔍 Testing Gemini API key with direct HTTP call...');
    
    // Try a simple API call to verify the key works
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "Hello World" and nothing else.'
          }]
        }]
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
        timestamp: new Date().toISOString()
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API call successful!');

    return NextResponse.json({
      success: true,
      data: {
        response: data,
        apiKeyValid: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
