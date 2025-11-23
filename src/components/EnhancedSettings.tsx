"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getReviewIntervals, saveReviewIntervals } from '@/utils/settingsStorage';
import { toast } from 'sonner';
import { X, Plus, Zap, Target, Brain, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface EnhancedSettingsProps {
  children?: React.ReactNode;
  onSettingsSave: (intervals: number[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Preset interval schemes
const INTERVAL_PRESETS = [
  {
    id: 'aggressive',
    name: 'Aggressive',
    icon: Zap,
    description: 'Faster intervals for quick mastery',
    intervals: [1, 2, 4, 7, 14, 21, 30, 60],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    recommended: 'Best for: Upcoming interviews, intensive prep'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    icon: Target,
    description: 'Optimal balance for steady learning',
    intervals: [1, 3, 7, 14, 30, 60, 90, 180],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    recommended: 'Best for: Regular practice, sustainable learning'
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    icon: Brain,
    description: 'Longer intervals for deep retention',
    intervals: [2, 5, 10, 20, 40, 80, 120, 240],
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    recommended: 'Best for: Long-term learning, less time pressure'
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: Sparkles,
    description: 'Design your own perfect schedule',
    intervals: [],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    recommended: 'Best for: Advanced users, specific needs'
  }
];

export function EnhancedSettings({ children, onSettingsSave, open: controlledOpen, onOpenChange: controlledOnOpenChange }: EnhancedSettingsProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [intervals, setIntervals] = useState<number[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  useEffect(() => {
    if (open) {
      const currentIntervals = getReviewIntervals();
      setIntervals(currentIntervals);
      
      // Detect which preset matches current intervals
      const matchingPreset = INTERVAL_PRESETS.find(
        preset => JSON.stringify(preset.intervals) === JSON.stringify(currentIntervals)
      );
      if (matchingPreset) {
        setSelectedPreset(matchingPreset.id);
        setActiveTab('presets');
      } else {
        setSelectedPreset('custom');
        setActiveTab('custom');
      }
    }
  }, [open]);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = INTERVAL_PRESETS.find(p => p.id === presetId);
    if (preset && preset.intervals.length > 0) {
      setIntervals(preset.intervals);
    } else if (presetId === 'custom') {
      setActiveTab('custom');
    }
  };

  const handleIntervalChange = (index: number, value: string) => {
    const newIntervals = [...intervals];
    newIntervals[index] = Number(value);
    setIntervals(newIntervals);
    setSelectedPreset('custom');
  };

  const handleAddInterval = () => {
    const lastInterval = intervals[intervals.length - 1] || 0;
    setIntervals([...intervals, lastInterval * 2 || 1]);
    setSelectedPreset('custom');
  };

  const handleRemoveInterval = (index: number) => {
    const newIntervals = intervals.filter((_, i) => i !== index);
    setIntervals(newIntervals);
    setSelectedPreset('custom');
  };

  const handleSave = () => {
    if (intervals.length === 0) {
      toast.error('Please add at least one interval.');
      return;
    }
    if (intervals.some(i => i <= 0)) {
      toast.error('Intervals must be positive numbers.');
      return;
    }
    saveReviewIntervals(intervals);
    onSettingsSave(intervals);
    
    const presetName = INTERVAL_PRESETS.find(p => p.id === selectedPreset)?.name || 'Custom';
    toast.success(`Saved ${presetName} intervals!`);
    setOpen(false);
  };

  const getIntervalSummary = () => {
    if (intervals.length === 0) return 'No intervals set';
    return intervals.map(i => `${i}d`).join(' → ');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Spaced Repetition Settings</DialogTitle>
          <DialogDescription>
            Choose a preset or customize your review intervals for optimal learning
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'presets' | 'custom')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4 mt-4">
            <div className="grid gap-3">
              {INTERVAL_PRESETS.filter(p => p.id !== 'custom').map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;

                return (
                  <Card
                    key={preset.id}
                    className={cn(
                      "relative p-4 cursor-pointer transition-all hover:shadow-md",
                      preset.bgColor,
                      preset.borderColor,
                      "border",
                      isSelected && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    )}
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2.5 rounded-lg", preset.bgColor, "border", preset.borderColor)}>
                        <Icon className={cn("h-5 w-5", preset.color)} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className={cn("font-semibold", preset.color)}>{preset.name}</h3>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded border">
                            {preset.intervals.map(i => `${i}d`).join(' → ')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-2">{preset.recommended}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Preview */}
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
              <h4 className="text-sm font-semibold mb-2">Preview Timeline</h4>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {intervals.map((interval, index) => (
                  <div key={index} className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-center">
                      <div className="h-8 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">{interval}d</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">R{index + 1}</span>
                    </div>
                    {index < intervals.length - 1 && (
                      <div className="h-px w-4 bg-border" />
                    )}
                  </div>
                ))}
                <div className="text-xs text-muted-foreground ml-2">→ Mastered</div>
              </div>
            </div>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Custom Intervals (in days)</Label>
              <p className="text-sm text-muted-foreground">
                Define your own review schedule. Each interval represents days until next review.
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {intervals.map((interval, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-12">
                      Day {index === 0 ? interval : intervals.slice(0, index + 1).reduce((a, b) => a + b, 0)}
                    </span>
                    <Input
                      type="number"
                      value={interval}
                      onChange={(e) => handleIntervalChange(index, e.target.value)}
                      min={1}
                      className="flex-1"
                      placeholder="Days"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInterval(index)}
                      disabled={intervals.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddInterval}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Interval
              </Button>
            </div>

            {/* Visualization */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="text-sm font-semibold mb-3">Your Custom Schedule</h4>
              <div className="space-y-2">
                {intervals.map((interval, index) => {
                  const totalDays = intervals.slice(0, index + 1).reduce((a, b) => a + b, 0);
                  return (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span className="font-mono w-20 text-muted-foreground">
                        Review {index + 1}:
                      </span>
                      <div className="flex-1 h-2 bg-primary/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(interval / Math.max(...intervals)) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium w-16 text-right">{interval} days</span>
                      <span className="text-xs text-muted-foreground w-24 text-right">
                        (Day {totalDays})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="text-sm text-muted-foreground">
            {intervals.length} intervals • {getIntervalSummary()}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

