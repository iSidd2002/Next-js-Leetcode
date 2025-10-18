'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Zap, Link2 } from 'lucide-react';

interface Prerequisite {
  title: string;
  difficulty: string;
  reason: string;
  estimatedTime: number;
}

interface SimilarProblem {
  title: string;
  tags: string[];
  reason: string;
  url?: string;
  platform?: string;
}

interface Microtask {
  title: string;
  description: string;
  duration: number;
}

interface SuggestionPanelProps {
  suggestions: {
    prerequisites: Prerequisite[];
    similarProblems: SimilarProblem[];
    microtasks: Microtask[];
    failureReason?: string;
    confidence?: number;
    [key: string]: any; // Allow additional properties
  };
  onAddToTodos?: (task: any) => void;
  failureReason?: string;
  confidence?: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  suggestions,
  onAddToTodos,
  failureReason,
  confidence,
}) => {
  return (
    <div className="space-y-6">
      {/* Header with failure reason */}
      {failureReason && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                Why you struggled:
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-300">{failureReason}</p>
              {confidence && (
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  Analysis confidence: {(confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            📚 Prerequisites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.prerequisites.length > 0 ? (
            suggestions.prerequisites.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:bg-accent/50 transition">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{item.reason}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getDifficultyColor(item.difficulty)}>
                        {item.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ⏱️ {item.estimatedTime} min
                      </Badge>
                    </div>
                  </div>
                  {onAddToTodos && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onAddToTodos({
                          title: item.title,
                          description: item.reason,
                          estimatedTime: item.estimatedTime,
                          category: 'study',
                        })
                      }
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No prerequisites suggested</p>
          )}
        </CardContent>
      </Card>

      {/* Similar Problems - ENHANCED: 5-6 problems with mixed difficulties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-purple-500" />
            🔗 Similar Problems ({suggestions.similarProblems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.similarProblems.length > 0 ? (
            <>
              {/* Group by difficulty */}
              {['Easy', 'Medium', 'Hard'].map((diffLevel) => {
                const problemsAtLevel = suggestions.similarProblems.filter((p) =>
                  p.tags.includes(diffLevel)
                );

                if (problemsAtLevel.length === 0) return null;

                return (
                  <div key={diffLevel} className="space-y-2">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {diffLevel} Level
                    </h5>
                    {problemsAtLevel.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-accent/50 transition">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mb-3">{item.reason}</p>
                            <div className="flex gap-2 flex-wrap items-center">
                              {/* Difficulty Badge */}
                              <Badge className={getDifficultyColor(diffLevel)}>
                                {diffLevel}
                              </Badge>

                              {/* Concept Tags */}
                              {item.tags
                                .filter((tag) => !['Easy', 'Medium', 'Hard'].includes(tag))
                                .map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}

                              {/* Platform Badge */}
                              {item.platform && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {item.platform}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                              >
                                <Link2 className="h-3 w-3" />
                                Open
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No similar problems suggested</p>
          )}
        </CardContent>
      </Card>

      {/* Microtasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            ⚡ Microtasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.microtasks.length > 0 ? (
            suggestions.microtasks.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:bg-accent/50 transition">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <Badge variant="outline" className="text-xs">
                      ⏱️ {item.duration} min
                    </Badge>
                  </div>
                  {onAddToTodos && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onAddToTodos({
                          title: item.title,
                          description: item.description,
                          estimatedTime: item.duration,
                          category: 'study',
                        })
                      }
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No microtasks suggested</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

