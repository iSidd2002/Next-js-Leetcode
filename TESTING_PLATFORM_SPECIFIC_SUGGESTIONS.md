# Testing Platform-Specific LLM Suggestions

## 📋 Pre-Test Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Browser is open to http://localhost:3000
- [ ] You are logged in
- [ ] Browser DevTools are open (F12)
- [ ] Network tab is visible
- [ ] Console tab is visible

## 🧪 Test 1: LeetCode Problem Suggestions

### Setup
1. Go to Review tab
2. Find or add a LeetCode problem (e.g., "Two Sum")
3. Ensure it's marked as "unsolved" or "partial"

### Execute
1. Click the 💡 (lightbulb) button next to the problem
2. Wait for suggestions to load (should take 2-5 seconds)

### Verify
- [ ] Modal appears with suggestions
- [ ] Suggestions mention "LeetCode" or similar tags
- [ ] Prerequisites include LeetCode-style problems
- [ ] Similar problems reference LeetCode topics
- [ ] Microtasks are relevant to LeetCode problem-solving

### Check Network Tab
1. Look for POST request to `/api/problems/[id]/llm-result`
2. Request body should include:
   - `transcript`: "User attempted but could not solve this problem"
   - `userFinalStatus`: "unsolved"
   - `code`: problem code (if available)
   - `problemDescription`: problem title

3. Response should include:
   - `success: true`
   - `data`: suggestions object with prerequisites, similarProblems, microtasks
   - `failureReason`: specific reason for failure
   - `confidence`: confidence score (0.0-1.0)

### Check Console
- [ ] No errors or warnings
- [ ] Log message: "Generating suggestions for platform: leetcode"
- [ ] Log message: "Suggestions generated successfully"

---

## 🧪 Test 2: CodeForces Problem Suggestions

### Setup
1. Go to Review tab
2. Find or add a CodeForces problem (e.g., "A. Watermelon")
3. Ensure it's marked as "unsolved" or "partial"

### Execute
1. Click the 💡 (lightbulb) button next to the problem
2. Wait for suggestions to load

### Verify
- [ ] Modal appears with suggestions
- [ ] Suggestions mention "CodeForces" or rating/difficulty
- [ ] Prerequisites include competitive programming concepts
- [ ] Similar problems reference CodeForces-style problems
- [ ] Microtasks focus on competitive programming skills

### Check Network Tab
1. Look for POST request to `/api/problems/[id]/llm-result`
2. Response should show platform-specific suggestions

### Check Console
- [ ] Log message: "Generating suggestions for platform: codeforces"
- [ ] No errors

---

## 🧪 Test 3: AtCoder Problem Suggestions

### Setup
1. Go to Review tab
2. Find or add an AtCoder problem
3. Ensure it's marked as "unsolved" or "partial"

### Execute
1. Click the 💡 (lightbulb) button next to the problem
2. Wait for suggestions to load

### Verify
- [ ] Modal appears with suggestions
- [ ] Suggestions mention "AtCoder" or contest context
- [ ] Prerequisites include AtCoder-style problems
- [ ] Similar problems reference AtCoder topics
- [ ] Microtasks are relevant to AtCoder problem-solving

### Check Network Tab
1. Look for POST request to `/api/problems/[id]/llm-result`
2. Response should show platform-specific suggestions

### Check Console
- [ ] Log message: "Generating suggestions for platform: atcoder"
- [ ] No errors

---

## 🧪 Test 4: Caching Verification

### Setup
1. Have a problem ready in Review tab
2. Open DevTools Network tab

### Execute
1. Click 💡 button on a problem
2. Wait for suggestions to load
3. Close the modal
4. Click 💡 button on the SAME problem again

### Verify
- [ ] First request takes 2-5 seconds
- [ ] Second request is instant (< 100ms)
- [ ] Response includes `"cached": true` on second request
- [ ] Suggestions are identical both times
- [ ] Console shows: "Returning cached suggestions"

---

## 🧪 Test 5: Unique Suggestions Per Platform

### Setup
1. Have problems from different platforms in Review tab
2. Example: LeetCode "Two Sum", CodeForces "A. Watermelon", AtCoder problem

### Execute
1. Generate suggestions for LeetCode problem
2. Note the suggestions
3. Generate suggestions for CodeForces problem
4. Note the suggestions
5. Generate suggestions for AtCoder problem
6. Note the suggestions

### Verify
- [ ] LeetCode suggestions are different from CodeForces
- [ ] CodeForces suggestions are different from AtCoder
- [ ] AtCoder suggestions are different from LeetCode
- [ ] Each set of suggestions is platform-specific
- [ ] No generic/repeated suggestions across platforms

---

## 🧪 Test 6: Error Handling

### Setup
1. Open DevTools Console
2. Have a problem ready

### Execute
1. Click 💡 button
2. Observe any errors

### Verify
- [ ] No TypeScript errors
- [ ] No JavaScript errors
- [ ] If Gemini API fails, fallback suggestions appear
- [ ] Error message is user-friendly

---

## 📊 Expected Results Summary

| Platform | Expected Behavior |
|----------|-------------------|
| LeetCode | Suggestions mention LeetCode, similar tags, company hiring patterns |
| CodeForces | Suggestions mention CodeForces, rating/difficulty, competitive programming |
| AtCoder | Suggestions mention AtCoder, contest context, similar difficulty |
| Caching | Second request instant, marked as cached |
| Uniqueness | Each platform has different suggestions |

---

## 🐛 Troubleshooting

### Issue: Suggestions are still generic
- [ ] Hard refresh browser (Cmd+Shift+R)
- [ ] Check console for errors
- [ ] Verify problem has platform set correctly
- [ ] Check Network tab response

### Issue: Lightbulb button not visible
- [ ] Ensure you're in Review tab
- [ ] Hard refresh browser
- [ ] Check browser console for errors

### Issue: Suggestions take too long
- [ ] First request may take 2-5 seconds (normal)
- [ ] Check Gemini API key in .env.local
- [ ] Check network connection

### Issue: Caching not working
- [ ] Check MongoDB connection
- [ ] Verify UserProblemSuggestion collection exists
- [ ] Check database for cached suggestions

---

**Test Date**: _______________
**Tester Name**: _______________
**Overall Result**: ✅ PASS / ❌ FAIL

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

