"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Calendar,
  Target,
  ExternalLink,
  AlertTriangle,
  BarChart3,
  Clock,
  CheckCircle,
  Info,
  Lightbulb,
  Zap,
  Brain
} from "lucide-react";

const Guide = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          How to Use Your Coding Tracker
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete guide to maximize your competitive programming journey
        </p>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to your comprehensive coding tracker! This application helps you manage problems from 
            LeetCode, Codeforces, and AtCoder with intelligent features like spaced repetition, analytics, 
            and AI-powered recommendations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Target className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium">Track Progress</h4>
              <p className="text-sm text-muted-foreground">Monitor your solving journey across platforms</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium">Spaced Repetition</h4>
              <p className="text-sm text-muted-foreground">Review problems at optimal intervals</p>
            </div>
            <div className="p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 text-rose-600 mb-2" />
              <h4 className="font-medium">Analytics</h4>
              <p className="text-sm text-muted-foreground">Visualize your performance and patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adding Problems - CRITICAL SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Adding Problems
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-orange-800 dark:text-orange-200">
                  <strong>IMPORTANT:</strong> When adding problems, you MUST provide the problem URL/link so it can be properly saved to the database.
                  Without the URL, the problem cannot be stored or retrieved later.
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              How to Add Problems:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>Click the <Badge variant="outline">+ Add Problem</Badge> button</li>
              <li>Fill in the problem title and select the platform (LeetCode, Codeforces, AtCoder)</li>
              <li><strong>Provide the complete problem URL</strong> (e.g., https://leetcode.com/problems/two-sum/)</li>
              <li>Set difficulty, topics, and your solution status</li>
              <li>Add any notes or solution approaches</li>
              <li>Save to add it to your tracking database</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h5 className="font-medium text-blue-900 dark:text-blue-100">LeetCode</h5>
              <p className="text-xs text-blue-700 dark:text-blue-300">URL format: leetcode.com/problems/problem-name/</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h5 className="font-medium text-green-900 dark:text-green-100">Codeforces</h5>
              <p className="text-xs text-green-700 dark:text-green-300">URL format: codeforces.com/problem/123/A</p>
            </div>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
              <h5 className="font-medium text-cyan-900 dark:text-cyan-100">AtCoder</h5>
              <p className="text-xs text-cyan-700 dark:text-cyan-300">URL format: atcoder.jp/contests/abc123/tasks/abc123_a</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem of the Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Problem of the Day (POTD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The POTD feature helps you maintain consistent practice with curated daily problems.
          </p>
          <div className="space-y-3">
            <h4 className="font-medium">How it works:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Automatically suggests problems based on your skill level and preferences</li>
              <li>Tracks your daily solving streak</li>
              <li>Integrates with spaced repetition for optimal review timing</li>
              <li>Add problems from external sources to your POTD archive</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Fetch fresh challenges from various platforms to keep your practice diverse and engaging.
          </p>
          <div className="space-y-3">
            <h4 className="font-medium">Available Sources:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">LeetCode Daily Challenge</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Codeforces Recent Problems</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">AtCoder Contest Problems</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Coding Ninjas Practice</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-cyan-600" />
            External Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Discover new problems and learning materials from curated external platforms.
          </p>
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-800 dark:text-blue-200">
                  <strong>Pro Tip:</strong> Use external resources to discover problems, then add them to your tracker
                  using the "Add Problem" feature with the problem URL for proper tracking and spaced repetition.
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Spaced Repetition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose-600" />
            Spaced Repetition System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Our intelligent review system leverages cognitive science to help you retain problem-solving patterns long-term through optimally timed reviews.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-rose-600" />
                How it works (The Science)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-4">
                <li>Based on the "forgetting curve" - we forget information exponentially over time</li>
                <li>Reviews problems just before you're likely to forget them (optimal retention)</li>
                <li>Default intervals: 1 → 3 → 7 → 14 → 30 → 90 → 180 → 365 days (customizable)</li>
                <li>Successful reviews advance to next interval; failed reviews reset to 1 day</li>
                <li>Problems enter review queue when marked as "solved" or "needs review"</li>
                <li>After exhausting predefined intervals, uses exponential growth (×2.5)</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                How to Use Effectively
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-4">
                <li>Mark problems for review when you solved them but want to reinforce the pattern</li>
                <li>During reviews: try solving from scratch first, then check your original solution</li>
                <li>Check the Review tab daily - consistency is key for retention</li>
                <li>If you fail a review, don't worry - the interval resets and you'll see it again soon</li>
                <li>Focus on understanding the approach, not memorizing the exact code</li>
                <li>Customize review intervals in Settings if the defaults don't suit your learning style</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI-Powered Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Leverage artificial intelligence to enhance your coding practice with personalized insights and recommendations.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Similar Problems Discovery
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Find problems with similar patterns, algorithms, or concepts to reinforce your learning.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-4">
                <li>AI analyzes problem descriptions and tags</li>
                <li>Suggests problems from multiple platforms</li>
                <li>Groups by algorithmic patterns and difficulty</li>
                <li>Helps build comprehensive understanding of concepts</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                AI Review Insights
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Get personalized insights about your problem-solving approach and areas for improvement.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-4">
                <li>Analyzes your solution patterns and performance</li>
                <li>Identifies knowledge gaps and weak areas</li>
                <li>Suggests targeted practice recommendations</li>
                <li>Provides study tips for specific algorithms</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-amber-600" />
                How to Use AI Features
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-4">
                <li>Click the "Similar Problems" button on any problem to discover related challenges</li>
                <li>Use "AI Insights" to get personalized review recommendations</li>
                <li>AI features work best with a history of solved problems</li>
                <li>Features are powered by Google Gemini AI for accurate analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Analytics & Progress Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Monitor your progress with detailed analytics and insights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Track Your Progress:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Solving streaks and consistency</li>
                <li>Difficulty distribution</li>
                <li>Topic-wise performance</li>
                <li>Platform-specific statistics</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Insights Available:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Weekly and monthly trends</li>
                <li>Problem completion rates</li>
                <li>Review success patterns</li>
                <li>Time investment analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Lightbulb className="h-5 w-5" />
            Quick Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Always provide problem URLs</strong> when adding problems for proper database storage</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Use the POTD feature daily to maintain consistent practice</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Review problems when they appear in your spaced repetition queue</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Explore external resources to discover new problem types and patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Check analytics regularly to identify areas for improvement</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guide;
