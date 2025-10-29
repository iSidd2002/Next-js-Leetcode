"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowLeft, Sparkles } from 'lucide-react';
import { SimilarProblems, ReviewInsights, AIDashboard } from '@/components/ai';
import type { Problem } from '@/types';

// Mock problem data for demonstration
const mockProblem: Problem = {
  id: 'demo-two-sum',
  userId: 'demo-user',
  platform: 'leetcode',
  title: 'Two Sum',
  problemId: '1',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/two-sum/',
  dateSolved: '2024-10-29',
  createdAt: '2024-10-29T10:00:00Z',
  notes: 'Classic hash table problem',
  isReview: false,
  repetition: 0,
  interval: 0,
  nextReviewDate: null,
  topics: ['Array', 'Hash Table'],
  status: 'active',
  companies: ['Google', 'Amazon', 'Microsoft'],
  source: 'manual'
};

const mockUserHistory = {
  previousAttempts: 3,
  lastSolved: '2024-10-22T10:00:00Z',
  timeSpent: 25,
  mistakes: ['forgot to handle edge cases', 'used O(n²) solution initially'],
  successRate: 0.67
};

const mockReviewContext = {
  daysSinceLastReview: 7,
  currentStreak: 5,
  upcomingInterviews: true,
  targetDifficulty: 'Medium'
};

const AIDemoPage = () => {
  const [activeTab, setActiveTab] = useState('similar');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-600" />
                  AI Assistant Demo
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Powered by Gemini
                  </Badge>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Experience AI-powered problem recommendations and personalized learning insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Problem Context */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Demo Problem Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Problem Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Title:</span> {mockProblem.title}</p>
                  <p><span className="font-medium">Platform:</span> {mockProblem.platform}</p>
                  <p><span className="font-medium">Difficulty:</span> {mockProblem.difficulty}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mockProblem.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">User History</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Attempts:</span> {mockUserHistory.previousAttempts}</p>
                  <p><span className="font-medium">Success Rate:</span> {Math.round(mockUserHistory.successRate * 100)}%</p>
                  <p><span className="font-medium">Time Spent:</span> {mockUserHistory.timeSpent} min</p>
                  <p><span className="font-medium">Common Mistakes:</span></p>
                  <ul className="text-xs text-muted-foreground ml-2">
                    {mockUserHistory.mistakes.map((mistake, idx) => (
                      <li key={idx}>• {mistake}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Review Context</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Days Since Review:</span> {mockReviewContext.daysSinceLastReview}</p>
                  <p><span className="font-medium">Current Streak:</span> {mockReviewContext.currentStreak}</p>
                  <p><span className="font-medium">Upcoming Interviews:</span> {mockReviewContext.upcomingInterviews ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Target Difficulty:</span> {mockReviewContext.targetDifficulty}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Components Demo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="similar">Similar Problems</TabsTrigger>
            <TabsTrigger value="insights">Review Insights</TabsTrigger>
            <TabsTrigger value="dashboard">AI Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="similar" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">AI-Powered Similar Problems</h2>
              <p className="text-muted-foreground">
                Get intelligent problem recommendations based on patterns, difficulty progression, and learning objectives
              </p>
            </div>
            <SimilarProblems problem={mockProblem} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Personalized Review Insights</h2>
              <p className="text-muted-foreground">
                Receive AI-generated study strategies, key concepts, and personalized learning recommendations
              </p>
            </div>
            <ReviewInsights 
              problem={mockProblem} 
              userHistory={mockUserHistory}
              reviewContext={mockReviewContext}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">AI Usage Analytics</h2>
              <p className="text-muted-foreground">
                Monitor your AI assistant usage, costs, performance metrics, and learning patterns
              </p>
            </div>
            <AIDashboard />
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 AI Features Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">🎯 Smart Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  AI analyzes problem patterns, difficulty progression, and your learning style to suggest the most relevant practice problems.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">🧠 Personalized Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Get customized review strategies, identify knowledge gaps, and receive motivation tailored to your progress.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">⚡ Cost-Optimized</h4>
                <p className="text-sm text-muted-foreground">
                  Intelligent caching and rate limiting minimize API costs while maintaining high-quality recommendations.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-600">🌐 Multi-Platform</h4>
                <p className="text-sm text-muted-foreground">
                  Works seamlessly across LeetCode, Codeforces, and AtCoder with unified difficulty normalization.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">📊 Analytics & Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor usage patterns, track costs, and analyze the effectiveness of AI recommendations.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">🔄 Spaced Repetition</h4>
                <p className="text-sm text-muted-foreground">
                  AI-enhanced spaced repetition system optimizes review timing based on your performance and retention patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIDemoPage;
