"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Clock, TrendingUp, CheckCircle, Play, Pause } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface LearningPath {
  _id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  difficulty: string;
  topics: string[];
  milestones: {
    id: string;
    title: string;
    description: string;
    requiredProblems: number;
    topics: string[];
    isCompleted: boolean;
    completedAt: string | null;
  }[];
  progress: {
    currentMilestone: number;
    completedMilestones: number;
    totalProblems: number;
    solvedProblems: number;
    startedAt: string;
    estimatedCompletion: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const LearningPathManager = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'interview-prep', label: 'Interview Prep' },
    { value: 'topic-specific', label: 'Topic Specific' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  useEffect(() => {
    loadPaths();
  }, [categoryFilter, difficultyFilter]);

  const loadPaths = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (difficultyFilter) params.append('difficulty', difficultyFilter);

      const response = await fetch(`/api/study/paths?${params}`);
      const data = await response.json();

      if (data.success) {
        setPaths(data.data);
      } else {
        toast.error('Failed to load learning paths');
      }
    } catch (error) {
      console.error('Error loading paths:', error);
      toast.error('Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-purple-100 text-purple-800',
      advanced: 'bg-red-100 text-red-800',
      'interview-prep': 'bg-orange-100 text-orange-800',
      'topic-specific': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const calculateProgress = (path: LearningPath) => {
    if (path.progress.totalProblems === 0) return 0;
    return Math.round((path.progress.solvedProblems / path.progress.totalProblems) * 100);
  };

  const formatDuration = (days: number) => {
    if (days < 7) return `${days} days`;
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Paths
            </CardTitle>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Path
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                {difficulties.map(diff => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading learning paths...</p>
        </div>
      ) : paths.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No learning paths found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first learning path to start your structured journey
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Learning Path
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paths.map((path) => {
            const progress = calculateProgress(path);
            return (
              <Card key={path._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{path.name}</CardTitle>
                        {path.isActive && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {path.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getCategoryColor(path.category)}>
                      {path.category.replace('-', ' ')}
                    </Badge>
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(path.estimatedDuration)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{path.progress.solvedProblems} / {path.progress.totalProblems} problems</span>
                      <span>{path.progress.completedMilestones} / {path.milestones.length} milestones</span>
                    </div>
                  </div>

                  {/* Current Milestone */}
                  {path.progress.currentMilestone < path.milestones.length && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Current Milestone</span>
                      </div>
                      <p className="text-sm text-blue-800">
                        {path.milestones[path.progress.currentMilestone]?.title}
                      </p>
                    </div>
                  )}

                  {/* Topics */}
                  <div>
                    <div className="text-sm font-medium mb-2">Topics Covered</div>
                    <div className="flex flex-wrap gap-1">
                      {path.topics.slice(0, 4).map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {path.topics.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{path.topics.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(path.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        {path.isActive ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Path Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create Learning Path - Implementation Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Learning path creation form will be implemented next.
              </p>
              <Button onClick={() => setShowCreateModal(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LearningPathManager;
