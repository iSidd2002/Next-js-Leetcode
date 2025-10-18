# LeetCode CF Tracker - Complete Project Overview

## 📋 Project Summary
A comprehensive **Next.js 15** full-stack application for tracking coding problems across multiple platforms (LeetCode, CodeForces, AtCoder). Features spaced repetition learning, contest tracking, company-specific problem organization, and AI-powered assistance.

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **UI Components**: Radix UI, Lucide React icons
- **Data Visualization**: Recharts
- **Forms**: React Hook Form
- **Notifications**: Sonner (toast)
- **Styling**: Tailwind CSS + Tailwind Merge

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (backend)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── problems/      # Problem CRUD operations
│   │   ├── contests/      # Contest management
│   │   ├── todos/         # Todo management
│   │   ├── potd/          # Problem of the Day
│   │   ├── ai/            # AI assistance (hints, code review)
│   │   ├── companies/     # Company problems
│   │   ├── daily-challenge/ # Daily challenges
│   │   ├── study/         # Study features
│   │   ├── debug/         # Debug endpoints
│   │   └── health/        # Health check
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── Dashboard.tsx     # Main dashboard
│   ├── ProblemList.tsx   # Problem listing
│   ├── ProblemForm.tsx   # Problem form
│   ├── CompanyDashboard.tsx
│   ├── ContestTracker.tsx
│   ├── TodoList.tsx
│   ├── Analytics.tsx
│   ├── AuthModal.tsx
│   └── ...
├── services/             # API client service
│   └── api.ts           # ApiService class
├── utils/               # Utility functions
│   ├── storage.ts       # StorageService (localStorage + API)
│   ├── spacedRepetition.ts
│   ├── potdCleanup.ts
│   ├── companyStats.ts
│   └── ...
├── lib/                 # Library functions
│   ├── auth.ts         # JWT, password hashing
│   ├── mongodb.ts      # MongoDB connection
│   ├── prisma.ts       # Prisma client
│   └── companies.ts    # Company data
├── models/             # Mongoose models
│   ├── User.ts
│   ├── Problem.ts
│   ├── Contest.ts
│   └── Todo.ts
└── types/              # TypeScript interfaces
    └── index.ts
```

---

## 📊 Database Schema (MongoDB + Prisma)

### User Model
```typescript
- id: ObjectId (primary key)
- email: String (unique)
- username: String (unique)
- password: String (hashed)
- reviewIntervals: Int[] (default: [1, 3, 7, 14, 30])
- enableNotifications: Boolean
- theme: String ('dark' | 'light')
- timezone: String
- createdAt, updatedAt: DateTime
```

### Problem Model
```typescript
- id: ObjectId
- userId: ObjectId (foreign key)
- platform: String ('leetcode' | 'codeforces' | 'atcoder')
- title, problemId, difficulty, url: String
- dateSolved, createdAt: String
- notes: String
- isReview: Boolean
- repetition, interval: Int
- nextReviewDate: String | null
- topics: String[]
- status: String ('active' | 'learned')
- companies: String[]
- source: String ('manual' | 'company' | 'potd')
```

### Contest Model
```typescript
- id: ObjectId
- userId: ObjectId
- platform, name, date: String
- rank, rating: Int | null
- problemsSolved, problemsTotal: Int
- notes: String
- createdAt: String
```

### Todo Model
```typescript
- id: ObjectId
- userId: ObjectId
- title, description: String
- priority: String ('low' | 'medium' | 'high' | 'urgent')
- status: String ('pending' | 'in-progress' | 'completed' | 'cancelled')
- category: String ('coding' | 'study' | 'interview-prep' | 'project' | 'personal' | 'other')
- dueDate, completedAt, createdAt, updatedAt: String
- tags: String[]
- estimatedTime, actualTime: Int | null
- notes: String
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Problems
- `GET /api/problems` - Get all user problems (with filters)
- `POST /api/problems` - Create new problem
- `PUT /api/problems/[id]` - Update problem
- `DELETE /api/problems/[id]` - Delete problem
- `POST /api/problems/bulk` - Bulk create problems

### Contests
- `GET /api/contests` - Get user contests
- `POST /api/contests` - Create contest
- `PUT /api/contests/[id]` - Update contest
- `DELETE /api/contests/[id]` - Delete contest
- `GET /api/contests/all` - Get all platform contests

### Todos
- `GET /api/todos` - Get user todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Delete todo

### External Data
- `GET /api/potd` - Get LeetCode Problem of the Day
- `GET /api/daily-challenge` - Get daily challenges
- `GET /api/companies` - Get company problems

### AI Features
- `POST /api/ai/hint` - Generate problem hints
- `POST /api/ai/code-review` - Review code
- `POST /api/ai/explain` - Explain concepts

### Utilities
- `GET /api/health` - Health check
- `GET /api/debug/auth` - Debug auth info
- `GET /api/debug/dates` - Debug date issues
- `GET /api/debug/import-status` - Debug import status

---

## 🔐 Authentication Flow

1. **Registration**: User creates account → Password hashed with bcryptjs → JWT token generated
2. **Login**: Credentials verified → JWT token created → Stored in HTTP-only cookie
3. **Protected Routes**: Middleware verifies JWT token → User attached to request
4. **Client-side**: ApiService checks auth cookie → Retries with exponential backoff

---

## 🎯 Key Features

### 1. Problem Tracking
- Add problems from multiple platforms
- Track difficulty, topics, companies
- Mark as solved/learned
- Add custom notes

### 2. Spaced Repetition
- Configurable review intervals (default: 1, 3, 7, 14, 30 days)
- Automatic next review date calculation
- Quality-based interval adjustment
- Review status tracking

### 3. Company Problems
- Import company-specific problems
- Filter by company
- Track company-wise progress
- Bulk import capability

### 4. Contest Tracking
- Track contest participation
- Record rank and rating changes
- Multi-platform support
- Contest history

### 5. Todo Management
- Priority levels (low, medium, high, urgent)
- Categories (coding, study, interview-prep, etc.)
- Time tracking (estimated vs actual)
- Status workflow

### 6. Analytics
- Problem statistics by platform/difficulty
- Progress visualization with Recharts
- Company-wise breakdown
- Review cycle analytics

### 7. AI Assistance
- Problem hints with difficulty levels
- Code review with quality metrics
- Concept explanations
- Fallback curated hints

### 8. Problem of the Day (POTD)
- LeetCode daily problem integration
- Monthly POTD archive
- Automatic cleanup of expired problems
- Move to problems section

---

## 🔄 Data Flow

### Frontend (Client)
1. User interacts with UI components
2. Components call StorageService methods
3. StorageService uses ApiService for API calls
4. ApiService handles JWT authentication
5. Data cached in localStorage for offline support

### Backend (API Routes)
1. Request arrives at API route
2. Middleware verifies JWT token
3. authenticateRequest extracts user info
4. Database operations via Mongoose/Prisma
5. Response returned with user-specific data

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📝 Key Files to Know

- **page.tsx** - Main dashboard with all tabs and state management
- **api.ts** - ApiService class for all API calls
- **storage.ts** - StorageService for localStorage + API sync
- **auth.ts** - JWT and password utilities
- **middleware.ts** - Route protection and auth verification
- **spacedRepetition.ts** - Spaced repetition algorithm
- **prisma/schema.prisma** - Database schema definition

---

## 🧪 Testing
- Jest configured with ts-jest
- Test environment: jsdom
- Module path mapping for @/ imports
- Tests located in `src/__tests__` and `src/components/__tests__`

---

## 🔒 Security Features
- JWT-based authentication
- bcryptjs password hashing
- HTTP-only cookies for tokens
- Protected API routes via middleware
- Rate limiting on login endpoint
- Input validation on all endpoints

