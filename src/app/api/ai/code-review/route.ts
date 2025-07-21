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

// Intelligent fallback code review based on code analysis
function generateFallbackCodeReview(code: string, language: string): CodeReviewResponse {
  // Handle empty or invalid code
  if (!code || !code.trim()) {
    return {
      overallScore: 1,
      codeQuality: {
        score: 1,
        feedback: "No code provided for review.",
        suggestions: ["Please provide code to analyze"]
      },
      efficiency: {
        score: 1,
        feedback: "Cannot analyze efficiency without code.",
        timeComplexity: "N/A",
        spaceComplexity: "N/A",
        optimizations: ["Provide code for analysis"]
      },
      readability: {
        score: 1,
        feedback: "Cannot assess readability without code.",
        improvements: ["Submit code for review"]
      },
      bestPractices: {
        score: 1,
        feedback: "Cannot evaluate best practices without code.",
        violations: ["No code provided"],
        recommendations: ["Submit code for analysis"]
      },
      bugs: {
        found: false,
        issues: [],
        fixes: []
      },
      summary: "No code provided for review. Please submit code to receive analysis."
    };
  }

  const codeLines = code.split('\n');
  const codeLength = code.length;

  // Basic analysis
  const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
  const hasNestedLoops = (code.match(/for|while/g) || []).length > 1;
  const hasRecursion = code.includes('return') && (code.includes('function') || code.includes('def'));
  const hasErrorHandling = code.includes('try') || code.includes('catch') || code.includes('except');

  // Determine complexity
  let timeComplexity = "O(n)";
  let spaceComplexity = "O(1)";
  let efficiencyScore = 7;

  if (hasNestedLoops) {
    timeComplexity = "O(n²)";
    efficiencyScore = 5;
  }

  if (hasRecursion) {
    spaceComplexity = "O(n)";
    efficiencyScore = Math.max(efficiencyScore - 1, 4);
  }

  // Code quality assessment
  const codeQualityScore = codeLength < 200 ? 8 : codeLength < 500 ? 7 : 6;
  const readabilityScore = hasComments ? 9 : 7;
  const bestPracticesScore = hasErrorHandling ? 8 : 6;

  const overallScore = Math.round((codeQualityScore + efficiencyScore + readabilityScore + bestPracticesScore) / 4);

  return {
    overallScore,
    codeQuality: {
      score: codeQualityScore,
      feedback: codeLength < 200 ? "Code is concise and well-structured." : "Code could benefit from being more modular.",
      suggestions: [
        codeLength > 300 ? "Consider breaking down into smaller functions" : "Good code structure",
        "Add input validation for robustness"
      ].filter(s => s !== "Good code structure" || codeLength <= 300)
    },
    efficiency: {
      score: efficiencyScore,
      feedback: hasNestedLoops ? "Nested loops detected - consider optimization." : "Algorithm efficiency looks good.",
      timeComplexity,
      spaceComplexity,
      optimizations: hasNestedLoops ? [
        "Consider using hash maps for O(1) lookups",
        "Look for ways to reduce nested iterations"
      ] : ["Code appears well-optimized"]
    },
    readability: {
      score: readabilityScore,
      feedback: hasComments ? "Good use of comments for clarity." : "Code is readable but could benefit from comments.",
      improvements: hasComments ? ["Maintain consistent commenting style"] : [
        "Add comments explaining complex logic",
        "Consider more descriptive variable names"
      ]
    },
    bestPractices: {
      score: bestPracticesScore,
      feedback: hasErrorHandling ? "Good error handling practices." : "Consider adding error handling.",
      violations: hasErrorHandling ? [] : ["Missing error handling"],
      recommendations: [
        hasErrorHandling ? "Maintain consistent error handling" : "Add try-catch blocks for error handling",
        language === 'javascript' ? "Use const/let instead of var" : "Follow language-specific conventions"
      ]
    },
    bugs: {
      found: false,
      issues: [],
      fixes: []
    },
    summary: `Code review complete. Overall score: ${overallScore}/10. ${hasNestedLoops ? 'Consider optimizing nested loops for better performance. ' : ''}${!hasComments ? 'Adding comments would improve maintainability. ' : ''}${!hasErrorHandling ? 'Consider adding error handling for robustness.' : ''}`
  };
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

    if (!code || !code.trim() || !language || !language.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code and language are required'
      }, { status: 400 });
    }

    // Use default problem title if not provided
    const finalProblemTitle = problemTitle && problemTitle.trim() ? problemTitle.trim() : 'Code Review';

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

Problem: ${finalProblemTitle}
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
        model: 'gpt-3.5-turbo',
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
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);

      // Provide intelligent fallback code review
      const fallbackResponse = generateFallbackCodeReview(code, language);

      return NextResponse.json({
        success: true,
        data: fallbackResponse,
        note: "AI service temporarily unavailable, providing curated review"
      });
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

      // Fallback: create a structured response
      const fallbackResponse = generateFallbackCodeReview(code, language);

      return NextResponse.json({
        success: true,
        data: fallbackResponse,
        note: "Using curated review due to parsing issue"
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
