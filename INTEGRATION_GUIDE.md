# Integration Guide: LLM-Failure Feature

## Quick Start

This guide shows how to integrate the LLM-Failure feature into your existing UI components.

---

## 1. Add Suggestion State to Your Component

```typescript
import { useState } from 'react';
import { SuggestionPanel } from '@/components/SuggestionPanel';

export default function ReviewTab() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ... rest of component
}
```

---

## 2. Create Function to Fetch Suggestions

```typescript
const handleGenerateSuggestions = async (problem: Problem, transcript: string) => {
  try {
    setIsLoadingSuggestions(true);
    setSelectedProblem(problem);

    const response = await fetch(`/api/problems/${problem.id}/llm-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        userFinalStatus: 'unsolved',
        code: problem.code, // if available
        problemDescription: problem.title,
      }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      setSuggestions(data.data);
      setShowSuggestions(true);
      toast.success('Suggestions generated!');
    } else {
      toast.info(data.reason || 'No suggestions available');
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    toast.error('Failed to generate suggestions');
  } finally {
    setIsLoadingSuggestions(false);
  }
};
```

---

## 3. Add Button to Problem Row

In your `ProblemList.tsx` or similar component:

```typescript
<Button
  size="sm"
  variant="outline"
  onClick={() => handleGenerateSuggestions(problem, userTranscript)}
  disabled={isLoadingSuggestions}
  className="gap-2"
>
  {isLoadingSuggestions ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Lightbulb className="h-4 w-4" />
      Get Suggestions
    </>
  )}
</Button>
```

---

## 4. Display Suggestions Modal/Drawer

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// In your JSX:
<Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        Suggestions for {selectedProblem?.title}
      </DialogTitle>
    </DialogHeader>
    {suggestions && (
      <SuggestionPanel
        suggestions={suggestions}
        failureReason={suggestions.failureReason}
        confidence={suggestions.confidence}
        onAddToTodos={(task) => handleAddTodo(task)}
      />
    )}
  </DialogContent>
</Dialog>
```

---

## 5. Handle "Add to Todos"

```typescript
const handleAddTodo = async (task: any) => {
  try {
    const newTodo: Todo = {
      id: generateId(),
      title: task.title,
      description: task.description,
      estimatedTime: task.estimatedTime,
      category: 'study',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to your todos state/database
    await StorageService.addTodo(newTodo);
    setTodos([...todos, newTodo]);
    toast.success('Added to Todos!');
  } catch (error) {
    toast.error('Failed to add todo');
  }
};
```

---

## 6. Retrieve Cached Suggestions

```typescript
const handleViewCachedSuggestions = async (problem: Problem) => {
  try {
    const response = await fetch(
      `/api/problems/${problem.id}/suggestions?userId=${currentUser.id}`
    );

    const data = await response.json();

    if (data.success) {
      setSuggestions(data.data.suggestions);
      setShowSuggestions(true);
      toast.success('Loaded cached suggestions');
    } else {
      toast.info('No cached suggestions found');
    }
  } catch (error) {
    console.error('Error retrieving suggestions:', error);
    toast.error('Failed to retrieve suggestions');
  }
};
```

---

## 7. Add Badge for Available Suggestions

```typescript
// In your problem row:
{problem.hasSuggestions && (
  <Badge variant="secondary" className="gap-1">
    <Lightbulb className="h-3 w-3" />
    Suggestions Available
  </Badge>
)}
```

---

## Complete Example Component

```typescript
'use client';

import { useState } from 'react';
import { Problem, Todo } from '@/types';
import { SuggestionPanel } from '@/components/SuggestionPanel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProblemRowProps {
  problem: Problem;
  onAddTodo: (todo: Todo) => void;
}

export function ProblemRow({ problem, onAddTodo }: ProblemRowProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/problems/${problem.id}/llm-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: 'User attempted but could not solve',
          userFinalStatus: 'unsolved',
          problemDescription: problem.title,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSuggestions(data.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleGenerateSuggestions}
        disabled={isLoading}
        size="sm"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Lightbulb />}
        Suggestions
      </Button>

      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suggestions for {problem.title}</DialogTitle>
          </DialogHeader>
          {suggestions && (
            <SuggestionPanel
              suggestions={suggestions}
              onAddToTodos={onAddTodo}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## API Response Format

### Success Response:
```json
{
  "success": true,
  "data": {
    "prerequisites": [...],
    "similarProblems": [...],
    "microtasks": [...]
  },
  "failureReason": "Missing understanding of dynamic programming",
  "confidence": 0.85
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check authentication token |
| 404 Problem not found | Verify problem ID exists |
| LLM API error | Check GEMINI_API_KEY in .env |
| Suggestions not cached | Check MongoDB connection |
| Expired suggestions | Suggestions auto-delete after 30 days |

---

## Performance Tips

1. **Cache aggressively**: Suggestions are cached for 30 days
2. **Batch requests**: Generate suggestions for multiple problems at once
3. **Lazy load**: Only fetch suggestions when user requests them
4. **Debounce**: Prevent rapid successive requests

---

**Ready to integrate!** 🚀

