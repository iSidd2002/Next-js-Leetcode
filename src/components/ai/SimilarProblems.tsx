"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, ExternalLink, Clock, Target, Lightbulb, TrendingUp, Plus, Building2 } from 'lucide-react';
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
  interview_relevance?: string;
}

interface SimilarProblemsResponse {
  recommendations: SimilarProblem[];
  analysis: {
    primary_patterns: string[];
    skill_focus?: string[];
    progression_path: string;
    interview_focus?: string;
  };
}

interface SimilarProblemsProps {
  problem: Problem;
  userProblems?: Problem[];
  onAddProblem?: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
  className?: string;
}

// Build context summary from user's solved problems
function buildUserContext(problems: Problem[]) {
  const topicCounts: Record<string, number> = {};
  const difficultySplit = { easy: 0, medium: 0, hard: 0 };

  problems.forEach(p => {
    (p.topics || []).forEach(t => { topicCounts[t] = (topicCounts[t] || 0) + 1; });
    const d = p.difficulty?.toLowerCase();
    if (d === 'easy') difficultySplit.easy++;
    else if (d === 'medium') difficultySplit.medium++;
    else if (d === 'hard') difficultySplit.hard++;
  });

  const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  const solvedTopics = sorted.map(([t]) => t);
  const weakTopics = sorted.filter(([, c]) => c <= 2).map(([t]) => t).slice(0, 8);

  return { solvedCount: problems.length, solvedTopics: solvedTopics.slice(0, 10), weakTopics, difficultySplit };
}

// Generate a problem URL from platform + title
function getProblemUrl(rec: SimilarProblem): string {
  if (rec.url) return rec.url;
  if (rec.platform === 'leetcode') {
    const slug = rec.title.toLowerCase().replace(/[(),.'"!?]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    return `https://leetcode.com/problems/${slug}/`;
  }
  if (rec.platform === 'codeforces') return 'https://codeforces.com/problemset';
  if (rec.platform === 'atcoder') return 'https://atcoder.jp/contests/';
  return '';
}

const SimilarProblems = ({ problem, userProblems = [], onAddProblem, className = '' }: SimilarProblemsProps) => {
  const [recommendations, setRecommendations] = useState<SimilarProblemsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingIdx, setAddingIdx] = useState<number | null>(null);

  const fetchSimilarProblems = async () => {
    if (!problem) return;
    setLoading(true);
    setError(null);

    try {
      const userContext = userProblems.length > 0 ? buildUserContext(userProblems) : undefined;

      const response = await fetch('/api/ai/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          targetDistribution: { easy: 2, medium: 2, hard: 1 },
          userContext
        })
      });

      if (!response.ok) throw new Error(`Failed to fetch recommendations: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
        toast.success('AI recommendations loaded!');
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async (rec: SimilarProblem, idx: number) => {
    if (!onAddProblem) return;
    setAddingIdx(idx);
    try {
      const url = getProblemUrl(rec);
      const problemId = rec.platform === 'leetcode'
        ? url.split('/problems/')[1]?.replace(/\/$/, '') || rec.title
        : rec.title;

      onAddProblem({
        platform: rec.platform,
        title: rec.title,
        problemId,
        difficulty: rec.difficulty,
        url,
        dateSolved: '',
        notes: '',
        isReview: false,
        repetition: 0,
        interval: 0,
        nextReviewDate: null,
        topics: rec.topics,
        status: 'active',
        companies: [],
        source: 'manual',
      });
      toast.success(`Added "${rec.title}" to your problems!`);
    } finally {
      setAddingIdx(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'leetcode': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'codeforces': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400';
      case 'atcoder': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-rose-500" />
          AI Similar Problems
          {userProblems.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              Personalized ({userProblems.length} solved)
            </Badge>
          )}
        </CardTitle>
        {!recommendations && !loading && (
          <Button onClick={fetchSimilarProblems} className="w-fit" variant="outline">
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Interview Recommendations
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 animate-pulse text-rose-500" />
              Analyzing patterns and generating interview-focused recommendations...
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2 p-4 border rounded-lg">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-4 text-sm">{error}</p>
            <Button onClick={fetchSimilarProblems} variant="outline" size="sm">Try Again</Button>
          </div>
        )}

        {recommendations && (
          <div className="space-y-5">
            {/* Analysis Section */}
            <div className="bg-muted/40 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                AI Analysis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-1.5">Patterns</p>
                  <div className="flex flex-wrap gap-1">
                    {recommendations.analysis?.primary_patterns?.map((p, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-1.5">Interview Focus</p>
                  <p className="text-xs text-foreground/80">
                    {recommendations.analysis?.interview_focus || recommendations.analysis?.progression_path}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Recommended Problems ({recommendations.recommendations?.length || 0})
              </h4>

              {recommendations.recommendations?.length > 0 ? (
                recommendations.recommendations.map((rec, idx) => {
                  const url = getProblemUrl(rec);
                  return (
                    <div key={idx} className="border rounded-lg p-4 hover:border-primary/40 transition-colors space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
                            >
                              {rec.title}
                            </a>
                          ) : (
                            <p className="font-semibold text-sm line-clamp-1">{rec.title}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rec.reasoning}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-xs font-semibold ${getSimilarityColor(rec.similarity_score)}`}>
                            {Math.round(rec.similarity_score * 100)}%
                          </span>
                          {url && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className={`text-[10px] h-5 px-2 ${getPlatformColor(rec.platform)}`}>
                          {rec.platform}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] h-5 px-2 ${getDifficultyColor(rec.difficulty)}`}>
                          {rec.difficulty}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />{rec.estimated_time}
                        </span>
                      </div>

                      {/* Interview relevance */}
                      {rec.interview_relevance && (
                        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-blue-500/5 border border-blue-500/10 rounded px-2.5 py-1.5">
                          <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>{rec.interview_relevance}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {rec.key_concepts?.slice(0, 3).map((c, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] h-5 px-2 font-normal">{c}</Badge>
                          ))}
                        </div>
                        {onAddProblem && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] shrink-0"
                            onClick={() => handleAddProblem(rec, idx)}
                            disabled={addingIdx === idx}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recommendations available. Try refreshing.</p>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-2">
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
