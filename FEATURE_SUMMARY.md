# LLM-Failure: Auto-Suggest Follow-Ups - Complete Summary

## 🎯 Feature Overview

**What**: Automatically generate personalized follow-up suggestions when a user fails a problem
**Why**: Help users learn from failures by suggesting targeted drills and related problems
**When**: Triggered when user marks a problem as "unsolved" after attempting it
**Where**: Displayed in the Review tab with 3 categories of suggestions

---

## 📊 What You Need (Complete Checklist)

### 1. Database Changes
- [ ] Add `UserProblemSuggestion` model to Prisma schema
- [ ] Add relations to `User` and `Problem` models
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Verify MongoDB collection created

### 2. Backend API Endpoints
- [ ] Create `POST /api/problems/[id]/llm-result` endpoint
  - Detects failure using LLM
  - Generates suggestions if confidence >= 0.6
  - Caches for 30 days
  - Returns suggestions JSON
  
- [ ] Create `GET /api/problems/[id]/suggestions` endpoint
  - Retrieves cached suggestions
  - Checks expiration
  - Returns 404 if expired/missing

### 3. LLM Integration
- [ ] Create `src/lib/llm-prompts.ts` with 2 prompts:
  - **Failure Detection Prompt**: Analyzes why user failed
  - **Suggestion Generator Prompt**: Creates 3 categories
  
- [ ] Create `src/services/suggestionService.ts` with methods:
  - `detectFailure()` - Call LLM for failure analysis
  - `generateSuggestions()` - Call LLM for suggestions
  - `cacheSuggestions()` - Save to DB
  - `getSuggestions()` - Retrieve from cache

### 4. Frontend Components
- [ ] Create `SuggestionPanel.tsx` component
  - Display Prerequisites section
  - Display Similar Problems section
  - Display Microtasks section
  - "Add to Todos" buttons
  
- [ ] Update `ProblemList.tsx`
  - Add "View Suggestions" button
  - Add "Suggestions Available" badge
  
- [ ] Update `src/app/page.tsx` (Review tab)
  - Add state for selected problem
  - Add modal/drawer for suggestions
  - Add handler to fetch suggestions

### 5. Error Handling & Fallbacks
- [ ] Handle LLM API failures gracefully
- [ ] Provide fallback suggestions if LLM fails
- [ ] Log errors for debugging
- [ ] Show user-friendly error messages

### 6. Testing & Validation
- [ ] Test with real OpenAI API calls
- [ ] Test caching logic (30-day expiration)
- [ ] Test error scenarios
- [ ] Test frontend UI/UX
- [ ] Performance testing

---

## 🔄 Data Flow

```
1. User marks problem "unsolved" in Review tab
   ↓
2. Frontend calls POST /api/problems/[id]/llm-result
   ↓
3. Backend checks if suggestions cached
   ↓
4. If not cached:
   a. Call LLM: Failure Detection
   b. Parse response → { failed, confidence, missing_concepts }
   c. If failed && confidence >= 0.6:
      - Call LLM: Suggestion Generator
      - Parse response → { prerequisites, similarProblems, microtasks }
      - Save to DB with 30-day expiration
   ↓
5. Return suggestions to frontend
   ↓
6. Display SuggestionPanel with 3 categories
   ↓
7. User can add suggestions as todos/problems
```

---

## 💾 Database Schema

```typescript
UserProblemSuggestion {
  id: string (unique ID)
  userId: string (links to User)
  problemId: string (links to Problem)
  generatedAt: DateTime (when created)
  expiresAt: DateTime (30 days from creation)
  suggestions: Json {
    prerequisites: Array<{
      title, difficulty, reason, estimatedTime
    }>,
    similarProblems: Array<{
      title, tags, reason
    }>,
    microtasks: Array<{
      title, description, duration
    }>
  }
  source: string ("llm-failure")
  failureReason: string (why user failed)
  confidence: float (0.0-1.0)
  error: Json (error details if failed)
}
```

---

## 🧠 LLM Prompts

### Prompt 1: Failure Detection
```
Input: Problem title, description, user's transcript, code
Output: {
  failed: boolean,
  failure_reason: string,
  missing_concepts: string[],
  confidence: 0.0-1.0
}
```

### Prompt 2: Suggestion Generator
```
Input: Problem title, difficulty, topics, missing concepts
Output: {
  prerequisites: [...],
  similarProblems: [...],
  microtasks: [...]
}
```

---

## 🔌 API Endpoints

### POST /api/problems/[id]/llm-result
```
Request: {
  userId: string,
  transcript: string,
  userFinalStatus: "solved" | "unsolved" | "partial",
  code?: string,
  problemDescription?: string
}

Response: {
  success: boolean,
  data?: {
    prerequisites: [...],
    similarProblems: [...],
    microtasks: [...]
  },
  cached?: boolean,
  error?: string
}
```

### GET /api/problems/[id]/suggestions?userId=...
```
Response: {
  success: boolean,
  data?: {
    cached: boolean,
    suggestions: {...},
    generatedAt: string,
    expiresAt: string
  },
  error?: string
}
```

---

## ⚙️ Configuration

### Confidence Threshold
```typescript
const CONFIDENCE_THRESHOLD = 0.6;
// Only generate suggestions if LLM is >= 60% confident
```

### Cache Duration
```typescript
const CACHE_DURATION_DAYS = 30;
// Suggestions expire after 30 days
```

### LLM Model
```typescript
model: 'gpt-3.5-turbo' // or 'gpt-4' for better quality
temperature: 0.3 // Lower = more deterministic
max_tokens: 1000 // Adjust based on response length
```

---

## 📁 Files to Create/Modify

### Create New Files
- `src/lib/llm-prompts.ts` - LLM prompt templates
- `src/services/suggestionService.ts` - Suggestion logic
- `src/app/api/problems/[id]/llm-result/route.ts` - POST endpoint
- `src/app/api/problems/[id]/suggestions/route.ts` - GET endpoint
- `src/components/SuggestionPanel.tsx` - UI component

### Modify Existing Files
- `prisma/schema.prisma` - Add UserProblemSuggestion model
- `src/components/ProblemList.tsx` - Add suggestion button
- `src/app/page.tsx` - Add suggestion modal
- `src/services/api.ts` - Add API methods

---

## 🚀 Implementation Order

1. **Database** (30 min)
   - Update schema
   - Run migration

2. **Backend Service** (1 hour)
   - Create prompts
   - Create suggestion service

3. **API Endpoints** (1 hour)
   - Create POST endpoint
   - Create GET endpoint

4. **Frontend** (1.5 hours)
   - Create SuggestionPanel
   - Update ProblemList
   - Update Review tab

5. **Testing** (1 hour)
   - Test all flows
   - Test error handling
   - Performance check

**Total: 4.5-5 hours**

---

## ❓ Key Questions Answered

**Q: When are suggestions generated?**
A: When user marks problem "unsolved" and LLM detects failure with >= 60% confidence

**Q: How long are suggestions cached?**
A: 30 days from generation

**Q: What if LLM fails?**
A: Return error, log it, optionally show fallback suggestions

**Q: Can users regenerate suggestions?**
A: Not in initial version, but can be added later

**Q: Are suggestions personalized?**
A: Yes, based on user's missing concepts and problem difficulty

**Q: Can suggestions be shared?**
A: Not in initial version, but can be added later

---

## 📚 Documentation Files Created

1. **LLM_FAILURE_FEATURE_DISCUSSION.md** - Detailed discussion
2. **IMPLEMENTATION_ROADMAP.md** - Step-by-step roadmap
3. **CODE_EXAMPLES.md** - Ready-to-use code snippets
4. **FEATURE_SUMMARY.md** - This file

---

## ✅ Next Steps

1. **Review** this summary with the team
2. **Clarify** any requirements or questions
3. **Approve** the design and approach
4. **Start implementation** following the roadmap
5. **Test thoroughly** before deployment

---

## 💡 Future Enhancements

- Regenerate suggestions on demand
- Track which suggestions users use
- Personalize based on user history
- Share suggestions between users
- Analytics dashboard
- Batch suggestion generation
- Multi-language support


