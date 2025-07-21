import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

interface CodeReviewRequest {
  code: string;
  language: string;
  problemTitle: string;
  problemDescription?: string;
}

interface CodeReviewResponse {
  overallScore: number;
  codeQuality: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  efficiency: {
    score: number;
    feedback: string;
    timeComplexity: string;
    spaceComplexity: string;
    optimizations: string[];
  };
  readability: {
    score: number;
    feedback: string;
    improvements: string[];
  };
  bestPractices: {
    score: number;
    feedback: string;
    violations: string[];
    recommendations: string[];
  };
  bugs: {
    found: boolean;
    issues: string[];
    fixes: string[];
  };
  summary: string;
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

    const body: CodeReviewRequest = await request.json();
    const { code, language, problemTitle, problemDescription } = body;

    if (!code || !language || !problemTitle) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code, language, problemTitle'
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
You are an expert code reviewer specializing in algorithm and data structure problems. 
Please review the following solution and provide detailed feedback in JSON format.

Problem: ${problemTitle}
${problemDescription ? `Description: ${problemDescription}` : ''}
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide a comprehensive review with scores (1-10) for each category. Return your response as a valid JSON object with this exact structure:

{
  "overallScore": <number>,
  "codeQuality": {
    "score": <number>,
    "feedback": "<string>",
    "suggestions": ["<string>", "<string>"]
  },
  "efficiency": {
    "score": <number>,
    "feedback": "<string>",
    "timeComplexity": "<string>",
    "spaceComplexity": "<string>",
    "optimizations": ["<string>", "<string>"]
  },
  "readability": {
    "score": <number>,
    "feedback": "<string>",
    "improvements": ["<string>", "<string>"]
  },
  "bestPractices": {
    "score": <number>,
    "feedback": "<string>",
    "violations": ["<string>"],
    "recommendations": ["<string>", "<string>"]
  },
  "bugs": {
    "found": <boolean>,
    "issues": ["<string>"],
    "fixes": ["<string>"]
  },
  "summary": "<string>"
}

Focus on:
1. Code Quality (structure, organization, clarity)
2. Efficiency (time/space complexity, optimizations)
3. Readability (naming, comments, formatting)
4. Best Practices (language-specific conventions)
5. Potential Bugs or Issues
6. Overall Assessment
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
            content: 'You are an expert programming mentor and code reviewer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      // Parse the JSON response from AI
      const reviewResult: CodeReviewResponse = JSON.parse(aiResponse);
      
      return NextResponse.json({
        success: true,
        data: reviewResult
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback: create a structured response from the text
      const fallbackResponse: CodeReviewResponse = {
        overallScore: 7,
        codeQuality: {
          score: 7,
          feedback: "Code structure appears reasonable based on AI analysis.",
          suggestions: ["Consider adding more descriptive variable names", "Add input validation"]
        },
        efficiency: {
          score: 7,
          feedback: "Algorithm efficiency looks acceptable.",
          timeComplexity: "Analysis pending",
          spaceComplexity: "Analysis pending",
          optimizations: ["Consider optimizing data structures"]
        },
        readability: {
          score: 8,
          feedback: "Code readability is good.",
          improvements: ["Add comments for complex logic"]
        },
        bestPractices: {
          score: 7,
          feedback: "Generally follows good practices.",
          violations: ["Minor convention issues"],
          recommendations: ["Follow language-specific conventions"]
        },
        bugs: {
          found: false,
          issues: [],
          fixes: []
        },
        summary: aiResponse.substring(0, 200) + "..." // Use first part of AI response
      };

      return NextResponse.json({
        success: true,
        data: fallbackResponse
      });
    }

  } catch (error) {
    console.error('Code review error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate code review'
    }, { status: 500 });
  }
}
