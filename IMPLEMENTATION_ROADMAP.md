# LLM-Failure Feature - Implementation Roadmap

## 📅 Phase 1: Database & Backend Setup (2-3 hours)

### Step 1.1: Update Prisma Schema
**File**: `prisma/schema.prisma`

Add the new model:
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

Also update the `User` and `Problem` models to add relations:
```prisma
// In User model:
suggestions UserProblemSuggestion[]

// In Problem model:
suggestions UserProblemSuggestion[]
```

**Commands**:
```bash
npx prisma migrate dev --name add_user_problem_suggestions
npx prisma generate
```

---

### Step 1.2: Create LLM Prompt Utilities
**File**: `src/lib/llm-prompts.ts`

Create reusable prompt templates:
```typescript
export const failureDetectionPrompt = (problem, transcript, code?) => {
  return `...prompt template...`;
};

export const suggestionGeneratorPrompt = (problem, missingConcepts) => {
  return `...prompt template...`;
};
```

---

### Step 1.3: Create Suggestion Service
**File**: `src/services/suggestionService.ts`

Implement:
- `detectFailure()` - Call LLM for failure detection
- `generateSuggestions()` - Call LLM for suggestions
- `cacheSuggestions()` - Save to DB
- `getSuggestions()` - Retrieve from cache
- `isExpired()` - Check 30-day expiration

---

## 📅 Phase 2: API Endpoints (2-3 hours)

### Step 2.1: Create POST Endpoint
**File**: `src/app/api/problems/[id]/llm-result/route.ts`

Implement:
1. Authenticate user
2. Validate request body
3. Check if suggestions already cached
4. If not cached:
   - Call failure detection LLM
   - If failed && confidence >= 0.6:
     - Call suggestion generator LLM
     - Save to DB
5. Return suggestions

---

### Step 2.2: Create GET Endpoint
**File**: `src/app/api/problems/[id]/suggestions/route.ts`

Implement:
1. Authenticate user
2. Query DB for cached suggestions
3. Check expiration
4. Return suggestions or 404

---

## 📅 Phase 3: Frontend Components (2-3 hours)

### Step 3.1: Create SuggestionPanel Component
**File**: `src/components/SuggestionPanel.tsx`

Display:
- Prerequisites section
- Similar Problems section
- Microtasks section
- Loading state
- Error state
- "Add to Todos" buttons

---

### Step 3.2: Update ProblemList Component
**File**: `src/components/ProblemList.tsx`

Add:
- "View Suggestions" button on unsolved problems
- Badge showing "Suggestions Available"
- Modal/drawer to show SuggestionPanel

---

### Step 3.3: Update Review Tab
**File**: `src/app/page.tsx`

Add:
- State for selected problem suggestions
- Handler to fetch suggestions
- Modal/drawer for SuggestionPanel

---

## 📅 Phase 4: Integration & Testing (2-3 hours)

### Step 4.1: API Service Integration
**File**: `src/services/api.ts`

Add methods:
```typescript
async submitLLMResult(problemId, data) { ... }
async getSuggestions(problemId) { ... }
```

---

### Step 4.2: Error Handling & Fallbacks
- Handle LLM API failures
- Provide fallback suggestions
- Log errors for debugging

---

### Step 4.3: Testing
- Test with real LLM calls
- Test caching logic
- Test expiration
- Test error scenarios

---

## 🎯 Key Implementation Details

### Confidence Threshold
```typescript
const CONFIDENCE_THRESHOLD = 0.6;
if (failureDetection.confidence >= CONFIDENCE_THRESHOLD) {
  // Generate suggestions
}
```

### Cache Expiration
```typescript
const CACHE_DURATION_DAYS = 30;
const expiresAt = new Date(Date.now() + CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000);
```

### Error Handling Pattern
```typescript
try {
  // LLM call
} catch (error) {
  // Log error
  // Save error to DB
  // Return fallback suggestions
}
```

---

## 📊 Estimated Timeline

| Phase | Tasks | Duration | Status |
|-------|-------|----------|--------|
| 1 | Database & Backend Setup | 2-3h | ⏳ Not Started |
| 2 | API Endpoints | 2-3h | ⏳ Not Started |
| 3 | Frontend Components | 2-3h | ⏳ Not Started |
| 4 | Integration & Testing | 2-3h | ⏳ Not Started |
| **Total** | | **8-12h** | |

---

## 🔍 Testing Checklist

- [ ] Prisma migration successful
- [ ] API endpoints respond correctly
- [ ] LLM calls work with real API
- [ ] Suggestions cached in DB
- [ ] Cache expiration works
- [ ] Frontend displays suggestions
- [ ] Error handling works
- [ ] Fallback suggestions display
- [ ] Performance acceptable
- [ ] No console errors

---

## 🚀 Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database migrated
- [ ] API endpoints tested
- [ ] Frontend tested in all browsers
- [ ] Performance optimized
- [ ] Error logging configured

---

## 💡 Future Enhancements

1. **Regenerate Suggestions**: Allow users to regenerate
2. **Track Usage**: Log which suggestions users use
3. **Personalization**: Adjust suggestions based on user history
4. **Sharing**: Share suggestions between users
5. **Analytics**: Track suggestion effectiveness
6. **Batch Processing**: Generate suggestions for multiple problems


