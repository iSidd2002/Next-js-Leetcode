# LLM-Failure Feature - Quick Start Guide

## 🚀 5-Minute Overview

**Feature**: Auto-suggest follow-ups when users fail problems
**Trigger**: User marks problem "unsolved" in Review tab
**Output**: 3 categories of suggestions (Prerequisites, Similar Problems, Microtasks)
**Storage**: 30-day cache in MongoDB
**Cost**: ~2 LLM API calls per failure

---

## 📦 What Gets Built

### Database
```
UserProblemSuggestion collection
├── userId (links to User)
├── problemId (links to Problem)
├── suggestions (JSON with 3 categories)
├── failureReason (why they failed)
├── confidence (0.0-1.0)
└── expiresAt (30 days from creation)
```

### API Endpoints
```
POST /api/problems/[id]/llm-result
  → Detects failure + generates suggestions

GET /api/problems/[id]/suggestions?userId=...
  → Retrieves cached suggestions
```

### Frontend
```
SuggestionPanel component
├── Prerequisites section
├── Similar Problems section
└── Microtasks section
```

---

## 🎯 Implementation Steps

### Step 1: Database (30 min)
```bash
# 1. Update prisma/schema.prisma
# 2. Add UserProblemSuggestion model
# 3. Add relations to User and Problem
# 4. Run migration
npx prisma migrate dev --name add_user_problem_suggestions
npx prisma generate
```

### Step 2: Backend Service (1 hour)
```bash
# Create these files:
# 1. src/lib/llm-prompts.ts
#    - failureDetectionPrompt()
#    - suggestionGeneratorPrompt()
#
# 2. src/services/suggestionService.ts
#    - detectFailure()
#    - generateSuggestions()
#    - cacheSuggestions()
#    - getSuggestions()
```

### Step 3: API Endpoints (1 hour)
```bash
# Create these files:
# 1. src/app/api/problems/[id]/llm-result/route.ts
#    - POST handler
#    - Failure detection logic
#    - Suggestion generation
#    - Caching
#
# 2. src/app/api/problems/[id]/suggestions/route.ts
#    - GET handler
#    - Cache retrieval
#    - Expiration check
```

### Step 4: Frontend (1.5 hours)
```bash
# Create/Update these files:
# 1. src/components/SuggestionPanel.tsx
#    - Display 3 categories
#    - Add to todos buttons
#
# 2. src/components/ProblemList.tsx
#    - Add "View Suggestions" button
#    - Add badge
#
# 3. src/app/page.tsx
#    - Add modal/drawer
#    - Add state management
#    - Add handlers
```

### Step 5: Testing (1 hour)
```bash
# Test these scenarios:
# 1. Mark problem unsolved
# 2. Suggestions generated
# 3. Suggestions cached
# 4. Cache expiration works
# 5. Error handling works
# 6. UI displays correctly
```

---

## 💻 Code Templates

### Prisma Schema
```prisma
model UserProblemSuggestion {
  id            String   @id @default(cuid())
  userId        String   @db.ObjectId
  problemId     String   @db.ObjectId
  generatedAt   DateTime @default(now())
  expiresAt     DateTime
  suggestions   Json
  source        String   @default("llm-failure")
  failureReason String?
  confidence    Float    @default(0.0)
  error         Json?
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem       Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  
  @@unique([userId, problemId])
  @@index([userId, expiresAt])
  @@map("user_problem_suggestions")
}
```

### API Endpoint Pattern
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const user = await authenticateRequest(request);
  
  // 2. Validate
  const body = await request.json();
  
  // 3. Check cache
  const cached = await suggestionService.getSuggestions(userId, problemId);
  if (cached) return cached;
  
  // 4. Detect failure
  const failure = await suggestionService.detectFailure(...);
  
  // 5. Generate suggestions
  if (failure.confidence >= 0.6) {
    const suggestions = await suggestionService.generateSuggestions(...);
    await suggestionService.cacheSuggestions(...);
  }
  
  // 6. Return
  return NextResponse.json({ success: true, data: suggestions });
}
```

### Frontend Component Pattern
```typescript
const [suggestions, setSuggestions] = useState(null);
const [loading, setLoading] = useState(false);

const handleViewSuggestions = async (problemId) => {
  setLoading(true);
  const response = await api.submitLLMResult(problemId, {
    transcript: userTranscript,
    userFinalStatus: 'unsolved',
  });
  setSuggestions(response.data);
  setLoading(false);
};

return (
  <>
    <Button onClick={() => handleViewSuggestions(problem.id)}>
      View Suggestions
    </Button>
    {suggestions && <SuggestionPanel suggestions={suggestions} />}
  </>
);
```

---

## 🔑 Key Configuration

```typescript
// Confidence threshold for generating suggestions
const CONFIDENCE_THRESHOLD = 0.6;

// Cache duration
const CACHE_DURATION_DAYS = 30;

// LLM settings
const LLM_CONFIG = {
  model: 'gpt-3.5-turbo',
  temperature: 0.3,
  max_tokens: 1000,
};
```

---

## ✅ Verification Checklist

- [ ] Prisma migration successful
- [ ] UserProblemSuggestion collection created
- [ ] API endpoints respond correctly
- [ ] LLM calls work with real API
- [ ] Suggestions cached in DB
- [ ] Cache expiration works (30 days)
- [ ] Frontend displays suggestions
- [ ] Error handling works
- [ ] Fallback suggestions display
- [ ] No console errors
- [ ] Performance acceptable

---

## 🐛 Debugging Tips

### Check if suggestions cached
```typescript
const suggestion = await prisma.userProblemSuggestion.findUnique({
  where: { userId_problemId: { userId, problemId } }
});
console.log(suggestion);
```

### Check LLM response
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  // ... config
});
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
```

### Check expiration
```typescript
const now = new Date();
const isExpired = now > suggestion.expiresAt;
console.log(`Expired: ${isExpired}`);
```

---

## 📚 Documentation Files

1. **FEATURE_SUMMARY.md** - Complete overview
2. **LLM_FAILURE_FEATURE_DISCUSSION.md** - Detailed discussion
3. **IMPLEMENTATION_ROADMAP.md** - Step-by-step roadmap
4. **CODE_EXAMPLES.md** - Ready-to-use code
5. **QUICK_START_GUIDE.md** - This file

---

## 🎓 Learning Resources

### Existing Code to Study
- `src/app/api/ai/hint/route.ts` - LLM API pattern
- `src/services/aiAssistant.ts` - Service pattern
- `src/components/ProblemList.tsx` - Component pattern
- `prisma/schema.prisma` - Schema pattern

### Key Concepts
- **Prisma ORM**: Database queries
- **OpenAI API**: LLM integration
- **Next.js API Routes**: Backend endpoints
- **React Hooks**: Frontend state management
- **JSON Parsing**: LLM response handling

---

## 🚨 Common Issues & Solutions

### Issue: LLM returns invalid JSON
**Solution**: Add JSON parsing error handling + fallback suggestions

### Issue: Cache not working
**Solution**: Check expiration logic, verify DB query

### Issue: Slow API response
**Solution**: Generate suggestions asynchronously, show loading state

### Issue: High API costs
**Solution**: Implement rate limiting, cache aggressively

---

## 🎯 Success Criteria

✅ Feature is complete when:
1. Suggestions generated on failure detection
2. Suggestions cached for 30 days
3. Suggestions displayed in Review tab
4. Users can add suggestions as todos
5. Error handling works gracefully
6. Performance is acceptable
7. All tests passing

---

## 📞 Questions?

Refer to:
- **FEATURE_SUMMARY.md** for overview
- **CODE_EXAMPLES.md** for code patterns
- **IMPLEMENTATION_ROADMAP.md** for step-by-step guide
- **LLM_FAILURE_FEATURE_DISCUSSION.md** for detailed discussion


