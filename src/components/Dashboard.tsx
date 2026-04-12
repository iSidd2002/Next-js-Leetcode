"use client"

import type { Problem, Todo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookCopy, CalendarDays, Star, Trophy, Clock, Download, CheckSquare, AlertTriangle, Target, Activity, Zap, Flame, TrendingUp, Clock as HistoryIcon, Sparkles, Brain, ExternalLink, BookOpen } from 'lucide-react';
import { isToday, isPast, subMonths } from 'date-fns';
import ExternalResourcesCard from './ExternalResourcesCard';
import { format, isSameDay, subDays, eachDayOfInterval, differenceInDays, eachWeekOfInterval } from 'date-fns';
import ImportProblems from './ImportProblems';
import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Greeting from './Greeting';
import StatsCounter from './StatsCounter';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlowCard } from '@/components/ui/glow-card';
import { BorderBeam } from '@/components/ui/border-beam';


interface DashboardProps {
  problems: Problem[];
  learnedProblems: Problem[];
  todos?: Todo[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onImportProblems: (companyName: string, problemsToImport: any[]) => void;
}

const Dashboard = ({ problems, learnedProblems, todos = [], onUpdateProblem, onImportProblems }: DashboardProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll heatmap to show today (rightmost column) on mount
  useEffect(() => {
    if (heatmapScrollRef.current) {
      heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth;
    }
  }, []);

  const totalProblems = problems.length;

  // Pick up to 5 learned problems to practice today.
  // Priority: past-due nextReviewDate → lowest repetition → oldest dateSolved.
  const practiceToday = useMemo(() => {
    const now = new Date();
    return [...learnedProblems]
      .sort((a, b) => {
        const aDue = !!(a.nextReviewDate && new Date(a.nextReviewDate) <= now);
        const bDue = !!(b.nextReviewDate && new Date(b.nextReviewDate) <= now);
        if (aDue !== bDue) return aDue ? -1 : 1;
        const repDiff = (a.repetition ?? 0) - (b.repetition ?? 0);
        if (repDiff !== 0) return repDiff;
        return new Date(a.dateSolved).getTime() - new Date(b.dateSolved).getTime();
      })
      .slice(0, 5);
  }, [learnedProblems]);
  const thisWeek = problems.filter((p) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(p.dateSolved) >= weekAgo;
  }).length;
  const forReview = problems.filter((p) => p.isReview).length;
  const dueForReview = problems.filter(p =>
    p.isReview &&
    p.nextReviewDate &&
    (isToday(new Date(p.nextReviewDate)) || isPast(new Date(p.nextReviewDate)))
  ).length;

  // Todo statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.status === 'completed').length;
  const pendingTodos = todos.filter(t => t.status === 'pending').length;
  const inProgressTodos = todos.filter(t => t.status === 'in-progress').length;
  const overdueTodos = todos.filter(t =>
    t.dueDate &&
    new Date(t.dueDate) < new Date() &&
    t.status !== 'completed'
  ).length;
  const urgentTodos = todos.filter(t =>
    t.priority === 'urgent' &&
    t.status !== 'completed'
  ).length;

  const calculateStreaks = (problems: Problem[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique solve dates (deduplicated)
    const uniqueSolveDatesSet = new Set(
      problems.map(p => new Date(p.dateSolved).setHours(0, 0, 0, 0))
    );
    const solveDates = Array.from(uniqueSolveDatesSet).sort((a, b) => a - b);
    
    if (solveDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    let longestStreak = 1;
    let tempStreak = 1;
    
    // Calculate longest streak from sorted unique dates
    for (let i = 1; i < solveDates.length; i++) {
      const diff = differenceInDays(solveDates[i], solveDates[i - 1]);
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (diff > 1) {
        tempStreak = 1;
      }
      // diff === 0 shouldn't happen since we deduplicated, but ignore if it does
    }
    
    // Check current streak - must include today or yesterday to be "current"
    let currentStreak = 0;
    const todayTime = today.getTime();
    const yesterdayTime = subDays(today, 1).setHours(0, 0, 0, 0);
    
    // Start checking from today, then yesterday, etc.
    let checkDate = todayTime;
    
    // If today doesn't have a solve, check if yesterday does (streak is still active)
    if (!uniqueSolveDatesSet.has(todayTime)) {
      if (uniqueSolveDatesSet.has(yesterdayTime)) {
        checkDate = yesterdayTime;
      } else {
        // No solve today or yesterday, current streak is 0
        return { currentStreak: 0, longestStreak };
      }
    }
    
    // Count consecutive days going backwards
    while (uniqueSolveDatesSet.has(checkDate)) {
      currentStreak++;
      checkDate = subDays(new Date(checkDate), 1).setHours(0, 0, 0, 0);
    }
    
    return { currentStreak, longestStreak };
  };

  const { currentStreak, longestStreak } = calculateStreaks(problems);

  // For calendar: exactly 52 weeks (like LeetCode)
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  // Start from exactly 52 weeks ago (364 days) from today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  startDate.setHours(0, 0, 0, 0); // Start of that day
  
  // Find the Sunday of the week containing the start date
  const startSunday = new Date(startDate);
  const startDayOfWeek = startDate.getDay();
  startSunday.setDate(startDate.getDate() - startDayOfWeek);
  startSunday.setHours(0, 0, 0, 0);
  
  // Find the Saturday of the week containing today
  const endSaturday = new Date(today);
  const todayDayOfWeek = today.getDay();
  endSaturday.setDate(today.getDate() + (6 - todayDayOfWeek));
  endSaturday.setHours(23, 59, 59, 999);
  
  // Generate solve counts — take date part directly to avoid UTC→local timezone shift
  const solveCounts: Record<string, number> = {};
  problems.forEach(p => {
    const dateStr = typeof p.dateSolved === 'string'
      ? p.dateSolved.split('T')[0]
      : format(p.dateSolved, 'yyyy-MM-dd');
    solveCounts[dateStr] = (solveCounts[dateStr] || 0) + 1;
  });

  // Create exactly 52 weeks starting from the calculated Sunday
  const allWeeks = eachWeekOfInterval({ start: startSunday, end: endSaturday }, { weekStartsOn: 0 });
  
  // Ensure we have exactly 52-53 weeks max (GitHub shows 53 sometimes)
  const weeks = allWeeks.slice(0, Math.min(53, allWeeks.length));
  const totalWeeks = weeks.length;

  // Calculate month labels with better alignment
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = '';
  weeks.forEach((weekStart, index) => {
    const weekDate = new Date(weekStart);
    weekDate.setDate(weekDate.getDate() + 3); // Use Wednesday of the week for month calculation
    const monthLabel = format(weekDate, 'MMM');
    
    // Only add label if it's different from the last month
    if (monthLabel !== lastMonth) {
      monthLabels.push({ label: monthLabel, weekIndex: index });
      lastMonth = monthLabel;
    }
  });

  // Create heatmap data (7 rows for days, weeks as columns) - Sunday to Saturday
  const heatmapData: { date: Date; count: number; isInDataRange: boolean; weekIdx: number }[][] = weeks.map((weekStart, weekIdx) => {
    return Array.from({length: 7}, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      day.setHours(12, 0, 0, 0); // Normalize to noon to avoid timezone issues
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Check if this day is within our actual data range (compare date strings to avoid time issues)
      const dayTime = day.getTime();
      const startTime = startSunday.getTime();
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const isInDataRange = dayTime >= startTime && dayTime <= todayEnd.getTime();
      const count = solveCounts[dateStr] || 0;
      
      return { date: day, count, isInDataRange, weekIdx };
    });
  });

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-800';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-600';
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  // Stats: count problems and active days in the last year
  const pastYearSolves = problems.filter(p => {
    const solveDate = new Date(p.dateSolved);
    return solveDate >= startSunday && solveDate <= today;
  }).length;
  const activeDays = Object.keys(solveCounts).filter(dateStr => {
    const date = new Date(dateStr);
    return date >= startSunday && date <= today && solveCounts[dateStr] > 0;
  }).length;
  const totalDays = differenceInDays(today, startSunday) + 1;
  const activePercentage = Math.round((activeDays / totalDays) * 100);

  // Generate Chart Data for Recharts (Last 30 days)
  const chartData = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 30);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => ({
        date: format(day, 'MMM dd'),
        count: problems.filter(p => isSameDay(new Date(p.dateSolved), day)).length
    }));
  }, [problems]);


  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Welcome Section */}
      <Greeting />

      {/* Top Stats Row - Hero Stats with Glow Effects */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlowCard 
          className="relative overflow-hidden border-orange-500/20" 
          glowColor="rgb(249 115 22)"
          showBorderBeam={currentStreak >= 7}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            <div className="relative">
              <Flame className={cn("h-5 w-5 text-orange-500", currentStreak >= 7 && "animate-pulse")} />
              {currentStreak >= 7 && (
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-bounce" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold tracking-tight">
                <StatsCounter value={currentStreak} /> 
                <span className="text-base font-normal text-muted-foreground"> days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Best: <span className="text-orange-500 font-semibold">{longestStreak} days</span>
            </p>
          </CardContent>
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl animate-glow-pulse" />
        </GlowCard>

        <GlowCard 
          className="relative overflow-hidden border-emerald-500/20" 
          glowColor="rgb(16 185 129)"
          showBorderBeam={totalProblems >= 100}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Solved</CardTitle>
            <Trophy className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold tracking-tight">
                <StatsCounter value={totalProblems} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-emerald-500 font-semibold">+{thisWeek}</span> this week
            </p>
          </CardContent>
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl animate-glow-pulse" />
        </GlowCard>

        <GlowCard 
          className="relative overflow-hidden border-blue-500/20" 
          glowColor="rgb(59 130 246)"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Days</CardTitle>
            <Activity className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold tracking-tight">
                <StatsCounter value={activeDays} />
                <span className="text-base font-normal text-muted-foreground"> / {totalDays}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-blue-500 font-semibold">{activePercentage}%</span> consistency
            </p>
          </CardContent>
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl animate-glow-pulse" />
        </GlowCard>

        <GlowCard 
          className={cn(
            "relative overflow-hidden",
            dueForReview > 0 ? "border-amber-500/30" : "border-amber-500/20"
          )}
          glowColor="rgb(245 158 11)"
          showBorderBeam={dueForReview > 0}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-500/10" />
          {dueForReview > 0 && (
            <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
          )}
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Review</CardTitle>
            <Clock className={cn("h-5 w-5 text-amber-500", dueForReview > 0 && "animate-bounce")} />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold tracking-tight">
                <StatsCounter value={dueForReview} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {forReview} total for review
            </p>
          </CardContent>
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl animate-glow-pulse" />
        </GlowCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Heatmap & Activity - Spans 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Chart */}
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm card-shine">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                          30 Day Activity
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                                    minTickGap={30}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#8884d8" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>


          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm card-shine">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-emerald-500" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
                      Activity Heatmap
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-1">{pastYearSolves} submissions in the last year</CardDescription>
                </div>
                {/* Legend - moved to header */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-[10px] h-[10px] rounded-sm bg-slate-100 dark:bg-slate-800" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-200 dark:bg-emerald-800" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-400 dark:bg-emerald-600" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500 dark:bg-emerald-500" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-600 dark:bg-emerald-400" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Pixel-exact widths so flex-1 collapse can't clip the last weeks */}
              {(() => {
                const STEP = 16; // 12px cell + 4px gap
                const gridPx = weeks.length * STEP - 4; // total cell grid width
                const spacerPx = 40; // w-7 (28) + gap-3 (12)
                return (
              <div ref={heatmapScrollRef} className="w-full overflow-x-auto pb-3 custom-scrollbar">
                <div style={{ width: spacerPx + gridPx + 'px' }}>
                  {/* Month labels row */}
                  <div className="flex mb-2">
                    <div style={{ width: spacerPx + 'px', flexShrink: 0 }} />
                    <div style={{ width: gridPx + 'px' }} className="flex">
                      {monthLabels.map((month, i) => {
                        const nextMonthIndex = monthLabels[i + 1]?.weekIndex ?? weeks.length;
                        const widthPx = (nextMonthIndex - month.weekIndex) * STEP;
                        return (
                          <div
                            key={i}
                            className="text-xs text-muted-foreground font-medium"
                            style={{ width: widthPx + 'px', flexShrink: 0 }}
                          >
                            {month.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Heatmap grid with day labels */}
                  <div className="flex gap-3">
                    {/* Day labels — h-[12px] + gap-[4px] matches cells exactly */}
                    <div className="w-7 shrink-0 flex flex-col gap-[4px] text-[11px] text-muted-foreground font-medium">
                      <div className="h-[12px] flex items-center leading-none">Sun</div>
                      <div className="h-[12px] flex items-center leading-none">Mon</div>
                      <div className="h-[12px] flex items-center leading-none">Tue</div>
                      <div className="h-[12px] flex items-center leading-none">Wed</div>
                      <div className="h-[12px] flex items-center leading-none">Thu</div>
                      <div className="h-[12px] flex items-center leading-none">Fri</div>
                      <div className="h-[12px] flex items-center leading-none">Sat</div>
                    </div>

                    {/* Grid of cells — explicit pixel width, no flex-1 */}
                    <div className="flex gap-[4px]" style={{ width: gridPx + 'px' }}>
                      {heatmapData.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-[4px]">
                          {week.map((cell, dayIdx) => {
                            const isOutOfRange = !cell.isInDataRange;
                            const dayName = format(cell.date, 'EEEE');
                            const fullDate = format(cell.date, 'MMMM d, yyyy');
                            const tooltipText = `${cell.count} problem${cell.count !== 1 ? 's' : ''} solved`;
                            // Show tooltip below for top 3 rows (Sun, Mon, Tue), above for rest
                            const showTooltipBelow = dayIdx < 3;
                            // Adjust horizontal position for edge weeks
                            const isLeftEdge = weekIdx < 5;
                            const isRightEdge = weekIdx > totalWeeks - 6;
                            const horizontalPosition = isLeftEdge 
                              ? "left-0" 
                              : isRightEdge 
                                ? "right-0" 
                                : "left-1/2 -translate-x-1/2";
                            const arrowPosition = isLeftEdge
                              ? "left-[6px]"
                              : isRightEdge
                                ? "right-[6px]"
                                : "left-1/2 -translate-x-1/2";
                            return (
                              <div
                                key={dayIdx}
                                className="relative group"
                              >
                                <div
                                  className={cn(
                                    "w-[12px] h-[12px] rounded-sm transition-all duration-200",
                                    isOutOfRange ? "bg-transparent" : getColor(cell.count),
                                    !isOutOfRange && "hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1 hover:ring-offset-background cursor-pointer"
                                  )}
                                />
                                {!isOutOfRange && (
                                  <div className={cn(
                                    "absolute px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap",
                                    horizontalPosition,
                                    showTooltipBelow ? "top-full mt-2" : "bottom-full mb-2"
                                  )}>
                                    <div className="text-sm font-semibold text-foreground">{dayName}</div>
                                    <div className="text-xs text-muted-foreground">{fullDate}</div>
                                    <div className={cn(
                                      "text-xs font-medium mt-1",
                                      cell.count > 0 ? "text-emerald-500" : "text-muted-foreground"
                                    )}>
                                      {tooltipText}
                                    </div>
                                    {/* Arrow pointing to cell */}
                                    <div className={cn(
                                      "absolute border-[6px] border-transparent",
                                      arrowPosition,
                                      showTooltipBelow ? "bottom-full border-b-border" : "top-full border-t-border"
                                    )} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="h-5 w-5 text-primary" />
                Recent Solves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {problems.slice(0, 5).map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-accent/50 transition-all duration-200 group hover:pl-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                        problem.platform === 'leetcode' ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500" : "bg-blue-500/10 text-blue-600 dark:text-blue-500"
                      )}>
                        {problem.platform === 'leetcode' ? 'LC' : 'CF'}
                      </div>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-xs">
                          {problem.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn(
                            "text-[10px] h-5 px-1.5 font-normal border-none bg-opacity-20",
                            problem.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            problem.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            "bg-red-500/10 text-red-600 dark:text-red-400"
                          )}>
                            {problem.difficulty}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(problem.dateSolved), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpdateProblem(problem.id, { isReview: !problem.isReview })}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        problem.isReview ? "text-yellow-500 opacity-100" : "text-muted-foreground"
                      )}
                    >
                      <Star className={cn("h-4 w-4", problem.isReview && "fill-current")} />
                    </Button>
                  </div>
                ))}
                {problems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No problems solved yet. Start your journey today!</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Daily Tasks & Actions */}
        <div className="space-y-5">
          {/* Practice Today — learned problems by repetition */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm flex items-center gap-2.5">
                <Brain className="h-4 w-4 text-violet-500" />
                Practice Today
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Revisit learned problems to reinforce memory
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {learnedProblems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                  <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No learned problems yet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Solve problems and mark them as <span className="font-medium">Learned</span> to see them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {practiceToday.map((p, idx) => {
                    const isDue = !!(p.nextReviewDate && new Date(p.nextReviewDate) <= new Date());
                    return (
                      <div key={p.id} className="flex items-start gap-2.5 group">
                        <span className="mt-0.5 text-[11px] font-bold text-muted-foreground/60 w-4 shrink-0 text-right">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium leading-snug hover:underline flex items-center gap-1 truncate"
                              >
                                {p.title}
                                <ExternalLink className="h-3 w-3 opacity-40 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-sm font-medium leading-snug truncate">{p.title}</span>
                            )}
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-1.5 shrink-0',
                                p.difficulty === 'Easy' && 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20',
                                p.difficulty === 'Medium' && 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20',
                                p.difficulty === 'Hard' && 'text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-900/20',
                              )}
                            >
                              {p.difficulty}
                            </Badge>
                            {isDue && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 shrink-0">
                                Due
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Rep {p.repetition ?? 0} · solved {format(new Date(p.dateSolved), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {learnedProblems.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{learnedProblems.length - 5} more in Learned tab
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Todo Snapshot */}
          {totalTodos > 0 && (
             <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
               <CardHeader className="pb-4 pt-5 px-5">
                 <CardTitle className="text-sm flex items-center gap-2.5">
                   <CheckSquare className="h-4 w-4 text-primary" />
                   Tasks
                 </CardTitle>
               </CardHeader>
               <CardContent className="px-5 pb-5 space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Progress</span>
                   <span className="text-sm font-medium">{Math.round((completedTodos / totalTodos) * 100) || 0}%</span>
                 </div>
                 <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                   <div
                      className="h-full bg-primary transition-all duration-1000 ease-out"
                      style={{ width: `${(completedTodos / totalTodos) * 100}%` }}
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-accent/50 p-2 rounded-md text-center">
                      <div className="text-lg font-bold text-orange-500">{inProgressTodos}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">In Progress</div>
                    </div>
                    <div className="bg-accent/50 p-2 rounded-md text-center">
                      <div className="text-lg font-bold text-red-500">{overdueTodos}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overdue</div>
                    </div>
                 </div>
               </CardContent>
             </Card>
          )}

          {/* Quick Tools */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 pt-5 px-5">
              <CardTitle className="text-sm flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-yellow-500" />
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start transition-all hover:bg-primary/10 hover:border-primary/50"
                onClick={() => setIsImporting(true)}
              >
                <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                Import Problems
              </Button>
              <ExternalResourcesCard />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ImportProblems 
        open={isImporting} 
        onOpenChange={setIsImporting} 
        onImport={onImportProblems} 
      />
    </div>
  );
};

export default Dashboard;
