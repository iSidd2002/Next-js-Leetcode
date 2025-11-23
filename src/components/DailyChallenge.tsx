"use client"

import { useEffect, useState } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, RefreshCw, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Platform = 'leetcode' | 'codeforces' | 'geeksforgeeks' | 'codingninjas' | 'atcoder';

interface DailyProblem {
  id: string;
  platform: Platform;
  title: string;
  difficulty: string;
  url: string;
  topics: string[];
  acRate?: number;
  date: string;
  platformMetadata?: {
    contestId?: number;
    problemIndex?: string;
    rating?: number;
    originalDifficulty?: string;
  };
}

interface DailyChallengeProps {
  onAddToPotd?: (problem: DailyProblem) => void;
}

const DailyChallenge = ({ onAddToPotd }: DailyChallengeProps) => {
  const [problem, setProblem] = useState<DailyProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDailyChallenge = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = forceRefresh ? '/api/daily-challenge?refresh=true' : '/api/daily-challenge';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch daily challenge: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.problem) {
        setProblem(result.problem);
        if (!forceRefresh && result.isCached) {
          console.log('Daily Challenge: Using cached problem');
        }
        if (forceRefresh) {
          toast.success('Daily challenge refreshed!');
        }
      } else {
        throw new Error(result.error || "No daily challenge found");
      }
    } catch (err) {
      console.error('Failed to fetch Daily Challenge:', err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error('Failed to fetch daily challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDailyChallenge(true);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const handleAddToPotd = async () => {
    if (!problem || !onAddToPotd) return;
    
    try {
      setIsAdding(true);
      await onAddToPotd(problem);
      toast.success('Daily challenge added to POTD archive!');
    } catch (error) {
      console.error('Failed to add daily challenge to POTD:', error);
      toast.error('Failed to add to POTD archive');
    } finally {
      setIsAdding(false);
    }
  };

  const getPlatformInfo = (platform: Platform) => {
    switch (platform) {
      case 'leetcode':
        return {
          name: 'LeetCode',
          color: 'bg-orange-600 text-white border-orange-600',
          bg: 'bg-orange-500/5 dark:bg-orange-500/10',
          borderColor: 'border-orange-200 dark:border-orange-800'
        };
      case 'codeforces':
        return {
          name: 'CodeForces',
          color: 'bg-blue-600 text-white border-blue-600',
          bg: 'bg-blue-500/5 dark:bg-blue-500/10',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'geeksforgeeks':
        return {
          name: 'GeeksforGeeks',
          color: 'bg-emerald-600 text-white border-emerald-600',
          bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
          borderColor: 'border-emerald-200 dark:border-emerald-800'
        };
      case 'codingninjas':
        return {
          name: 'Coding Ninjas',
          color: 'bg-rose-600 text-white border-rose-600',
          bg: 'bg-rose-500/5 dark:bg-rose-500/10',
          borderColor: 'border-rose-200 dark:border-rose-800'
        };
      case 'atcoder':
        return {
          name: 'AtCoder',
          color: 'bg-teal-600 text-white border-teal-600',
          bg: 'bg-teal-500/5 dark:bg-teal-500/10',
          borderColor: 'border-teal-200 dark:border-teal-800'
        };
      default:
        return {
          name: platform,
          color: 'bg-gray-500 text-white border-gray-500',
          bg: 'bg-gray-500/5 dark:bg-gray-500/10',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hard':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  if (loading) {
    return (
      <SpotlightCard className="border-white/10 bg-card/30 backdrop-blur-md h-full">
        <CardHeader className="pb-4 pt-5 px-5">
          <CardTitle className="text-sm flex items-center gap-2.5 text-muted-foreground">
            <Zap className="h-4 w-4" />
            Daily Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
        </CardContent>
      </SpotlightCard>
    );
  }

  if (error && !problem) {
    return (
      <SpotlightCard className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md h-full">
        <CardHeader className="pb-4 pt-5 px-5">
          <CardTitle className="text-sm flex items-center gap-2.5 text-amber-400">
            <Zap className="h-4 w-4" />
            Daily Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <div className="text-center">
            <p className="text-sm text-amber-300/80 mb-3">
              Unable to load challenge
            </p>
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="h-8 text-xs border-amber-500/20 hover:bg-amber-500/10 text-amber-400" disabled={isRefreshing}>
              <RefreshCw className={cn("h-3 w-3 mr-1.5", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </CardContent>
      </SpotlightCard>
    );
  }

  if (!problem) {
    return null;
  }

  const platformInfo = getPlatformInfo(problem.platform);

  return (
    <SpotlightCard className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden relative group h-full">
      {/* Decorative gradient background matching platform */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 opacity-50" />
      
      <CardHeader className="pb-4 pt-5 px-5 relative z-10">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">Challenge</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 p-0 hover:bg-white/10"
              title="Refresh daily challenge"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            </Button>
            <Badge className={cn("text-[10px] h-6 px-2.5 font-medium", platformInfo.color)}>
                {platformInfo.name}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 px-5 pb-5 space-y-4">
        <div className="space-y-3.5">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
            title={problem.title}
          >
            {problem.title}
          </a>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("text-[10px] px-2.5 h-6 font-medium border", getDifficultyColor(problem.difficulty))}>
              {problem.difficulty}
            </Badge>
            
             {problem.topics && problem.topics.slice(0, 2).map(topic => (
                <Badge 
                  key={topic} 
                  variant="secondary" 
                  className="text-[10px] px-2.5 h-6 bg-white/5 hover:bg-white/10 text-slate-300 border-transparent font-normal transition-colors"
                >
                  {topic}
                </Badge>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {onAddToPotd && (
            <Button 
              size="sm" 
              onClick={handleAddToPotd}
              disabled={isAdding}
              className="h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all"
            >
              {isAdding ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1.5" />
              )}
              Add to POTD
            </Button>
          )}
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="h-9 text-xs font-medium border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
          >
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Solve Now
            </a>
          </Button>
        </div>
      </CardContent>
    </SpotlightCard>
  );
};

export default DailyChallenge;
