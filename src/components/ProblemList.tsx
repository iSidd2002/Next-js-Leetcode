"use client"

import { useState } from 'react';
import type { Problem } from '@/types';
import { formatDate } from '@/utils/dateMigration';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Star, Trash2, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Pencil, Undo2, BookOpen, Edit, ArrowRight, Brain, Lightbulb, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeSnippetViewer } from './CodeSnippetViewer';
import { Code2 } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ReviewInsights from '@/components/ai/ReviewInsights';
import SimilarProblems from '@/components/ai/SimilarProblems';
import { EnhancedReviewDialog } from '@/components/EnhancedReviewDialog';
import { cn } from '@/lib/utils';

// Helper function to get difficulty badge variant
const getDifficultyVariant = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getDifficultyClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'hard':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
};

interface ProblemListProps {
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
  onClearAll?: () => void;
  isReviewList?: boolean;
  onAddToProblem?: (id: string) => void;
  isPotdInProblems?: (problem: Problem) => boolean;
}

const ProblemList = ({ problems, onUpdateProblem, onToggleReview, onDeleteProblem, onEditProblem, onProblemReviewed, onClearAll, isReviewList = false, onAddToProblem, isPotdInProblems }: ProblemListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // AI Modal states
  const [showReviewInsights, setShowReviewInsights] = useState(false);
  const [showSimilarProblems, setShowSimilarProblems] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  
  // Enhanced Review Dialog state
  const [showEnhancedReview, setShowEnhancedReview] = useState(false);
  const [problemToReview, setProblemToReview] = useState<Problem | null>(null);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredProblems = problems.filter((problem) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesTitle = problem.title.toLowerCase().includes(searchTermLower);
    const matchesTopics = problem.topics && problem.topics.some(topic => topic.toLowerCase().includes(searchTermLower));
    const matchesCompanies = problem.companies && problem.companies.some(company => company.toLowerCase().includes(searchTermLower));
    return matchesTitle || matchesTopics || matchesCompanies;
  });

  const isDueForReview = (problem: Problem) => {
    if (!problem.isReview || !problem.nextReviewDate) return false;
    try {
      const reviewDate = new Date(problem.nextReviewDate);
      const today = new Date();

      // Set both dates to start of day for comparison
      reviewDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // Check if the date is valid
      if (isNaN(reviewDate.getTime())) return false;
      return reviewDate <= today;
    } catch (error) {
      console.warn('Invalid date format for problem:', problem.id, problem.nextReviewDate);
      return false;
    }
  };

  // AI Modal handlers
  const handleShowReviewInsights = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowReviewInsights(true);
  };

  const handleShowSimilarProblems = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowSimilarProblems(true);
  };

  const getPlatformLabel = (platform: string): string => {
    switch (platform?.toLowerCase()) {
      case 'leetcode':
        return 'LeetCode';
      case 'codeforces':
        return 'CodeForces';
      case 'atcoder':
        return 'AtCoder';
      case 'geeksforgeeks':
        return 'GeeksforGeeks';
      case 'codingninjas':
        return 'CodingNinjas';
      default:
        return platform || 'Unknown';
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-4 pt-0">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center tracking-tight">
                        {isReviewList ? (
                            <>
                                <Star className="h-6 w-6 text-orange-500 mr-2 fill-orange-500/20" />
                                Review Queue
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-6 w-6 text-emerald-500 mr-2" />
                                All Problems
                            </>
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {filteredProblems.length} of {problems.length} problems
                        {isReviewList && filteredProblems.length > 0 && (
                            <span className="ml-2 text-orange-500 font-medium bg-orange-500/10 px-2 py-0.5 rounded-full text-xs">
                                {filteredProblems.length} due
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search problems..."
                            className="pl-9 bg-background/50 backdrop-blur-sm border-white/10 focus:bg-background transition-all"
                        />
                    </div>
                    {/* Clear All Button - only show for non-review lists and when there are problems */}
                    {!isReviewList && onClearAll && problems.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="whitespace-nowrap shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Clear All</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Clear All Problems</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete all manually added problems?
                                        This will remove {problems.length} problem{problems.length !== 1 ? 's' : ''} from your personal tracking.
                                        <br /><br />
                                        <strong>This action cannot be undone.</strong>
                                        <br /><br />
                                        <em>Note: Company-imported problems in the Companies tab will not be affected.</em>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={onClearAll}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Clear All Problems
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </CardHeader>
      <CardContent className="px-0">
        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-3 mb-6">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <div key={problem.id} className={cn(
                  "border rounded-xl p-4 transition-all",
                  isDueForReview(problem) 
                    ? "border-orange-500/30 bg-orange-500/5" 
                    : "bg-card/50 border-white/10"
                )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {problem.url ? (
                        <a href={problem.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:text-primary transition-colors flex items-center gap-1 truncate">
                          {problem.title}
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      ) : (
                        <span className="font-medium text-sm truncate">{problem.title}</span>
                      )}
                      {problem.isReview && <Star className={`h-3.5 w-3.5 shrink-0 ${isDueForReview(problem) ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground'}`} />}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-secondary/50">
                        {getPlatformLabel(problem.platform)}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 border-0", getDifficultyClass(problem.difficulty))}>
                        {problem.difficulty}
                      </Badge>
                    </div>

                    {problem.topics && problem.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {problem.topics.slice(0, 3).map(topic => (
                          <Badge key={topic} variant="secondary" className="text-[10px] h-5 bg-background/50">{topic}</Badge>
                        ))}
                        {problem.topics.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] h-5 bg-background/50">+{problem.topics.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    {problem.dateSolved && (
                      <p className="text-[10px] text-muted-foreground">
                        Solved: {format(new Date(problem.dateSolved), 'MMM dd')}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditProblem(problem)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShowReviewInsights(problem)}>
                        <Brain className="mr-2 h-4 w-4 text-blue-500" />
                        Insights
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteProblem(problem.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isReviewList && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                      <Button size="sm" onClick={() => onProblemReviewed(problem.id, 5)} disabled={!isDueForReview(problem)} className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700 text-white">
                        Easy
                      </Button>
                      <Button size="sm" onClick={() => onProblemReviewed(problem.id, 3)} disabled={!isDueForReview(problem)} className="flex-1 text-xs h-8 bg-yellow-600 hover:bg-yellow-700 text-white">
                        Good
                      </Button>
                      <Button size="sm" onClick={() => onProblemReviewed(problem.id, 1)} disabled={!isDueForReview(problem)} className="flex-1 text-xs h-8 bg-red-600 hover:bg-red-700 text-white">
                        Hard
                      </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p>No problems found.</p>
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="rounded-xl border border-white/10 hidden md:block overflow-hidden bg-card/30 backdrop-blur-sm shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[40%]">Problem</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProblems.length > 0 ? (
                filteredProblems.flatMap((problem) => (
                  <React.Fragment key={problem.id}>
                    <TableRow 
                        className={cn(
                            "border-white/5 hover:bg-muted/20 transition-colors", 
                            isDueForReview(problem) && "bg-orange-500/5 hover:bg-orange-500/10"
                        )}
                        data-state={isDueForReview(problem) ? 'selected' : undefined}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(problem.id)} className="mr-2 h-6 w-6 text-muted-foreground">
                            {expandedRows.has(problem.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </Button>
                          <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                {problem.url ? (
                                    <a href={problem.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                                    {problem.title}
                                    <ExternalLink className="h-3 w-3 opacity-30" />
                                    </a>
                                ) : (
                                    problem.title
                                )}
                                {problem.isReview && <Star className={`h-3.5 w-3.5 ${isDueForReview(problem) ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground/40'}`} />}
                              </div>
                              {problem.topics && problem.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {problem.topics.slice(0, 3).map(topic => (
                                    <span key={topic} className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded-sm">{topic}</span>
                                    ))}
                                    {problem.topics.length > 3 && (
                                        <span className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded-sm">+{problem.topics.length - 3}</span>
                                    )}
                                </div>
                                )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-secondary/30 text-muted-foreground font-normal">
                          {getPlatformLabel(problem.platform)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-normal border-0", getDifficultyClass(problem.difficulty))}>
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isDueForReview(problem) ? (
                          <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Due Review
                          </span>
                        ) : problem.isReview && problem.nextReviewDate ? (
                          <span className="text-xs text-muted-foreground">{formatDate(problem.nextReviewDate)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isReviewList ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShowReviewInsights(problem)}
                              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                              title="AI Insights"
                            >
                              <Brain className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShowSimilarProblems(problem)}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                              title="Similar Problems"
                            >
                              <Lightbulb className="h-4 w-4" />
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={() => {
                                  setProblemToReview(problem);
                                  setShowEnhancedReview(true);
                                }}
                                disabled={!isDueForReview(problem)}
                                className="h-8 text-xs bg-primary hover:bg-primary/90"
                            >
                              Review
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => onEditProblem(problem)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleShowReviewInsights(problem)}>
                                <Brain className="mr-2 h-4 w-4 text-blue-500" />
                                AI Insights
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleShowSimilarProblems(problem)}>
                                <Lightbulb className="mr-2 h-4 w-4 text-rose-500" />
                                Similar Problems
                              </DropdownMenuItem>

                              {problem.source === 'potd' && onAddToProblem && (
                                <DropdownMenuItem
                                  onClick={() => onAddToProblem(problem.id)}
                                  disabled={isPotdInProblems && isPotdInProblems(problem)}
                                >
                                  <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
                                  {isPotdInProblems && isPotdInProblems(problem) ? 'Already Added' : 'Add to Main List'}
                                </DropdownMenuItem>
                              )}

                              {problem.status === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => (onToggleReview || onUpdateProblem)(problem.id, { isReview: !problem.isReview })}>
                                    <Star className="mr-2 h-4 w-4" />
                                    {problem.isReview ? 'Unmark review' : 'Mark for review'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'learned' })}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Mark as Learned
                                  </DropdownMenuItem>
                                </>
                              )}

                              {problem.status === 'learned' && (
                                <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'active' })}>
                                  <Undo2 className="mr-2 h-4 w-4" />
                                  Mark as Unlearned
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem onClick={() => setProblemToDelete(problem.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(problem.id) && (
                      <TableRow className="bg-muted/5 hover:bg-muted/5 border-white/5">
                        <TableCell colSpan={5} className="p-4">
                          <div className="pl-9 space-y-4">
                            {/* Solution Summary & Complexity */}
                            {(problem.solutionSummary || problem.timeComplexity || problem.spaceComplexity) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {problem.solutionSummary && (
                                  <div className="md:col-span-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Solution Summary</h4>
                                    <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-white/5">
                                      {problem.solutionSummary}
                                    </p>
                                  </div>
                                )}
                                {(problem.timeComplexity || problem.spaceComplexity) && (
                                  <div className="flex gap-4">
                                    {problem.timeComplexity && (
                                      <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Time</h4>
                                        <Badge variant="outline" className="font-mono text-xs">{problem.timeComplexity}</Badge>
                                      </div>
                                    )}
                                    {problem.spaceComplexity && (
                                      <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Space</h4>
                                        <Badge variant="outline" className="font-mono text-xs">{problem.spaceComplexity}</Badge>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Sub-Patterns, Struggles, Learnings */}
                            {(problem.subPatterns?.length || problem.struggles?.length || problem.learnings?.length) && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {problem.subPatterns && problem.subPatterns.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sub-Patterns</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {problem.subPatterns.map((pattern, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">{pattern}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {problem.struggles && problem.struggles.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Struggled With</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {problem.struggles.map((struggle, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs bg-red-500/10 text-red-600 dark:text-red-400">{struggle}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {problem.learnings && problem.learnings.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Learnings</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {problem.learnings.map((learning, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400">{learning}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Notes Section */}
                            <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground bg-background/50 p-4 rounded-lg border border-white/5">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {problem.notes || 'No notes recorded.'}
                              </ReactMarkdown>
                            </div>
                            </div>
                            
                            {/* Code Snippet Section */}
                            {problem.codeSnippet && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Code2 className="h-4 w-4 text-primary" />
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Solution Code
                                  </h4>
                                  <span className="text-xs text-muted-foreground">
                                    • {problem.codeLanguage || 'javascript'}
                                  </span>
                                </div>
                                <CodeSnippetViewer
                                  code={problem.codeSnippet}
                                  language={problem.codeLanguage || 'javascript'}
                                  filename={problem.codeFilename || 'solution'}
                                  title={problem.title}
                                  showLineNumbers={true}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <EmptyState
                      title={isReviewList ? "All Caught Up" : "No Problems Found"}
                      description={isReviewList ? "You have no reviews scheduled for today." : "Try adjusting your search or add a new problem."}
                      actionLabel={isReviewList ? undefined : "Add Problem"}
                      onAction={isReviewList ? undefined : () => onEditProblem(null as any)}
                      icon={isReviewList ? <CheckCircle className="h-12 w-12 text-green-500/50" /> : <Search className="h-12 w-12 text-muted-foreground/20" />}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog open={!!problemToDelete} onOpenChange={() => setProblemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Problem</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this problem? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (problemToDelete) {
                  onDeleteProblem(problemToDelete);
                  setProblemToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                timeSpent: 30, // Default time in minutes
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
              <Lightbulb className="h-5 w-5 text-rose-600" />
              Similar Problems
            </DialogTitle>
          </DialogHeader>
          {selectedProblem && (
            <SimilarProblems
              problem={selectedProblem}
            />
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
    </Card>
  );
};

export default ProblemList;
