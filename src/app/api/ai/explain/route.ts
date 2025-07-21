import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

interface ExplanationRequest {
  code: string;
  language: string;
  problemTitle: string;
}

interface ExplanationResponse {
  overview: string;
  stepByStep: {
    step: number;
    description: string;
    codeSnippet: string;
    explanation: string;
  }[];
  keyInsights: string[];
  timeComplexity: {
    analysis: string;
    explanation: string;
  };
  spaceComplexity: {
    analysis: string;
    explanation: string;
  };
  alternativeApproaches: string[];
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

    const body: ExplanationRequest = await request.json();
    const { code, language, problemTitle } = body;

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
You are a computer science educator. Please provide a comprehensive explanation 
of the following solution to help students understand the approach and implementation.

Problem: ${problemTitle}
Language: ${language}

Solution:
\`\`\`${language}
${code}
\`\`\`

Provide your explanation in JSON format with this exact structure:

{
  "overview": "<string - high-level overview of the approach>",
  "stepByStep": [
    {
      "step": 1,
      "description": "<string>",
      "codeSnippet": "<string>",
      "explanation": "<string>"
    }
  ],
  "keyInsights": ["<string>", "<string>", "<string>"],
  "timeComplexity": {
    "analysis": "<string - Big O notation>",
    "explanation": "<string - why this complexity>"
  },
  "spaceComplexity": {
    "analysis": "<string - Big O notation>",
    "explanation": "<string - why this complexity>"
  },
  "alternativeApproaches": ["<string>", "<string>", "<string>"]
}

Please provide:
1. High-level overview of the approach
2. Step-by-step breakdown of the algorithm (3-5 key steps)
3. Key insights and intuitions
4. Time and space complexity analysis with explanations
5. Alternative approaches that could be used

Make the explanation educational and easy to understand for intermediate programmers.
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
            content: 'You are an expert computer science educator. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      const explanationResult: ExplanationResponse = JSON.parse(aiResponse);
      
      return NextResponse.json({
        success: true,
        data: explanationResult
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback explanation
      const fallbackExplanation: ExplanationResponse = {
        overview: "This solution implements an algorithmic approach to solve the given problem efficiently.",
        stepByStep: [
          {
            step: 1,
            description: "Initialize variables and data structures",
            codeSnippet: "// Initialization code",
            explanation: "Set up the necessary variables and data structures for the algorithm."
          },
          {
            step: 2,
            description: "Process the input data",
            codeSnippet: "// Main processing logic",
            explanation: "Apply the core algorithm logic to process the input."
          },
          {
            step: 3,
            description: "Return the result",
            codeSnippet: "// Return statement",
            explanation: "Return the computed result."
          }
        ],
        keyInsights: [
          "The algorithm uses an efficient approach to solve the problem",
          "Data structures are chosen to optimize time complexity",
          "The solution handles edge cases appropriately"
        ],
        timeComplexity: {
          analysis: "O(n)",
          explanation: "The algorithm processes each element once, resulting in linear time complexity."
        },
        spaceComplexity: {
          analysis: "O(1)",
          explanation: "The algorithm uses constant extra space."
        },
        alternativeApproaches: [
          "Brute force approach with higher time complexity",
          "Different data structure choices",
          "Recursive vs iterative implementation"
        ]
      };

      return NextResponse.json({
        success: true,
        data: fallbackExplanation
      });
    }

  } catch (error) {
    console.error('Explanation generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate explanation'
    }, { status: 500 });
  }
}
