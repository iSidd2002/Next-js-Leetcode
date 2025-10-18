# 🎓 How to Use the LLM Feature - Complete Guide

## Overview

The LLM feature automatically generates personalized learning suggestions when a user fails to solve a problem. Here's how to use it:

---

## 🎯 User Perspective (How Users Will Use It)

### Step 1: Attempt a Problem
- User clicks on a problem in the "Problems" tab
- Attempts to solve it using the in-app LLM or manually

### Step 2: Mark as Unsolved
- After attempting, user marks the problem as **"unsolved"**
- System automatically triggers suggestion generation

### Step 3: View Suggestions
- A modal/panel appears showing 3 categories:
  - **📚 Prerequisites** - Simpler concept drills
  - **🔗 Similar Problems** - Related problems to practice
  - **⚡ Microtasks** - Targeted learning tasks

### Step 4: Add to Todos (Optional)
- User can click "Add" on any suggestion
- Suggestion gets added to their Todos list
- User can work through suggestions at their own pace

---

## 👨‍💻 Developer Perspective (How to Integrate)

### Option 1: Add to Review Tab (Recommended)

**File**: `src/app/page.tsx`

Find the Review tab section and add a button:

```typescript
// In the Review tab content (around line 1199)
<TabsContent value="review" className="space-y-6">
  <div className="rounded-lg border bg-card">
    <ProblemList
      problems={reviewProblems}
      onUpdateProblem={handleUpdateProblem}
      onToggleReview={handleToggleReview}
      onDeleteProblem={handleDeleteProblem}
      onEditProblem={handleEditProblem}
      onProblemReviewed={handleProblemReviewed}
      isReviewList={true}
      // ADD THIS:
      onGenerateSuggestions={handleGenerateSuggestions}
    />
  </div>
</TabsContent>
```

### Option 2: Add to ProblemList Component

**File**: `src/components/ProblemList.tsx`

Add to the props interface:

```typescript
interface ProblemListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onToggleReview?: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, quality?: number) => void;
  onClearAll?: () => void;
  isReviewList?: boolean;
  onAddToProblem?: (id: string) => void;
  isPotdInProblems?: (problem: Problem) => boolean;
  // ADD THIS:
  onGenerateSuggestions?: (problem: Problem) => void;
}
```

Then add a button in the problem row (around line 256):

```typescript
{/* Existing buttons */}
<Button variant="ghost" size="icon" onClick={() => onEditProblem(problem)} className="h-8 w-8">
  <Edit className="h-3 w-3" />
</Button>

{/* ADD THIS - Suggestions Button */}
{onGenerateSuggestions && (
  <Button 
    variant="ghost" 
    size="icon" 
    onClick={() => onGenerateSuggestions(problem)}
    className="h-8 w-8 text-blue-600"
    title="Get AI suggestions"
  >
    <Lightbulb className="h-3 w-3" />
  </Button>
)}

{/* Existing delete button */}
<Button variant="ghost" size="icon" onClick={() => onDeleteProblem(problem.id)} className="h-8 w-8 text-destructive">
  <Trash2 className="h-3 w-3" />
</Button>
```

Don't forget to import Lightbulb:

```typescript
import { MoreHorizontal, Star, Trash2, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Pencil, Undo2, BookOpen, Edit, ArrowRight, Lightbulb } from 'lucide-react';
```

---

## 🔧 Complete Integration Example

Here's a complete example for `src/app/page.tsx`:

### 1. Add Imports
```typescript
import { SuggestionPanel } from '@/components/SuggestionPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
```

### 2. Add State
```typescript
const [selectedProblemForSuggestions, setSelectedProblemForSuggestions] = useState<Problem | null>(null);
const [suggestions, setSuggestions] = useState<any>(null);
const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
```

### 3. Add Handler Function
```typescript
const handleGenerateSuggestions = async (problem: Problem) => {
  try {
    setIsLoadingSuggestions(true);
    setSelectedProblemForSuggestions(problem);

    // Call the API
    const response = await fetch(`/api/problems/${problem.id}/llm-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: 'User attempted but could not solve this problem',
        userFinalStatus: 'unsolved',
        code: problem.code || '',
        problemDescription: problem.title,
      }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      setSuggestions(data.data);
      setShowSuggestionsModal(true);
      toast.success('Suggestions generated!');
    } else if (data.data === null) {
      toast.info(data.reason || 'No suggestions available for this problem');
    } else {
      toast.error('Failed to generate suggestions');
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    toast.error('Failed to generate suggestions');
  } finally {
    setIsLoadingSuggestions(false);
  }
};
```

### 4. Add Handler for Adding to Todos
```typescript
const handleAddSuggestionToTodos = async (suggestion: any) => {
  try {
    const newTodo: Todo = {
      id: generateId(),
      title: suggestion.title,
      description: suggestion.description || suggestion.reason,
      estimatedTime: suggestion.estimatedTime || suggestion.duration || 30,
      category: 'study',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to your todos
    const createdTodo = await StorageService.addTodo(newTodo);
    setTodos([...todos, createdTodo]);
    toast.success('Added to Todos!');
  } catch (error) {
    console.error('Error adding to todos:', error);
    toast.error('Failed to add to todos');
  }
};
```

### 5. Add Modal to JSX
```typescript
{/* Add this in your JSX, after the main Tabs component */}
<Dialog open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        💡 Suggestions for {selectedProblemForSuggestions?.title}
      </DialogTitle>
    </DialogHeader>
    {suggestions && (
      <SuggestionPanel
        suggestions={suggestions}
        failureReason={suggestions.failureReason}
        confidence={suggestions.confidence}
        onAddToTodos={handleAddSuggestionToTodos}
      />
    )}
  </DialogContent>
</Dialog>
```

### 6. Pass Handler to ProblemList
```typescript
<ProblemList
  problems={reviewProblems}
  onUpdateProblem={handleUpdateProblem}
  onToggleReview={handleToggleReview}
  onDeleteProblem={handleDeleteProblem}
  onEditProblem={handleEditProblem}
  onProblemReviewed={handleProblemReviewed}
  isReviewList={true}
  // ADD THIS:
  onGenerateSuggestions={handleGenerateSuggestions}
/>
```

---

## 🧪 Testing the Feature

### Test 1: Generate Suggestions
1. Go to the Review tab
2. Click the 💡 icon on any problem
3. Wait for suggestions to load
4. Verify 3 categories appear

### Test 2: Add to Todos
1. Click "Add" on any suggestion
2. Go to Todos tab
3. Verify the suggestion appears as a new todo

### Test 3: Cached Suggestions
1. Generate suggestions for a problem
2. Close the modal
3. Click 💡 again on the same problem
4. Suggestions should load instantly (from cache)

### Test 4: Error Handling
1. Disconnect internet (or disable API key)
2. Try to generate suggestions
3. Should show fallback suggestions

---

## 📊 API Response Format

When you call the API, you'll get:

```json
{
  "success": true,
  "data": {
    "prerequisites": [
      {
        "title": "Dynamic Programming Basics",
        "difficulty": "Easy",
        "reason": "Understanding DP is crucial for this problem",
        "estimatedTime": 20
      }
    ],
    "similarProblems": [
      {
        "title": "Climbing Stairs",
        "tags": ["Dynamic Programming", "Math"],
        "reason": "Similar DP approach"
      }
    ],
    "microtasks": [
      {
        "title": "Trace Through Example",
        "description": "Step through the solution with a sample input",
        "duration": 15
      }
    ]
  },
  "failureReason": "Missing understanding of dynamic programming",
  "confidence": 0.85
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Review Tab Integration
- User reviews problems they struggled with
- Clicks 💡 to get suggestions
- Adds suggestions to Todos
- Works through them systematically

### Use Case 2: Problem Solving Session
- User attempts a problem
- Marks as unsolved
- Gets suggestions immediately
- Learns from suggestions
- Retries the problem

### Use Case 3: Study Planning
- User collects suggestions from multiple problems
- Adds them all to Todos
- Creates a personalized study plan
- Tracks progress

---

## ⚙️ Configuration

### Environment Variables
Make sure these are set in `.env.local`:
```
GEMINI_API_KEY=AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g
```

### API Endpoint
```
POST /api/problems/[id]/llm-result
GET /api/problems/[id]/suggestions?userId=...
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Suggestions not loading | Check GEMINI_API_KEY in .env |
| Button not appearing | Verify onGenerateSuggestions prop is passed |
| Modal not showing | Check Dialog component is imported |
| Todos not saving | Verify StorageService.addTodo works |
| Cached suggestions not working | Check MongoDB connection |

---

## 💡 Tips & Tricks

1. **Batch Suggestions**: Generate for multiple problems at once
2. **Lazy Load**: Only fetch when user requests
3. **Cache Aggressively**: Suggestions cached for 30 days
4. **Fallback Support**: Works even if LLM fails
5. **User Feedback**: Track which suggestions users find helpful

---

**Ready to integrate? Start with Option 1 (Review Tab) - it's the easiest! 🚀**

