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
  Calendar
} from 'lucide-react';

interface MonthlyPotdListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onToggleReview?: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, quality?: number) => void;
  onAddToProblem?: (id: string) => void;
  isPotdInProblems?: (problem: Problem) => boolean;
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
        return 'default';
      case 'medium':
        return 'secondary';
      case 'hard':
        return 'destructive';
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
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
          <Card key={monthYear}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleMonth(monthYear)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      {monthYear}
                      <Badge variant="outline" className="ml-3">
                        {monthProblems.length} problem{monthProblems.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {monthProblems.map(problem => {
                      const alreadyInProblems = isPotdInProblems ? isPotdInProblems(problem) : false;
                      
                      return (
                        <div
                          key={problem.id}
                          className={`border rounded-lg p-4 ${
                            isDueForReview(problem) 
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                              : 'bg-card'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {problem.url ? (
                                  <a 
                                    href={problem.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-medium hover:underline flex items-center gap-1 truncate"
                                  >
                                    {problem.title}
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="font-medium truncate">{problem.title}</span>
                                )}
                                {problem.isReview && (
                                  <Star className={`h-4 w-4 shrink-0 ${
                                    isDueForReview(problem) ? 'text-blue-500' : 'text-yellow-500'
                                  }`} />
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {problem.platform === 'leetcode' ? 'LeetCode' : 'CodeForces'}
                                </Badge>
                                <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-xs">
                                  {problem.difficulty}
                                </Badge>
                                <Badge variant={problem.status === 'learned' ? 'default' : 'secondary'} className="text-xs">
                                  {problem.status === 'learned' ? 'Learned' : 'Active'}
                                </Badge>
                                {alreadyInProblems && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    In Problems
                                  </Badge>
                                )}
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
                                  Solved: {format(parseISO(problem.dateSolved), 'MMM dd, yyyy')}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {onAddToProblem && (
                                <Button
                                  variant={alreadyInProblems ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => onAddToProblem(problem.id)}
                                  disabled={alreadyInProblems}
                                  className="text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {alreadyInProblems ? 'In Problems' : 'Add to Problems'}
                                </Button>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
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

                                  <DropdownMenuItem onClick={() => onDeleteProblem(problem.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {problem.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground">{problem.notes}</p>
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
