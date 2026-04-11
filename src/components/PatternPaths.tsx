"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ExternalLink,
  CheckCircle2, Route, Edit2, BookOpen, X, Layers,
  Bookmark, GraduationCap, Check,
} from 'lucide-react';
import type { StudyPath, StudyPathProblem } from '@/types';
import StorageService from '@/utils/storage';
import { toast } from 'sonner';

// ─── localStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'pattern-paths';

function loadPaths(): StudyPath[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePaths(paths: StudyPath[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch {}
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50   text-amber-700   border-amber-200',
  Hard:   'bg-rose-50    text-rose-700    border-rose-200',
};

function detectPlatform(url: string): 'leetcode' | 'codeforces' | 'atcoder' {
  if (url.includes('codeforces.com')) return 'codeforces';
  if (url.includes('atcoder.jp')) return 'atcoder';
  return 'leetcode';
}

const emptyProblem = (): StudyPathProblem => ({
  id: genId(),
  title: '',
  url: '',
  difficulty: '',
  notes: '',
  completed: false,
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function PatternPaths() {
  const [paths, setPaths] = useState<StudyPath[]>(() => loadPaths());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<StudyPath | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProblems, setFormProblems] = useState<StudyPathProblem[]>([]);

  // ── Dialog helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingPath(null);
    setFormName('');
    setFormTopic('');
    setFormDesc('');
    setFormProblems([]);
    setDialogOpen(true);
  };

  const openEdit = (path: StudyPath) => {
    setEditingPath(path);
    setFormName(path.name);
    setFormTopic(path.topic);
    setFormDesc(path.description);
    setFormProblems(path.problems.map(p => ({ ...p })));
    setDialogOpen(true);
  };

  // ── Form problem helpers ────────────────────────────────────────────────────

  const addFormProblem = () => setFormProblems(prev => [...prev, emptyProblem()]);

  const updateFormProblem = (id: string, patch: Partial<StudyPathProblem>) =>
    setFormProblems(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));

  const removeFormProblem = (id: string) =>
    setFormProblems(prev => prev.filter(p => p.id !== id));

  const moveFormProblem = (id: string, dir: 'up' | 'down') => {
    setFormProblems(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  // ── Save / Delete ───────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!formName.trim() || !formTopic.trim()) return;
    const validProblems = formProblems.filter(p => p.title.trim());
    const now = new Date().toISOString();

    let updated: StudyPath[];
    if (editingPath) {
      updated = paths.map(p =>
        p.id === editingPath.id
          ? { ...p, name: formName.trim(), topic: formTopic.trim(), description: formDesc.trim(), problems: validProblems, updatedAt: now }
          : p
      );
    } else {
      const newPath: StudyPath = {
        id: genId(),
        name: formName.trim(),
        topic: formTopic.trim(),
        description: formDesc.trim(),
        problems: validProblems,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newPath, ...paths];
    }

    setPaths(updated);
    savePaths(updated);
    setDialogOpen(false);
  };

  const deletePath = (id: string) => {
    const updated = paths.filter(p => p.id !== id);
    setPaths(updated);
    savePaths(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const pushToTracker = async (
    prob: StudyPathProblem,
    mode: 'review' | 'learned'
  ) => {
    if (!prob.url) {
      toast.error('Add a URL to this problem first');
      return;
    }
    try {
      await StorageService.addProblem({
        platform: detectPlatform(prob.url),
        title: prob.title,
        problemId: prob.title.toLowerCase().replace(/\s+/g, '-'),
        difficulty: prob.difficulty || 'Medium',
        url: prob.url,
        dateSolved: new Date().toISOString(),
        notes: prob.notes || '',
        isReview: mode === 'review',
        status: mode === 'learned' ? 'learned' : 'active',
        repetition: 0,
        interval: 0,
        nextReviewDate: null,
        topics: [],
        companies: [],
        source: 'manual',
      });
      toast.success(
        mode === 'review'
          ? `"${prob.title}" added to Review`
          : `"${prob.title}" added to Learned`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('already exists') || msg.includes('409')) {
        toast.info(`"${prob.title}" is already in your tracker`);
      } else {
        toast.error('Failed to add problem to tracker');
      }
    }
  };

  const toggleProblem = (pathId: string, problemId: string) => {
    const updated = paths.map(p =>
      p.id !== pathId ? p : {
        ...p,
        updatedAt: new Date().toISOString(),
        problems: p.problems.map(prob =>
          prob.id === problemId ? { ...prob, completed: !prob.completed } : prob
        ),
      }
    );
    setPaths(updated);
    savePaths(updated);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Route className="h-6 w-6 text-violet-500" />
            Pattern Paths
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Group problems by pattern and follow the order to build intuition step by step.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Path
        </Button>
      </div>

      {/* ── Empty state ── */}
      {paths.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Pattern Paths Yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Create a path for a pattern like <span className="font-medium">"Two Pointers"</span> and
            add problems to solve in order — step by step.
          </p>
          <Button onClick={openCreate} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Path
          </Button>
        </div>
      )}

      {/* ── Path cards ── */}
      <div className="grid gap-5">
        {paths.map(path => {
          const completedCount = path.problems.filter(p => p.completed).length;
          const total = path.problems.length;
          const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
          const isExpanded = expandedId === path.id;

          return (
            <Card
              key={path.id}
              className="overflow-hidden border-border/60 hover:border-border/90 transition-colors"
            >
              {/* Card header */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base leading-snug">{path.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal text-violet-600 border-violet-200 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400"
                      >
                        {path.topic}
                      </Badge>
                    </div>
                    {path.description && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {path.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => openEdit(path)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deletePath(path.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{completedCount} / {total} solved</span>
                      <span className={pct === 100 ? 'text-emerald-600 font-medium' : ''}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardHeader>

              {/* Problem list */}
              {total > 0 && (
                <CardContent className="pt-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : path.id)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3 transition-colors"
                  >
                    <BookOpen className="h-3 w-3" />
                    {isExpanded ? 'Hide' : 'Show'} {total} problem{total !== 1 ? 's' : ''}
                  </button>

                  {isExpanded && (
                    <div className="relative pl-1">
                      {/* Vertical spine */}
                      {total > 1 && (
                        <div className="absolute left-[18px] top-5 bottom-5 w-px bg-border/70" />
                      )}

                      <div className="space-y-2">
                        {path.problems.map((prob, idx) => (
                          <div key={prob.id} className="relative flex items-start gap-3">
                            {/* Step bubble */}
                            <button
                              onClick={() => toggleProblem(path.id, prob.id)}
                              className="relative z-10 shrink-0 mt-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                              title={prob.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {prob.completed ? (
                                <CheckCircle2 className="h-[22px] w-[22px] text-violet-500" />
                              ) : (
                                <div className="h-[22px] w-[22px] rounded-full border-2 border-muted-foreground/40 bg-background flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-muted-foreground leading-none">
                                    {idx + 1}
                                  </span>
                                </div>
                              )}
                            </button>

                            {/* Problem card */}
                            <div
                              className={`flex-1 rounded-lg border px-3 py-2.5 transition-colors ${
                                prob.completed
                                  ? 'bg-muted/40 border-border/30'
                                  : 'bg-card border-border/60 hover:border-border'
                              }`}
                            >
                              {/* Title row */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {prob.url ? (
                                  <a
                                    href={prob.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm font-medium hover:underline flex items-center gap-1 ${
                                      prob.completed ? 'line-through text-muted-foreground' : ''
                                    }`}
                                  >
                                    {prob.title}
                                    <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                                  </a>
                                ) : (
                                  <span
                                    className={`text-sm font-medium ${
                                      prob.completed ? 'line-through text-muted-foreground' : ''
                                    }`}
                                  >
                                    {prob.title}
                                  </span>
                                )}

                                {prob.difficulty && (
                                  <span
                                    className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${DIFFICULTY_STYLES[prob.difficulty] ?? ''}`}
                                  >
                                    {prob.difficulty}
                                  </span>
                                )}
                              </div>

                              {prob.notes && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                  {prob.notes}
                                </p>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40">
                                {/* Done toggle */}
                                <button
                                  onClick={() => toggleProblem(path.id, prob.id)}
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                                    prob.completed
                                      ? 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300'
                                      : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                                  }`}
                                >
                                  <Check className="h-3 w-3" />
                                  {prob.completed ? 'Done' : 'Mark Done'}
                                </button>

                                {/* Push to Review */}
                                <button
                                  onClick={() => pushToTracker(prob, 'review')}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                                >
                                  <Bookmark className="h-3 w-3" />
                                  Add to Review
                                </button>

                                {/* Push to Learned */}
                                <button
                                  onClick={() => pushToTracker(prob, 'learned')}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                                >
                                  <GraduationCap className="h-3 w-3" />
                                  Add to Learned
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPath ? 'Edit Pattern Path' : 'Create Pattern Path'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Pattern + Topic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Pattern Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Two Pointers"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Topic <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Arrays, Sliding Window"
                  value={formTopic}
                  onChange={e => setFormTopic(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                placeholder="What will you learn? e.g. 'Master the shrink/expand technique on sorted arrays'"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                rows={2}
              />
            </div>

            {/* Problems */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Problems{' '}
                  <span className="text-muted-foreground text-xs font-normal">— in the order to solve them</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFormProblem}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Add Problem
                </Button>
              </div>

              {formProblems.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                  Click <span className="font-medium">"Add Problem"</span> to build your learning sequence
                </div>
              )}

              <div className="space-y-3">
                {formProblems.map((prob, idx) => (
                  <div
                    key={prob.id}
                    className="border rounded-lg p-3 space-y-2 bg-muted/20"
                  >
                    {/* Row 1: number + title + difficulty + controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <Input
                        placeholder="Problem title *"
                        value={prob.title}
                        onChange={e => updateFormProblem(prob.id, { title: e.target.value })}
                        className="flex-1 h-8 text-sm"
                      />
                      <Select
                        value={prob.difficulty || 'none'}
                        onValueChange={v => updateFormProblem(prob.id, { difficulty: (v === 'none' ? '' : v) as StudyPathProblem['difficulty'] })}
                      >
                        <SelectTrigger className="w-[90px] h-8 text-xs">
                          <SelectValue placeholder="Diff" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-0.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveFormProblem(prob.id, 'up')}
                          disabled={idx === 0}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveFormProblem(prob.id, 'down')}
                          disabled={idx === formProblems.length - 1}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeFormProblem(prob.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Row 2: URL + notes */}
                    <div className="flex gap-2 pl-7">
                      <Input
                        placeholder="URL (optional)"
                        value={prob.url}
                        onChange={e => updateFormProblem(prob.id, { url: e.target.value })}
                        className="flex-1 h-7 text-xs"
                      />
                      <Input
                        placeholder="Notes / hint (optional)"
                        value={prob.notes}
                        onChange={e => updateFormProblem(prob.id, { notes: e.target.value })}
                        className="flex-1 h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formName.trim() || !formTopic.trim()}
            >
              {editingPath ? 'Save Changes' : 'Create Path'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
