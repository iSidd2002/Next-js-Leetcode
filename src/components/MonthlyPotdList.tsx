"use client"

import { useState } from 'react';
import type { Problem } from '@/types';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Star, 
  Trash2, 
  ExternalLink, 
  Pencil, 
  CheckCircle, 
  Undo2, 
  Plus,
  Calendar,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyPotdListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onToggleReview?: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, quality?: number) => void;
  onAddToProblem?: (id: string, targetStatus?: 'active' | 'learned') => void;
  isPotdInProblems?: (problem: Problem) => { inProblems: boolean; inLearned: boolean; status: string };
}

interface GroupedProblems {
  [monthYear: string]: Problem[];
}

const MonthlyPotdList = ({
  problems,
  onUpdateProblem,
  onToggleReview,
  onDeleteProblem,
  onEditProblem,
  onProblemReviewed,
  onAddToProblem,
  isPotdInProblems
}: MonthlyPotdListProps) => {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group problems by month
  const groupedProblems: GroupedProblems = problems.reduce((acc, problem) => {
    const date = parseISO(problem.dateSolved || problem.createdAt);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(problem);
    
    return acc;
  }, {} as GroupedProblems);

  // Sort months in descending order (newest first)
  const sortedMonths = Object.keys(groupedProblems).sort((a, b) => {
    const dateA = parseISO(`01 ${a}`);
    const dateB = parseISO(`01 ${b}`);
    return dateB.getTime() - dateA.getTime();
  });

  const toggleMonth = (monthYear: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) {
        newSet.delete(monthYear);
      } else {
        newSet.add(monthYear);
      }
      return newSet;
    });
  };

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'hard':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'outline';
    }
  };

  const isDueForReview = (problem: Problem) => {
    if (!problem.isReview || !problem.nextReviewDate) return false;
    const today = new Date();
    const reviewDate = parseISO(problem.nextReviewDate);
    return reviewDate <= today;
  };

  if (problems.length === 0) {
    return (
      <Card className="bg-transparent border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No POTD Problems Yet</h3>
          <p className="text-muted-foreground text-center">
            Start adding Problem of the Day problems to see them organized by month here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMonths.map(monthYear => {
        const monthProblems = groupedProblems[monthYear];
        const isExpanded = expandedMonths.has(monthYear);
        
        return (
          <Card key={monthYear} className="border-none shadow-sm bg-card/30 backdrop-blur-sm overflow-hidden transition-all">
            <Collapsible open={isExpanded} onOpenChange={() => toggleMonth(monthYear)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center">
                      <Calendar className="h-4 w-4 mr-3 text-orange-500" />
                      {monthYear}
                      <Badge variant="secondary" className="ml-3 bg-secondary/50 text-muted-foreground font-normal">
                        {monthProblems.length} problem{monthProblems.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-2">
                    {monthProblems.map(problem => {
                      const problemStatus = isPotdInProblems ? isPotdInProblems(problem) : { inProblems: false, inLearned: false, status: '' };
                      
                      return (
                        <div
                          key={problem.id}
                          className={cn(
                            "border rounded-lg p-3 transition-all hover:bg-muted/20",
                            isDueForReview(problem) 
                              ? "border-orange-500/30 bg-orange-500/5" 
                              : "bg-background/40 border-white/5"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {problem.url ? (
                                  <a 
                                    href={problem.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-medium text-sm hover:text-primary transition-colors flex items-center gap-1 truncate"
                                  >
                                    {problem.title}
                                    <ExternalLink className="h-3 w-3 shrink-0 opacity-30" />
                                  </a>
                                ) : (
                                  <span className="font-medium text-sm truncate">{problem.title}</span>
                                )}
                                {problem.isReview && (
                                  <Star className={`h-3.5 w-3.5 shrink-0 ${
                                    isDueForReview(problem) ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground/40'
                                  }`} />
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 text-muted-foreground">
                                  {problem.platform === 'leetcode' ? 'LC' : 'CF'}
                                </Badge>
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 border-0", getDifficultyVariant(problem.difficulty))}>
                                  {problem.difficulty}
                                </Badge>
                                {problemStatus.status && (
                                  <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30">
                                    {problemStatus.status}
                                  </Badge>
                                )}
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
                                  Solved: {format(parseISO(problem.dateSolved), 'MMM dd')}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {onAddToProblem && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant={problemStatus.inProblems || problemStatus.inLearned ? "ghost" : "default"}
                                      size="sm"
                                      className={cn(
                                          "text-xs h-8",
                                          problemStatus.inProblems || problemStatus.inLearned ? "text-muted-foreground" : "bg-primary/80 hover:bg-primary"
                                      )}
                                    >
                                      {problemStatus.inProblems || problemStatus.inLearned ? (
                                          <CheckCircle className="h-4 w-4" />
                                      ) : (
                                          <>
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                          </>
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => onAddToProblem(problem.id, 'active')}
                                      disabled={problemStatus.inProblems}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add as Active Problem
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onAddToProblem(problem.id, 'learned')}
                                      disabled={problemStatus.inLearned}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Add as Learned Problem
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onEditProblem(problem)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  
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

                                  <DropdownMenuItem onClick={() => onDeleteProblem(problem.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {problem.notes && (
                            <div className="mt-3 pt-3 border-t border-white/5">
                              <p className="text-xs text-muted-foreground line-clamp-2">{problem.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};

export default MonthlyPotdList;
