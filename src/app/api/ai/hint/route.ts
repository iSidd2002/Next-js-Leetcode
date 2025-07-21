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

// Intelligent fallback hint generation based on problem patterns
function generateFallbackHint(problemTitle: string, difficulty: string): HintResponse {
  const title = problemTitle.toLowerCase();

  // Pattern-based hints
  if (title.includes('two sum') || title.includes('target sum')) {
    return {
      level: 'moderate',
      hint: "Think about what data structure allows O(1) lookup time. You need to find two numbers that add up to a target.",
      approach: "Use a hash map to store numbers you've seen and their indices. For each number, check if (target - current number) exists in the map.",
      nextSteps: [
        "Create a hash map to store number -> index pairs",
        "Iterate through the array once",
        "For each number, calculate what you need to find (target - current)",
        "Check if that complement exists in your hash map"
      ],
      relatedConcepts: ["Hash Maps", "Complement Search", "O(n) Time Complexity"]
    };
  }

  if (title.includes('palindrome')) {
    return {
      level: 'moderate',
      hint: "A palindrome reads the same forwards and backwards. Consider using two pointers from opposite ends.",
      approach: "Use two pointers technique - one from the start and one from the end, moving towards each other.",
      nextSteps: [
        "Set up two pointers: left at start, right at end",
        "Compare characters at both pointers",
        "Move pointers towards center",
        "Handle edge cases for odd/even length strings"
      ],
      relatedConcepts: ["Two Pointers", "String Manipulation", "Symmetry"]
    };
  }

  if (title.includes('binary') || title.includes('search')) {
    return {
      level: 'moderate',
      hint: "When dealing with sorted data, think about dividing the search space in half repeatedly.",
      approach: "Use binary search to efficiently find elements in O(log n) time.",
      nextSteps: [
        "Ensure your data is sorted",
        "Set left and right boundaries",
        "Calculate middle point",
        "Compare and eliminate half the search space"
      ],
      relatedConcepts: ["Binary Search", "Divide and Conquer", "Logarithmic Time"]
    };
  }

  if (title.includes('tree') || title.includes('binary tree')) {
    return {
      level: 'moderate',
      hint: "Tree problems often involve traversal. Consider which traversal method (DFS, BFS) fits your needs.",
      approach: "Think about whether you need to process nodes level by level (BFS) or go deep first (DFS).",
      nextSteps: [
        "Identify if you need DFS (recursive/stack) or BFS (queue)",
        "Consider the base case for recursion",
        "Think about what information to pass between recursive calls",
        "Handle null nodes appropriately"
      ],
      relatedConcepts: ["Tree Traversal", "DFS", "BFS", "Recursion"]
    };
  }

  // Generic hints based on difficulty
  if (difficulty === 'easy') {
    return {
      level: 'gentle',
      hint: "Start with the simplest approach that works. Focus on correctness first, then optimize if needed.",
      approach: "Break down the problem into smaller steps and solve each step methodically.",
      nextSteps: [
        "Understand the problem requirements clearly",
        "Think of the most straightforward solution",
        "Consider edge cases",
        "Implement step by step"
      ],
      relatedConcepts: ["Problem Decomposition", "Edge Cases", "Basic Algorithms"]
    };
  }

  if (difficulty === 'hard') {
    return {
      level: 'detailed',
      hint: "Hard problems often combine multiple techniques or require advanced data structures. Look for patterns you recognize.",
      approach: "Consider if this problem can be broken down into subproblems or if it requires dynamic programming, graph algorithms, or advanced data structures.",
      nextSteps: [
        "Identify the core algorithmic challenge",
        "Consider if you've seen similar patterns before",
        "Think about time/space complexity requirements",
        "Consider advanced techniques like DP, graphs, or specialized data structures"
      ],
      relatedConcepts: ["Dynamic Programming", "Graph Algorithms", "Advanced Data Structures", "Optimization"]
    };
  }

  // Default medium difficulty hint
  return {
    level: 'moderate',
    hint: "Look for patterns in the problem. Often the key insight involves choosing the right data structure or algorithm approach.",
    approach: "Consider the time and space complexity requirements, then choose an appropriate algorithm or data structure.",
    nextSteps: [
      "Analyze the input constraints",
      "Identify the core operation you need to perform efficiently",
      "Choose appropriate data structures",
      "Consider if sorting or preprocessing helps"
    ],
    relatedConcepts: ["Algorithm Design", "Data Structures", "Time Complexity", "Space Complexity"]
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
        model: 'gpt-3.5-turbo',
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
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);

      // Provide intelligent fallback based on problem difficulty and title
      const fallbackHint = generateFallbackHint(problemTitle, difficulty);

      return NextResponse.json({
        success: true,
        data: fallbackHint,
        note: "AI service temporarily unavailable, providing curated hint"
      });
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
      const fallbackHint = generateFallbackHint(problemTitle, difficulty);

      return NextResponse.json({
        success: true,
        data: fallbackHint,
        note: "Using curated hint due to parsing issue"
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
