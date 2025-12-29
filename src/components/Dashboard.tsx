"use client"

import type { Problem, ActiveDailyCodingChallengeQuestion, Todo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookCopy, CalendarDays, Star, Trophy, Clock, Download, CheckSquare, AlertTriangle, Target, Trash2, Activity, Zap, Flame, TrendingUp, Clock as HistoryIcon, Sparkles } from 'lucide-react';
import { isToday, isPast, subMonths } from 'date-fns';
import ProblemOfTheDay from './ProblemOfTheDay';
import DailyChallenge from './DailyChallenge';
import ExternalResourcesCard from './ExternalResourcesCard';
import { format, isSameDay, subDays, eachDayOfInterval, differenceInDays, eachWeekOfInterval } from 'date-fns';
import ImportProblems from './ImportProblems';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Greeting from './Greeting';
import StatsCounter from './StatsCounter';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlowCard } from '@/components/ui/glow-card';
import { BorderBeam } from '@/components/ui/border-beam';


interface DashboardProps {
  problems: Problem[];
  todos?: Todo[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onAddPotd: (potd: ActiveDailyCodingChallengeQuestion) => void;
  onImportProblems: (companyName: string, problemsToImport: any[]) => void;
  onCleanupPotd?: () => Promise<void>;
  onAddDailyChallenge?: (dailyProblem: any) => Promise<void>;
}

const Dashboard = ({ problems, todos = [], onUpdateProblem, onAddPotd, onImportProblems, onCleanupPotd, onAddDailyChallenge }: DashboardProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isCleaningPotd, setIsCleaningPotd] = useState(false);

  const totalProblems = problems.length;
  const potdProblems = problems.filter(p => p.source === 'potd');
  const expiredPotdCount = potdProblems.filter(p => {
    const problemDate = new Date(p.dateSolved || p.createdAt);
    const now = new Date();
    const daysDifference = Math.floor((now.getTime() - problemDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference > 7; // POTD retention period
  }).length;

  const handleCleanupPotd = async () => {
    if (!onCleanupPotd) return;

    setIsCleaningPotd(true);
    try {
      await onCleanupPotd();
    } catch (error) {
      console.error('POTD cleanup failed:', error);
    } finally {
      setIsCleaningPotd(false);
    }
  };
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
    const solveDates = problems.map(p => new Date(p.dateSolved).setHours(0,0,0,0)).sort((a,b) => a - b);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    let prevDate: number | null = null;
    solveDates.forEach(date => {
      if (prevDate !== null && differenceInDays(date, prevDate) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = date;
    });
    
    // Check current streak
    let checkDate = today.setHours(0,0,0,0);
    while (solveDates.includes(checkDate)) {
      currentStreak++;
      checkDate = subDays(new Date(checkDate), 1).getTime();
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
  
  // Generate solve counts - include ALL problems within the date range
  const solveCounts: Record<string, number> = {};
  problems.forEach(p => {
    const solveDate = new Date(p.dateSolved);
    const dateStr = format(solveDate, 'yyyy-MM-dd');
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

  // Update color scheme to match LeetCode better
  const getColor = (count: number) => {
    if (count === 0) return 'bg-secondary/50 dark:bg-secondary/30';
    if (count === 1) return 'bg-emerald-300 dark:bg-emerald-900/60';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500';
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
                <span className="text-base font-normal text-muted-foreground"> / 365</span>
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
                    <div className="w-[10px] h-[10px] rounded-sm bg-secondary/50 dark:bg-secondary/30" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-300 dark:bg-emerald-900/60" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500 dark:bg-emerald-600" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-emerald-600 dark:bg-emerald-500" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                <div className="min-w-[750px]">
                  {/* Month labels row */}
                  <div className="flex mb-2">
                    <div className="w-10 shrink-0" /> {/* Spacer for day labels */}
                    <div className="flex-1 flex">
                      {monthLabels.map((month, i) => {
                        const nextMonthIndex = monthLabels[i + 1]?.weekIndex ?? weeks.length;
                        const width = ((nextMonthIndex - month.weekIndex) / weeks.length) * 100;
                        return (
                          <div
                            key={i}
                            className="text-xs text-muted-foreground font-medium"
                            style={{ width: `${width}%` }}
                          >
                            {month.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Heatmap grid with day labels */}
                  <div className="flex gap-3">
                    {/* Day labels */}
                    <div className="w-7 shrink-0 flex flex-col text-[11px] text-muted-foreground font-medium" style={{ height: '118px' }}>
                      <div className="h-[14px] flex items-center">Sun</div>
                      <div className="h-[14px] flex items-center">Mon</div>
                      <div className="h-[14px] flex items-center">Tue</div>
                      <div className="h-[14px] flex items-center">Wed</div>
                      <div className="h-[14px] flex items-center">Thu</div>
                      <div className="h-[14px] flex items-center">Fri</div>
                      <div className="h-[14px] flex items-center">Sat</div>
                    </div>

                    {/* Grid of cells */}
                    <div className="flex-1 flex gap-[4px]">
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
          {/* Daily Actions */}
          <div className="grid gap-4">
             <ProblemOfTheDay onAddPotd={onAddPotd} />
             <DailyChallenge onAddToPotd={onAddDailyChallenge} />
          </div>

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
              
              {onCleanupPotd && (
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                    onClick={handleCleanupPotd}
                    disabled={isCleaningPotd || expiredPotdCount === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean Old POTD ({expiredPotdCount})
                  </Button>
              )}
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
