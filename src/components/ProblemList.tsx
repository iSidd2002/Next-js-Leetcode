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
import { MoreHorizontal, Star, Trash2, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Pencil, Undo2, BookOpen, Edit, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EmptyState from '@/components/EmptyState';

// Helper function to get difficulty badge variant
const getDifficultyVariant = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'hard':
      return 'destructive';
    default:
      return 'outline';
  }
};

interface ProblemListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onToggleReview?: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, quality?: number) => void;
  onClearAll?: () => void;
  isReviewList?: boolean;
  onAddToProblem?: (id: string) => void; // New handler for adding POTD to Problems
  isPotdInProblems?: (problem: Problem) => boolean; // Check if POTD problem exists in Problems
  onGenerateSuggestions?: (problem: Problem) => void; // LLM feature handler
  isLoadingSuggestions?: boolean; // Loading state for suggestions
  selectedProblemForSuggestions?: Problem | null; // Currently selected problem for suggestions
}

const ProblemList = ({ problems, onUpdateProblem, onToggleReview, onDeleteProblem, onEditProblem, onProblemReviewed, onClearAll, isReviewList = false, onAddToProblem, isPotdInProblems, onGenerateSuggestions, isLoadingSuggestions = false, selectedProblemForSuggestions }: ProblemListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const getDifficultyBadgeVariant = (difficulty: string, platform: string): "default" | "destructive" | "secondary" | "outline" | "success" | "warning" => {
    if (platform === 'codeforces' || platform === 'atcoder') return 'default';
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

  return (
    <Card>
        <CardHeader className="pb-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center">
                        {isReviewList ? (
                            <>
                                <Star className="h-6 w-6 text-orange-500 mr-2" />
                                Review Problems
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                                Problems
                            </>
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {filteredProblems.length} of {problems.length} problems
                        {isReviewList && filteredProblems.length > 0 && (
                            <span className="ml-2 text-orange-600 font-medium">
                                • {filteredProblems.length} due for review
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search problems..."
                            className="bg-background w-full"
                        />
                    </div>
                    {/* Clear All Button - only show for non-review lists and when there are problems */}
                    {!isReviewList && onClearAll && problems.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="whitespace-nowrap shrink-0"
                                >
                                    <Trash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Clear All</span>
                                    <span className="sm:hidden">Clear</span>
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
      <CardContent>
        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-3 mb-6">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <div key={problem.id} className={`border rounded-lg p-4 ${isDueForReview(problem) ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'bg-card'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {problem.url ? (
                        <a href={problem.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:underline flex items-center gap-1 truncate">
                          {problem.title}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="font-medium text-sm truncate">{problem.title}</span>
                      )}
                      {problem.isReview && <Star className={`h-4 w-4 shrink-0 ${isDueForReview(problem) ? 'text-blue-500' : 'text-yellow-500'}`} />}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant={problem.platform === 'leetcode' ? 'outline' : 'default'} className="text-xs">
                        {getPlatformLabel(problem.platform)}
                      </Badge>
                      <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-xs">
                        {problem.difficulty}
                      </Badge>
                      <Badge variant={problem.status === 'learned' ? 'default' : 'secondary'} className="text-xs">
                        {problem.status === 'learned' ? 'Learned' : 'Active'}
                      </Badge>
                    </div>

                    {problem.topics && problem.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {problem.topics.slice(0, 3).map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                        ))}
                        {problem.topics.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{problem.topics.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    {problem.dateSolved && (
                      <p className="text-xs text-muted-foreground">
                        Solved: {format(new Date(problem.dateSolved), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => onEditProblem(problem)} className="h-8 w-8">
                      <Edit className="h-3 w-3" />
                    </Button>
                    {onGenerateSuggestions && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onGenerateSuggestions(problem)}
                        className="h-8 w-8 text-blue-600"
                        title="Get AI suggestions"
                        disabled={isLoadingSuggestions && selectedProblemForSuggestions?.id === problem.id}
                      >
                        {isLoadingSuggestions && selectedProblemForSuggestions?.id === problem.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Lightbulb className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    {problem.source === 'potd' && onAddToProblem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddToProblem(problem.id)}
                        className="h-8 w-8 text-blue-600"
                        title={isPotdInProblems && isPotdInProblems(problem) ? "Already in Problems" : "Add to Problems"}
                        disabled={isPotdInProblems && isPotdInProblems(problem)}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDeleteProblem(problem.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {problem.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">{problem.notes}</p>
                  </div>
                )}

                {isReviewList && (
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Button size="sm" onClick={() => onProblemReviewed(problem.id, 5)} className="flex-1 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Easy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onProblemReviewed(problem.id, 3)} className="flex-1 text-xs">
                      Good
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onProblemReviewed(problem.id, 1)} className="flex-1 text-xs">
                      Hard
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No problems found matching your search.</p>
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Difficulty / Rating</TableHead>
                <TableHead>Next Review</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProblems.length > 0 ? (
                filteredProblems.flatMap((problem) => (
                  <React.Fragment key={problem.id}>
                    <TableRow data-state={isDueForReview(problem) ? 'selected' : undefined}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(problem.id)} className="mr-2 h-8 w-8">
                            {expandedRows.has(problem.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                          {problem.url ? (
                            <a href={problem.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                              {problem.title}
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          ) : (
                            problem.title
                          )}
                          {problem.isReview && <Star className={`ml-2 h-5 w-5 ${isDueForReview(problem) ? 'text-blue-500' : 'text-yellow-500'}`} />}
                        </div>
                        {problem.topics && problem.topics.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {problem.topics.map(topic => (
                              <Badge key={topic} variant="secondary">{topic}</Badge>
                            ))}
                          </div>
                        )}
                        {problem.companies && problem.companies.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {problem.companies.map(company => (
                              <Badge key={company} variant="default">{company}</Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={problem.platform === 'leetcode' ? 'outline' : 'default'}>
                          {getPlatformLabel(problem.platform)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDifficultyBadgeVariant(problem.difficulty, problem.platform)}>
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isDueForReview(problem) ? (
                          <Badge variant="destructive">Due Today</Badge>
                        ) : problem.isReview && problem.nextReviewDate ? (
                          formatDate(problem.nextReviewDate)
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isReviewList ? (
                          <div className="flex items-center justify-end gap-2">
                            {onGenerateSuggestions && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onGenerateSuggestions(problem)}
                                className="h-8 w-8 text-blue-600"
                                title="Get AI suggestions"
                                disabled={isLoadingSuggestions && selectedProblemForSuggestions?.id === problem.id}
                              >
                                {isLoadingSuggestions && selectedProblemForSuggestions?.id === problem.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Lightbulb className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button size="sm" onClick={() => onProblemReviewed(problem.id, 4)} disabled={!isDueForReview(problem)}>
                              Reviewed &amp; Advance
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditProblem(problem)}>
                                <Pencil className="mr-2 h-5 w-5" />
                                Edit
                              </DropdownMenuItem>

                              {problem.source === 'potd' && onAddToProblem && (
                                <DropdownMenuItem
                                  onClick={() => onAddToProblem(problem.id)}
                                  disabled={isPotdInProblems && isPotdInProblems(problem)}
                                >
                                  <ArrowRight className="mr-2 h-5 w-5 text-blue-600" />
                                  {isPotdInProblems && isPotdInProblems(problem) ? 'Already in Problems' : 'Add to Problems'}
                                </DropdownMenuItem>
                              )}

                              {problem.status === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => (onToggleReview || onUpdateProblem)(problem.id, { isReview: !problem.isReview })}>
                                    <Star className="mr-2 h-5 w-5" />
                                    {problem.isReview ? 'Unmark review' : 'Mark for review'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'learned' })}>
                                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                    Mark as Learned
                                  </DropdownMenuItem>
                                </>
                              )}

                              {problem.status === 'learned' && (
                                <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'active' })}>
                                  <Undo2 className="mr-2 h-5 w-5" />
                                  Mark as Unlearned
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem onClick={() => setProblemToDelete(problem.id)}>
                                <Trash2 className="mr-2 h-5 w-5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(problem.id) && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="p-4 bg-muted/50 rounded-md">
                            <h4 className="font-semibold mb-2">Notes</h4>
                            <div className="prose dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {problem.notes || 'No notes for this problem.'}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState
                      title={isReviewList ? "No problems due for review" : "No problems found"}
                      description={isReviewList ? "Great job! You're all caught up with your reviews." : "Start tracking your coding journey by adding your first problem."}
                      actionLabel={isReviewList ? undefined : "Add Problem"}
                      onAction={isReviewList ? undefined : () => onEditProblem(null as any)}
                      icon={isReviewList ? <CheckCircle className="h-12 w-12 text-green-500" /> : <BookOpen className="h-12 w-12 text-muted-foreground/50" />}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the problem.
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
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProblemList;
