# 📋 Copy-Paste Integration Guide

## ⚠️ Important: Read This First

This guide provides exact code snippets you can copy and paste. Follow the steps in order.

---

## Step 1: Update Imports in `src/app/page.tsx`

**Find this line (around line 19):**
```typescript
import { Home as HomeIcon, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, Archive as LearnedIcon, History, Trophy, Building2, LogOut, User, FileText, CheckSquare, ExternalLink } from 'lucide-react';
```

**Replace with:**
```typescript
import { Home as HomeIcon, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, Archive as LearnedIcon, History, Trophy, Building2, LogOut, User, FileText, CheckSquare, ExternalLink, Lightbulb } from 'lucide-react';
```

**Add these imports after line 33:**
```typescript
import { SuggestionPanel } from '@/components/SuggestionPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
```

---

## Step 2: Add State Variables

**Find this section (around line 35-47):**
```typescript
export default function HomePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [potdProblems, setPotdProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);
  const [activePlatform, setActivePlatform] = useState('leetcode');
```

**Add these lines after `const [activePlatform, setActivePlatform] = useState('leetcode');`:**
```typescript
  // LLM Feature State
  const [selectedProblemForSuggestions, setSelectedProblemForSuggestions] = useState<Problem | null>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
```

---

## Step 3: Add Handler Function

**Find a good place to add this (after other handlers, around line 530):**

```typescript
  const handleGenerateSuggestions = async (problem: Problem) => {
    try {
      setIsLoadingSuggestions(true);
      setSelectedProblemForSuggestions(problem);

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

      const createdTodo = await StorageService.addTodo(newTodo);
      setTodos([...todos, createdTodo]);
      toast.success('Added to Todos!');
    } catch (error) {
      console.error('Error adding to todos:', error);
      toast.error('Failed to add to todos');
    }
  };
```

---

## Step 4: Update ProblemList Props

**Find the Review tab section (around line 1199):**
```typescript
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
    />
  </div>
</TabsContent>
```

**Add this prop:**
```typescript
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
      onGenerateSuggestions={handleGenerateSuggestions}
    />
  </div>
</TabsContent>
```

---

## Step 5: Add Modal Before Closing Return

**Find the end of the return statement (before the final `</div>`):**

**Add this code:**
```typescript
      {/* LLM Suggestions Modal */}
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
    </div>
  );
}
```

---

## Step 6: Update ProblemList Component

**File**: `src/components/ProblemList.tsx`

**Find the interface (around line 56):**
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
}
```

**Add this line:**
```typescript
  onGenerateSuggestions?: (problem: Problem) => void;
```

**Find the function signature (around line 69):**
```typescript
const ProblemList = ({ problems, onUpdateProblem, onToggleReview, onDeleteProblem, onEditProblem, onProblemReviewed, onClearAll, isReviewList = false, onAddToProblem, isPotdInProblems }: ProblemListProps) => {
```

**Add this parameter:**
```typescript
onGenerateSuggestions
```

**Find the button section in mobile view (around line 256):**
```typescript
                  <div className="flex flex-col gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => onEditProblem(problem)} className="h-8 w-8">
                      <Edit className="h-3 w-3" />
                    </Button>
                    {problem.source === 'potd' && onAddToProblem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddToProblem(problem.id)}
                        className="h-8 w-8 text-blue-600"
                        title={isPotdInProblems && isPotdInProblems(problem) ? "Already in Problems" : "Add to Problems"}
                        disabled={isPotdInProblems && isPotdInProblems(problem)}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDeleteProblem(problem.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
```

**Add this button after the Edit button:**
```typescript
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
```

**Update the import at the top (line 24):**
```typescript
import { MoreHorizontal, Star, Trash2, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Pencil, Undo2, BookOpen, Edit, ArrowRight, Lightbulb } from 'lucide-react';
```

---

## Step 7: Test It!

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to Review tab:**
   - Navigate to http://localhost:3000
   - Click "Review" tab

3. **Click the 💡 button:**
   - You should see a loading state
   - Then suggestions should appear

4. **Test "Add to Todos":**
   - Click "Add" on any suggestion
   - Go to Todos tab
   - Verify it appears

---

## ✅ Verification Checklist

- [ ] Code compiles without errors
- [ ] 💡 button appears on problems
- [ ] Clicking button shows loading state
- [ ] Suggestions modal appears
- [ ] 3 categories visible
- [ ] "Add to Todos" works
- [ ] Suggestions cached (instant 2nd time)
- [ ] Dark mode looks good

---

## 🐛 If Something Goes Wrong

1. **Check console for errors:**
   ```bash
   npm run build
   ```

2. **Verify imports:**
   - SuggestionPanel imported?
   - Dialog imported?
   - Lightbulb imported?

3. **Check API:**
   - Is dev server running?
   - Is GEMINI_API_KEY set?

4. **Restart:**
   ```bash
   npm run dev
   ```

---

**That's it! You're done! 🎉**

