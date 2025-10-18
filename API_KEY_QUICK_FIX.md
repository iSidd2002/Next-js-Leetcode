# Quick Fix: Gemini API Key

## 🚀 3-Minute Fix

### Step 1: Get New API Key (1 min)
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Step 2: Update `.env.local` (1 min)
1. Open `.env.local` in your editor
2. Find line 20: `GEMINI_API_KEY="..."`
3. Replace with your new key:
   ```
   GEMINI_API_KEY="your-new-key-here"
   ```
4. Save file

### Step 3: Restart Server (1 min)
1. Press `Ctrl+C` in terminal
2. Run: `npm run dev`
3. Wait for: `✓ Ready in X.Xs`

## ✅ Test It

1. Hard refresh browser: `Cmd+Shift+R`
2. Go to Review tab
3. Click 💡 button
4. Should see suggestions (no errors)

## 📝 What Changed

- Updated model: `gemini-1.5-flash` → `gemini-2.0-flash`
- File: `src/services/suggestionService.ts` line 51

## 🆘 Still Not Working?

1. **Verify key is correct**:
   - Copy from Google AI Studio again
   - No extra spaces

2. **Check permissions**:
   - Go to: https://console.cloud.google.com/
   - Verify API key has access

3. **Check quota**:
   - Free tier: 60 requests/minute
   - May need to wait or upgrade

4. **Try different model**:
   - Edit `src/services/suggestionService.ts` line 51
   - Change to: `gemini-1.5-pro`

## 📚 Full Guide

See: `GEMINI_API_KEY_FIX.md` for detailed instructions

---

**Time to fix**: ~3 minutes
**Difficulty**: Easy
**Status**: Ready to implement

