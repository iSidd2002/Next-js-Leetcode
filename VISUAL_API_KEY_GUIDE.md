# Visual Guide - Get Gemini API Key

## 🎯 Goal
Get a valid Gemini API key and update your `.env.local` file so the LLM suggestions feature works.

## 📍 Step 1: Open Google AI Studio

**URL**: https://aistudio.google.com/app/apikey

```
┌─────────────────────────────────────────────────────────┐
│  Google AI Studio - API Keys                            │
│  https://aistudio.google.com/app/apikey                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Sign in with Google]                                  │
│                                                          │
│  Your API Keys:                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ No API keys yet                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Create API Key] ← Click this button                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📍 Step 2: Click "Create API Key"

```
┌─────────────────────────────────────────────────────────┐
│  Create API Key Dialog                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Where would you like to create your API key?           │
│                                                          │
│  ○ Create API key in new project                        │
│  ○ Create API key in existing project                   │
│                                                          │
│  [Cancel]  [Create API key in Google Cloud]             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📍 Step 3: Your API Key Appears

```
┌─────────────────────────────────────────────────────────┐
│  Your API Key                                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  API Key:                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ AIzaSyD...xK9mL2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7 │  │
│  │                                          [Copy] │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ✓ Key copied to clipboard!                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📍 Step 4: Update `.env.local`

**File**: `.env.local`

```
# Before:
GEMINI_API_KEY="AIzaSyAhx_WRsW4-nHj-Q6iT7uHL09VyWX2my9g"

# After:
GEMINI_API_KEY="AIzaSyD...xK9mL2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7"
                 ↑ Replace with your new key
```

**Steps**:
1. Open `.env.local` in your editor
2. Find line 20 with `GEMINI_API_KEY=`
3. Delete the old key (inside quotes)
4. Paste your new key
5. Save file (Cmd+S or Ctrl+S)

## 📍 Step 5: Restart Dev Server

**Terminal**:
```bash
# Current state:
$ npm run dev
✓ Ready in 2.8s

# Press Ctrl+C to stop:
^C

# Restart:
$ npm run dev
✓ Ready in 2.8s  ← Wait for this message
```

## 📍 Step 6: Test in Browser

**URL**: http://localhost:3000

```
┌─────────────────────────────────────────────────────────┐
│  Problem Tracker                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [All] [Review] [Completed]                             │
│                                                          │
│  Review Problems:                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Two Sum          [Edit] [💡] [Delete]            │  │
│  │ Add Two Numbers  [Edit] [💡] [Delete]            │  │
│  │ Longest Substr   [Edit] [💡] [Delete]            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Click 💡 button ↑                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📍 Step 7: See Suggestions

**After clicking 💡**:

```
┌─────────────────────────────────────────────────────────┐
│  Suggestions for Two Sum                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📚 Prerequisites:                                       │
│  • Review Data Structures Fundamentals                  │
│  • Practice Array Manipulation                          │
│  • Learn Time Complexity Analysis                       │
│                                                          │
│  🎯 Similar Problems:                                   │
│  • Two Sum II - Input Array Is Sorted                   │
│  • Contains Duplicate                                   │
│  • Valid Anagram                                        │
│                                                          │
│  ⚡ Microtasks:                                         │
│  • Implement hash table from scratch                    │
│  • Practice two-pointer technique                       │
│  • Solve 3 array problems                               │
│                                                          │
│  [Close]                                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## ✅ Verification Checklist

- [ ] Opened https://aistudio.google.com/app/apikey
- [ ] Signed in with Google
- [ ] Clicked "Create API Key"
- [ ] Copied the new API key
- [ ] Updated `.env.local` line 20
- [ ] Saved `.env.local`
- [ ] Restarted dev server (Ctrl+C, npm run dev)
- [ ] Hard refreshed browser (Cmd+Shift+R)
- [ ] Clicked 💡 button on a problem
- [ ] Saw suggestions modal (no errors)

## 🎉 Success!

If you see the suggestions modal with platform-specific suggestions, you're done! 🎊

---

**Time**: ~6 minutes
**Difficulty**: Easy
**Status**: Ready to implement

