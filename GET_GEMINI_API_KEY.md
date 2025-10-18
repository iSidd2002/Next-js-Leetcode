# Get Gemini API Key - Step by Step

## 🚀 Quick Steps (2 minutes)

### Step 1: Go to Google AI Studio
1. Open this link in your browser: **https://aistudio.google.com/app/apikey**
2. You'll be asked to sign in with your Google account
3. Click "Sign in with Google"

### Step 2: Create API Key
1. Click the blue button: **"Create API Key"**
2. A dialog will appear asking where to create the key
3. Select: **"Create API key in new project"** (or use existing project)
4. Click **"Create API key in Google Cloud"**

### Step 3: Copy Your API Key
1. Your new API key will appear on the screen
2. Click the **copy icon** next to the key
3. The key is now in your clipboard

### Step 4: Update `.env.local`
1. Open the file: `.env.local` in your editor
2. Find line 20: `GEMINI_API_KEY="AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g"`
3. Replace the old key with your new key:
   ```
   GEMINI_API_KEY="your-new-key-here"
   ```
4. **Save the file** (Cmd+S or Ctrl+S)

### Step 5: Restart Dev Server
1. In your terminal, press: **Ctrl+C** (to stop the server)
2. Run: **`npm run dev`**
3. Wait for: **`✓ Ready in X.Xs`**

### Step 6: Test It
1. Hard refresh browser: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
2. Go to **Review tab**
3. Click **💡 button** on a problem
4. Should see **suggestions modal** (no errors)

## ✅ Verification

### Check if it worked:

**In Browser Console (F12)**:
- Should see: `Generating suggestions for platform: leetcode`
- Should NOT see: `Gemini API error`

**In Network Tab (F12)**:
- Look for POST request to `/api/problems/[id]/llm-result`
- Response should show: `"success": true` with suggestions

**In Terminal**:
- Should see: `Generating suggestions for platform: [platform]`
- Should NOT see: `Gemini API error`

## 🆘 Troubleshooting

### Issue: "API key not found"
**Solution**: 
- Make sure `.env.local` is saved
- Restart dev server (Ctrl+C, then `npm run dev`)
- Hard refresh browser

### Issue: "models/gemini-2.0-flash is not found"
**Solution 1**: Try different model
- Edit: `src/services/suggestionService.ts` line 51
- Change: `gemini-2.0-flash` to `gemini-1.5-pro`
- Restart dev server

**Solution 2**: Check API key permissions
- Go to: https://console.cloud.google.com/
- Select your project
- Go to: APIs & Services → Credentials
- Verify API key has access to "Generative Language API"

### Issue: "Quota exceeded"
**Solution**:
- Free tier: 60 requests per minute
- Wait a few minutes and try again
- Or upgrade to paid plan

### Issue: Still getting errors
**Solution**:
- Copy API key from Google AI Studio again
- Make sure there are NO extra spaces
- Check `.env.local` is saved
- Restart dev server
- Hard refresh browser

## 📝 What to Expect

### Before API Key Update
- ❌ Suggestions modal shows generic suggestions
- ❌ Console shows: `Gemini API error: models/gemini-1.5-flash is not found`
- ❌ Network tab shows error response

### After API Key Update
- ✅ Suggestions modal shows platform-specific suggestions
- ✅ Console shows: `Generating suggestions for platform: leetcode`
- ✅ Network tab shows success response with suggestions
- ✅ LeetCode problems get LeetCode suggestions
- ✅ CodeForces problems get CodeForces suggestions
- ✅ AtCoder problems get AtCoder suggestions

## 🔗 Useful Links

- **Google AI Studio**: https://aistudio.google.com/app/apikey
- **Google Cloud Console**: https://console.cloud.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Gemini Models**: https://ai.google.dev/models

## ⏱️ Time Required

- Get API key: 2 minutes
- Update `.env.local`: 1 minute
- Restart server: 1 minute
- Test: 2 minutes

**Total**: ~6 minutes

---

**Status**: Ready to get API key
**Difficulty**: Easy
**Time**: ~6 minutes

