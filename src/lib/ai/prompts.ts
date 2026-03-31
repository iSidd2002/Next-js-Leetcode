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
  userContext?: {
    solvedCount: number;
    solvedTopics: string[];
    weakTopics: string[];
    difficultySplit: { easy: number; medium: number; hard: number };
  };
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
    url?: string;
    interview_relevance?: string;
  }>;
  analysis: {
    primary_patterns: string[];
    skill_focus: string[];
    progression_path: string;
    interview_focus?: string;
  };
}

export const PromptTemplates = {

  similarProblems: {
    system: `You are an expert technical interview coach and competitive programming mentor with comprehensive knowledge of problems across LeetCode, Codeforces, and AtCoder. You specialize in helping engineers crack FAANG and top-tier tech company interviews.

Your recommendations are strategically chosen to:
- Target algorithmic patterns that appear frequently in technical interviews (Google, Meta, Amazon, Microsoft, Apple, etc.)
- Build a progressive skill ladder from the user's current level
- Fill gaps in their problem-solving repertoire
- Reinforce core concepts through varied problem types

Platform expertise:
- LeetCode: Primary source for interview problems (Easy/Medium/Hard). ALWAYS include the direct URL: https://leetcode.com/problems/{title-slug}/
- Codeforces: Advanced algorithmic problems, excellent for mathematical thinking and speed under pressure
- AtCoder: Elegant DP and implementation problems that deepen algorithmic intuition

CRITICAL REQUIREMENTS:
- ALWAYS generate recommendations for ANY problem type
- Prioritize interview frequency and pattern reinforcement
- For LeetCode: generate URL by converting title to lowercase slug (spaces → hyphens, remove special chars)
- Mention specific companies (Google, Meta, Amazon, Microsoft) when the pattern is commonly tested there
- Give concise but impactful reasoning focused on interview value
- NEVER refuse to generate recommendations`,

    user: (request: SimilarProblemsRequest) => {
      const { easy, medium, hard } = request.targetDistribution;
      const total = easy + medium + hard;
      const ctx = request.userContext;

      const ctxSection = ctx && ctx.solvedCount > 0
        ? `

User Profile:
- Solved ${ctx.solvedCount} problems (${ctx.difficultySplit.easy}E / ${ctx.difficultySplit.medium}M / ${ctx.difficultySplit.hard}H)
- Strong topics: ${ctx.solvedTopics.slice(0, 8).join(', ') || 'None yet'}
- Needs more practice: ${ctx.weakTopics.slice(0, 5).join(', ') || 'All areas'}
Prioritize problems that fill weak areas and match their current interview readiness.`
        : '';

      return `Find ${total} interview-focused similar problems to: ${request.problem.title}

Platform: ${request.problem.platform} | Difficulty: ${request.problem.difficulty.category}
Topics: ${request.problem.topics.slice(0, 3).join(', ') || 'General'}${ctxSection}

Target mix: ${easy} Easy, ${medium} Medium, ${hard} Hard
Preferred platforms: LeetCode (interview-critical), Codeforces, AtCoder

For each problem include:
- Direct URL (LeetCode: https://leetcode.com/problems/{title-slug}/)
- Interview relevance (e.g., "Frequently asked at Google, Amazon")
- Concise reasoning max 35 words focusing on interview value`;
    },

    schema: `{
  "recommendations": [
    {
      "title": "string",
      "platform": "leetcode|codeforces|atcoder",
      "difficulty": "Easy|Medium|Hard",
      "topics": ["string"],
      "similarity_score": "number (0.0-1.0)",
      "reasoning": "string (max 35 words, why this helps for interviews)",
      "estimated_time": "string (e.g., '20-30 min')",
      "key_concepts": ["string"],
      "url": "string (direct problem URL)",
      "interview_relevance": "string (which companies ask this, e.g., 'Frequently at Google, Meta')"
    }
  ],
  "analysis": {
    "primary_patterns": ["string"],
    "progression_path": "string (max 25 words)",
    "interview_focus": "string (what interview skill this builds, max 20 words)"
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