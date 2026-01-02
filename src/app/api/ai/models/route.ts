// List available Gemini models
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('🔍 Listing available Gemini models...');
    
    // Return known Gemini models (API doesn't have listModels method)
    const modelList = [
      {
        name: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        description: 'Fast, versatile model for most tasks',
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192,
        supportedGenerationMethods: ['generateContent'],
      },
      {
        name: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        description: 'Best for complex reasoning tasks',
        inputTokenLimit: 2097152,
        outputTokenLimit: 8192,
        supportedGenerationMethods: ['generateContent'],
      },
      {
        name: 'gemini-2.0-flash-exp',
        displayName: 'Gemini 2.0 Flash (Experimental)',
        description: 'Next-gen multimodal model',
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192,
        supportedGenerationMethods: ['generateContent'],
      },
    ];

    console.log(`✅ Found ${modelList.length} available models`);

    return NextResponse.json({
      success: true,
      data: {
        models: modelList,
        count: modelList.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to list models:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
