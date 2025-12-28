"use client";

import { useState, useMemo } from 'react';
import { Problem } from '@/types';
import { TopicFolder } from '@/components/ui/animated-folder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCcw,
  Search,
  Folder,
  List,
  GraduationCap,
  Undo2,
  Clock,
  Brain,
  Lightbulb,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isPast, isFuture } from 'date-fns';
import ReviewInsights from '@/components/ai/ReviewInsights';
import SimilarProblems from '@/components/ai/SimilarProblems';
import { EnhancedReviewDialog } from '@/components/EnhancedReviewDialog';

interface TopicGroupedProblemListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onToggleReview?: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (
    id: string,
    quality?: number,
    notes?: string,
    timeTaken?: number,
    tags?: string[],
    customDays?: number,
    moveToLearned?: boolean
  ) => void;
  isLearnedList?: boolean;
  title?: string;
}

// Group problems by their topics
function groupProblemsByTopic(problems: Problem[]): Map<string, Problem[]> {
  const groups = new Map<string, Problem[]>();
  
  problems.forEach(problem => {
    const topics = problem.topics && problem.topics.length > 0 
      ? problem.topics 
      : ['Uncategorized'];
    
    topics.forEach(topic => {
      if (!groups.has(topic)) {
        groups.set(topic, []);
      }
      groups.get(topic)!.push(problem);
    });
  });

  // Sort topics alphabetically, but keep "Uncategorized" at the end
  return new Map(
    [...groups.entries()].sort((a, b) => {
      if (a[0] === 'Uncategorized') return 1;
      if (b[0] === 'Uncategorized') return -1;
      return a[0].localeCompare(b[0]);
    })
  );
}

// Get difficulty stats for a group
function getDifficultyStats(problems: Problem[]) {
  return {
    easy: problems.filter(p => p.difficulty.toLowerCase() === 'easy').length,
    medium: problems.filter(p => p.difficulty.toLowerCase() === 'medium').length,
    hard: problems.filter(p => p.difficulty.toLowerCase() === 'hard').length,
  };
}

export function TopicGroupedProblemList({
  problems,
  onUpdateProblem,
  onToggleReview,
  onDeleteProblem,
  onEditProblem,
  onProblemReviewed,
  isLearnedList = false,
  title = "Problems by Topic",
}: TopicGroupedProblemListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
  
  // AI Modal states
  const [showReviewInsights, setShowReviewInsights] = useState(false);
  const [showSimilarProblems, setShowSimilarProblems] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  
  // Enhanced Review Dialog state
  const [showEnhancedReview, setShowEnhancedReview] = useState(false);
  const [problemToReview, setProblemToReview] = useState<Problem | null>(null);

  // AI Modal handlers
  const handleShowReviewInsights = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowReviewInsights(true);
  };

  const handleShowSimilarProblems = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowSimilarProblems(true);
  };

  const handleStartReview = (problem: Problem) => {
    setProblemToReview(problem);
    setShowEnhancedReview(true);
  };

  // Filter problems by search query
  const filteredProblems = useMemo(() => {
    if (!searchQuery.trim()) return problems;
    const query = searchQuery.toLowerCase();
    return problems.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.topics.some(t => t.toLowerCase().includes(query)) ||
      p.difficulty.toLowerCase().includes(query)
    );
  }, [problems, searchQuery]);

  // Group problems by topic
  const groupedProblems = useMemo(() => 
    groupProblemsByTopic(filteredProblems),
    [filteredProblems]
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getReviewStatus = (problem: Problem) => {
    if (!problem.isReview || !problem.nextReviewDate) return null;
    const reviewDate = new Date(problem.nextReviewDate);
    if (isToday(reviewDate)) return 'due-today';
    if (isPast(reviewDate)) return 'overdue';
    if (isFuture(reviewDate)) return 'upcoming';
    return null;
  };

  const renderProblemRow = (problem: Problem) => {
    const reviewStatus = getReviewStatus(problem);
    
    return (
      <div
        key={problem.id}
        className={cn(
          "flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0",
          reviewStatus === 'overdue' && "bg-red-500/5",
          reviewStatus === 'due-today' && "bg-amber-500/5"
        )}
      >
        {/* Difficulty Badge */}
        <Badge 
          variant="outline" 
          className={cn("text-xs shrink-0", getDifficultyColor(problem.difficulty))}
        >
          {problem.difficulty}
        </Badge>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-primary transition-colors truncate block"
          >
            {problem.title}
          </a>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground capitalize">
              {problem.platform}
            </span>
            {problem.isReview && problem.nextReviewDate && (
              <span className={cn(
                "text-xs",
                reviewStatus === 'overdue' && "text-red-500",
                reviewStatus === 'due-today' && "text-amber-500",
                reviewStatus === 'upcoming' && "text-muted-foreground"
              )}>
                <Clock className="h-3 w-3 inline mr-1" />
                {format(new Date(problem.nextReviewDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-1 shrink-0">
          {problem.isReview && (
            <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <RefreshCcw className="h-3 w-3 mr-1" />
              Review
            </Badge>
          )}
        </div>

        {/* Review Button for due problems */}
        {problem.isReview && reviewStatus && (reviewStatus === 'due-today' || reviewStatus === 'overdue') && (
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs shrink-0"
            onClick={() => handleStartReview(problem)}
          >
            <Star className="h-3 w-3 mr-1" />
            Review
          </Button>
        )}

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(problem.url, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Problem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditProblem(problem)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* AI Features */}
            <DropdownMenuItem onClick={() => handleShowReviewInsights(problem)}>
              <Brain className="mr-2 h-4 w-4 text-blue-500" />
              AI Insights
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShowSimilarProblems(problem)}>
              <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
              Similar Problems
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Start Review */}
            {problem.isReview && (
              <DropdownMenuItem onClick={() => handleStartReview(problem)}>
                <Star className="mr-2 h-4 w-4 text-orange-500" />
                Start Review
              </DropdownMenuItem>
            )}
            
            {/* Toggle Review */}
            {!problem.isReview ? (
              <DropdownMenuItem onClick={() => onToggleReview?.(problem.id, { isReview: true })}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Mark for Review
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onToggleReview?.(problem.id, { isReview: false })}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Remove from Review
              </DropdownMenuItem>
            )}

            {/* Status Toggle */}
            {isLearnedList ? (
              <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'active', isReview: false })}>
                <Undo2 className="mr-2 h-4 w-4" />
                Mark as Unlearned
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'learned', isReview: false })}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Move to Learned
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDeleteProblem(problem.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (problems.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No problems yet</h3>
        <p className="text-muted-foreground">
          {isLearnedList 
            ? "Problems you've mastered will appear here" 
            : "Add problems to see them organized by topic"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {problems.length} problems in {groupedProblems.size} topics
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'folders' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('folders')}
            >
              <Folder className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'folders' ? (
        <div className="space-y-3">
          {[...groupedProblems.entries()].map(([topic, topicProblems]) => (
            <TopicFolder
              key={topic}
              topic={topic}
              count={topicProblems.length}
              difficulty={getDifficultyStats(topicProblems)}
              defaultOpen={topicProblems.length <= 5}
            >
              <div className="divide-y divide-border/50">
                {topicProblems.map(problem => renderProblemRow(problem))}
              </div>
            </TopicFolder>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="divide-y divide-border/50">
            {filteredProblems.map(problem => renderProblemRow(problem))}
          </div>
        </div>
      )}

      {/* AI Review Insights Modal */}
      <Dialog open={showReviewInsights} onOpenChange={setShowReviewInsights}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Insights
            </DialogTitle>
          </DialogHeader>
          {selectedProblem && (
            <ReviewInsights
              problem={selectedProblem}
              userHistory={{
                previousAttempts: selectedProblem.repetition || 0,
                lastSolved: selectedProblem.dateSolved || new Date().toISOString(),
                timeSpent: 30,
                mistakes: selectedProblem.notes ? [selectedProblem.notes] : [],
                successRate: selectedProblem.repetition > 0 ? 0.8 : 0.5
              }}
              reviewContext={{
                daysSinceLastReview: selectedProblem.nextReviewDate ?
                  Math.floor((new Date().getTime() - new Date(selectedProblem.nextReviewDate).getTime()) / (1000 * 60 * 60 * 24)) :
                  1,
                currentStreak: selectedProblem.repetition || 0,
                upcomingInterviews: false,
                targetDifficulty: selectedProblem.difficulty
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* AI Similar Problems Modal */}
      <Dialog open={showSimilarProblems} onOpenChange={setShowSimilarProblems}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Similar Problems
            </DialogTitle>
          </DialogHeader>
          {selectedProblem && (
            <SimilarProblems problem={selectedProblem} />
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Review Dialog */}
      <EnhancedReviewDialog
        problem={problemToReview}
        open={showEnhancedReview}
        onOpenChange={setShowEnhancedReview}
        onReview={(id, quality, notes, timeTaken, tags, customDays, moveToLearned) => {
          onProblemReviewed(id, quality, notes, timeTaken, tags, customDays, moveToLearned);
        }}
      />
    </div>
  );
}
