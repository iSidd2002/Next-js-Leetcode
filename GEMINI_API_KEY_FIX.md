# Gemini API Key Fix Guide

## 🔴 Problem

The LLM suggestion feature is failing with this error:

```
Gemini API error: models/gemini-1.5-flash is not found for API version v1beta, 
or is not supported for generateContent
```

## 🔍 Root Cause

The Gemini API key in `.env.local` is either:
- Invalid or expired
- Doesn't have access to the `gemini-1.5-flash` model
- The API key quota has been exceeded

## ✅ Solution

### Step 1: Get a New Gemini API Key

1. **Open Google AI Studio**:
   - Go to: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create a new API key**:
   - Click "Create API Key"
   - Select "Create API key in new project" or use existing project
   - Copy the generated API key

3. **Verify the key works**:
   - Go to: https://aistudio.google.com/app/apikey
   - You should see your new key listed

### Step 2: Update `.env.local`

1. **Open the file**: `.env.local`

2. **Find this line**:
   ```
   GEMINI_API_KEY="AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g"
   ```

3. **Replace with your new key**:
   ```
   GEMINI_API_KEY="your-new-api-key-here"
   ```

4. **Save the file**

### Step 3: Restart the Dev Server

1. **Stop the current server**:
   - Press `Ctrl+C` in the terminal

2. **Start the server again**:
   ```bash
   npm run dev
   ```

3. **Wait for compilation**:
   - Should see: `✓ Ready in X.Xs`

### Step 4: Test the Fix

1. **Hard refresh browser**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

2. **Go to Review tab**

3. **Click 💡 button on a problem**

4. **Check for suggestions**:
   - Should see suggestions modal
   - No API errors in console

## 🔄 Model Update

I've also updated the code to use `gemini-2.0-flash` (the latest model) instead of `gemini-1.5-flash`. This is more reliable and has better performance.

**File changed**: `src/services/suggestionService.ts`
**Change**: Updated API endpoint to use `gemini-2.0-flash`

## 🧪 Verification

### Check if API key is working:

1. **Open browser DevTools**: F12
2. **Go to Network tab**
3. **Click 💡 button on a problem**
4. **Look for POST request to `/api/problems/[id]/llm-result`**
5. **Check response**:
   - ✅ Success: `"success": true` with suggestions
   - ❌ Error: `"error": "Gemini API error..."`

### Check console for errors:

1. **Open browser DevTools**: F12
2. **Go to Console tab**
3. **Look for error messages**:
   - ✅ Good: `Generating suggestions for platform: leetcode`
   - ❌ Bad: `Gemini API error: ...`

## 🆘 Troubleshooting

### Issue: Still getting API errors

**Solution 1: Verify API key is correct**
- Copy the key from Google AI Studio again
- Make sure there are no extra spaces
- Check `.env.local` is saved

**Solution 2: Check API key permissions**
- Go to: https://console.cloud.google.com/
- Select your project
- Go to APIs & Services → Credentials
- Verify the API key has access to Generative Language API

**Solution 3: Check quota**
- Go to: https://console.cloud.google.com/
- Go to APIs & Services → Quotas
- Check if you've exceeded daily quota
- Free tier has limits: 60 requests per minute

**Solution 4: Try different model**
- If `gemini-2.0-flash` doesn't work, try `gemini-1.5-pro`
- Edit `src/services/suggestionService.ts` line 51
- Change `gemini-2.0-flash` to `gemini-1.5-pro`

### Issue: API key not loading

**Solution:**
- Make sure `.env.local` is in the project root
- Restart dev server after changing `.env.local`
- Check file is saved (should see checkmark in editor)

## 📋 Checklist

- [ ] Got new API key from Google AI Studio
- [ ] Updated `.env.local` with new key
- [ ] Restarted dev server
- [ ] Hard refreshed browser
- [ ] Clicked 💡 button on a problem
- [ ] Saw suggestions modal (no errors)
- [ ] Checked console for "Generating suggestions for platform" log

## 🔗 Useful Links

- **Google AI Studio**: https://aistudio.google.com/app/apikey
- **Google Cloud Console**: https://console.cloud.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Gemini Models**: https://ai.google.dev/models

## ✨ Status

After completing these steps:
- ✅ API key will be valid
- ✅ Gemini API will work
- ✅ LLM suggestions will generate
- ✅ Platform-specific suggestions will appear

---

**Date**: 2025-10-18
**Model Updated**: `gemini-1.5-flash` → `gemini-2.0-flash`
**Status**: Ready for API key update

