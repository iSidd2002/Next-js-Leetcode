# Vercel Environment Variables Setup

## 🔴 Problem

The LLM feature is not working on Vercel because the `GEMINI_API_KEY` environment variable is missing from Vercel's project settings.

---

## ✅ Solution

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Select your project: **Next-js-Leetcode**
3. Click on **Settings** tab

### Step 2: Add Environment Variables

1. Click on **Environment Variables** (left sidebar)
2. Click **Add New** button
3. Fill in the following:

#### Variable 1: GEMINI_API_KEY
```
Name: GEMINI_API_KEY
Value: AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g
Environments: Production, Preview, Development
```

#### Variable 2: DATABASE_URL (if not already set)
```
Name: DATABASE_URL
Value: mongodb+srv://[your-mongodb-connection-string]
Environments: Production, Preview, Development
```

#### Variable 3: JWT_SECRET (if not already set)
```
Name: JWT_SECRET
Value: [your-32-character-secret-key]
Environments: Production, Preview, Development
```

#### Variable 4: NEXTAUTH_SECRET (if not already set)
```
Name: NEXTAUTH_SECRET
Value: [your-nextauth-secret]
Environments: Production, Preview, Development
```

### Step 3: Save and Redeploy

1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click the three dots (...) on the latest deployment
4. Select **Redeploy**
5. Wait for the build to complete

---

## 🔍 Verify the Fix

After redeployment:

1. Open your Vercel app
2. Try the LLM feature (click 💡 button on a problem)
3. Check browser console for errors (F12)
4. Check Vercel logs: **Deployments** → **Latest** → **Logs**

---

## 📋 Required Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API for LLM suggestions | ✅ Yes |
| `DATABASE_URL` | MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | JWT token signing | ✅ Yes |
| `NEXTAUTH_SECRET` | NextAuth session secret | ✅ Yes |

---

## 🐛 Troubleshooting

### Issue: "Gemini API key not configured"
**Solution**: Make sure `GEMINI_API_KEY` is added to Vercel environment variables

### Issue: "Prisma Client initialization error"
**Solution**: Already fixed! The build script now includes `prisma generate`

### Issue: Still not working after redeploy
**Solution**: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check Vercel logs for detailed errors

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Gemini API Key: https://aistudio.google.com/app/apikey
- Project Settings: https://vercel.com/dashboard/[project-name]/settings

---

## ✨ After Setup

Once environment variables are set and redeployed:
- ✅ LLM feature will work
- ✅ Suggestions will generate
- ✅ Web search will work
- ✅ AtCoder optimization will work

