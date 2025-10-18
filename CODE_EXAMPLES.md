# LLM-Failure Feature - Code Examples

## 1️⃣ Prisma Schema Addition

```prisma
// prisma/schema.prisma

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

// Update User model:
model User {
  // ... existing fields ...
  suggestions UserProblemSuggestion[]
}

// Update Problem model:
model Problem {
  // ... existing fields ...
  suggestions UserProblemSuggestion[]
}
```

---

## 2️⃣ LLM Prompts

```typescript
// src/lib/llm-prompts.ts

export const failureDetectionPrompt = (
  problemTitle: string,
  problemDescription: string,
  transcript: string,
  code?: string
) => `
You are an expert coding mentor analyzing a student's attempt at a problem.

Problem: ${problemTitle}
Description: ${problemDescription}
${code ? `Code:\n\`\`\`\n${code}\n\`\`\`` : ''}
Student's Explanation: ${transcript}

Analyze whether the student failed and identify missing concepts.

Return ONLY valid JSON (no markdown, no extra text):
{
  "failed": boolean,
  "failure_reason": "specific reason why they failed",
  "missing_concepts": ["concept1", "concept2", "concept3"],
  "confidence": 0.0-1.0
}
`;

export const suggestionGeneratorPrompt = (
  problemTitle: string,
  difficulty: string,
  topics: string[],
  missingConcepts: string[]
) => `
A student failed this problem: ${problemTitle} (${difficulty})
Topics: ${topics.join(', ')}
Missing Concepts: ${missingConcepts.join(', ')}

Generate 3 categories of follow-up suggestions in JSON format:

{
  "prerequisites": [
    {
      "title": "concept drill title",
      "difficulty": "Easy|Medium|Hard",
      "reason": "why this helps",
      "estimatedTime": 15
    }
  ],
  "similarProblems": [
    {
      "title": "problem title",
      "tags": ["tag1", "tag2"],
      "reason": "why this is similar"
    }
  ],
  "microtasks": [
    {
      "title": "task title",
      "description": "what to do",
      "duration": 20
    }
  ]
}
`;
```

---

## 3️⃣ Suggestion Service

```typescript
// src/services/suggestionService.ts

import prisma from '@/lib/prisma';

export class SuggestionService {
  async detectFailure(
    problemTitle: string,
    problemDescription: string,
    transcript: string,
    code?: string
  ) {
    const prompt = failureDetectionPrompt(
      problemTitle,
      problemDescription,
      transcript,
      code
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert coding mentor. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async generateSuggestions(
    problemTitle: string,
    difficulty: string,
    topics: string[],
    missingConcepts: string[]
  ) {
    const prompt = suggestionGeneratorPrompt(
      problemTitle,
      difficulty,
      topics,
      missingConcepts
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert coding mentor. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async cacheSuggestions(
    userId: string,
    problemId: string,
    suggestions: any,
    failureReason: string,
    confidence: number
  ) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return await prisma.userProblemSuggestion.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {
        suggestions,
        failureReason,
        confidence,
        expiresAt,
        generatedAt: new Date(),
      },
      create: {
        userId,
        problemId,
        suggestions,
        failureReason,
        confidence,
        expiresAt,
      },
    });
  }

  async getSuggestions(userId: string, problemId: string) {
    const suggestion = await prisma.userProblemSuggestion.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });

    if (!suggestion) return null;
    if (new Date() > suggestion.expiresAt) return null;

    return suggestion;
  }
}
```

---

## 4️⃣ API Endpoint

```typescript
// src/app/api/problems/[id]/llm-result/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { SuggestionService } from '@/services/suggestionService';

const suggestionService = new SuggestionService();
const CONFIDENCE_THRESHOLD = 0.6;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transcript, userFinalStatus, code, problemDescription } = body;

    // Get problem from DB
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Check cache first
    const cached = await suggestionService.getSuggestions(user.id, params.id);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.suggestions,
        cached: true,
      });
    }

    // Detect failure
    const failureDetection = await suggestionService.detectFailure(
      problem.title,
      problemDescription || '',
      transcript,
      code
    );

    if (
      !failureDetection.failed ||
      failureDetection.confidence < CONFIDENCE_THRESHOLD
    ) {
      return NextResponse.json({
        success: true,
        data: null,
        reason: 'No failure detected or low confidence',
      });
    }

    // Generate suggestions
    const suggestions = await suggestionService.generateSuggestions(
      problem.title,
      problem.difficulty,
      problem.topics,
      failureDetection.missing_concepts
    );

    // Cache suggestions
    await suggestionService.cacheSuggestions(
      user.id,
      params.id,
      suggestions,
      failureDetection.failure_reason,
      failureDetection.confidence
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
      cached: false,
    });
  } catch (error) {
    console.error('LLM result error:', error);
    return NextResponse.json(
      { error: 'Failed to process LLM result' },
      { status: 500 }
    );
  }
}
```

---

## 5️⃣ Frontend Component

```typescript
// src/components/SuggestionPanel.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SuggestionPanelProps {
  suggestions: any;
  onAddToTodos: (task: any) => void;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  suggestions,
  onAddToTodos,
}) => {
  return (
    <div className="space-y-6">
      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Prerequisites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.prerequisites.map((item: any, idx: number) => (
            <div key={idx} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.reason}</p>
                  <Badge className="mt-2">{item.estimatedTime} min</Badge>
                </div>
                <Button size="sm" onClick={() => onAddToTodos(item)}>
                  Add
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Similar Problems */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Similar Problems</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.similarProblems.map((item: any, idx: number) => (
            <div key={idx} className="border rounded p-3">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.reason}</p>
              <div className="flex gap-2 mt-2">
                {item.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Microtasks */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Microtasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.microtasks.map((item: any, idx: number) => (
            <div key={idx} className="border rounded p-3">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
              <Badge className="mt-2">{item.duration} min</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
```


