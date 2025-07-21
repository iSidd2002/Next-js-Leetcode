# Review Feature Deployment Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue 1: Review Tab Shows No Problems

**Symptoms:**
- Review tab appears empty even when problems are marked for review
- "Mark for Review" button doesn't work
- Problems don't appear in review list after being marked

**Diagnosis Steps:**
1. Check the debug endpoint: `GET /api/debug/review`
2. Verify database connection
3. Check authentication status

**Solutions:**

#### A. Database Connection Issues
```bash
# Check if DATABASE_URL is set correctly
curl -X GET "https://your-app.vercel.app/api/debug/review"
```

If you see authentication errors, the database connection might be failing.

**Fix:**
- Ensure `DATABASE_URL` is set in your deployment environment
- For Vercel: Add `DATABASE_URL` in Project Settings → Environment Variables
- For other platforms: Set the environment variable accordingly

#### B. Authentication Problems
```bash
# Test with authentication
curl -X GET "https://your-app.vercel.app/api/debug/review" \
  -H "Cookie: auth-token=your-token"
```

**Fix:**
- Ensure JWT_SECRET is set in production
- Check that cookies are being sent correctly
- Verify NEXTAUTH_URL is set to your production URL

### Issue 2: Invalid Review Dates

**Symptoms:**
- Problems marked for review but nextReviewDate is null or invalid
- Console errors about date parsing
- Review scheduling not working

**Diagnosis:**
```bash
# Check for invalid dates
curl -X GET "https://your-app.vercel.app/api/debug/review"
```

Look for `invalidDates` count > 0 in the response.

**Fix:**
```bash
# Auto-fix invalid dates
curl -X POST "https://your-app.vercel.app/api/debug/review" \
  -H "Cookie: auth-token=your-token"
```

### Issue 3: Spaced Repetition Not Working

**Symptoms:**
- Problems don't get rescheduled after review
- Review intervals are incorrect
- nextReviewDate doesn't update

**Diagnosis:**
Check the spaced repetition logic in the frontend and API calls.

**Fix:**
Ensure the `handleProblemReviewed` function is being called correctly:

```typescript
const handleProblemReviewed = async (id: string, quality: number = 4) => {
  try {
    const problem = problems.find(p => p.id === id);
    if (!problem) return;

    const updatedProblem = markAsReviewed(problem, quality);
    await handleUpdateProblem(problem.id, updatedProblem);
  } catch (error) {
    console.error('Failed to mark problem as reviewed:', error);
  }
};
```

### Issue 4: Environment Variables

**Required Environment Variables for Review Feature:**

```env
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-super-secret-32-character-jwt-key
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app

# Optional: For development debugging
NODE_ENV=production
```

### Issue 5: MongoDB Atlas Configuration

**Common MongoDB Atlas Issues:**

1. **IP Whitelist**: Ensure `0.0.0.0/0` is added to allow connections from Vercel
2. **Database User**: Ensure the user has read/write permissions
3. **Connection String**: Use the correct format:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## 🧪 Testing the Review Feature

### Step 1: Test Database Connection
```bash
curl -X GET "https://your-app.vercel.app/api/problems"
```
Should return `{"success": true, "data": [...]}`

### Step 2: Test Authentication
```bash
# Login first
curl -X POST "https://your-app.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email", "password": "your-password"}'

# Use the returned token
curl -X GET "https://your-app.vercel.app/api/debug/review" \
  -H "Cookie: auth-token=returned-token"
```

### Step 3: Test Review Functionality
```bash
# Add a problem for review
curl -X POST "https://your-app.vercel.app/api/problems" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=your-token" \
  -d '{
    "title": "Test Problem",
    "platform": "leetcode",
    "difficulty": "Easy",
    "url": "https://leetcode.com/problems/test",
    "isReview": true
  }'

# Check if it appears in review debug
curl -X GET "https://your-app.vercel.app/api/debug/review" \
  -H "Cookie: auth-token=your-token"
```

## 🚀 Quick Fix Commands

### Fix All Review Issues at Once
```bash
# 1. Fix invalid dates
curl -X POST "https://your-app.vercel.app/api/debug/review" \
  -H "Cookie: auth-token=your-token"

# 2. Check status
curl -X GET "https://your-app.vercel.app/api/debug/review" \
  -H "Cookie: auth-token=your-token"
```

### Reset All Review Data (Nuclear Option)
```bash
# This will reset all review scheduling - use with caution
curl -X POST "https://your-app.vercel.app/api/debug/dates" \
  -H "Cookie: auth-token=your-token"
```

## 📞 Support

If none of these solutions work:

1. Check the browser console for JavaScript errors
2. Check the server logs in your deployment platform
3. Use the debug endpoint to get detailed information
4. Verify all environment variables are set correctly

The debug endpoint `/api/debug/review` provides comprehensive information about the review system status and can help identify the specific issue.
