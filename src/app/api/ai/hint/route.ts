import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

interface HintRequest {
  problemTitle: string;
  problemDescription: string;
  difficulty: string;
  currentAttempt?: string;
  stuckPoint?: string;
}

interface HintResponse {
  level: 'gentle' | 'moderate' | 'detailed';
  hint: string;
  approach: string;
  nextSteps: string[];
  relatedConcepts: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body: HintRequest = await request.json();
    const { problemTitle, problemDescription, difficulty, currentAttempt, stuckPoint } = body;

    if (!problemTitle || !problemDescription) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: problemTitle, problemDescription'
      }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      }, { status: 500 });
    }

    const prompt = `
You are a coding mentor helping a student solve algorithm problems. 
Provide a progressive hint that guides without giving away the complete solution.

Problem: ${problemTitle}
Description: ${problemDescription}
Difficulty: ${difficulty}
${currentAttempt ? `Current Attempt: ${currentAttempt}` : ''}
${stuckPoint ? `Student is stuck on: ${stuckPoint}` : ''}

Provide a hint in JSON format with this exact structure:

{
  "level": "moderate",
  "hint": "<string - a helpful hint that guides without revealing the solution>",
  "approach": "<string - suggest the general approach or algorithm pattern>",
  "nextSteps": ["<string>", "<string>", "<string>"],
  "relatedConcepts": ["<string>", "<string>", "<string>"]
}

Guidelines:
1. Don't reveal the complete solution
2. Guide the student toward the right approach
3. Encourage critical thinking
4. Suggest the next logical step
5. Include related concepts they should review if needed
6. Make the hint appropriate for the difficulty level

The hint should be encouraging and educational.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding mentor. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      const hintResult: HintResponse = JSON.parse(aiResponse);
      
      return NextResponse.json({
        success: true,
        data: hintResult
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback hint
      const fallbackHint: HintResponse = {
        level: 'moderate',
        hint: "Think about what data structure would help you efficiently track or lookup elements. Consider the time complexity requirements.",
        approach: "Consider using a hash map or array to store intermediate results.",
        nextSteps: [
          "Identify what information you need to track",
          "Choose an appropriate data structure",
          "Think about the algorithm pattern that fits this problem"
        ],
        relatedConcepts: ["Hash Maps", "Arrays", "Two Pointers", "Sliding Window"]
      };

      return NextResponse.json({
        success: true,
        data: fallbackHint
      });
    }

  } catch (error) {
    console.error('Hint generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate hint'
    }, { status: 500 });
  }
}
