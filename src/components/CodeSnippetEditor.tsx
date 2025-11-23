"use client"

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CodeSnippetViewer } from './CodeSnippetViewer';
import { Code2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeSnippetEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  initialFilename?: string;
  onSave?: (code: string, language: string, filename: string) => void;
  onChange?: (code: string, language: string, filename: string) => void;
  className?: string;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
];

const CODE_TEMPLATES = {
  javascript: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
  python: `def two_sum(nums, target):
    seen = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return []`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            
            map.put(nums[i], i);
        }
        
        return new int[] {};
    }
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            
            map[nums[i]] = i;
        }
        
        return {};
    }
};`,
};

export function CodeSnippetEditor({
  initialCode = '',
  initialLanguage = 'javascript',
  initialFilename = 'solution',
  onSave,
  onChange,
  className
}: CodeSnippetEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [filename, setFilename] = useState(initialFilename);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(code, language, filename);
      toast.success('Code snippet saved! ✨');
    }
  };

  const loadTemplate = () => {
    const template = CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES];
    if (template) {
      setCode(template);
      onChange?.(template, language, filename);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Code Snippet</h3>
            <p className="text-xs text-muted-foreground">Add your beautiful solution</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {!showPreview ? (
        /* Editor Mode */
        <div className="space-y-4">
          {/* Language and filename */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={language} 
                onValueChange={(val) => {
                  setLanguage(val);
                  onChange?.(code, val, filename);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filename</Label>
              <Input
                value={filename}
                onChange={(e) => {
                  setFilename(e.target.value);
                  onChange?.(code, language, e.target.value);
                }}
                placeholder="solution"
              />
            </div>
          </div>

          {/* Code editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Code</Label>
              {CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadTemplate}
                  className="h-7 text-xs gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Load Template
                </Button>
              )}
            </div>
            <Textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                onChange?.(e.target.value, language, filename);
              }}
              placeholder="Paste your solution here..."
              className="font-mono text-sm min-h-[300px] resize-none"
            />
          </div>

          {/* Actions */}
          {onSave && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={!code.trim()}>
                Save Snippet
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Preview Mode */
        <div className="space-y-4">
          {code ? (
            <>
              <CodeSnippetViewer
                code={code}
                language={language}
                filename={filename}
                showLineNumbers={true}
              />
              {onSave && (
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    Save Snippet
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="border border-dashed border-white/10 rounded-xl p-12 text-center">
              <Code2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No code to preview</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Switch to edit mode to add your code
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

