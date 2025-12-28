"use client"

import { useState, useEffect, useMemo } from 'react';
import type { Problem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MultiSelect, type Option } from '@/components/ui/multi-select';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeSnippetEditor } from './CodeSnippetEditor';
import { leetcodeTopics, codeforcesTopics } from '@/lib/topics';
import { companies } from '@/lib/companies';
import { Code2, FileText, Brain } from 'lucide-react';
import { TagInput } from '@/components/ui/tag-input';
import { Textarea } from '@/components/ui/textarea';

interface ProblemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProblem: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  problemToEdit: Problem | null;
}

type FormData = Omit<Problem, 'id' | 'createdAt' | 'problemId'>;

const INITIAL_FORM_STATE: FormData = {
  platform: 'leetcode',
  title: '',
  difficulty: '',
  url: '',
  dateSolved: new Date().toISOString().split('T')[0],
  notes: '',
  isReview: false,
  topics: [],
  companies: [],
  status: 'active',
  repetition: 0,
  interval: 0,
  nextReviewDate: null,
  codeSnippet: '',
  codeLanguage: 'javascript',
  codeFilename: 'solution',
  source: 'manual',
  // Enhanced tracking fields
  subPatterns: [],
  struggles: [],
  learnings: [],
  solutionSummary: '',
  timeComplexity: '',
  spaceComplexity: '',
};


const ProblemForm = ({ open, onOpenChange, onAddProblem, onUpdateProblem, problemToEdit }: ProblemFormProps) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);

  useEffect(() => {
    if (problemToEdit) {
      setFormData({
        ...problemToEdit,
        companies: problemToEdit.companies || [],
        dateSolved: problemToEdit.dateSolved ? problemToEdit.dateSolved.split('T')[0] : new Date().toISOString().split('T')[0],
        // Enhanced tracking fields
        subPatterns: problemToEdit.subPatterns || [],
        struggles: problemToEdit.struggles || [],
        learnings: problemToEdit.learnings || [],
        solutionSummary: problemToEdit.solutionSummary || '',
        timeComplexity: problemToEdit.timeComplexity || '',
        spaceComplexity: problemToEdit.spaceComplexity || '',
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [problemToEdit, open]);

  const topicOptions = useMemo<Option[]>(() => {
    const topics = formData.platform === 'leetcode' ? leetcodeTopics : codeforcesTopics;
    return topics.map(topic => ({ label: topic, value: topic }));
  }, [formData.platform]);

  const companyOptions = useMemo<Option[]>(() => {
    return companies.map(company => ({ label: company, value: company }));
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    if (name === 'platform') {
        setFormData(prev => ({ ...prev, platform: value as 'leetcode' | 'codeforces' | 'atcoder', difficulty: '', topics: [] }));
    } else if (name === 'topics') {
        setFormData(prev => ({ ...prev, topics: value as string[] }));
    } else if (name === 'companies') {
        setFormData(prev => ({ ...prev, companies: value as string[] }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value as string }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.difficulty.trim()) {
      alert('Please fill in the title and difficulty fields');
      return;
    }

    const problemData = {
      ...formData,
      title: formData.title.trim(),
      problemId: formData.title.trim().toLowerCase().replace(/\s+/g, '-'),
      url: formData.url.trim() || '', // Ensure URL is always a string
    };

    // Debug: Log code snippet data
    console.log('📝 Submitting problem with code snippet:', {
      hasCode: !!problemData.codeSnippet,
      codeLength: problemData.codeSnippet?.length || 0,
      language: problemData.codeLanguage,
      filename: problemData.codeFilename
    });

    if (problemToEdit) {
      onUpdateProblem(problemToEdit.id, problemData);
    } else {
      onAddProblem(problemData);
    }

    onOpenChange(false);
  };

  const isEditing = !!problemToEdit && !!problemToEdit.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Problem' : 'Add New Problem'}</DialogTitle>
          {/* DialogDescription removed as per new_code */}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2">
                <Brain className="h-4 w-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code2 className="h-4 w-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select name="platform" onValueChange={(value: string) => handleSelectChange('platform', value)} value={formData.platform}>
              <SelectTrigger id="platform" data-testid="platform-select">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leetcode">LeetCode</SelectItem>
                <SelectItem value="codeforces">CodeForces</SelectItem>
                <SelectItem value="atcoder">AtCoder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Problem Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Two Sum"
              data-testid="title-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">{formData.platform === 'leetcode' ? 'Difficulty' : 'Rating'} *</Label>
            {formData.platform === 'leetcode' ? (
              <Select name="difficulty" onValueChange={(value: string) => handleSelectChange('difficulty', value)} value={formData.difficulty}>
                <SelectTrigger id="difficulty" data-testid="difficulty-select">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="difficulty"
                type="number"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                placeholder="800"
                min={800}
                max={3500}
                step={100}
                data-testid="difficulty-input"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://leetcode.com/problems/two-sum/"
              data-testid="url-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateSolved">Date Solved *</Label>
            <Input
                type="date"
                id="dateSolved"
                name="dateSolved"
                value={formData.dateSolved}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                data-testid="date-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <MarkdownEditor
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              data-testid="notes-editor"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topics">Topics</Label>
            <MultiSelect
                options={topicOptions}
                onValueChange={(value) => handleSelectChange('topics', value)}
                value={formData.topics}
                placeholder="Select topics"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companies">Company Tags</Label>
            <MultiSelect
                options={companyOptions}
                onValueChange={(value) => handleSelectChange('companies', value)}
                value={formData.companies}
                placeholder="Select companies"
            />
          </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                    id="isReview"
                    name="isReview"
                    checked={formData.isReview}
                    onCheckedChange={(checked: boolean) => setFormData(prev => ({...prev, isReview: checked}))}
                />
                <Label htmlFor="isReview" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Mark for review later
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4 mt-4">
              {/* Solution Summary */}
              <div className="space-y-2">
                <Label htmlFor="solutionSummary">Solution Summary</Label>
                <Textarea
                  id="solutionSummary"
                  name="solutionSummary"
                  value={formData.solutionSummary || ''}
                  onChange={handleInputChange}
                  placeholder="Brief 1-2 sentence summary of your approach in your own words..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Explain the solution approach in your own words</p>
              </div>

              {/* Time & Space Complexity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeComplexity">Time Complexity</Label>
                  <Input
                    id="timeComplexity"
                    name="timeComplexity"
                    value={formData.timeComplexity || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., O(n), O(n log n)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spaceComplexity">Space Complexity</Label>
                  <Input
                    id="spaceComplexity"
                    name="spaceComplexity"
                    value={formData.spaceComplexity || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., O(1), O(n)"
                  />
                </div>
              </div>

              {/* Sub-Patterns */}
              <div className="space-y-2">
                <Label>Sub-Patterns</Label>
                <TagInput
                  value={formData.subPatterns || []}
                  onChange={(tags) => setFormData(prev => ({ ...prev, subPatterns: tags }))}
                  placeholder="e.g., Monotonic Stack, Sliding Window Max..."
                  maxTags={10}
                />
                <p className="text-xs text-muted-foreground">Specific patterns within broader topics (e.g., &quot;Monotonic Stack&quot; under Stack)</p>
              </div>

              {/* Struggles */}
              <div className="space-y-2">
                <Label>What I Struggled With</Label>
                <TagInput
                  value={formData.struggles || []}
                  onChange={(tags) => setFormData(prev => ({ ...prev, struggles: tags }))}
                  placeholder="e.g., Edge cases, Time optimization..."
                  maxTags={10}
                />
                <p className="text-xs text-muted-foreground">Record what was difficult about this problem</p>
              </div>

              {/* Learnings */}
              <div className="space-y-2">
                <Label>Key Learnings</Label>
                <TagInput
                  value={formData.learnings || []}
                  onChange={(tags) => setFormData(prev => ({ ...prev, learnings: tags }))}
                  placeholder="e.g., Two pointer technique, HashMap for O(1) lookup..."
                  maxTags={10}
                />
                <p className="text-xs text-muted-foreground">What new things you learned from solving this</p>
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-4">
              <CodeSnippetEditor
                initialCode={formData.codeSnippet || ''}
                initialLanguage={formData.codeLanguage || 'javascript'}
                initialFilename={formData.codeFilename || 'solution'}
                onChange={(code, language, filename) => {
                  setFormData(prev => ({
                    ...prev,
                    codeSnippet: code,
                    codeLanguage: language,
                    codeFilename: filename
                  }));
                }}
                onSave={(code, language, filename) => {
                  setFormData(prev => ({
                    ...prev,
                    codeSnippet: code,
                    codeLanguage: language,
                    codeFilename: filename
                  }));
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Problem' : 'Add Problem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProblemForm;
