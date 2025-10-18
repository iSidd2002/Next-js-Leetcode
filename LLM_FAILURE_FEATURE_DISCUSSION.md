# LLM-Failure: Auto-Suggest Follow-Ups Feature - Implementation Discussion

## 📋 Overview

This document outlines the complete implementation plan for the "LLM-failure: Auto-Suggest Follow-Ups" feature in your LeetCode Tracker app.

**Goal**: When a user marks a problem as "unsolved" after attempting it with the LLM, automatically generate 3 categories of follow-up suggestions:
- **Prerequisites** (simpler concept drills)
- **Similar Problems** (same tags/technique)
- **Microtasks** (10-30 min targeted drills)

---

## 🏗️ Current Project Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Prisma ORM
- **LLM Provider**: OpenAI (GPT-3.5-turbo, GPT-4)
- **UI**: Shadcn/UI + Tailwind CSS

### Existing LLM Integration
- **Location**: `src/app/api/ai/` directory
- **Endpoints**: `/api/ai/hint`, `/api/ai/code-review`, `/api/ai/explain`, `/api/ai/bugs`
- **Pattern**: All use OpenAI API with JSON response parsing
- **Auth**: JWT-based authentication via `authenticateRequest()`

### Database Models
- **User**: Email, username, settings
- **Problem**: userId, platform, title, difficulty, topics, status, etc.
- **Contest, Todo**: Other tracked entities

---

## 🎯 What You Need to Implement

### 1. **Database Schema Addition**

Add to `prisma/schema.prisma`:

```prisma
model UserProblemSuggestion {
  id            String   @id @default(cuid())
  userId        String   @db.ObjectId
  problemId     String   @db.ObjectId
  generatedAt   DateTime @default(now())
  expiresAt     DateTime // 30 days from generatedAt
  suggestions   Json     // Structured suggestion data
  source        String   @default("llm-failure")
  failureReason String?
  confidence    Float    @default(0.0)
  error         Json?    // Error details if generation failed
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem       Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  
  @@unique([userId, problemId])
  @@index([userId, expiresAt])
  @@map("user_problem_suggestions")
}
```

**Why this structure?**
- `expiresAt`: Enables 30-day cache expiration
- `suggestions`: Stores JSON with 3 categories
- `confidence`: Tracks LLM confidence in failure detection
- `error`: Logs failures for debugging

---

## 🔌 API Endpoints to Create

### Endpoint 1: POST `/api/problems/[id]/llm-result`

**Purpose**: Detect failure and generate suggestions

**Request Body**:
```typescript
{
  userId: string;
  transcript: string;        // User's attempt/explanation
  userFinalStatus: "solved" | "unsolved" | "partial";
  code?: string;             // Optional: user's code
  problemDescription?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data?: {
    failed: boolean;
    failureReason: string;
    missingConcepts: string[];
    confidence: number;
    suggestions?: {
      prerequisites: Array<{
        title: string;
        difficulty: string;
        reason: string;
        estimatedTime: number;
      }>;
      similarProblems: Array<{
        title: string;
        tags: string[];
        reason: string;
      }>;
      microtasks: Array<{
        title: string;
        description: string;
        duration: number;
      }>;
    };
  };
  error?: string;
}
```

**Logic Flow**:
1. Call LLM with "Failure Detection" prompt
2. Parse response → `{ failed, failure_reason, missing_concepts, confidence }`
3. If `failed === true && confidence >= 0.6`:
   - Call "Suggestion Generator" prompt
   - Save to DB with 30-day expiration
4. Return suggestions

---

### Endpoint 2: GET `/api/problems/[id]/suggestions?userId=...`

**Purpose**: Retrieve cached suggestions

**Response**:
```typescript
{
  success: boolean;
  data?: {
    cached: boolean;
    suggestions: {...};
    generatedAt: string;
    expiresAt: string;
  };
  error?: string;
}
```

**Logic**:
- Check if valid suggestion exists in DB
- If expired or missing, return 404
- Return cached data with metadata

---

## 🧠 LLM Prompts Needed

### Prompt 1: Failure Detection

```
You are an expert coding mentor analyzing a student's attempt at a problem.

Problem: [title]
Description: [description]
Student's Transcript: [transcript]
Code (if provided): [code]
Final Status: [solved/unsolved/partial]

Analyze whether the student failed and why. Return JSON:
{
  "failed": boolean,
  "failure_reason": "specific reason",
  "missing_concepts": ["concept1", "concept2"],
  "confidence": 0.0-1.0
}
```

### Prompt 2: Suggestion Generator

```
Based on the student's failure in this problem:
Problem: [title]
Missing Concepts: [concepts]
Difficulty: [difficulty]

Generate 3 categories of follow-up suggestions in JSON format:
{
  "prerequisites": [...],
  "similarProblems": [...],
  "microtasks": [...]
}
```

---

## 🔄 Integration Points

### Frontend Changes Needed

1. **Review Tab** (`src/app/page.tsx`):
   - Add "View Suggestions" button on unsolved problems
   - Show suggestion panel when clicked

2. **New Component**: `SuggestionPanel.tsx`
   - Display 3 categories
   - Allow users to add suggestions as todos/problems

3. **Problem Card Enhancement**:
   - Add badge showing "Suggestions Available"
   - Link to suggestion details

### Backend Changes Needed

1. Create new API route file
2. Add Prisma model
3. Create LLM prompt utilities
4. Add caching logic

---

## ⚙️ Implementation Checklist

- [ ] Add Prisma model to schema
- [ ] Run `npx prisma migrate dev`
- [ ] Create `/api/problems/[id]/llm-result` endpoint
- [ ] Create `/api/problems/[id]/suggestions` endpoint
- [ ] Write LLM prompts
- [ ] Create `SuggestionPanel.tsx` component
- [ ] Integrate into Review tab
- [ ] Add error handling & fallbacks
- [ ] Test with real LLM calls
- [ ] Add caching logic (30-day expiration)
- [ ] Create tests

---

## 💡 Key Considerations

1. **Cost**: Each failure detection = 2 LLM calls. Consider rate limiting.
2. **Latency**: Generate suggestions async, show loading state
3. **Fallback**: Have curated suggestions if LLM fails
4. **Privacy**: Store suggestions securely, tied to userId
5. **Cache**: 30-day expiration prevents stale suggestions

---

## 📊 Data Flow Diagram

```
User marks problem "unsolved"
    ↓
POST /api/problems/[id]/llm-result
    ↓
Call LLM: Failure Detection
    ↓
If failed && confidence >= 0.6:
    ↓
Call LLM: Suggestion Generator
    ↓
Save to DB (UserProblemSuggestion)
    ↓
Return suggestions to frontend
    ↓
Display in Review tab
    ↓
User can add suggestions as todos/problems
```

---

## 🚀 Next Steps

1. **Discuss** this plan with me
2. **Clarify** any requirements
3. **Decide** on:
   - Confidence threshold (currently 0.6)
   - Cache duration (currently 30 days)
   - Which LLM model to use
   - Rate limiting strategy
4. **Start implementation** once approved

---

## ❓ Questions to Answer

1. Should suggestions be generated **synchronously** or **asynchronously**?
2. Should we show a **loading state** while generating?
3. Should users be able to **regenerate** suggestions?
4. Should we **track** which suggestions users actually use?
5. Should suggestions be **shareable** between users with similar failures?


