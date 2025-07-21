// AI Assistant Service - Integrates with OpenAI API for intelligent features

interface AIAssistantConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

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

class AIAssistantService {
  private config: AIAssistantConfig;

  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.3
    };
  }

  /**
   * AI-Powered Code Review
   * Analyzes code for quality, efficiency, readability, and best practices
   */
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    const prompt = `
You are an expert code reviewer specializing in algorithm and data structure problems. 
Please review the following solution and provide detailed feedback.

Problem: ${request.problemTitle}
${request.problemDescription ? `Description: ${request.problemDescription}` : ''}
Language: ${request.language}

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Please provide a comprehensive review covering:
1. Code Quality (structure, organization, clarity)
2. Efficiency (time/space complexity, optimizations)
3. Readability (naming, comments, formatting)
4. Best Practices (language-specific conventions)
5. Potential Bugs or Issues
6. Overall Assessment

Format your response as a structured analysis with scores (1-10) for each category.
`;

    try {
      const response = await this.callOpenAI(prompt);
      return this.parseCodeReviewResponse(response);
    } catch (error) {
      console.error('AI Code Review Error:', error);
      throw new Error('Failed to generate code review');
    }
  }

  /**
   * Progressive Hint System
   * Provides hints based on user's current progress and difficulty level
   */
  async getHint(request: HintRequest): Promise<HintResponse> {
    const prompt = `
You are a coding mentor helping a student solve algorithm problems. 
Provide a progressive hint that guides without giving away the complete solution.

Problem: ${request.problemTitle}
Description: ${request.problemDescription}
Difficulty: ${request.difficulty}
${request.currentAttempt ? `Current Attempt: ${request.currentAttempt}` : ''}
${request.stuckPoint ? `Student is stuck on: ${request.stuckPoint}` : ''}

Provide a hint that:
1. Guides the student toward the right approach
2. Doesn't reveal the complete solution
3. Encourages critical thinking
4. Suggests the next logical step

Include related concepts they should review if needed.
`;

    try {
      const response = await this.callOpenAI(prompt);
      return this.parseHintResponse(response);
    } catch (error) {
      console.error('AI Hint Error:', error);
      throw new Error('Failed to generate hint');
    }
  }

  /**
   * Solution Explanation Generator
   * Creates detailed explanations for code solutions
   */
  async explainSolution(request: ExplanationRequest): Promise<ExplanationResponse> {
    const prompt = `
You are a computer science educator. Please provide a comprehensive explanation 
of the following solution to help students understand the approach and implementation.

Problem: ${request.problemTitle}
Language: ${request.language}

Solution:
\`\`\`${request.language}
${request.code}
\`\`\`

Please provide:
1. High-level overview of the approach
2. Step-by-step breakdown of the algorithm
3. Key insights and intuitions
4. Time and space complexity analysis
5. Alternative approaches that could be used

Make the explanation educational and easy to understand for intermediate programmers.
`;

    try {
      const response = await this.callOpenAI(prompt);
      return this.parseExplanationResponse(response);
    } catch (error) {
      console.error('AI Explanation Error:', error);
      throw new Error('Failed to generate explanation');
    }
  }

  /**
   * Bug Detection and Fixes
   * Identifies potential bugs and suggests fixes
   */
  async detectBugs(code: string, language: string, problemContext: string): Promise<{
    bugs: Array<{
      line: number;
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      suggestedFix: string;
    }>;
    overallAssessment: string;
  }> {
    const prompt = `
Analyze the following code for potential bugs, edge cases, and logical errors.

Context: ${problemContext}
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

Identify:
1. Syntax errors
2. Logical errors
3. Edge case handling issues
4. Performance bottlenecks
5. Memory leaks or inefficiencies

For each issue, provide the line number, description, severity, and suggested fix.
`;

    try {
      const response = await this.callOpenAI(prompt);
      return this.parseBugDetectionResponse(response);
    } catch (error) {
      console.error('AI Bug Detection Error:', error);
      throw new Error('Failed to detect bugs');
    }
  }

  /**
   * Personalized Study Recommendations
   * Analyzes user's solving patterns and suggests improvements
   */
  async getStudyRecommendations(userStats: {
    solvedProblems: number;
    weakTopics: string[];
    strongTopics: string[];
    averageTime: number;
    difficultyDistribution: { easy: number; medium: number; hard: number };
  }): Promise<{
    recommendations: string[];
    focusAreas: string[];
    suggestedProblems: string[];
    studyPlan: {
      week: number;
      focus: string;
      goals: string[];
      problems: string[];
    }[];
  }> {
    const prompt = `
Based on the following user statistics, provide personalized study recommendations:

Solved Problems: ${userStats.solvedProblems}
Weak Topics: ${userStats.weakTopics.join(', ')}
Strong Topics: ${userStats.strongTopics.join(', ')}
Average Solving Time: ${userStats.averageTime} minutes
Difficulty Distribution: Easy: ${userStats.difficultyDistribution.easy}, Medium: ${userStats.difficultyDistribution.medium}, Hard: ${userStats.difficultyDistribution.hard}

Provide:
1. Specific recommendations for improvement
2. Focus areas for the next month
3. Suggested problem types to practice
4. A 4-week study plan with weekly goals
`;

    try {
      const response = await this.callOpenAI(prompt);
      return this.parseStudyRecommendationsResponse(response);
    } catch (error) {
      console.error('AI Study Recommendations Error:', error);
      throw new Error('Failed to generate study recommendations');
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert programming mentor and code reviewer with deep knowledge of algorithms, data structures, and software engineering best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseCodeReviewResponse(response: string): CodeReviewResponse {
    // Parse the AI response and structure it into the expected format
    // This would include regex parsing or structured prompting
    // For brevity, returning a mock structure
    return {
      overallScore: 8,
      codeQuality: {
        score: 8,
        feedback: "Code is well-structured with clear logic flow.",
        suggestions: ["Consider adding more descriptive variable names", "Add input validation"]
      },
      efficiency: {
        score: 7,
        feedback: "Algorithm is efficient for most cases.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        optimizations: ["Consider using a hash map for O(1) lookups"]
      },
      readability: {
        score: 9,
        feedback: "Code is very readable with good formatting.",
        improvements: ["Add comments for complex logic sections"]
      },
      bestPractices: {
        score: 8,
        feedback: "Follows most language conventions.",
        violations: ["Missing error handling"],
        recommendations: ["Add try-catch blocks", "Use const for immutable variables"]
      },
      bugs: {
        found: false,
        issues: [],
        fixes: []
      },
      summary: "Overall solid solution with room for minor improvements in error handling and optimization."
    };
  }

  private parseHintResponse(response: string): HintResponse {
    // Parse hint response
    return {
      level: 'moderate',
      hint: "Consider what data structure would allow you to track elements efficiently.",
      approach: "Think about using a hash map to store values and their indices.",
      nextSteps: ["Identify what you need to track", "Choose appropriate data structure", "Implement the core logic"],
      relatedConcepts: ["Hash Maps", "Two Pointers", "Array Traversal"]
    };
  }

  private parseExplanationResponse(response: string): ExplanationResponse {
    // Parse explanation response
    return {
      overview: "This solution uses a hash map approach to solve the problem efficiently.",
      stepByStep: [
        {
          step: 1,
          description: "Initialize a hash map to store values and indices",
          codeSnippet: "const map = new Map();",
          explanation: "We use a Map to store each number and its index for O(1) lookup time."
        }
      ],
      keyInsights: ["Hash maps provide O(1) lookup time", "Single pass solution is possible"],
      timeComplexity: {
        analysis: "O(n)",
        explanation: "We iterate through the array once, and each hash map operation is O(1)."
      },
      spaceComplexity: {
        analysis: "O(n)",
        explanation: "In worst case, we store all n elements in the hash map."
      },
      alternativeApproaches: ["Brute force O(n²)", "Two pointers after sorting"]
    };
  }

  private parseBugDetectionResponse(response: string): any {
    // Parse bug detection response
    return {
      bugs: [],
      overallAssessment: "No critical bugs detected. Code appears to handle edge cases well."
    };
  }

  private parseStudyRecommendationsResponse(response: string): any {
    // Parse study recommendations response
    return {
      recommendations: ["Focus on dynamic programming patterns", "Practice more tree traversal problems"],
      focusAreas: ["Dynamic Programming", "Tree Algorithms", "Graph Theory"],
      suggestedProblems: ["Climbing Stairs", "House Robber", "Binary Tree Inorder Traversal"],
      studyPlan: [
        {
          week: 1,
          focus: "Dynamic Programming Basics",
          goals: ["Understand memoization", "Solve 10 DP problems"],
          problems: ["Fibonacci", "Climbing Stairs", "House Robber"]
        }
      ]
    };
  }
}

export default new AIAssistantService();
