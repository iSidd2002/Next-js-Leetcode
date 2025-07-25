"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, RefreshCw, Zap, Calendar } from "lucide-react";
import { toast } from "sonner";

interface DailyProblem {
  id: string;
  platform: 'leetcode';
  title: string;
  difficulty: string;
  url: string;
  topics: string[];
  acRate: number;
  date: string;
}

interface DailyChallengeProps {
  onAddToPotd?: (problem: DailyProblem) => void;
}

const DailyChallenge = ({ onAddToPotd }: DailyChallengeProps) => {
  const [problem, setProblem] = useState<DailyProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchDailyChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/daily-challenge', {
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
        if (result.isCached) {
          console.log('Daily Challenge: Using cached problem');
        }
      } else {
        throw new Error(result.error || "No daily challenge found");
      }
    } catch (err) {
      console.error('Failed to fetch Daily Challenge:', err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'hard':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'hard':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-purple-600" />
            Daily Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading today's challenge...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !problem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-purple-600" />
            Daily Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Unable to load today's challenge. Please try again later.
            </p>
            <p className="text-sm text-red-600 mb-4">
              Error: {error}
            </p>
            <Button onClick={fetchDailyChallenge} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-purple-600" />
            Daily Challenge
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Problem Title and Link */}
          <div>
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold hover:underline flex items-center group"
            >
              {problem.title}
              <ExternalLink className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {problem.platform === 'leetcode' ? 'LeetCode' : problem.platform}
            </Badge>
            <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-xs">
              {problem.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {problem.acRate.toFixed(1)}% Acceptance
            </Badge>
          </div>

          {/* Topics */}
          {problem.topics && problem.topics.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Topics:</p>
              <div className="flex flex-wrap gap-1">
                {problem.topics.slice(0, 5).map(topic => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {problem.topics.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{problem.topics.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button asChild className="flex-1">
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Solve Challenge
              </a>
            </Button>
            
            {onAddToPotd && (
              <Button 
                variant="outline" 
                onClick={handleAddToPotd}
                disabled={isAdding}
                className="flex-1"
              >
                {isAdding ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add to POTD
              </Button>
            )}
          </div>

          {/* Refresh Button */}
          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchDailyChallenge}
              disabled={loading}
              className="w-full text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh Challenge
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChallenge;
