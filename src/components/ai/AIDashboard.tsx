"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Zap, 
  Target,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AIStats {
  totalRequests: number;
  similarProblemsRequests: number;
  reviewInsightsRequests: number;
  cacheHits: number;
  cacheMisses: number;
  totalCost: number;
  totalTokensUsed: number;
  avgResponseTime: number;
  cacheHitRate: number;
  costSavings: number;
}

interface RecentActivity {
  id: string;
  type: 'similar-problems' | 'review-insights';
  problemTitle: string;
  platform: string;
  timestamp: string;
  cost: number;
  tokensUsed: number;
}

interface AIDashboardProps {
  className?: string;
}

const AIDashboard = ({ className = '' }: AIDashboardProps) => {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would be a real API endpoint in production
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: AIStats = {
        totalRequests: 47,
        similarProblemsRequests: 28,
        reviewInsightsRequests: 19,
        cacheHits: 23,
        cacheMisses: 24,
        totalCost: 0.0234,
        totalTokensUsed: 15420,
        avgResponseTime: 3200,
        cacheHitRate: 48.9,
        costSavings: 0.0156
      };
      
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'similar-problems',
          problemTitle: 'Two Sum',
          platform: 'leetcode',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          cost: 0.0012,
          tokensUsed: 1450
        },
        {
          id: '2',
          type: 'review-insights',
          problemTitle: 'Binary Search',
          platform: 'leetcode',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          cost: 0.0018,
          tokensUsed: 1820
        },
        {
          id: '3',
          type: 'similar-problems',
          problemTitle: 'Valid Parentheses',
          platform: 'leetcode',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          cost: 0.0009,
          tokensUsed: 1200
        }
      ];
      
      setStats(mockStats);
      setRecentActivity(mockActivity);
      toast.success('AI statistics loaded!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load AI statistics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIStats();
  }, []);

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'similar-problems': return <Target className="h-4 w-4" />;
      case 'review-insights': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'similar-problems': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300';
      case 'review-insights': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-rose-600" />
          AI Assistant Dashboard
        </h2>
        <Button onClick={fetchAIStats} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && !stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchAIStats} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{stats.totalRequests}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-rose-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                    <p className="text-2xl font-bold">{stats.cacheHitRate.toFixed(1)}%</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <Progress value={stats.cacheHitRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">{formatCost(stats.totalCost)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Saved {formatCost(stats.costSavings)} via caching
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">{formatTime(stats.avgResponseTime)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Similar Problems</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stats.similarProblemsRequests}</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-rose-600 h-2 rounded-full" 
                          style={{ width: `${(stats.similarProblemsRequests / stats.totalRequests) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Review Insights</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stats.reviewInsightsRequests}</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(stats.reviewInsightsRequests / stats.totalRequests) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cache Hits</p>
                      <p className="font-medium text-green-600">{stats.cacheHits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cache Misses</p>
                      <p className="font-medium text-red-600">{stats.cacheMisses}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Tokens</p>
                      <p className="font-medium">{stats.totalTokensUsed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost Savings</p>
                      <p className="font-medium text-green-600">{formatCost(stats.costSavings)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(activity.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.problemTitle}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {activity.platform}
                            </Badge>
                            <Badge className={`text-xs ${getTypeColor(activity.type)}`}>
                              {activity.type.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                        <p className="text-xs">{formatCost(activity.cost)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AIDashboard;
