"use client"

import type { Problem, ActiveDailyCodingChallengeQuestion, Todo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookCopy, CalendarDays, Star, Trophy, Clock, Download, CheckSquare, AlertTriangle, Target, Trash2 } from 'lucide-react';
import { isToday, isPast } from 'date-fns';
import ProblemOfTheDay from './ProblemOfTheDay';
import DailyChallenge from './DailyChallenge';
import { format, isSameDay, subDays, eachDayOfInterval, differenceInDays, eachWeekOfInterval } from 'date-fns';
import ImportProblems from './ImportProblems';
import { useState } from 'react';


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

  const getDifficultyBadgeVariant = (difficulty: string, platform: string): "default" | "destructive" | "secondary" | "outline" | "success" | "warning" => {
    if (platform === 'codeforces') return 'default';
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

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
  
  // Start from exactly 52 weeks ago (364 days) from today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  
  // Find the Sunday of the week containing the start date
  const startSunday = new Date(startDate);
  const startDayOfWeek = startDate.getDay();
  startSunday.setDate(startDate.getDate() - startDayOfWeek);
  
  // Find the Saturday of the week containing today
  const endSaturday = new Date(today);
  const todayDayOfWeek = today.getDay();
  endSaturday.setDate(today.getDate() + (6 - todayDayOfWeek));
  
  // Generate solve counts for the actual data range (not the padded weeks)
  const last365Days = eachDayOfInterval({ start: startDate, end: today });
  const solveCounts = last365Days.reduce((acc, day) => {
    const count = problems.filter(p => isSameDay(new Date(p.dateSolved), day)).length;
    acc[format(day, 'yyyy-MM-dd')] = count;
    return acc;
  }, {} as Record<string, number>);

  // Create exactly 52 weeks starting from the calculated Sunday
  const allWeeks = eachWeekOfInterval({ start: startSunday, end: endSaturday }, { weekStartsOn: 0 });
  
  // Ensure we have exactly 52-53 weeks max (GitHub shows 53 sometimes)
  const weeks = allWeeks.slice(0, Math.min(53, allWeeks.length));

  // Calculate month labels with better alignment - FIXED
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
  const heatmapData: { date: Date; count: number; isInDataRange: boolean }[][] = weeks.map(weekStart => {
    return Array.from({length: 7}, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Check if this day is within our actual data range
      const isInDataRange = day >= startDate && day <= today;
      const count = isInDataRange ? (solveCounts[dateStr] || 0) : 0;
      
      return { date: day, count, isInDataRange };
    });
  });

  // Update color scheme to match LeetCode better
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count === 3) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  // Stats: use the actual data range, not the padded weeks
  const pastYearSolves = problems.filter(p => new Date(p.dateSolved) >= startDate && new Date(p.dateSolved) <= today).length;
  const activeDays = Object.values(solveCounts).filter(c => c > 0).length;
  const totalDays = differenceInDays(today, startDate) + 1;
  const activePercentage = Math.round((activeDays / totalDays) * 100);


  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProblemOfTheDay onAddPotd={onAddPotd} />
        <DailyChallenge onAddToPotd={onAddDailyChallenge} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Import Problems
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Bulk import problems from company lists.
            </div>
            <Button onClick={() => setIsImporting(true)}>
              Import Now
            </Button>
          </CardContent>
        </Card>

        {/* POTD Cleanup Card */}
        {onCleanupPotd && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                POTD Cleanup
              </CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                {potdProblems.length} POTD problems total
              </div>
              {expiredPotdCount > 0 ? (
                <div className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                  {expiredPotdCount} expired (&gt;7 days old)
                </div>
              ) : (
                <div className="text-sm text-green-600 dark:text-green-400 mb-4">
                  All POTD problems are current
                </div>
              )}
              <Button
                onClick={handleCleanupPotd}
                disabled={isCleaningPotd || expiredPotdCount === 0}
                variant={expiredPotdCount > 0 ? "default" : "secondary"}
                size="sm"
              >
                {isCleaningPotd ? 'Cleaning...' : 'Cleanup Old POTD'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <ImportProblems 
        open={isImporting} 
        onOpenChange={setIsImporting} 
        onImport={onImportProblems} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Solve Streaks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{currentStreak}</div>
                  <div className="text-sm">Streak</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Longest: {longestStreak} days
          </div>
          
          {/* LeetCode-style heatmap */}
          <div className="w-full">
            {/* Month labels */}
            <div className="relative mb-6 ml-12 h-4">
              {monthLabels.map((month, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground font-medium"
                  style={{
                    left: `${(month.weekIndex / weeks.length) * 100}%`,
                    top: '0px'
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex items-start">
              {/* Day labels */}
              <div className="flex flex-col justify-around text-xs text-muted-foreground mr-3 font-medium" style={{ height: '112px' }}>
                <span></span>
                <span>Mon</span>
                <span></span>
                <span>Wed</span>
                <span></span>
                <span>Fri</span>
                <span></span>
              </div>

              {/* Calendar grid - Fill all gaps */}
              <div className="flex-1">
                <div className="grid gap-[1px] w-full" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
                  {heatmapData.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[1px]">
                      {week.map((cell, dayIdx) => {
                        // Render all cells consistently to avoid gaps
                        const isOutOfRange = !cell.isInDataRange;

                        return (
                          <div
                            key={dayIdx}
                            className={`aspect-square rounded-[2px] ${
                              isOutOfRange
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : getColor(cell.count)
                            } hover:ring-1 hover:ring-gray-400 transition-all cursor-default`}
                            title={
                              isOutOfRange
                                ? `${format(cell.date, 'MMM d, yyyy')}: Out of range`
                                : `${format(cell.date, 'MMM d, yyyy')}: ${cell.count} ${cell.count === 1 ? 'problem' : 'problems'}`
                            }
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-[1px]">
                <div className="w-[12px] h-[12px] rounded-[1px] bg-gray-100 dark:bg-gray-800" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-200 dark:bg-green-900" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-300 dark:bg-green-800" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-400 dark:bg-green-700" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-500 dark:bg-green-600" />
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="text-center space-y-1 mt-3 sm:mt-4">
            <div className="text-base sm:text-lg font-medium">{pastYearSolves} Submissions in the past year</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Active Days: {activeDays} ({activePercentage}%)</div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <BookCopy className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProblems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved This Week</CardTitle>
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marked for Review</CardTitle>
            <Star className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forReview}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
                <Clock className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{dueForReview}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Easy Problems</CardTitle>
                <Trophy className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{problems.filter(p => p.difficulty === 'Easy').length}</div>
            </CardContent>
        </Card>
      </div>

      {/* Todo Statistics */}
      {totalTodos > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
              <CheckSquare className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTodos}</div>
              <p className="text-xs text-muted-foreground">
                {completedTodos} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Target className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTodos}</div>
              <p className="text-xs text-muted-foreground">
                {pendingTodos} pending
              </p>
            </CardContent>
          </Card>
          {overdueTodos > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueTodos}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>
          )}
          {urgentTodos > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{urgentTodos}</div>
                <p className="text-xs text-muted-foreground">
                  High priority
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Problems</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {problems.slice(0, 5).map((problem) => (
              <div key={problem.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="font-medium">{problem.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={problem.platform === 'leetcode' ? 'outline' : 'default'}>
                        {problem.platform === 'leetcode' ? 'LeetCode' : 'CodeForces'}
                    </Badge>
                    <Badge variant={getDifficultyBadgeVariant(problem.difficulty, problem.platform)}>
                        {problem.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onUpdateProblem(problem.id, { isReview: !problem.isReview })}
                  className={problem.isReview ? 'text-yellow-500' : 'text-muted-foreground'}
                >
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            ))}
            {problems.length === 0 && (
                <div className="text-center py-12">
                    <BookCopy className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No problems yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Start tracking your coding progress by adding your first problem!
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Placeholder for activity chart or feed */}
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Activity feed coming soon...
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
