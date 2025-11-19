"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
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
  Brain,
  Sparkles,
  Code2,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

const Guide = () => {
  return (
    <div className="space-y-8 pb-8">
      {/* Artistic Header - Asymmetrical */}
      <div className="relative">
        {/* Decorative Elements */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl rotate-12" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-xl rotate-[-15deg]" />
        
        <div className="relative space-y-3">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-[-8deg] hover:rotate-0 transition-transform duration-500">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              {/* Small accent dots */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary rounded-full" />
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent block">
                  Your Journey
                </span>
                <span className="text-foreground italic block" style={{ transform: 'rotate(-1deg)', marginTop: '4px' }}>
                  Starts Here
                </span>
              </h1>
              <p className="text-muted-foreground text-lg italic max-w-2xl">
                A hand-crafted guide to mastering competitive programming
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started - Artistic Card */}
      <SpotlightCard className="border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-xl" />
        
        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-primary/10 text-primary ring-2 ring-primary/20 rotate-[-3deg] group-hover:rotate-0 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold">Getting Started</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-6">
          <p className="text-muted-foreground leading-relaxed text-base">
            Welcome to your comprehensive coding tracker! This application helps you manage problems from 
            LeetCode, Codeforces, and AtCoder with intelligent features like spaced repetition, analytics, 
            and AI-powered recommendations.
          </p>
          
          {/* Feature Cards - Asymmetrical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-background/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/30 transition-all rotate-[-1deg] group-hover:rotate-0">
                <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mb-3">
                  <Target className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold mb-1">Track Progress</h4>
                <p className="text-sm text-muted-foreground">Monitor your solving journey across platforms</p>
              </div>
            </div>
            
            <div className="relative group mt-4 md:mt-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-background/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/30 transition-all rotate-[1deg] group-hover:rotate-0">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">Spaced Repetition</h4>
                <p className="text-sm text-muted-foreground">Review problems at optimal intervals</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-background/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-accent/30 transition-all rotate-[-0.5deg] group-hover:rotate-0">
                <div className="p-2 rounded-lg bg-accent/10 w-fit mb-3">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-1">Analytics</h4>
                <p className="text-sm text-muted-foreground">Visualize your performance and patterns</p>
              </div>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* Adding Problems - Critical Section with Artistic Warning */}
      <SpotlightCard className="border-secondary/30 bg-gradient-to-br from-secondary/5 via-background/50 to-primary/5 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-accent" />
        
        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary ring-2 ring-secondary/20 rotate-[2deg] group-hover:rotate-0 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-bold">Adding Problems</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-5">
          {/* Warning Card - Hand-drawn style */}
          <div className="relative p-5 bg-secondary/10 border-2 border-secondary/30 rounded-2xl rotate-[-0.5deg]">
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-secondary/20 rounded-full blur-sm" />
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-secondary text-base block mb-1">IMPORTANT:</strong>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  When adding problems, you MUST provide the problem URL/link so it can be properly saved to the database.
                  Without the URL, the problem cannot be stored or retrieved later.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              How to Add Problems:
            </h4>
            <ol className="space-y-3 text-sm text-muted-foreground ml-6">
              {[
                'Click the + Add Problem button',
                'Fill in the problem title and select the platform',
                'Provide the complete problem URL (e.g., https://leetcode.com/problems/two-sum/)',
                'Set difficulty, topics, and your solution status',
                'Add any notes or solution approaches',
                'Save to add it to your tracking database'
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Platform Cards - Asymmetrical */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { name: 'LeetCode', color: 'primary', format: 'leetcode.com/problems/problem-name/', icon: Code2 },
              { name: 'Codeforces', color: 'emerald', format: 'codeforces.com/problem/123/A', icon: Target },
              { name: 'AtCoder', color: 'cyan', format: 'atcoder.jp/contests/abc123/tasks/abc123_a', icon: Palette }
            ].map((platform, idx) => {
              const rotation = idx === 0 ? '-1deg' : idx === 1 ? '1deg' : '-0.5deg';
              return (
                <div key={platform.name} className="relative group" style={{ transform: `rotate(${rotation})` }}>
                  <div className="p-4 bg-background/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/30 transition-all group-hover:rotate-0">
                    <h5 className="font-semibold text-foreground mb-1">{platform.name}</h5>
                    <p className="text-xs text-muted-foreground font-mono">{platform.format}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </SpotlightCard>

      {/* POTD & Daily Challenges - Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* POTD Card */}
        <SpotlightCard className="border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
          <CardHeader className="relative z-10 pb-4 pt-6 px-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary ring-2 ring-primary/20 rotate-[-2deg]">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="font-bold">Problem of the Day</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 px-6 pb-6 space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              The POTD feature helps you maintain consistent practice with curated daily problems.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              {[
                'Automatically suggests problems based on your skill level',
                'Tracks your daily solving streak',
                'Integrates with spaced repetition',
                'Add problems from external sources'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </SpotlightCard>

        {/* Daily Challenges Card */}
        <SpotlightCard className="border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-xl" />
          <CardHeader className="relative z-10 pb-4 pt-6 px-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary ring-2 ring-secondary/20 rotate-[2deg]">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold">Daily Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 px-6 pb-6 space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Fetch fresh challenges from various platforms to keep your practice diverse.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {['LeetCode', 'Codeforces', 'AtCoder', 'Coding Ninjas'].map((source, idx) => (
                <div key={source} className="flex items-center gap-2 p-2 bg-background/30 rounded-lg border border-white/5 text-xs">
                  <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-muted-foreground">{source}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </SpotlightCard>
      </div>

      {/* Spaced Repetition - Artistic Science Card */}
      <SpotlightCard className="border-accent/20 bg-gradient-to-br from-accent/5 via-background/50 to-primary/5 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
        
        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-accent/10 text-accent ring-2 ring-accent/20 rotate-[-3deg] group-hover:rotate-0 transition-transform">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-bold">Spaced Repetition System</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-5">
          <p className="text-muted-foreground leading-relaxed">
            Our intelligent review system leverages cognitive science to help you retain problem-solving patterns long-term.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {/* Science Card */}
            <div className="relative p-5 bg-accent/10 border border-accent/20 rounded-2xl rotate-[-0.5deg] group-hover:rotate-0 transition-transform">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent/30 rounded-full" />
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-accent" />
                The Science
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  'Based on the "forgetting curve"',
                  'Reviews before you forget (optimal retention)',
                  'Intervals: 1 → 3 → 7 → 14 → 30 → 90 days',
                  'Successful reviews advance intervals'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Card */}
            <div className="relative p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rotate-[0.5deg] group-hover:rotate-0 transition-transform">
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500/30 rounded-full" />
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-emerald-400" />
                How to Use
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  'Mark problems for review when solved',
                  'Try solving from scratch during reviews',
                  'Check Review tab daily for consistency',
                  'Focus on understanding, not memorizing'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* AI Features - Creative Layout */}
      <SpotlightCard className="border-primary/20 bg-gradient-to-br from-primary/5 via-background/50 to-accent/5 backdrop-blur-xl overflow-hidden relative group">
        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-primary/10 text-primary ring-2 ring-primary/20 rotate-[2deg] group-hover:rotate-0 transition-transform">
              <Lightbulb className="h-5 w-5" />
            </div>
            <span className="font-bold">AI-Powered Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Leverage artificial intelligence to enhance your coding practice with personalized insights.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary">
                <Brain className="h-4 w-4" />
                Similar Problems
              </h4>
              <p className="text-xs text-muted-foreground mb-2">Find problems with similar patterns</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• AI analyzes descriptions</li>
                <li>• Suggests from multiple platforms</li>
                <li>• Groups by patterns</li>
              </ul>
            </div>
            
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-2 text-accent">
                <Lightbulb className="h-4 w-4" />
                AI Insights
              </h4>
              <p className="text-xs text-muted-foreground mb-2">Get personalized recommendations</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Analyzes solution patterns</li>
                <li>• Identifies knowledge gaps</li>
                <li>• Suggests practice areas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* Quick Tips - Hand-written Style */}
      <div className="relative p-6 bg-gradient-to-br from-secondary/10 via-background/50 to-primary/10 border-2 border-secondary/20 rounded-3xl rotate-[-0.5deg]">
        <div className="absolute top-2 right-2 w-8 h-8 bg-secondary/10 rounded-full blur-sm" />
        <div className="absolute bottom-2 left-2 w-6 h-6 bg-primary/10 rounded-full blur-sm" />
        
        <div className="relative">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-secondary" />
            Quick Tips for Success
          </h3>
          <ul className="space-y-3">
            {[
              'Always provide problem URLs when adding problems',
              'Use POTD feature daily for consistent practice',
              'Review problems when they appear in your queue',
              'Explore external resources for new problem types',
              'Check analytics regularly for improvement areas'
            ].map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                <div className="mt-1 w-6 h-6 rounded-full bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 text-secondary" />
                </div>
                <span className="pt-0.5">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Guide;
