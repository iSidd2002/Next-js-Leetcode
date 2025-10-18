# Development Guide - LeetCode Tracker

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- MongoDB instance (local or Atlas)
- Git

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd nextjs-leetcode-tracker

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your values:
# - DATABASE_URL: MongoDB connection string
# - JWT_SECRET: 32+ character random string
# - OPENAI_API_KEY: (optional, for AI features)

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📁 File Organization

### Adding a New Feature

**1. Create API Route** (`src/app/api/[feature]/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Your logic here
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**2. Add API Service Method** (`src/services/api.ts`)
```typescript
static async getFeature(): Promise<any> {
  return this.request('/feature');
}
```

**3. Create Component** (`src/components/Feature.tsx`)
```typescript
'use client';
import { useState, useEffect } from 'react';
import ApiService from '@/services/api';

export default function Feature() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    ApiService.getFeature().then(setData);
  }, []);
  
  return <div>{/* Your JSX */}</div>;
}
```

**4. Add to Main Page** (`src/app/page.tsx`)
```typescript
<TabsContent value="feature">
  <Feature />
</TabsContent>
```

---

## 🔧 Common Development Tasks

### Adding a New Database Model

**1. Update Prisma Schema** (`prisma/schema.prisma`)
```prisma
model NewModel {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  title     String
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("newmodels")
}
```

**2. Create Mongoose Model** (`src/models/NewModel.ts`)
```typescript
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.NewModel || 
  mongoose.model('NewModel', schema);
```

**3. Generate & Push**
```bash
npx prisma generate
npx prisma db push
```

---

### Adding Authentication to a Route

```typescript
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Access token required' },
      { status: 401 }
    );
  }
  
  // User is authenticated, user.id is available
}
```

---

### Adding a New Tab to Dashboard

**1. Add Tab Trigger** (in `page.tsx` TabsList)
```typescript
<TabsTrigger value="newtab">
  <Icon className="h-4 w-4 mr-2" />
  <span>New Tab</span>
</TabsTrigger>
```

**2. Add Tab Content** (in TabsContent)
```typescript
<TabsContent value="newtab">
  <NewTabComponent />
</TabsContent>
```

**3. Create Component** (`src/components/NewTabComponent.tsx`)

---

### Working with Forms

**Using React Hook Form** (recommended)
```typescript
import { useForm } from 'react-hook-form';

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    try {
      await ApiService.submitData(data);
      toast.success('Success!');
    } catch (error) {
      toast.error('Error!');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('field', { required: true })} />
      {errors.field && <span>Required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### Adding Notifications

**Using Sonner Toast**
```typescript
import { toast } from 'sonner';

// Success
toast.success('Operation successful!');

// Error
toast.error('Something went wrong');

// Info
toast.info('FYI: This is informational');

// Loading
const id = toast.loading('Processing...');
toast.success('Done!', { id });
```

---

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

### Writing Tests
```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

---

## 🐛 Debugging

### Browser DevTools
- **Network Tab**: Monitor API calls
- **Application Tab**: Check localStorage, cookies
- **Console**: View logs and errors
- **React DevTools**: Inspect component state

### Server Logs
```bash
# Development server shows logs in terminal
# Check for:
# - API request logs
# - Database connection logs
# - Authentication logs
# - Error stack traces
```

### Debug Endpoints
- `GET /api/debug/auth` - User information
- `GET /api/debug/dates` - Date validation issues
- `GET /api/debug/import-status` - Import statistics

---

## 📦 Building & Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-32-character-secret-key
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production
```

### Deployment to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Or manually deploy:
npm install -g vercel
vercel
```

---

## 🔍 Code Quality

### Linting
```bash
npm run lint
```

### TypeScript Checking
```bash
npx tsc --noEmit
```

### Code Style
- Use Prettier (configured in project)
- Follow ESLint rules
- Use TypeScript strict mode
- Add JSDoc comments for complex functions

---

## 📚 Key Patterns Used

### API Service Pattern
```typescript
// Centralized API calls
class ApiService {
  static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Handle auth, errors, retries
  }
}
```

### Storage Service Pattern
```typescript
// Hybrid localStorage + API
class StorageService {
  static async getProblems(): Promise<Problem[]> {
    // Try API first, fallback to localStorage
  }
}
```

### Component Composition
```typescript
// Reusable, composable components
<ProblemList
  problems={problems}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
/>
```

---

## 🚨 Common Issues & Solutions

### Issue: "Access token required" error
**Solution**: Check if user is logged in, verify JWT_SECRET is set

### Issue: Database connection fails
**Solution**: Verify DATABASE_URL, check MongoDB is running

### Issue: POTD not loading
**Solution**: Check LeetCode GraphQL API, verify network connectivity

### Issue: Spaced repetition dates wrong
**Solution**: Run `/api/debug/dates` to check for invalid dates

### Issue: Company problems not importing
**Solution**: Check `/api/debug/import-status` for import statistics

---

## 📖 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

---

## 📝 Git Workflow

```bash
# Update from main
git pull origin main

# Create feature branch
git checkout -b feature/description

# Make changes
git add .
git commit -m "Descriptive message"

# Push to remote
git push origin feature/description

# Create PR on GitHub
```

---

## 🎯 Performance Tips

1. **Use React.memo** for expensive components
2. **Lazy load** components with dynamic imports
3. **Optimize images** with Next.js Image component
4. **Cache API responses** appropriately
5. **Minimize bundle size** - check with `npm run build`
6. **Use localStorage** for frequently accessed data
7. **Debounce** search and filter inputs

