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
  Palette,
  Download,
  Trophy,
  Building2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Guide = () => {
  return (
    <div className="space-y-8 pb-8">
      {/* Artistic Header */}
      <div className="relative">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl rotate-12" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-xl rotate-[-15deg]" />

        <div className="relative space-y-3">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-[-8deg] hover:rotate-0 transition-transform duration-500">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full" />
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
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

      {/* Getting Started */}
      <SpotlightCard className="border-primary/20 bg-slate-900/70 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-xl" />

        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-primary/10 text-primary ring-2 ring-primary/20 rotate-[-3deg] group-hover:rotate-0 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-white">Getting Started</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-base">
            Welcome to your comprehensive coding tracker! This application helps you manage problems from
            LeetCode, Codeforces, and AtCoder with intelligent features like spaced repetition, analytics,
            and AI-powered recommendations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-primary/30 transition-all rotate-[-1deg] group-hover:rotate-0">
                <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mb-3">
                  <Target className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold mb-1 text-white">Track Progress</h4>
                <p className="text-sm text-slate-400">Monitor your solving journey across platforms</p>
              </div>
            </div>

            <div className="relative group mt-4 md:mt-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-primary/30 transition-all rotate-[1deg] group-hover:rotate-0">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1 text-white">Spaced Repetition</h4>
                <p className="text-sm text-slate-400">Review problems at optimal intervals</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-accent/30 transition-all rotate-[-0.5deg] group-hover:rotate-0">
                <div className="p-2 rounded-lg bg-accent/10 w-fit mb-3">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-1 text-white">Analytics</h4>
                <p className="text-sm text-slate-400">Visualize your performance and patterns</p>
              </div>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* Adding Problems */}
      <SpotlightCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background/50 to-primary/5 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-primary to-accent" />

        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/20 rotate-[2deg] group-hover:rotate-0 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-bold">Adding Problems</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-5">
          {/* Warning Card */}
          <div className="relative p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl rotate-[-0.5deg]">
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500/20 rounded-full blur-sm" />
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400 text-base block mb-1">IMPORTANT:</strong>
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
                'Click the + New Problem button in the header',
                'Fill in the problem title and select the platform',
                'Provide the complete problem URL (e.g., https://leetcode.com/problems/two-sum/)',
                'Set difficulty, topics, and your solution status',
                'Add notes, pattern, or code snippet in the tabs',
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

          {/* Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { name: 'LeetCode', color: 'primary', format: 'leetcode.com/problems/problem-name/', icon: Code2 },
              { name: 'Codeforces', color: 'emerald', format: 'codeforces.com/problem/123/A', icon: Target },
              { name: 'AtCoder', color: 'cyan', format: 'atcoder.jp/contests/abc123/tasks/abc123_a', icon: Palette }
            ].map((platform, idx) => {
              const rotation = idx === 0 ? '-1deg' : idx === 1 ? '1deg' : '-0.5deg';
              return (
                <div key={platform.name} className="relative group" style={{ transform: `rotate(${rotation})` }}>
                  <div className="p-4 bg-background/50 border border-border/50 rounded-xl hover:border-primary/30 transition-all group-hover:rotate-0">
                    <h5 className="font-semibold text-foreground mb-1">{platform.name}</h5>
                    <p className="text-xs text-muted-foreground font-mono">{platform.format}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </SpotlightCard>

      {/* POTD & Daily Challenges */}
      <div className="grid md:grid-cols-2 gap-6">
        <SpotlightCard className="border-primary/20 bg-slate-900/70 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
          <CardHeader className="relative z-10 pb-4 pt-6 px-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary ring-2 ring-primary/20 rotate-[-2deg]">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="font-bold text-white">Problem of the Day</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 px-6 pb-6 space-y-3">
            <p className="text-slate-300 text-sm leading-relaxed">
              The POTD feature helps you maintain consistent practice with curated daily problems.
            </p>
            <ul className="space-y-2 text-sm text-slate-400 ml-4">
              {[
                'Fetches LeetCode\'s official daily problem',
                'Tracks your daily solving streak',
                'Integrates with spaced repetition',
                'Add problems to your archive with one click'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </SpotlightCard>

        <SpotlightCard className="border-accent/20 bg-slate-900/70 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
          <CardHeader className="relative z-10 pb-4 pt-6 px-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 text-accent ring-2 ring-accent/20 rotate-[2deg]">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold text-white">Daily Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 px-6 pb-6 space-y-3">
            <p className="text-slate-300 text-sm leading-relaxed">
              Fetch fresh challenges from various platforms to keep your practice diverse.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {['LeetCode', 'Codeforces', 'AtCoder', 'Coding Ninjas'].map((source) => (
                <div key={source} className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg border border-slate-700 text-xs">
                  <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">{source}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </SpotlightCard>
      </div>

      {/* Spaced Repetition */}
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

      {/* Manual Review Days */}
      <SpotlightCard className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-background/50 to-purple-500/5 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl" />

        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 ring-2 ring-indigo-500/20 rotate-[3deg] group-hover:rotate-0 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="font-bold">Manual Review Days</span>
            </CardTitle>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg">
              NEW
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-5">
          <p className="text-muted-foreground leading-relaxed">
            Take full control of your review schedule! Set exact review dates manually, perfect for interview prep, contests, or custom study plans.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="relative p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rotate-[-0.5deg] group-hover:rotate-0 transition-transform">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500/30 rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500/30 rounded-full" />
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-indigo-400" />
                Two Review Modes
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  { label: 'Quality Based', desc: 'Auto intervals (Again, Hard, Good, Easy, Perfect)' },
                  { label: 'Custom Days', desc: 'Manual control (1-365 days)' },
                ].map((item, idx) => (
                  <li key={idx} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-indigo-400">{item.label}:</span>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl rotate-[0.5deg] group-hover:rotate-0 transition-transform">
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-500/30 rounded-full" />
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-purple-400" />
                Quick Presets
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  '1 day - Quick refresh',
                  '7 days - Weekly review',
                  '14 days - Bi-weekly check',
                  '30+ days - Long-term retention'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Perfect For:
            </h4>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { emoji: '🎯', title: 'Interview Prep', desc: 'Review 3 days before' },
                { emoji: '🏆', title: 'Contest Prep', desc: 'Review 1 day before' },
                { emoji: '📅', title: 'Custom Schedule', desc: 'Weekly/monthly reviews' }
              ].map((useCase, idx) => (
                <div key={idx} className="text-center p-3 bg-background/50 rounded-lg border border-border/40">
                  <div className="text-2xl mb-2">{useCase.emoji}</div>
                  <div className="font-semibold text-xs mb-1">{useCase.title}</div>
                  <div className="text-xs text-muted-foreground">{useCase.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-400" />
              How to Use:
            </h4>
            <ol className="space-y-1.5 text-xs text-muted-foreground pl-4">
              <li>1. Go to the <strong className="text-foreground">Review</strong> tab</li>
              <li>2. Click <strong className="text-foreground">Review</strong> button on any due problem</li>
              <li>3. Switch to <strong className="text-foreground">Custom Days</strong> tab</li>
              <li>4. Choose a preset or enter custom days (1-365)</li>
              <li>5. Add notes/tags (optional) and submit!</li>
            </ol>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* AI Features */}
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
                <li>• AI analyzes problem descriptions</li>
                <li>• Suggests from multiple platforms</li>
                <li>• Groups by algorithmic patterns</li>
              </ul>
            </div>

            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-2 text-accent">
                <Lightbulb className="h-4 w-4" />
                Pattern Detection
              </h4>
              <p className="text-xs text-muted-foreground mb-2">Auto-identify the core algorithm</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Detects patterns (Sliding Window, DP, etc.)</li>
                <li>• Fills pattern field automatically</li>
                <li>• Available in problem add/edit form</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* Code Snippets */}
      <SpotlightCard className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 via-background/50 to-purple-500/5 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-purple-600/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-red-500/10 rounded-full blur-xl" />

        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500 ring-2 ring-pink-500/20 rotate-[-2deg] group-hover:rotate-0 transition-transform">
              <Palette className="h-5 w-5" />
            </div>
            <span className="font-bold">Beautiful Code Snippets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-5">
          <p className="text-muted-foreground leading-relaxed">
            Turn your solutions into stunning, portfolio-ready images with our premium code visualization engine.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="p-4 bg-background/50 border border-border/50 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-pink-500">
                <Sparkles className="h-4 w-4" />
                Premium Aesthetics
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
                  <span>8 Premium Gradients (Hyper, Gotham, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                  <span>6 Syntax Themes (Dracula, Night Owl, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
                  <span>Deep Shadows &amp; Noise Textures</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" />
                  <span>Mac-style Window Chrome</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-background/50 border border-border/50 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-purple-500">
                <Code2 className="h-4 w-4" />
                How to Use
              </h4>
              <ol className="space-y-2 text-xs text-muted-foreground ml-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-500">1.</span>
                  <span>Add/Edit a problem &amp; go to <strong>&quot;Code Solution&quot;</strong> tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-500">2.</span>
                  <span>Paste code (supports 14+ languages)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-500">3.</span>
                  <span>Hover over code in list to customize 🎨</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-500">4.</span>
                  <span>Click <strong>Download</strong> for high-res PNG export</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* Export Learned Problems — NEW */}
      <SpotlightCard className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background/50 to-teal-500/5 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

        <CardHeader className="relative z-10 pb-4 pt-6 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/20 rotate-[-2deg] group-hover:rotate-0 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <span className="font-bold">Export Learned Problems</span>
            </CardTitle>
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg">
              NEW
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-5">
          <p className="text-muted-foreground leading-relaxed">
            Download all your mastered problems as a formatted Excel spreadsheet — perfect for offline revision or sharing with peers.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                What's Exported
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {[
                  'Question Name — full problem title',
                  'Link — direct URL to the problem',
                  'Topics — all associated topic tags',
                  'Pattern — the core algorithm pattern'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-teal-400">
                <Info className="h-4 w-4" />
                How to Export
              </h4>
              <ol className="space-y-1.5 text-xs text-muted-foreground pl-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-400">1.</span>
                  <span>Go to the <strong className="text-foreground">Learned</strong> tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-400">2.</span>
                  <span>Click <strong className="text-foreground">Export Excel</strong> in the top-right</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-400">3.</span>
                  <span>File downloads as <code className="text-teal-400">.xlsx</code> with auto-sized columns</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>

      {/* Contest Tracker & Company Problems — side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        <SpotlightCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background/50 to-amber-500/5 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl" />
          <CardHeader className="relative z-10 pb-4 pt-6 px-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20 rotate-[2deg] group-hover:rotate-0 transition-transform">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-bold">Contest Tracker</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 px-6 pb-6 space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Stay on top of upcoming and past competitive programming contests across all major platforms.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              {[
                'View upcoming LeetCode, Codeforces & AtCoder contests',
                'Track past contests you\'ve participated in',
                'Log your rank and score for each contest',
                'Never miss an important contest again'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </SpotlightCard>

        <SpotlightCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background/50 to-cyan-500/5 backdrop-blur-xl overflow-hidden relative group">
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
          <CardHeader className="relative z-10 pb-4 pt-6 px-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 ring-2 ring-blue-500/20 rotate-[-2deg] group-hover:rotate-0 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold">Company Problems</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 px-6 pb-6 space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Prepare specifically for your target company interviews with organized company-tagged problems.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              {[
                'Filter problems by company tag (Google, Meta, etc.)',
                'Import company-specific problem lists in bulk',
                'Track which company problems you\'ve solved',
                'View the Companies tab for a company-first overview'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </SpotlightCard>
      </div>

      {/* Quick Tips */}
      <div className="relative p-6 bg-gradient-to-br from-primary/10 via-background/50 to-accent/10 border-2 border-primary/20 rounded-3xl rotate-[-0.5deg]">
        <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full blur-sm" />
        <div className="absolute bottom-2 left-2 w-6 h-6 bg-accent/10 rounded-full blur-sm" />

        <div className="relative">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            Quick Tips for Success
          </h3>
          <ul className="space-y-3">
            {[
              'Always provide problem URLs when adding problems',
              'Use POTD feature daily for consistent practice',
              'Mark problems for review right after solving them',
              'Export your Learned list regularly as a revision sheet',
              'Use company tags to target your interview prep',
              'Check Analytics weekly to spot your weak topics'
            ].map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 text-primary" />
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
