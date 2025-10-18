# Quick Reference Guide

## 🎯 Project at a Glance

**What**: Full-stack Next.js app for tracking coding problems with spaced repetition
**Tech**: Next.js 15, React 19, MongoDB, Prisma, TypeScript, Tailwind CSS
**Purpose**: Help developers master coding problems through intelligent review scheduling

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| **Frontend Components** | 30+ |
| **API Routes** | 15+ |
| **Database Models** | 4 (User, Problem, Contest, Todo) |
| **Supported Platforms** | 3 (LeetCode, CodeForces, AtCoder) |
| **Companies Supported** | 50+ |
| **Review Intervals** | 5 (1, 3, 7, 14, 30 days) |

---

## 🗂️ Directory Quick Map

```
src/
├── app/page.tsx              ← Main dashboard (1300+ lines)
├── app/api/                  ← All backend routes
├── components/               ← React components
├── services/api.ts           ← API client
├── utils/storage.ts          ← Data persistence
├── lib/auth.ts               ← JWT & passwords
├── models/                   ← Mongoose schemas
└── types/index.ts            ← TypeScript interfaces
```

---

## 🔑 Core Concepts

### Problem Lifecycle
```
Add Problem → Active Problems → Mark for Review → Review Cycle → Learned
```

### Spaced Repetition
```
Day 1 → Day 3 → Day 7 → Day 14 → Day 30 → Mastered
(Quality rating adjusts intervals)
```

### Data Flow
```
UI Component → ApiService → API Route → Middleware → Database
                    ↓
              StorageService (localStorage cache)
```

### Authentication
```
Register/Login → JWT Token → HTTP-only Cookie → Protected Routes
```

---

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build           # Build for production
npm start               # Start production server
npm test                # Run tests
npm run lint            # Lint code

# Database
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to DB
npx prisma studio     # Open Prisma Studio GUI

# Debugging
curl http://localhost:3000/api/health
curl http://localhost:3000/api/debug/auth
```

---

## 📱 Main Tabs & Features

| Tab | Component | Purpose |
|-----|-----------|---------|
| Dashboard | Dashboard.tsx | Overview & stats |
| Companies | CompanyDashboard.tsx | Company problems |
| POTD | MonthlyPotdList.tsx | Daily problems |
| Contests | ContestTracker.tsx | Contest tracking |
| Todos | TodoList.tsx | Task management |
| Study | StudyHub.tsx | Learning resources |
| Problems | ProblemList.tsx | All problems |
| Review | ProblemList.tsx | Problems to review |
| Learned | ProblemList.tsx | Mastered problems |
| Analytics | Analytics.tsx | Statistics |
| Resources | ExternalResources.tsx | External links |

---

## 🔌 API Endpoints Cheat Sheet

### Auth
```
POST   /api/auth/register      # Create account
POST   /api/auth/login         # Login
GET    /api/auth/profile       # Get user info
POST   /api/auth/logout        # Logout
```

### Problems
```
GET    /api/problems           # Get all problems
POST   /api/problems           # Create problem
PUT    /api/problems/[id]      # Update problem
DELETE /api/problems/[id]      # Delete problem
POST   /api/problems/bulk      # Bulk create
```

### Contests
```
GET    /api/contests           # Get contests
POST   /api/contests           # Create contest
PUT    /api/contests/[id]      # Update contest
DELETE /api/contests/[id]      # Delete contest
GET    /api/contests/all       # All platform contests
```

### Todos
```
GET    /api/todos              # Get todos
POST   /api/todos              # Create todo
PUT    /api/todos/[id]         # Update todo
DELETE /api/todos/[id]         # Delete todo
```

### External
```
GET    /api/potd               # Problem of the Day
GET    /api/daily-challenge    # Daily challenges
GET    /api/companies          # Company problems
POST   /api/ai/hint            # Get hint
POST   /api/ai/code-review     # Review code
GET    /api/health             # Health check
```

---

## 💾 Data Models Quick Reference

### Problem
```typescript
{
  id: string,
  userId: string,
  platform: 'leetcode' | 'codeforces' | 'atcoder',
  title: string,
  difficulty: string,
  url: string,
  dateSolved: string,
  isReview: boolean,
  repetition: number,
  interval: number,
  nextReviewDate: string | null,
  topics: string[],
  status: 'active' | 'learned',
  companies: string[],
  source: 'manual' | 'company' | 'potd'
}
```

### Contest
```typescript
{
  id: string,
  userId: string,
  platform: string,
  name: string,
  date: string,
  rank?: number,
  rating?: number,
  problemsSolved: number,
  problemsTotal: number
}
```

### Todo
```typescript
{
  id: string,
  userId: string,
  title: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  category: 'coding' | 'study' | 'interview-prep' | 'project' | 'personal' | 'other',
  dueDate?: string,
  completedAt?: string,
  tags: string[],
  estimatedTime?: number,
  actualTime?: number
}
```

---

## 🔐 Authentication Flow

```
1. User enters email/password
2. POST /api/auth/register or /api/auth/login
3. Server hashes password (bcryptjs)
4. Server generates JWT token
5. Token sent in HTTP-only cookie
6. Client stores auth-status cookie
7. Subsequent requests include token
8. Middleware verifies token
9. User ID attached to request
```

---

## 🎨 Component Hierarchy

```
RootLayout
└── ThemeProvider
    └── HomePage (page.tsx)
        ├── Header
        │   ├── Logo
        │   ├── Theme Toggle
        │   └── User Menu
        └── Tabs
            ├── Dashboard
            ├── Companies
            ├── POTD
            ├── Contests
            ├── Todos
            ├── Study
            ├── Problems
            ├── Review
            ├── Learned
            ├── Analytics
            └── Resources
```

---

## 🛠️ Utility Functions

### StorageService
```typescript
StorageService.getProblems()           // Get all problems
StorageService.addProblem(data)        // Add problem
StorageService.updateProblem(id, data) // Update problem
StorageService.deleteProblem(id)       // Delete problem
StorageService.getContests()           // Get contests
StorageService.getTodos()              // Get todos
StorageService.syncWithServer()        // Sync data
```

### ApiService
```typescript
ApiService.register(email, username, password)
ApiService.login(email, password)
ApiService.getProfile()
ApiService.getProblems()
ApiService.createProblem(data)
ApiService.updateProblem(id, data)
ApiService.deleteProblem(id)
ApiService.isAuthenticated()
ApiService.logout()
```

### Spaced Repetition
```typescript
initializeSpacedRepetition(problem, isReview)
markAsReviewed(problem, quality)
calculateNextReviewDate(interval)
```

---

## 🎯 Common Workflows

### Add a Problem
1. Click "Add Problem" button
2. Fill form (platform, title, difficulty, URL, notes)
3. Submit
4. Problem appears in Problems tab

### Mark for Review
1. Open problem
2. Click "Mark for Review"
3. Problem appears in Review tab when due
4. Rate quality (0-5)
5. System calculates next review date

### Import Company Problems
1. Go to Companies tab
2. Select company
3. Click "Import Problems"
4. Problems added with source='company'
5. Track separately from manual problems

### Track Contest
1. Go to Contests tab
2. Click "Add Contest"
3. Enter platform, name, date, rank, rating
4. View contest history and statistics

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check email/password, verify user exists |
| Problems not loading | Check auth token, verify database connection |
| POTD not showing | Check LeetCode API, verify network |
| Dates wrong | Run `/api/debug/dates` endpoint |
| Company import fails | Check `/api/debug/import-status` |
| Offline mode stuck | Clear localStorage, refresh page |

---

## 📚 File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| page.tsx | 1300+ | Main dashboard |
| api.ts | 325+ | API client |
| storage.ts | 566+ | Data persistence |
| ProblemList.tsx | 400+ | Problem display |
| Dashboard.tsx | 300+ | Dashboard view |

---

## 🔗 Important Links

- **Main Page**: `src/app/page.tsx`
- **API Routes**: `src/app/api/`
- **Components**: `src/components/`
- **Services**: `src/services/api.ts`
- **Utils**: `src/utils/`
- **Database Schema**: `prisma/schema.prisma`
- **Environment**: `.env.local`

---

## 💡 Pro Tips

1. **Use localStorage DevTools** to inspect cached data
2. **Check Network tab** to debug API calls
3. **Use `/api/debug/*` endpoints** for troubleshooting
4. **Enable offline mode** for testing
5. **Check console logs** for detailed error messages
6. **Use Prisma Studio** to inspect database: `npx prisma studio`
7. **Test with different themes** (light/dark)
8. **Test on mobile** using DevTools device emulation

---

## 🎓 Learning Path

1. **Understand Architecture**: Read PROJECT_OVERVIEW.md
2. **Explore Features**: Read FEATURES_DETAILED.md
3. **Setup Development**: Follow DEVELOPMENT_GUIDE.md
4. **Make Changes**: Use this Quick Reference
5. **Debug Issues**: Check Troubleshooting section
6. **Deploy**: Follow deployment instructions in README.md

