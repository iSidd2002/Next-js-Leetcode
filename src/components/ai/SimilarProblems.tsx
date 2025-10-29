"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, ExternalLink, Clock, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Problem } from '@/types';

interface SimilarProblem {
  title: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  similarity_score: number;
  reasoning: string;
  estimated_time: string;
  key_concepts: string[];
  url?: string;
}

interface SimilarProblemsResponse {
  recommendations: SimilarProblem[];
  analysis: {
    primary_patterns: string[];
    skill_focus: string[];
    progression_path: string;
  };
}

interface SimilarProblemsProps {
  problem: Problem;
  className?: string;
}

const SimilarProblems = ({ problem, className = '' }: SimilarProblemsProps) => {
  const [recommendations, setRecommendations] = useState<SimilarProblemsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarProblems = async () => {
    if (!problem) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/similar', {
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
          targetDistribution: {
            easy: 2,
            medium: 3,
            hard: 1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data);
        toast.success('AI recommendations loaded!');
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'leetcode': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'codeforces': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'atcoder': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI-Powered Similar Problems
        </CardTitle>
        {!recommendations && !loading && (
          <Button 
            onClick={fetchSimilarProblems}
            className="w-fit"
            variant="outline"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Get AI Recommendations
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 animate-pulse" />
              AI is analyzing patterns and generating recommendations...
            </div>
            {[1, 2, 3].map((i) => (
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
            <Button onClick={fetchSimilarProblems} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {recommendations && (
          <div className="space-y-6">
            {/* Analysis Section */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                AI Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Primary Patterns</p>
                  <div className="flex flex-wrap gap-1">
                    {recommendations.analysis.primary_patterns.map((pattern, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Skill Focus</p>
                  <div className="flex flex-wrap gap-1">
                    {recommendations.analysis.skill_focus.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Progression Path</p>
                  <p className="text-xs">{recommendations.analysis.progression_path}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recommended Problems ({recommendations.recommendations.length})
              </h4>
              
              {recommendations.recommendations.map((rec, idx) => (
                <Card key={idx} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">{rec.title}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{rec.reasoning}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`text-sm font-medium ${getSimilarityColor(rec.similarity_score)}`}>
                          {Math.round(rec.similarity_score * 100)}% match
                        </span>
                        {rec.url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={rec.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={getPlatformColor(rec.platform)}>
                        {rec.platform}
                      </Badge>
                      <Badge className={getDifficultyColor(rec.difficulty)}>
                        {rec.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {rec.estimated_time}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Topics</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.topics.map((topic, topicIdx) => (
                            <Badge key={topicIdx} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Key Concepts</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.key_concepts.map((concept, conceptIdx) => (
                            <Badge key={conceptIdx} variant="secondary" className="text-xs">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={fetchSimilarProblems} variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Refresh Recommendations
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimilarProblems;
