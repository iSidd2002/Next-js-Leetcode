# 🚀 START HERE - LLM Feature Usage Guide

## 📖 Choose Your Path

### 👤 I'm a User - How Do I Use This?
→ **Read**: [User Guide](#user-guide)

### 👨‍💻 I'm a Developer - How Do I Integrate This?
→ **Read**: [Developer Guide](#developer-guide)

---

## 👤 User Guide

### What Is This Feature?

When you attempt a problem and mark it as **"unsolved"**, the system automatically:
1. Analyzes why you failed
2. Suggests 3 types of learning resources
3. Lets you add them to your Todos

### How to Use It

#### Step 1: Attempt a Problem
- Go to the **Review** tab
- Find a problem you struggled with

#### Step 2: Click the 💡 Button
- You'll see a lightbulb icon next to each problem
- Click it to get suggestions

#### Step 3: View Suggestions
A modal will appear showing:
- **📚 Prerequisites** - Simpler concepts to learn first
- **🔗 Similar Problems** - Related problems to practice
- **⚡ Microtasks** - Specific learning tasks

#### Step 4: Add to Todos (Optional)
- Click "Add" on any suggestion
- It gets added to your Todos list
- Work through them at your own pace

#### Step 5: Learn & Retry
- Study the suggestions
- Retry the original problem
- Celebrate when you solve it! 🎉

### Example Workflow

```
1. You attempt "Longest Substring Without Repeating Characters"
2. You can't solve it → Mark as "unsolved"
3. Click 💡 button
4. System suggests:
   - Learn: "Sliding Window Technique" (15 min)
   - Practice: "Two Sum" (similar problem)
   - Task: "Trace through example" (10 min)
5. Add all to Todos
6. Study them
7. Retry the problem
8. Success! ✅
```

---

## 👨‍💻 Developer Guide

### Quick Start (15 minutes)

#### Option A: Copy-Paste (Easiest)
1. Open `COPY_PASTE_INTEGRATION.md`
2. Follow steps 1-7
3. Done! 🎉

#### Option B: Manual Integration (Detailed)
1. Open `HOW_TO_USE_LLM_FEATURE.md`
2. Follow the complete integration example
3. Test everything

#### Option C: Quick Reference
1. Open `QUICK_REFERENCE_LLM.md`
2. Use as a cheat sheet

### What You're Adding

**5 Files Already Created:**
- ✅ `src/lib/llm-prompts.ts` - LLM prompts
- ✅ `src/services/suggestionService.ts` - Service logic
- ✅ `src/app/api/problems/[id]/llm-result/route.ts` - POST API
- ✅ `src/app/api/problems/[id]/suggestions/route.ts` - GET API
- ✅ `src/components/SuggestionPanel.tsx` - UI component

**You Need to Add:**
- Import the component
- Add state variables
- Add handler functions
- Add button to problem list
- Add modal to display suggestions

**Time Required:** ~15 minutes

### Integration Steps

#### Step 1: Add Imports
```typescript
import { SuggestionPanel } from '@/components/SuggestionPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
```

#### Step 2: Add State
```typescript
const [suggestions, setSuggestions] = useState(null);
const [showModal, setShowModal] = useState(false);
```

#### Step 3: Add Handler
```typescript
const handleGenerateSuggestions = async (problem: Problem) => {
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

#### Step 4: Add Button
```typescript
<Button onClick={() => handleGenerateSuggestions(problem)}>
  💡 Get Suggestions
</Button>
```

#### Step 5: Add Modal
```typescript
<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent>
    {suggestions && <SuggestionPanel suggestions={suggestions} />}
  </DialogContent>
</Dialog>
```

### Testing

```bash
# 1. Start dev server
npm run build
npm run dev

# 2. Go to http://localhost:3000
# 3. Click Review tab
# 4. Click 💡 button on any problem
# 5. Verify suggestions appear
```

---

## 📚 Documentation Map

| Document | For | Time |
|----------|-----|------|
| **START_HERE_LLM.md** | Everyone | 5 min |
| **QUICK_REFERENCE_LLM.md** | Developers | 5 min |
| **HOW_TO_USE_LLM_FEATURE.md** | Developers | 15 min |
| **COPY_PASTE_INTEGRATION.md** | Developers | 15 min |
| **INTEGRATION_GUIDE.md** | Developers | 20 min |
| **IMPLEMENTATION_SUMMARY.md** | Developers | 10 min |
| **README_LLM_FEATURE.md** | Everyone | 10 min |

---

## 🎯 Common Questions

### Q: How long does it take to integrate?
**A:** 15 minutes with copy-paste, 30 minutes manually

### Q: Do I need to modify the backend?
**A:** No! Everything is already built. You just add UI.

### Q: What if the API fails?
**A:** System returns fallback suggestions automatically

### Q: Are suggestions cached?
**A:** Yes! For 30 days. Same problem = instant suggestions

### Q: Can users customize suggestions?
**A:** Not yet, but it's on the roadmap

### Q: Does it work offline?
**A:** No, it needs internet for Gemini API

### Q: Is it free?
**A:** Gemini API has free tier (limited requests)

---

## 🚀 Integration Checklist

### Before You Start
- [ ] Dev server is running
- [ ] You have access to `src/app/page.tsx`
- [ ] You have access to `src/components/ProblemList.tsx`

### During Integration
- [ ] Added imports
- [ ] Added state variables
- [ ] Added handler functions
- [ ] Added button to problem list
- [ ] Added modal to display suggestions

### After Integration
- [ ] Code compiles without errors
- [ ] 💡 button appears
- [ ] Clicking button shows loading
- [ ] Suggestions modal appears
- [ ] "Add to Todos" works
- [ ] Dark mode looks good

---

## 🎓 Learning Path

### Beginner
1. Read this file (START_HERE_LLM.md)
2. Read QUICK_REFERENCE_LLM.md
3. Use COPY_PASTE_INTEGRATION.md

### Intermediate
1. Read HOW_TO_USE_LLM_FEATURE.md
2. Read INTEGRATION_GUIDE.md
3. Integrate manually

### Advanced
1. Read IMPLEMENTATION_SUMMARY.md
2. Read LLM_FAILURE_IMPLEMENTATION_COMPLETE.md
3. Customize the feature

---

## 🆘 Troubleshooting

### Button Not Showing
```
✓ Check: onGenerateSuggestions prop passed to ProblemList
✓ Check: Lightbulb icon imported
✓ Check: Button code added correctly
```

### Modal Not Appearing
```
✓ Check: Dialog component imported
✓ Check: showModal state exists
✓ Check: Modal code added to JSX
```

### API Error
```
✓ Check: GEMINI_API_KEY in .env.local
✓ Check: Dev server running
✓ Check: Network connection
```

### Type Errors
```
✓ Run: npx prisma generate
✓ Run: npm run build
✓ Check: All imports correct
```

---

## 📞 Need Help?

1. **Quick answer?** → QUICK_REFERENCE_LLM.md
2. **Step-by-step?** → COPY_PASTE_INTEGRATION.md
3. **Detailed guide?** → HOW_TO_USE_LLM_FEATURE.md
4. **Technical details?** → IMPLEMENTATION_SUMMARY.md
5. **Architecture?** → LLM_FAILURE_IMPLEMENTATION_COMPLETE.md

---

## ✅ You're Ready!

Everything is built and ready to use. Just follow one of the guides above and you'll have the feature integrated in 15 minutes.

**Choose your path:**
- 👤 **User?** → Enjoy the feature!
- 👨‍💻 **Developer?** → Pick a guide and integrate!

---

**Let's go! 🚀**

---

**Status**: ✅ Ready to use
**Difficulty**: Easy
**Time**: 15 minutes
**Support**: Full documentation provided

