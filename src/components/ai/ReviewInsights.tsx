"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Clock, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  BookOpen,
  Zap,
  Heart,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { Problem } from '@/types';

interface ReviewInsightsResponse {
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

interface UserHistory {
  previousAttempts: number;
  lastSolved: string;
  timeSpent: number;
  mistakes: string[];
  successRate: number;
}

interface ReviewContext {
  daysSinceLastReview: number;
  currentStreak: number;
  upcomingInterviews: boolean;
  targetDifficulty?: string;
}

interface ReviewInsightsProps {
  problem: Problem;
  userHistory: UserHistory;
  reviewContext: ReviewContext;
  className?: string;
}

const ReviewInsights = ({ problem, userHistory, reviewContext, className = '' }: ReviewInsightsProps) => {
  const [insights, setInsights] = useState<ReviewInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewInsights = async () => {
    if (!problem) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: {
            id: problem.problemId || problem.id,
            title: problem.title,
            platform: problem.platform,
            difficulty: problem.difficulty,
            topics: problem.topics || [],
            description: `Problem: ${problem.title}`,
            url: problem.url
          },
          userHistory,
          reviewContext
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setInsights(data.data);
        toast.success('AI review insights generated!');
      } else {
        throw new Error(data.error || 'Failed to get insights');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load insights';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConfidenceProgress = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 85;
      case 'medium': return 60;
      case 'low': return 30;
      default: return 0;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Review Insights
        </CardTitle>
        {!insights && !loading && (
          <Button 
            onClick={fetchReviewInsights}
            className="w-fit"
            variant="outline"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate Review Strategy
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 animate-pulse" />
              AI is analyzing your learning patterns and generating personalized insights...
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchReviewInsights} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {insights && (
          <div className="space-y-6">
            {/* Review Strategy */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Review Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Priority Level</span>
                  <Badge className={getPriorityColor(insights.review_strategy.priority_level)}>
                    {insights.review_strategy.priority_level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Time Allocation: {insights.review_strategy.time_allocation}</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Approach</p>
                  <p className="text-sm text-muted-foreground">{insights.review_strategy.approach}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Focus Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {insights.review_strategy.focus_areas.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Concepts */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Key Concepts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Must Remember
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {insights.key_concepts.must_remember.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Common Pitfalls
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {insights.key_concepts.common_pitfalls.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    Optimization Tips
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {insights.key_concepts.optimization_tips.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Assessment */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Confidence Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Level</span>
                    <span className={`text-sm font-medium ${getConfidenceColor(insights.confidence_assessment.current_level)}`}>
                      {insights.confidence_assessment.current_level}
                    </span>
                  </div>
                  <Progress 
                    value={getConfidenceProgress(insights.confidence_assessment.current_level)} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Next Milestone</p>
                  <p className="text-sm text-muted-foreground">{insights.confidence_assessment.next_milestone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Retention Prediction</p>
                  <p className="text-sm text-muted-foreground">{insights.confidence_assessment.retention_prediction}</p>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Notes */}
            <Card className="border-l-4 border-l-pink-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Personalized Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Strengths</p>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    {insights.personalized_notes.strengths.map((strength, idx) => (
                      <li key={idx}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Learning Tips</p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    {insights.personalized_notes.learning_style_tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">Motivation</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {insights.personalized_notes.motivation_boost}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <Button onClick={fetchReviewInsights} variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Refresh Insights
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewInsights;
