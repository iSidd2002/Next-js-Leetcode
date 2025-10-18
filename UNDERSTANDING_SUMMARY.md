# Understanding the LeetCode Tracker - Complete Summary

## 🎯 What This Project Does

This is a **full-stack web application** that helps developers master coding problems through intelligent tracking and spaced repetition learning. Think of it as a personal tutor that reminds you to review problems at optimal times for maximum retention.

### Real-World Use Case
```
Developer's Journey:
1. Solves a LeetCode problem on Day 1
2. App reminds them to review on Day 3
3. They review and rate difficulty
4. App schedules next review for Day 7
5. Process repeats until problem is mastered
6. Developer can track progress across companies and platforms
```

---

## 🏗️ How It's Built - The 3 Layers

### Layer 1: Frontend (What Users See)
- **Technology**: React 19 + Next.js 15
- **Styling**: Tailwind CSS + Shadcn/UI components
- **Location**: `src/components/` and `src/app/page.tsx`
- **What it does**: 
  - Displays dashboard with tabs (Problems, Contests, Todos, etc.)
  - Shows forms for adding/editing data
  - Renders charts and statistics
  - Handles user interactions

### Layer 2: Backend (The Brain)
- **Technology**: Next.js API Routes + Node.js
- **Location**: `src/app/api/`
- **What it does**:
  - Handles user registration and login
  - Processes CRUD operations (Create, Read, Update, Delete)
  - Validates data
  - Manages authentication
  - Fetches external data (LeetCode POTD, contests)

### Layer 3: Database (The Memory)
- **Technology**: MongoDB + Prisma ORM
- **Location**: `prisma/schema.prisma`
- **What it does**:
  - Stores user accounts
  - Stores problems, contests, todos
  - Maintains relationships between data
  - Persists all user information

---

## 🔄 How Data Flows Through the System

### Example: Adding a Problem

```
1. User clicks "Add Problem" button
   ↓
2. Form appears with fields (title, difficulty, URL, etc.)
   ↓
3. User fills form and clicks "Submit"
   ↓
4. Frontend calls StorageService.addProblem(data)
   ↓
5. StorageService calls ApiService.createProblem(data)
   ↓
6. ApiService makes HTTP POST to /api/problems
   ↓
7. Middleware verifies JWT token (is user logged in?)
   ↓
8. API route receives request with user ID
   ↓
9. API creates problem in MongoDB with userId
   ↓
10. Database returns created problem
   ↓
11. API sends response back to frontend
   ↓
12. Frontend caches in localStorage
   ↓
13. Frontend updates UI to show new problem
   ↓
14. User sees problem in Problems tab
```

---

## 🔐 Authentication - How Security Works

### The Problem
- We need to know WHO is making requests
- We need to prevent unauthorized access
- We need to keep passwords safe

### The Solution: JWT (JSON Web Tokens)

```
Registration:
1. User enters email + password
2. Password is hashed (bcryptjs) - can't be reversed
3. User stored in database with hashed password
4. JWT token generated (like a digital ID card)
5. Token sent to user in HTTP-only cookie

Login:
1. User enters email + password
2. System finds user by email
3. Compares entered password with stored hash
4. If match, generates JWT token
5. Token sent in cookie

Subsequent Requests:
1. Browser automatically includes token in cookie
2. Middleware verifies token signature
3. If valid, extracts user ID
4. User ID attached to request
5. API knows which user is making request
6. Returns only that user's data
```

---

## 📊 The Spaced Repetition Algorithm

### Why It Works
Research shows we forget things over time. Spaced repetition fights this by:
- Reviewing material just before you forget it
- Gradually increasing review intervals
- Adjusting based on how well you know the material

### How It Works in This App

```
Initial State:
- repetition = 0
- interval = 1 day
- nextReviewDate = today + 1 day

After First Review (user rates quality 0-5):
- Quality 0-2 (forgot): Reset to interval=1
- Quality 3 (struggled): interval = interval × 1.3
- Quality 4 (good): interval = interval × 1.5
- Quality 5 (perfect): interval = interval × 2.0

Example Progression:
Day 1: Learn problem
Day 2: Review (quality=4) → next review in 1.5 days
Day 3.5: Review (quality=4) → next review in 2.25 days
Day 5.75: Review (quality=4) → next review in 3.375 days
...continues until mastered
```

---

## 🗂️ Key Concepts Explained

### Problems vs POTD vs Company Problems
```
Manual Problems:
- User adds manually
- Tracked in Problems tab
- Can be marked for review
- Source: 'manual'

POTD (Problem of the Day):
- Fetched from LeetCode daily
- Stored separately
- Can be moved to Problems
- Source: 'potd'
- Auto-cleanup after 30 days

Company Problems:
- Imported from company lists
- Organized by company
- Tracked separately
- Source: 'company'
```

### Problem Status
```
Active: Currently working on or reviewing
Learned: Mastered, no longer needs review
```

### Problem Source
```
'manual': User added manually
'company': Imported from company problems
'potd': From Problem of the Day
```

---

## 🎯 Main Features Explained

### 1. Dashboard
- Shows overview of all your progress
- Statistics: total problems, by difficulty, by platform
- Charts showing distribution
- Quick actions to add problems or import

### 2. Problems Tab
- Lists all problems you've added
- Filter by platform, difficulty, company
- Mark for review, edit, delete
- See which are active vs learned

### 3. Review Tab
- Shows only problems marked for review
- Highlights problems that are DUE
- Rate quality after reviewing
- System calculates next review date

### 4. Companies Tab
- Organize problems by target company
- Import company-specific problems
- Track progress per company
- See which companies you're prepared for

### 5. Contests Tab
- Track contest participation
- Record rank and rating
- See contest history
- Analyze performance trends

### 6. Todos Tab
- Manage coding-related tasks
- Set priorities and deadlines
- Track time spent
- Organize by category

### 7. Analytics Tab
- Visualize your progress
- See statistics by platform/difficulty
- Track review cycle progress
- Identify weak areas

---

## 🔌 API Endpoints - What They Do

### Authentication
```
POST /api/auth/register
  Input: email, username, password
  Output: user info, JWT token
  
POST /api/auth/login
  Input: email, password
  Output: user info, JWT token
  
GET /api/auth/profile
  Input: JWT token (in cookie)
  Output: current user info
```

### Problems
```
GET /api/problems
  Returns: all user's problems
  
POST /api/problems
  Creates: new problem
  
PUT /api/problems/[id]
  Updates: existing problem
  
DELETE /api/problems/[id]
  Deletes: problem
```

---

## 💾 Database Structure

### User Collection
```
{
  _id: ObjectId,
  email: "user@example.com",
  username: "john_doe",
  password: "hashed_password",
  reviewIntervals: [1, 3, 7, 14, 30],
  theme: "dark",
  createdAt: Date
}
```

### Problem Collection
```
{
  _id: ObjectId,
  userId: ObjectId (links to User),
  title: "Two Sum",
  platform: "leetcode",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/two-sum/",
  isReview: true,
  repetition: 2,
  interval: 7,
  nextReviewDate: "2024-10-23",
  topics: ["Array", "Hash Table"],
  status: "active",
  companies: ["Google", "Amazon"],
  source: "manual"
}
```

---

## 🚀 How to Use This Project

### For Learning
1. Read PROJECT_OVERVIEW.md for architecture
2. Read FEATURES_DETAILED.md for features
3. Read DEVELOPMENT_GUIDE.md for setup
4. Use QUICK_REFERENCE.md while coding

### For Development
1. Set up environment (see DEVELOPMENT_GUIDE.md)
2. Make changes to code
3. Test locally with `npm run dev`
4. Check API with debug endpoints
5. Deploy when ready

### For Debugging
1. Check browser console for errors
2. Check Network tab for API calls
3. Use `/api/debug/*` endpoints
4. Check localStorage in DevTools
5. Review server logs in terminal

---

## 🎓 Learning Outcomes

After understanding this project, you'll know:
- ✅ How to build full-stack Next.js applications
- ✅ How JWT authentication works
- ✅ How to structure a React application
- ✅ How to design database schemas
- ✅ How to build RESTful APIs
- ✅ How to implement spaced repetition
- ✅ How to handle offline data
- ✅ How to integrate external APIs
- ✅ How to deploy to production

---

## 🔗 File Navigation Guide

**Want to understand...**

| Topic | File |
|-------|------|
| Main UI | `src/app/page.tsx` |
| API calls | `src/services/api.ts` |
| Data storage | `src/utils/storage.ts` |
| Authentication | `src/lib/auth.ts` |
| Database schema | `prisma/schema.prisma` |
| Problem logic | `src/utils/spacedRepetition.ts` |
| Components | `src/components/` |
| API routes | `src/app/api/` |

---

## 🎯 Next Steps

1. **Explore the Code**: Start with `src/app/page.tsx`
2. **Run Locally**: Follow setup in DEVELOPMENT_GUIDE.md
3. **Make Changes**: Use QUICK_REFERENCE.md
4. **Deploy**: Push to GitHub and deploy to Vercel
5. **Extend**: Add new features using patterns in codebase

---

## 📞 Quick Help

**"How do I add a new feature?"**
→ See DEVELOPMENT_GUIDE.md section "Adding a New Feature"

**"How does authentication work?"**
→ See this file's "Authentication" section

**"What's the database structure?"**
→ See PROJECT_OVERVIEW.md "Database Schema"

**"How do I debug an issue?"**
→ See QUICK_REFERENCE.md "Troubleshooting"

**"What are the API endpoints?"**
→ See QUICK_REFERENCE.md "API Endpoints Cheat Sheet"

---

## 🎉 Congratulations!

You now understand the LeetCode Tracker project! You know:
- What it does and why
- How it's structured
- How data flows through it
- How authentication works
- How to navigate the codebase
- How to make changes and deploy

Happy coding! 🚀

