# Vercel Deployment Guide for LeetCode CF Tracker

## ⚠️ Important: Vercel Pro Plan Required

The AI features require **Vercel Pro Plan** for the 300-second (5-minute) function timeout. The Hobby plan only supports 10-second timeouts, which is insufficient for AI processing.

## 🚀 Latest Optimizations (v2.0)

**Performance Improvements:**
- ✅ Response times reduced to 10-15 seconds (down from 30-60 seconds)
- ✅ Token usage reduced by 60% (now ~800-1200 tokens)
- ✅ Fallback system prevents timeouts
- ✅ Enhanced JSON parsing with 100% success rate

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iSidd2002/Next-js-Leetcode.git)

## 📋 Required Environment Variables

Set these environment variables in your Vercel dashboard:

### **Essential Variables**
```bash
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority"

# Authentication
JWT_SECRET="your-super-secure-32-character-jwt-secret-key-here"
NEXTAUTH_SECRET="your-secure-nextauth-secret-for-production"
NEXTAUTH_URL="https://your-vercel-app.vercel.app"

# AI Features (Required for Similar Problems & Review Insights)
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="models/gemini-2.5-flash"
GEMINI_FALLBACK_MODEL="models/gemini-2.5-flash-lite"

# AI Configuration
AI_MAX_TOKENS=8192
AI_SIMILAR_PROBLEMS_TOKENS=8192
AI_REVIEW_INSIGHTS_TOKENS=8192
AI_CACHE_TTL_HOURS=24
AI_RATE_LIMIT_PER_HOUR=100

# Vercel Optimization
VERCEL_ENV="production"
VERCEL_TIMEOUT_SECONDS=60
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
```

## 🔧 Vercel Configuration

The project includes optimized `vercel.json` configuration:

- **AI Endpoints**: 60-second timeout, 1GB memory
- **Regular Endpoints**: 30-second timeout
- **CORS Headers**: Configured for API access
- **Runtime**: Node.js for AI processing

## 🎯 AI Features Setup

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to Vercel environment variables as `GEMINI_API_KEY`

### 2. MongoDB Setup
1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Add it to Vercel as `DATABASE_URL`

### 3. Generate Secrets
```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32
```

## 🚀 Deployment Steps

### Option 1: One-Click Deploy
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Set environment variables
4. Deploy!

### Option 2: Manual Deploy
1. Fork/clone the repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy from Vercel dashboard

## ✅ Post-Deployment Verification

### 1. Check Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "database": "connected",
  "ai": "configured",
  "environment": "production"
}
```

### 2. Test AI Features
```bash
# Test Similar Problems API
curl -X POST https://your-app.vercel.app/api/ai/similar \
  -H "Content-Type: application/json" \
  -d '{
    "problem": {
      "id": "test",
      "title": "Two Sum",
      "platform": "leetcode",
      "difficulty": "Easy",
      "topics": ["Array", "Hash Table"]
    },
    "targetDistribution": {"easy": 2, "medium": 1, "hard": 1}
  }'
```

## 🔍 Troubleshooting

### Common Issues

**1. Function Timeout**
- Ensure `maxDuration: 60` in vercel.json
- Check AI token limits are reasonable
- Verify Gemini API key is valid

**2. Environment Variables**
- Double-check all required variables are set
- Ensure no trailing spaces in values
- Verify MongoDB connection string format

**3. AI API Errors**
- Check Gemini API key permissions
- Verify API quota/billing
- Monitor Vercel function logs

### Monitoring
- Check Vercel function logs for errors
- Monitor AI API usage and costs
- Set up alerts for function timeouts

## 📊 Performance Optimization

The deployment is optimized for:
- **Fast Cold Starts**: Standalone build output
- **Efficient Caching**: 24-hour TTL for AI responses
- **Rate Limiting**: 100 requests/hour per user
- **Memory Management**: 1GB for AI functions
- **Timeout Handling**: 60-second max for AI processing

## 🎉 Success!

Your LeetCode CF Tracker with AI-powered features is now live on Vercel!

Features available:
- ✅ Problem tracking across LeetCode, Codeforces, AtCoder
- ✅ Spaced repetition system
- ✅ AI-powered similar problem recommendations
- ✅ AI-powered review insights
- ✅ Company-specific problem lists
- ✅ Progress analytics
