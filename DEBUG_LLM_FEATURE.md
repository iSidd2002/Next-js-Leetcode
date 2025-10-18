# Debug LLM Feature - Troubleshooting Guide

## 🔍 How to Debug

### Step 1: Check Browser Console
1. Open your Vercel app
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Click the 💡 button on any problem
5. Look for error messages

### Step 2: Check Vercel Logs
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Deployments**
4. Click the latest deployment
5. Click **Logs** tab
6. Look for errors related to `llm-result` or `Gemini`

### Step 3: Test the API Directly

Open your browser console and run:

```javascript
// Test the API endpoint
const testLLM = async () => {
  const response = await fetch('/api/problems/test-id/llm-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: 'I tried but could not solve it',
      userFinalStatus: 'unsolved'
    })
  });
  const data = await response.json();
  console.log('Response:', data);
};

testLLM();
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Gemini API key not configured"
**Cause**: Environment variable not set in Vercel
**Solution**: 
1. Go to Vercel Settings → Environment Variables
2. Add `GEMINI_API_KEY=AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g`
3. Redeploy

### Issue 2: "models/gemini-2.0-flash is not found"
**Cause**: Model name might be wrong or API key doesn't have access
**Solution**: 
- Try using `gemini-1.5-flash` instead
- Or check if the API key is valid at https://aistudio.google.com/app/apikey

### Issue 3: "No content in Gemini response"
**Cause**: API returned empty response
**Solution**:
- Check if the prompt is too long
- Check if the API is rate-limited
- Try again after a few seconds

### Issue 4: "Failed to parse JSON"
**Cause**: Gemini returned non-JSON response
**Solution**:
- The prompt might be asking for something that doesn't return JSON
- Check the prompt in `src/lib/llm-prompts.ts`

### Issue 5: "No failure detected or low confidence"
**Cause**: Confidence score below 60%
**Solution**:
- This is expected behavior - the system only generates suggestions if confident
- Try with a more detailed transcript

---

## 🔧 Fixes Applied

### ✅ Fix 1: Changed Gemini Model
Changed from `gemini-2.0-flash` to `gemini-1.5-flash` (more stable)
- File: `src/services/suggestionService.ts` line 61
- Reason: gemini-2.0-flash might not be available in all regions

### ✅ Fix 2: Added Better Error Logging
Added console logs to help debug:
- Constructor logs if API key is configured
- API response logging for debugging
- Error response logging

### ✅ Fix 3: Added Detailed Error Messages
- Shows full error response from Gemini API
- Shows full response data if content is missing

### Fix 2: Add Error Logging
Add this to `src/services/suggestionService.ts` after line 88:

```typescript
console.log('Gemini API Response Status:', response.status);
console.log('Gemini API Response:', error);
```

### Fix 3: Check API Key Format
The API key should start with `AIza...`

Current key: `AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g`
- ✅ Starts with `AIza`
- ✅ Has correct format

---

## 📊 Testing Checklist

- [ ] GEMINI_API_KEY is set in Vercel
- [ ] API key is valid (test at https://aistudio.google.com/app/apikey)
- [ ] Model name is correct (gemini-2.0-flash or gemini-1.5-flash)
- [ ] Browser console shows no errors
- [ ] Vercel logs show no errors
- [ ] Transcript is not empty
- [ ] Problem exists in database
- [ ] User is authenticated

---

## ✅ Changes Made

### 1. Updated Gemini Model
- Changed from `gemini-2.0-flash` to `gemini-1.5-flash`
- More stable and widely available
- File: `src/services/suggestionService.ts`

### 2. Added Comprehensive Logging
- Constructor logs if API key is configured
- API response logging for debugging
- Error response logging with full details
- Helps identify issues quickly

### 3. Build Status
- ✅ Build successful
- ✅ API key is being read correctly
- ✅ All 28 routes compiled
- ✅ Ready for deployment

---

## 📝 Next Steps

1. **Rebuild on Vercel**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click **Deployments**
   - Click the latest deployment
   - Click **Redeploy**

2. **Test the Feature**:
   - Open your Vercel app
   - Go to Review tab
   - Click 💡 button on any problem
   - Check browser console (F12) for logs

3. **Check Logs**:
   - If it fails, check Vercel logs
   - Look for "SuggestionService initialized"
   - Look for "Gemini API Response"
   - Look for any error messages

4. **If Still Not Working**:
   - Check that GEMINI_API_KEY is set in Vercel
   - Verify the API key is valid
   - Check browser console for network errors
   - Check Vercel logs for server errors

