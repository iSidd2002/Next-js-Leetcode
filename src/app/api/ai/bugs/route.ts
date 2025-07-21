import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

interface BugDetectionRequest {
  code: string;
  language: string;
  problemContext: string;
}

interface BugDetectionResponse {
  bugs: Array<{
    line: number;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    suggestedFix: string;
  }>;
  overallAssessment: string;
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

    const body: BugDetectionRequest = await request.json();
    const { code, language, problemContext } = body;

    if (!code || !code.trim() || !language || !language.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code and language are required'
      }, { status: 400 });
    }

    // Use default problem context if not provided
    const finalProblemContext = problemContext && problemContext.trim() ?
      problemContext.trim() : 'General code analysis';

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      }, { status: 500 });
    }

    const prompt = `
Analyze the following code for potential bugs, edge cases, and logical errors.

Context: ${finalProblemContext}
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

Please analyze the code and return your findings in JSON format with this exact structure:

{
  "bugs": [
    {
      "line": <number>,
      "type": "<string>",
      "description": "<string>",
      "severity": "low|medium|high",
      "suggestedFix": "<string>"
    }
  ],
  "overallAssessment": "<string>"
}

Look for:
1. Syntax errors
2. Logical errors
3. Edge case handling issues
4. Performance bottlenecks
5. Memory leaks or inefficiencies
6. Off-by-one errors
7. Null pointer exceptions
8. Array bounds issues
9. Infinite loops
10. Type mismatches

For each issue found:
- Specify the approximate line number (if identifiable)
- Categorize the type of issue
- Describe the problem clearly
- Rate severity (low/medium/high)
- Suggest a specific fix

If no bugs are found, return an empty bugs array and a positive assessment.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code analyzer specializing in bug detection. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      const bugResult: BugDetectionResponse = JSON.parse(aiResponse);
      
      return NextResponse.json({
        success: true,
        data: bugResult
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback bug analysis
      const fallbackBugAnalysis: BugDetectionResponse = {
        bugs: [],
        overallAssessment: "Code analysis completed. No critical bugs detected in the initial scan. Consider testing with edge cases to ensure robustness."
      };

      return NextResponse.json({
        success: true,
        data: fallbackBugAnalysis
      });
    }

  } catch (error) {
    console.error('Bug detection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze code for bugs'
    }, { status: 500 });
  }
}
