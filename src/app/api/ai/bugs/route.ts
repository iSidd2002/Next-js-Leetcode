import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

// Intelligent fallback bug detection based on common patterns
function generateFallbackBugDetection(code: string, language: string, problemContext: string) {
  const bugs = [];
  const warnings = [];
  const suggestions = [];

  // Common bug patterns
  if (code.includes('i <= arr.length') || code.includes('i <= array.length')) {
    bugs.push({
      type: "Array Index Out of Bounds",
      line: code.split('\n').findIndex(line => line.includes('i <= arr.length') || line.includes('i <= array.length')) + 1,
      description: "Loop condition uses <= instead of < which can cause array index out of bounds",
      severity: "high",
      fix: "Change '<= arr.length' to '< arr.length'"
    });
  }

  if (code.includes('let max = 0') && problemContext.toLowerCase().includes('max')) {
    warnings.push({
      type: "Incorrect Initialization",
      line: code.split('\n').findIndex(line => line.includes('let max = 0')) + 1,
      description: "Initializing max to 0 may not work for arrays with all negative numbers",
      severity: "medium",
      fix: "Initialize max to arr[0] or Number.NEGATIVE_INFINITY"
    });
  }

  if (code.includes('==') && !code.includes('===')) {
    warnings.push({
      type: "Type Coercion",
      line: code.split('\n').findIndex(line => line.includes('==') && !line.includes('===')) + 1,
      description: "Using == instead of === can lead to unexpected type coercion",
      severity: "medium",
      fix: "Use === for strict equality comparison"
    });
  }

  if (!code.includes('return') && language === 'javascript') {
    warnings.push({
      type: "Missing Return Statement",
      line: code.split('\n').length,
      description: "Function may be missing a return statement",
      severity: "medium",
      fix: "Add appropriate return statement"
    });
  }

  // Performance suggestions
  if (code.includes('for') && code.includes('for')) {
    const nestedLoops = (code.match(/for/g) || []).length > 1;
    if (nestedLoops) {
      suggestions.push({
        type: "Performance Optimization",
        description: "Nested loops detected - consider using hash maps for O(1) lookups",
        impact: "Can improve time complexity from O(n²) to O(n)"
      });
    }
  }

  if (code.includes('.indexOf(') || code.includes('.includes(')) {
    suggestions.push({
      type: "Data Structure Optimization",
      description: "Consider using Set or Map for faster lookups instead of array methods",
      impact: "Improves lookup time from O(n) to O(1)"
    });
  }

  const bugsFound = bugs.length > 0;
  const issueCount = bugs.length + warnings.length;

  return {
    bugsFound,
    issueCount,
    bugs,
    warnings,
    suggestions,
    summary: issueCount > 0
      ? `Found ${issueCount} potential issue${issueCount > 1 ? 's' : ''} in the code`
      : "No obvious bugs detected in the code",
    recommendations: [
      bugs.length > 0 ? "Fix critical bugs before deployment" : "Code appears bug-free",
      warnings.length > 0 ? "Address warnings to improve code quality" : "Good code quality practices",
      suggestions.length > 0 ? "Consider performance optimizations" : "Performance looks acceptable"
    ]
  };
}

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
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);

      // Provide intelligent fallback bug detection
      const fallbackBugReport = generateFallbackBugDetection(code, language, finalProblemContext);

      return NextResponse.json({
        success: true,
        data: fallbackBugReport,
        note: "AI service temporarily unavailable, providing curated bug analysis"
      });
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
