/**
 * LLM Prompts for Failure Detection and Suggestion Generation
 * Used by the LLM-Failure: Auto-Suggest Follow-Ups feature
 */

export const failureDetectionPrompt = (
  problemTitle: string,
  problemDescription: string,
  transcript: string,
  code?: string,
  difficulty?: string
): string => {
  return `You are an expert coding mentor analyzing a student's attempt at a problem.

Problem Title: ${problemTitle}
Difficulty: ${difficulty || 'Unknown'}
Problem Description: ${problemDescription || 'No description provided'}

${code ? `Student's Code:\n\`\`\`\n${code}\n\`\`\`` : ''}

Student's Explanation/Transcript: ${transcript}

Analyze whether the student failed to solve this problem and identify the root causes.

ANALYSIS FRAMEWORK:
1. Problem Understanding: Did they grasp the problem requirements?
2. Approach: Was their algorithm/strategy correct?
3. Implementation: Did they code it correctly?
4. Edge Cases: Did they consider all edge cases?
5. Optimization: Was their solution efficient enough?

Return ONLY valid JSON (no markdown, no extra text, no code blocks):
{
  "failed": boolean,
  "failure_reason": "specific reason why they failed (1-2 sentences) - be constructive and specific",
  "missing_concepts": ["concept1", "concept2", "concept3"],
  "confidence": 0.0-1.0
}

IMPORTANT:
- Be precise and constructive in your analysis
- Identify 2-4 specific missing concepts
- Confidence should reflect how certain you are about the failure
- Focus on actionable insights for learning`;
};

export const suggestionGeneratorPrompt = (
  problemTitle: string,
  difficulty: string,
  topics: string[],
  missingConcepts: string[],
  failureReason: string,
  platform?: string,
  url?: string,
  companies?: string[]
): string => {
  const platformInfo = platform ? `\nPlatform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}` : '';
  const urlInfo = url ? `\nProblem URL: ${url}` : '';
  const companiesInfo = companies && companies.length > 0 ? `\nCompanies: ${companies.join(', ')}` : '';

  // Platform-specific context
  let platformContext = '';
  if (platform === 'codeforces') {
    platformContext = `
CODEFORCES CONTEXT (ENHANCED):
- This is a competitive programming problem
- Focus on algorithmic efficiency and time complexity
- Suggest problems with similar rating/difficulty (±200-300 points)
- Include problems that teach similar algorithmic techniques
- Consider Codeforces rating system (800-3500) with granular difficulty levels
- Suggest problems from Codeforces, AtCoder, or similar competitive platforms
- Emphasize optimization and edge case handling
- Problem format: "Codeforces [ContestID][ProblemLetter] - [ProblemName] (Rating [rating])"
- Examples: "Codeforces 1234A - Game (Rating 800)", "Codeforces 1567B - Optimal Moves (Rating 1200)"
- Include the contest ID, problem letter (A-F), and rating
- IMPORTANT: Match problem tags/concepts for better learning outcomes
- Suggest problems with similar tags (DP, Graph, Math, Greedy, etc.)
- Include problems from different contests to show pattern variety
- Prioritize problems that teach the missing concepts`;
  } else if (platform === 'leetcode') {
    platformContext = `
LEETCODE CONTEXT:
- This is an interview-style problem
- Focus on practical coding patterns and data structures
- Suggest problems with similar tags and difficulty
- Include problems that teach similar patterns
- Consider LeetCode difficulty (Easy/Medium/Hard)
- Suggest problems from LeetCode
- Emphasize clean code and interview readiness`;
  } else if (platform === 'atcoder') {
    platformContext = `
ATCODER CONTEXT (ENHANCED):
- This is a Japanese competitive programming problem
- AtCoder has three contest types: ABC (Beginner), ARC (Regular), AGC (Grand)
- AtCoder problems are labeled A, B, C, D, E, F within contests (A is easiest, F is hardest)
- Problem difficulty increases significantly from A→B→C→D→E→F
- Contest progression: ABC → ARC → AGC (increasing difficulty)
- Focus on mathematical and algorithmic thinking
- Suggest problems with similar difficulty and concepts
- Include problems that teach similar mathematical techniques
- For problem A/B: Focus on implementation and basic algorithms
- For problem C/D: Focus on data structures and intermediate algorithms
- For problem E/F: Focus on advanced algorithms and mathematical insights
- Suggest specific AtCoder problems (e.g., "AtCoder ABC123A", "AtCoder ARC456B", "AtCoder AGC789C")
- Include the contest type (ABC, ARC, AGC) and problem letter (e.g., ABC, ARC, AGC)
- IMPORTANT: Consider cross-contest recommendations for progression
- ABC E/F → ARC A/B (natural progression)
- ARC D/E → AGC A/B (advanced progression)
- Emphasize mathematical insights and elegant solutions
- Consider that AtCoder problems often have tight time/memory limits
- Match problem concepts for better learning outcomes`;
  }

  return `A student failed to solve this coding problem and needs targeted help.

Problem: ${problemTitle}
Difficulty: ${difficulty}
Topics: ${topics.length > 0 ? topics.join(', ') : 'Not specified'}${platformInfo}${companiesInfo}${urlInfo}
Why they failed: ${failureReason}
Missing Concepts: ${missingConcepts.join(', ')}
${platformContext}

Generate 3 categories of follow-up suggestions to help them learn and eventually solve this problem.

IMPORTANT GUIDELINES:
1. Prerequisites: Simpler concept drills (5-20 min each)
   - Focus on the missing concepts: ${missingConcepts.join(', ')}
   - Make them progressively harder
   - Include practical examples

2. Similar Problems: Real problems with same techniques
   - Suggest SPECIFIC problem names/titles from ${platform || 'the platform'}
   ${platform === 'codeforces' ? `- For Codeforces: Use format "Codeforces 1234A - Problem Name (Rating 800)"
   - Include the contest ID, problem letter (A-F), and rating
   - Suggest problems with ratings within 200-300 points of current problem (ENHANCED: tighter range)
   - IMPORTANT: Match problem tags/concepts (DP, Graph, Math, Greedy, etc.)
   - Include problems from different contests to show pattern variety
   - Focus on problems that teach similar algorithmic techniques
   - Prioritize problems with matching tags for better learning` : ''}
   ${platform === 'atcoder' ? `- For AtCoder: Use format "AtCoder ABC123A - Problem Name" or "AtCoder ARC456B - Problem Name"
   - Include the contest type (ABC, ARC, AGC) and problem letter (A-F)
   - Suggest problems with similar difficulty letter (if problem is C, suggest C/D level problems)
   - ENHANCED: Consider cross-contest progression (ABC E/F → ARC A/B, ARC D/E → AGC A/B)
   - IMPORTANT: Match problem concepts for better learning outcomes
   - Include problems from different contests to show pattern variety
   - Prioritize problems that teach the missing concepts` : ''}
   - Include problems that use similar algorithms/data structures
   - Explain why each problem helps
   - Vary difficulty slightly (easier to harder)

3. Microtasks: Targeted 10-30 min drills
   - Specific to this problem's requirements
   - Actionable and measurable
   - Build towards solving the original problem

Return ONLY valid JSON (no markdown, no extra text, no code blocks):
{
  "prerequisites": [
    {
      "title": "concept drill title",
      "difficulty": "Easy|Medium|Hard",
      "reason": "why this helps them understand the missing concept",
      "estimatedTime": 15
    },
    {
      "title": "another prerequisite",
      "difficulty": "Easy",
      "reason": "explanation",
      "estimatedTime": 10
    }
  ],
  "similarProblems": [
    {
      "title": "problem title that uses similar techniques",
      "tags": ["tag1", "tag2"],
      "reason": "why this problem helps them practice the same skills"
    },
    {
      "title": "another similar problem",
      "tags": ["tag1"],
      "reason": "explanation"
    }
  ],
  "microtasks": [
    {
      "title": "specific task title",
      "description": "what to do (1-2 sentences)",
      "duration": 20
    },
    {
      "title": "another microtask",
      "description": "description",
      "duration": 15
    }
  ]
}

CRITICAL: Make suggestions SPECIFIC to their failure reason, missing concepts, and problem platform.
Ensure all suggestions are actionable, educational, and relevant to the problem context.`;
};

export const fallbackSuggestions = {
  prerequisites: [
    {
      title: "Review Data Structures Fundamentals",
      difficulty: "Easy",
      reason: "Understanding basic data structures is crucial for most problems",
      estimatedTime: 20,
    },
    {
      title: "Practice Array Manipulation",
      difficulty: "Easy",
      reason: "Arrays are fundamental to many coding problems",
      estimatedTime: 15,
    },
    {
      title: "Learn Time Complexity Analysis",
      difficulty: "Medium",
      reason: "Understanding complexity helps optimize solutions",
      estimatedTime: 25,
    },
  ],
  similarProblems: [
    {
      title: "Two Sum",
      tags: ["Array", "Hash Table"],
      reason: "Classic problem that teaches hash table usage",
    },
    {
      title: "Contains Duplicate",
      tags: ["Array", "Hash Table"],
      reason: "Similar approach to detecting duplicates",
    },
  ],
  microtasks: [
    {
      title: "Trace Through Your Code",
      description: "Step through your solution with a sample input to find logical errors",
      duration: 15,
    },
    {
      title: "Identify Edge Cases",
      description: "List all edge cases for this problem and test your solution against them",
      duration: 20,
    },
    {
      title: "Optimize for Time Complexity",
      description: "Try to improve your solution's time complexity by one level",
      duration: 25,
    },
  ],
};

