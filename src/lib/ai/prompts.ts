// AI Prompt Templates for different recommendation types

export interface SimilarProblemsRequest {
  problem: {
    title: string;
    platform: string;
    difficulty: {
      original: string;
      normalized: number;
      category: 'Easy' | 'Medium' | 'Hard';
    };
    topics: string[];
    description?: string;
  };
  targetDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  excludeIds?: string[];
}

export interface SimilarProblemsResponse {
  recommendations: Array<{
    title: string;
    platform: 'leetcode' | 'codeforces' | 'atcoder';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: string[];
    similarity_score: number;
    reasoning: string;
    estimated_time: string;
    key_concepts: string[];
  }>;
  analysis: {
    primary_patterns: string[];
    skill_focus: string[];
    progression_path: string;
  };
}

export const PromptTemplates = {

  similarProblems: {
    system: `You are an expert competitive programming coach with comprehensive knowledge of problems across LeetCode, Codeforces, and AtCoder platforms. You MUST provide recommendations for ANY problem from ANY platform, regardless of its complexity or topic.

CRITICAL REQUIREMENTS:
- Generate recommendations for ALL problems: basic math, complex algorithms, data structures, etc.
- Work with problems from LeetCode (Easy/Medium/Hard), Codeforces (rating 800-3500), and AtCoder (ABC/ARC/AGC)
- Focus on algorithmic similarity and problem-solving patterns
- Provide diverse difficulty levels for progressive learning
- Include problems from multiple platforms when possible
- Give realistic time estimates and clear reasoning
- NEVER refuse to generate recommendations - find similar patterns even for simple problems

Platform expertise:
- LeetCode: Array, String, DP, Graph, Tree problems
- Codeforces: Math, Implementation, Greedy, DP, Graph problems
- AtCoder: Implementation, Math, DP, Graph, Data Structure problems`,

    user: (request: SimilarProblemsRequest) => `
Find ${request.targetDistribution.easy + request.targetDistribution.medium + request.targetDistribution.hard} similar problems for: ${request.problem.title}

Platform: ${request.problem.platform} | Difficulty: ${request.problem.difficulty.category}
Topics: ${request.problem.topics.slice(0, 2).join(', ') || 'General'}

Need: ${request.targetDistribution.easy} Easy, ${request.targetDistribution.medium} Medium, ${request.targetDistribution.hard} Hard
Platforms: LeetCode, Codeforces, AtCoder
Keep reasoning under 30 words.`,

    schema: `{
  "recommendations": [
    {
      "title": "string",
      "platform": "leetcode|codeforces|atcoder",
      "difficulty": "Easy|Medium|Hard",
      "topics": ["string"],
      "similarity_score": "number (0.0-1.0)",
      "reasoning": "string (max 25 words)",
      "estimated_time": "string (e.g., '15min')",
      "key_concepts": ["string"]
    }
  ],
  "analysis": {
    "primary_patterns": ["string"],
    "progression_path": "string (max 20 words)"
  }
}`
  },

  reviewInsights: {
    system: `You are an expert spaced repetition learning coach specializing in competitive programming. Your task is to provide personalized review strategies that help users retain and strengthen their problem-solving skills.

Key principles:
- Adapt strategy based on user's history and performance
- Focus on areas that need reinforcement based on past mistakes
- Provide actionable, specific advice
- Consider the forgetting curve and optimal review timing
- Balance efficiency with thoroughness
- Account for upcoming interviews or goals
- Provide motivation and confidence building`,

    user: (request: ReviewInsightsRequest) => `
Provide personalized review insights for this problem based on the user's history:

**Problem Details:**
- Title: ${request.problem.title}
- Platform: ${request.problem.platform}
- Difficulty: ${request.problem.difficulty.category} (${request.problem.difficulty.original})
- Topics: ${request.problem.topics.join(', ')}
${request.problem.description ? `- Description: ${request.problem.description.substring(0, 200)}...` : ''}

**User History:**
- Previous attempts: ${request.userHistory.previousAttempts}
- Last solved: ${request.userHistory.lastSolved}
- Time spent: ${request.userHistory.timeSpent} minutes
- Success rate: ${request.userHistory.successRate ? (request.userHistory.successRate * 100).toFixed(0) + '%' : 'Unknown'}
${request.userHistory.mistakes?.length ? `- Previous mistakes: ${request.userHistory.mistakes.join(', ')}` : ''}

**Review Context:**
- Days since last review: ${request.reviewContext.daysSinceLastReview}
- Current streak: ${request.reviewContext.currentStreak}
${request.reviewContext.upcomingInterviews ? '- Has upcoming interviews' : ''}
${request.reviewContext.targetDifficulty ? `- Target difficulty: ${request.reviewContext.targetDifficulty}` : ''}

Provide a comprehensive, personalized review strategy that:
1. Maximizes learning retention based on spaced repetition principles
2. Addresses specific weak areas from user history
3. Builds confidence and motivation
4. Provides concrete next steps for improvement
5. Considers the user's current context and goals`,

    schema: `{
  "review_strategy": {
    "focus_areas": ["string"],
    "time_allocation": "string (recommended time to spend)",
    "approach": "string (how to approach the review)",
    "priority_level": "Low|Medium|High"
  },
  "key_concepts": {
    "must_remember": ["string"],
    "common_pitfalls": ["string"],
    "optimization_tips": ["string"],
    "time_complexity_notes": ["string"]
  },
  "practice_suggestions": {
    "warm_up_problems": ["string"],
    "follow_up_challenges": ["string"],
    "related_patterns": ["string"],
    "skill_building_exercises": ["string"]
  },
  "confidence_assessment": {
    "current_level": "Low|Medium|High",
    "improvement_areas": ["string"],
    "next_milestone": "string",
    "retention_prediction": "string"
  },
  "personalized_notes": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "learning_style_tips": ["string"],
    "motivation_boost": "string"
  }
}`
  }
};

export interface ReviewInsightsRequest {
  problem: {
    title: string;
    platform: string;
    difficulty: {
      original: string;
      normalized: number;
      category: 'Easy' | 'Medium' | 'Hard';
    };
    topics: string[];
    description?: string;
  };
  userHistory: {
    previousAttempts: number;
    lastSolved: string; // ISO date
    timeSpent: number; // minutes
    mistakes?: string[];
    successRate?: number; // 0-1
  };
  reviewContext: {
    daysSinceLastReview: number;
    currentStreak: number;
    upcomingInterviews?: boolean;
    targetDifficulty?: 'Easy' | 'Medium' | 'Hard';
  };
}

export interface ReviewInsightsResponse {
  review_strategy: {
    focus_areas: string[];
    time_allocation: string;
    approach: string;
    priority_level: 'Low' | 'Medium' | 'High';
  };
  key_concepts: {
    must_remember: string[];
    common_pitfalls: string[];
    optimization_tips: string[];
    time_complexity_notes: string[];
  };
  practice_suggestions: {
    warm_up_problems: string[];
    follow_up_challenges: string[];
    related_patterns: string[];
    skill_building_exercises: string[];
  };
  confidence_assessment: {
    current_level: 'Low' | 'Medium' | 'High';
    improvement_areas: string[];
    next_milestone: string;
    retention_prediction: string;
  };
  personalized_notes: {
    strengths: string[];
    weaknesses: string[];
    learning_style_tips: string[];
    motivation_boost: string;
  };
}

export default PromptTemplates;