# 🧪 Manual Testing Guide - LLM Feature

## 📋 Pre-Test Checklist

- [x] Dev server running on http://localhost:3000
- [x] All code changes in place
- [x] GEMINI_API_KEY configured
- [x] Browser ready for testing

---

## 🧪 Test 1: Verify Lightbulb Button Visibility

### Steps
1. **Open browser**: http://localhost:3000
2. **Login** if needed
3. **Click "Review" tab** at the top
4. **Look for the 💡 button** next to each problem

### What to Look For
```
Expected Layout:
┌─────────────────────────────────────────────────────┐
│ Problem Title                    [Edit] [💡] [Delete]│
└─────────────────────────────────────────────────────┘
```

### Success Criteria
- ✅ 💡 button is visible
- ✅ Button is positioned between Edit and Delete
- ✅ Button is blue colored
- ✅ Hovering shows tooltip "Get AI suggestions"

### If Button is NOT Visible
1. **Hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear cache**: Ctrl+Shift+Delete
3. **Check console**: F12 → Console tab for errors
4. **Restart server**: Kill and run `npm run dev` again

---

## 🧪 Test 2: Click Button & Observe Loading State

### Steps
1. **Click the 💡 button** on any problem
2. **Observe the loading state** (should appear briefly)
3. **Wait for modal to appear**

### What to Look For
```
Expected Sequence:
1. Click 💡 button
   ↓
2. Loading spinner appears
   ↓
3. Modal opens with title "💡 Suggestions for [Problem Name]"
```

### Success Criteria
- ✅ Loading state appears
- ✅ Modal appears within 2-5 seconds
- ✅ Modal title shows problem name
- ✅ No errors in console

### If Modal Doesn't Appear
1. **Check console**: F12 → Console tab
2. **Look for errors**: Red error messages
3. **Check Network tab**: F12 → Network tab
4. **Look for API call**: Should see POST to `/api/problems/[id]/llm-result`

---

## 🧪 Test 3: Verify Suggestions Display

### Steps
1. **View the modal** with suggestions
2. **Scroll through all content**
3. **Verify all 3 categories are present**

### What to Look For
```
Expected Modal Content:
┌─────────────────────────────────────────┐
│ 💡 Suggestions for [Problem Name]       │
├─────────────────────────────────────────┤
│                                         │
│ 📚 Prerequisites                        │
│ ├─ Concept 1 [Add]                     │
│ ├─ Concept 2 [Add]                     │
│ └─ Concept 3 [Add]                     │
│                                         │
│ 🔗 Similar Problems                     │
│ ├─ Problem 1 [Add]                     │
│ ├─ Problem 2 [Add]                     │
│ └─ Problem 3 [Add]                     │
│                                         │
│ ⚡ Microtasks                           │
│ ├─ Task 1 [Add]                        │
│ ├─ Task 2 [Add]                        │
│ └─ Task 3 [Add]                        │
│                                         │
└─────────────────────────────────────────┘
```

### Success Criteria
- ✅ All 3 categories visible
- ✅ Each category has items
- ✅ Each item has "Add" button
- ✅ Failure reason shown (if available)
- ✅ Confidence score shown (if available)

---

## 🧪 Test 4: Test "Add to Todos" Functionality

### Steps
1. **Click "Add" button** on any suggestion
2. **Observe toast notification** (should say "Added to Todos!")
3. **Go to Todos tab**
4. **Verify suggestion appears** as a new todo

### What to Look For
```
Expected Behavior:
1. Click [Add] button
   ↓
2. Toast appears: "Added to Todos!"
   ↓
3. Go to Todos tab
   ↓
4. New todo appears with suggestion title
```

### Success Criteria
- ✅ Toast notification appears
- ✅ Toast says "Added to Todos!"
- ✅ Suggestion appears in Todos tab
- ✅ Todo has correct title and description
- ✅ No errors in console

---

## 🧪 Test 5: Verify API Endpoint

### Steps
1. **Open DevTools**: F12
2. **Go to Network tab**
3. **Click 💡 button** on a problem
4. **Look for API request**

### What to Look For
```
Expected Network Request:
Method: POST
URL: /api/problems/[problem-id]/llm-result
Status: 200 OK
Response: {
  "success": true,
  "data": {
    "prerequisites": [...],
    "similarProblems": [...],
    "microtasks": [...]
  },
  "failureReason": "...",
  "confidence": 0.85
}
```

### Success Criteria
- ✅ Request method is POST
- ✅ URL contains `/api/problems/[id]/llm-result`
- ✅ Status code is 200
- ✅ Response has success: true
- ✅ Response has all 3 categories

---

## 🧪 Test 6: Test Caching

### Steps
1. **Click 💡 button** on a problem (first time)
2. **Note the response time** (should be 2-5 seconds)
3. **Close the modal**
4. **Click 💡 button** on the same problem (second time)
5. **Note the response time** (should be instant)

### What to Look For
```
Expected Behavior:
First Click:  2-5 seconds (API call to Gemini)
Second Click: <100ms (from cache)
```

### Success Criteria
- ✅ First click takes 2-5 seconds
- ✅ Second click is instant
- ✅ Same suggestions displayed both times
- ✅ Network tab shows cache hit on second click

---

## 🧪 Test 7: Check Browser Console

### Steps
1. **Open DevTools**: F12
2. **Go to Console tab**
3. **Look for any errors or warnings**

### What to Look For
```
Expected Console Output:
✅ No red error messages
✅ May see info logs about API calls
✅ May see warnings about Webpack/Turbopack
```

### Success Criteria
- ✅ No red errors
- ✅ No "undefined" errors
- ✅ No "Cannot read property" errors
- ✅ No import/export errors

---

## 📊 Testing Checklist

- [ ] Test 1: Button visible in Review tab
- [ ] Test 2: Button click shows loading state
- [ ] Test 3: Modal appears with suggestions
- [ ] Test 4: All 3 categories displayed
- [ ] Test 5: "Add to Todos" works
- [ ] Test 6: Suggestion appears in Todos tab
- [ ] Test 7: API endpoint working (Network tab)
- [ ] Test 8: Caching working (second click instant)
- [ ] Test 9: No console errors
- [ ] Test 10: Dark mode looks good

---

## 🐛 Troubleshooting

### Button Not Visible
```
1. Hard refresh: Ctrl+Shift+R
2. Clear cache: Ctrl+Shift+Delete
3. Check console: F12 → Console
4. Restart server: Kill and npm run dev
```

### Modal Doesn't Appear
```
1. Check Network tab: F12 → Network
2. Look for API error: Should see POST request
3. Check response: Should have status 200
4. Check console: Look for error messages
```

### API Returns Error
```
1. Check GEMINI_API_KEY: Should be in .env.local
2. Check API response: Network tab → Response
3. Check server logs: Terminal output
4. Verify internet connection
```

### Suggestions Not Showing
```
1. Check response format: Network tab → Response
2. Verify all 3 categories present
3. Check console: Look for parsing errors
4. Verify SuggestionPanel component loaded
```

---

## 📝 Notes

- All code changes verified in place
- Environment variables configured
- Dev server running successfully
- Ready for manual browser testing

---

## ✅ Next Steps

1. **Follow Test 1-10** above in order
2. **Document results** in TEST_REPORT.md
3. **Report any issues** found
4. **Verify all success criteria** met

---

**Status**: Ready for manual testing
**Time Required**: ~15 minutes
**Difficulty**: Easy

