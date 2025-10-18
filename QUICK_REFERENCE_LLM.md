# ⚡ LLM Feature - Quick Reference Card

## 🎯 What It Does (30 seconds)

When a user marks a problem as **"unsolved"**, the system:
1. Analyzes why they failed
2. Generates 3 types of suggestions
3. Caches results for 30 days
4. Lets users add suggestions to Todos

---

## 🚀 Quick Start (5 minutes)

### Step 1: Add Import
```typescript
import { SuggestionPanel } from '@/components/SuggestionPanel';
```

### Step 2: Add State
```typescript
const [suggestions, setSuggestions] = useState(null);
const [showModal, setShowModal] = useState(false);
```

### Step 3: Add Handler
```typescript
const handleGetSuggestions = async (problem: Problem) => {
  const res = await fetch(`/api/problems/${problem.id}/llm-result`, {
    method: 'POST',
    body: JSON.stringify({
      transcript: 'User attempted but failed',
      userFinalStatus: 'unsolved'
    })
  });
  const data = await res.json();
  if (data.success) {
    setSuggestions(data.data);
    setShowModal(true);
  }
};
```

### Step 4: Add Button
```typescript
<Button onClick={() => handleGetSuggestions(problem)}>
  💡 Get Suggestions
</Button>
```

### Step 5: Add Modal
```typescript
<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent>
    {suggestions && <SuggestionPanel suggestions={suggestions} />}
  </DialogContent>
</Dialog>
```

---

## 📊 API Endpoints

### POST `/api/problems/[id]/llm-result`
**Generate suggestions**

```bash
curl -X POST http://localhost:3000/api/problems/123/llm-result \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "I tried but couldnt solve it",
    "userFinalStatus": "unsolved"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prerequisites": [...],
    "similarProblems": [...],
    "microtasks": [...]
  },
  "failureReason": "Missing DP understanding",
  "confidence": 0.85
}
```

### GET `/api/problems/[id]/suggestions?userId=...`
**Get cached suggestions**

```bash
curl http://localhost:3000/api/problems/123/suggestions?userId=user123
```

---

## 🎨 Component Usage

### SuggestionPanel Props
```typescript
interface SuggestionPanelProps {
  suggestions: {
    prerequisites: Prerequisite[];
    similarProblems: SimilarProblem[];
    microtasks: Microtask[];
  };
  onAddToTodos?: (task: any) => void;
  failureReason?: string;
  confidence?: number;
}
```

### Example
```typescript
<SuggestionPanel
  suggestions={suggestions}
  failureReason="Missing DP concepts"
  confidence={0.85}
  onAddToTodos={(task) => addToTodos(task)}
/>
```

---

## 🔧 Configuration

### Required Environment Variables
```
GEMINI_API_KEY=AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g
DATABASE_URL=mongodb+srv://...
```

### Files to Know
- **Service**: `src/services/suggestionService.ts`
- **Component**: `src/components/SuggestionPanel.tsx`
- **Prompts**: `src/lib/llm-prompts.ts`
- **API**: `src/app/api/problems/[id]/llm-result/route.ts`

---

## 📋 Suggestion Categories

### 📚 Prerequisites
- Simpler concept drills
- 5-20 minutes each
- Difficulty: Easy, Medium, Hard
- Example: "Dynamic Programming Basics"

### 🔗 Similar Problems
- Real problems with same techniques
- Tagged with topics
- Example: "Climbing Stairs" (for DP problems)

### ⚡ Microtasks
- Targeted 10-30 min drills
- Specific actions
- Example: "Trace through example"

---

## 🧪 Testing Checklist

- [ ] Button appears on problem row
- [ ] Clicking button shows loading state
- [ ] Suggestions modal appears
- [ ] 3 categories are visible
- [ ] "Add to Todos" buttons work
- [ ] Suggestions are cached (instant on 2nd click)
- [ ] Error handling works (fallback suggestions)
- [ ] Dark mode looks good

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Button not showing | Pass `onGenerateSuggestions` prop to ProblemList |
| Modal not appearing | Import Dialog component |
| API error | Check GEMINI_API_KEY in .env |
| Suggestions not caching | Verify MongoDB connection |
| Type errors | Run `npx prisma generate` |

---

## 💡 Pro Tips

1. **Cache Hit**: Same problem = instant suggestions (30 days)
2. **Fallback**: Works even if LLM fails
3. **Confidence**: Only generates if ≥ 60% confident
4. **Batch**: Can generate for multiple problems
5. **User-Specific**: Each user gets their own cache

---

## 📱 Mobile Responsive

The SuggestionPanel is fully responsive:
- ✅ Mobile: Stacked layout
- ✅ Tablet: 2-column layout
- ✅ Desktop: 3-column layout
- ✅ Dark mode: Fully supported

---

## 🎯 Integration Locations

### Option 1: Review Tab (Recommended)
```typescript
// src/app/page.tsx - Review tab
<ProblemList
  problems={reviewProblems}
  onGenerateSuggestions={handleGenerateSuggestions}
/>
```

### Option 2: Problems Tab
```typescript
// src/app/page.tsx - Problems tab
<ProblemList
  problems={activeProblems}
  onGenerateSuggestions={handleGenerateSuggestions}
/>
```

### Option 3: Custom Component
```typescript
// Create your own component
<SuggestionPanel suggestions={suggestions} />
```

---

## 📊 Data Flow

```
User clicks button
    ↓
API POST /api/problems/[id]/llm-result
    ↓
Check cache (MongoDB)
    ↓
If cached: Return instantly
If not: Call Gemini API
    ↓
Analyze failure + Generate suggestions
    ↓
Cache for 30 days
    ↓
Return to frontend
    ↓
Display SuggestionPanel
    ↓
User clicks "Add to Todos"
    ↓
Add to Todos list
```

---

## 🚀 Next Steps

1. **Read**: `HOW_TO_USE_LLM_FEATURE.md` (detailed guide)
2. **Integrate**: Add to Review tab or Problems tab
3. **Test**: Follow testing checklist
4. **Deploy**: Push to production
5. **Monitor**: Track user engagement

---

## 📞 Need Help?

- **Integration**: See `INTEGRATION_GUIDE.md`
- **API Details**: See `LLM_FAILURE_IMPLEMENTATION_COMPLETE.md`
- **Troubleshooting**: See `HOW_TO_USE_LLM_FEATURE.md`
- **Architecture**: See `IMPLEMENTATION_SUMMARY.md`

---

**Status**: ✅ Ready to use
**Time to integrate**: ~15 minutes
**Difficulty**: Easy

**Let's go! 🚀**

