"use client"

import { useState } from 'react';
import { Problem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  Trophy,
  Target,
  Sparkles,
  Edit3,
  Tag,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnhancedReviewDialogProps {
  problem: Problem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: (problemId: string, quality: number, notes?: string, timeTaken?: number, tags?: string[], customDays?: number, moveToLearned?: boolean) => void;
}

// Quality ratings with descriptions
const QUALITY_RATINGS = [
  {
    value: 1,
    label: 'Again',
    icon: ThumbsDown,
    description: 'Couldn\'t solve it',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20',
    borderColor: 'border-red-500/30',
    nextInterval: '1 day'
  },
  {
    value: 2,
    label: 'Hard',
    icon: Target,
    description: 'Struggled significantly',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    nextInterval: '2 days'
  },
  {
    value: 3,
    label: 'Good',
    icon: ThumbsUp,
    description: 'Got it with some effort',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    nextInterval: '3+ days'
  },
  {
    value: 4,
    label: 'Easy',
    icon: Zap,
    description: 'Solved smoothly',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    nextInterval: '7+ days'
  },
  {
    value: 5,
    label: 'Perfect',
    icon: Trophy,
    description: 'Mastered completely',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    nextInterval: '14+ days'
  }
];

export function EnhancedReviewDialog({
  problem,
  open,
  onOpenChange,
  onReview
}: EnhancedReviewDialogProps) {
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [reviewMode, setReviewMode] = useState<'quality' | 'manual'>('quality');
  const [customDays, setCustomDays] = useState<number>(7);
  const [moveToLearned, setMoveToLearned] = useState(false);

  const handleSubmit = () => {
    if (!problem) return;
    
    console.log('📤 EnhancedReviewDialog submitting:', {
      reviewMode,
      selectedQuality,
      moveToLearned,
      customDays
    });
    
    if (reviewMode === 'manual') {
      // Use custom days with a neutral quality score (3)
      onReview(problem.id, 3, notes, timeTaken, quickTags, customDays, moveToLearned);
    } else {
      // Use quality-based system
      // If moveToLearned is checked, allow submission even without quality rating (use default 3)
      if (selectedQuality === null && !moveToLearned) {
        console.warn('⚠️ No quality selected and moveToLearned is false');
        return;
      }
      const qualityToUse = selectedQuality !== null ? selectedQuality : 3;
      console.log('✅ Submitting with quality:', qualityToUse, 'moveToLearned:', moveToLearned);
      onReview(problem.id, qualityToUse, notes, timeTaken, quickTags, undefined, moveToLearned);
    }
    
    // Reset state
    setSelectedQuality(null);
    setNotes('');
    setTimeTaken(0);
    setQuickTags([]);
    setShowQuickActions(false);
    setReviewMode('quality');
    setCustomDays(7);
    setMoveToLearned(false);
    onOpenChange(false);
  };

  const handleQualitySelect = (quality: number) => {
    setSelectedQuality(quality);
    setShowQuickActions(true);
  };

  const toggleTag = (tag: string) => {
    setQuickTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const suggestedTags = [
    'tricky-edge-case',
    'need-revisit',
    'pattern-recognized',
    'optimization-needed',
    'interview-ready'
  ];

  if (!problem) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{problem.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1.5">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getDifficultyColor(problem.difficulty))}
                >
                  {problem.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Repetition: {problem.repetition || 0} • Interval: {problem.interval || 0} days
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Review Mode Selection */}
          <Tabs value={reviewMode} onValueChange={(v) => {
            setReviewMode(v as 'quality' | 'manual');
            // Reset moveToLearned when switching to manual mode
            if (v === 'manual') {
              setMoveToLearned(false);
            }
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quality" className="gap-2">
                <Star className="h-4 w-4" />
                Quality Based
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Calendar className="h-4 w-4" />
                Custom Days
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quality" className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">How did you do?</Label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {QUALITY_RATINGS.map((rating) => {
                  const Icon = rating.icon;
                  const isSelected = selectedQuality === rating.value;
                  
                  return (
                    <button
                      key={rating.value}
                      onClick={() => handleQualitySelect(rating.value)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                        rating.bgColor,
                        rating.borderColor,
                        isSelected && "ring-2 ring-offset-2 ring-offset-background",
                        isSelected ? "scale-105 shadow-lg" : "hover:scale-102"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", rating.color)} />
                      <span className={cn("text-xs font-medium", rating.color)}>
                        {rating.label}
                      </span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
                        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg border text-xs whitespace-nowrap">
                          <p className="font-medium">{rating.description}</p>
                          <p className="text-muted-foreground mt-0.5">Next: {rating.nextInterval}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Review this problem in</Label>
                </div>
                
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-24 text-center text-lg font-semibold"
                  />
                  <span className="text-lg">days</span>
                </div>

                {/* Quick day presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick presets:</Label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 7, 14, 30, 60, 90].map((days) => (
                      <Button
                        key={days}
                        variant={customDays === days ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCustomDays(days);
                          setShowQuickActions(true);
                        }}
                        className="h-8"
                      >
                        {days} {days === 1 ? 'day' : 'days'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Next review date:</strong> {new Date(Date.now() + customDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions (show after quality selected or in manual mode) */}
          {(showQuickActions || reviewMode === 'manual') && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Time Taken */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Time taken (optional)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={timeTaken || ''}
                    onChange={(e) => setTimeTaken(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Quick tags</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={quickTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className="text-xs h-7"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Additional notes</Label>
                </div>
                <Textarea
                  placeholder="What did you learn? Any edge cases to remember?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          {/* Existing Notes */}
          {problem.notes && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Previous Notes</span>
              </div>
              <p className="text-sm text-muted-foreground">{problem.notes}</p>
            </div>
          )}

          {/* Move to Learned Section - Only show if problem is not already learned AND not in manual mode */}
          {problem.status !== 'learned' && reviewMode !== 'manual' && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={moveToLearned}
                  onChange={(e) => setMoveToLearned(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-emerald-500/30 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-500 group-hover:text-emerald-400 transition-colors">
                      Move to Learned
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mark this problem as fully mastered and move it to the Learned section. 
                    You can still review it later if needed.
                  </p>
                </div>
              </label>
            </div>
          )}
          
          {/* Info message when in manual mode */}
          {problem.status !== 'learned' && reviewMode === 'manual' && (
            <div className="p-3 rounded-lg bg-muted/50 border border-muted-foreground/20">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> To move this problem to the Learned section, switch to &quot;Quality Based&quot; mode and check the &quot;Move to Learned&quot; option.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reviewMode === 'quality' && selectedQuality === null && !moveToLearned}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            {moveToLearned && reviewMode === 'quality' && selectedQuality === null
              ? 'Move to Learned'
              : reviewMode === 'manual'
              ? `Review in ${customDays} days`
              : 'Complete Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

