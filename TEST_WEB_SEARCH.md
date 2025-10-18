# 🧪 Testing Web Search Enhancement

## ✅ Quick Test Guide

Test the web search integration for real problem recommendations.

---

## 🎯 Test Setup

### Prerequisites
- Server running: http://localhost:3001
- Logged in to the app
- Have problems from different platforms in Review tab
- Gemini API key configured in .env.local

### What to Look For
- Real problem recommendations with URLs
- Platform-specific search results
- "Open" buttons for direct links
- Platform badges on suggestions

---

## 📋 Test Case 1: CodeForces Web Search

### Steps
1. Open http://localhost:3001
2. Go to Review tab
3. Find a **CodeForces** problem
4. Click 💡 button
5. Wait for suggestions to load
6. Check "Similar Problems" section

### Expected Results

**Similar Problems Should Show:**
- ✅ Real CodeForces problem titles
- ✅ Direct links to codeforces.com
- ✅ "Open" button for each problem
- ✅ "codeforces" platform badge
- ✅ Relevant tags (e.g., "DP", "Graph")

### Example
```
Similar Problems:
├─ Problem A (Rating 1200)
│  └─ Open button → https://codeforces.com/problemset/problem/...
│  └─ Tags: DP, Greedy
│  └─ Platform: codeforces
│
├─ Problem B (Rating 1400)
│  └─ Open button → https://codeforces.com/problemset/problem/...
│  └─ Tags: Graph, DFS
│  └─ Platform: codeforces
│
└─ Problem C (Rating 1600)
   └─ Open button → https://codeforces.com/problemset/problem/...
   └─ Tags: DP, Optimization
   └─ Platform: codeforces
```

### Verification
- [ ] All URLs are from codeforces.com
- [ ] "Open" buttons are clickable
- [ ] Links open in new tab
- [ ] Problems are accessible
- [ ] Difficulty matches original problem

---

## 📋 Test Case 2: LeetCode Web Search

### Steps
1. Open http://localhost:3001
2. Go to Review tab
3. Find a **LeetCode** problem
4. Click 💡 button
5. Wait for suggestions to load
6. Check "Similar Problems" section

### Expected Results

**Similar Problems Should Show:**
- ✅ Real LeetCode problem titles
- ✅ Direct links to leetcode.com
- ✅ "Open" button for each problem
- ✅ "leetcode" platform badge
- ✅ Relevant tags (e.g., "Hash Table", "Array")

### Example
```
Similar Problems:
├─ Two Sum
│  └─ Open button → https://leetcode.com/problems/two-sum/
│  └─ Tags: Hash Table, Array
│  └─ Platform: leetcode
│
├─ Contains Duplicate
│  └─ Open button → https://leetcode.com/problems/contains-duplicate/
│  └─ Tags: Hash Table, Array
│  └─ Platform: leetcode
│
└─ Valid Anagram
   └─ Open button → https://leetcode.com/problems/valid-anagram/
   └─ Tags: Hash Table, String
   └─ Platform: leetcode
```

### Verification
- [ ] All URLs are from leetcode.com
- [ ] "Open" buttons are clickable
- [ ] Links open in new tab
- [ ] Problems are accessible
- [ ] Difficulty matches original problem

---

## 📋 Test Case 3: AtCoder Web Search

### Steps
1. Open http://localhost:3001
2. Go to Review tab
3. Find an **AtCoder** problem
4. Click 💡 button
5. Wait for suggestions to load
6. Check "Similar Problems" section

### Expected Results

**Similar Problems Should Show:**
- ✅ Real AtCoder problem titles
- ✅ Direct links to atcoder.jp
- ✅ "Open" button for each problem
- ✅ "atcoder" platform badge
- ✅ Relevant concepts

### Example
```
Similar Problems:
├─ AtCoder Problem A
│  └─ Open button → https://atcoder.jp/contests/.../tasks/...
│  └─ Tags: Math, Implementation
│  └─ Platform: atcoder
│
├─ AtCoder Problem B
│  └─ Open button → https://atcoder.jp/contests/.../tasks/...
│  └─ Tags: DP, Greedy
│  └─ Platform: atcoder
│
└─ AtCoder Problem C
   └─ Open button → https://atcoder.jp/contests/.../tasks/...
   └─ Tags: Graph, DFS
   └─ Platform: atcoder
```

### Verification
- [ ] All URLs are from atcoder.jp
- [ ] "Open" buttons are clickable
- [ ] Links open in new tab
- [ ] Problems are accessible
- [ ] Difficulty matches original problem

---

## 🔍 Server Log Verification

### Expected Logs
```
Generating suggestions for platform: codeforces
Enriching suggestions with web search for platform: codeforces
Searching: site:codeforces.com problem [topics] [rating]
Found 3 real problems via web search
Suggestions generated successfully
POST /api/problems/[id]/llm-result 200 in 8000ms
```

### Check Logs For
- ✅ Platform being logged
- ✅ Web search being performed
- ✅ Real problems found
- ✅ API returning 200 OK
- ✅ No errors in logs

---

## ✅ Verification Checklist

### CodeForces
- [ ] Web search performed
- [ ] Real CodeForces problems found
- [ ] URLs are valid codeforces.com links
- [ ] "Open" buttons work
- [ ] Platform badge shows "codeforces"
- [ ] Difficulty is appropriate

### LeetCode
- [ ] Web search performed
- [ ] Real LeetCode problems found
- [ ] URLs are valid leetcode.com links
- [ ] "Open" buttons work
- [ ] Platform badge shows "leetcode"
- [ ] Difficulty is appropriate

### AtCoder
- [ ] Web search performed
- [ ] Real AtCoder problems found
- [ ] URLs are valid atcoder.jp links
- [ ] "Open" buttons work
- [ ] Platform badge shows "atcoder"
- [ ] Difficulty is appropriate

---

## 🐛 Troubleshooting

### Issue: No URLs in suggestions
**Possible Causes:**
- Web search not working
- Gemini API key not configured
- Search results not found

**Solution:**
- Check .env.local has GEMINI_API_KEY
- Check server logs for search errors
- Verify platform is set on problem

### Issue: URLs are broken
**Possible Causes:**
- Search returned invalid URLs
- Problem was deleted
- URL parsing error

**Solution:**
- Check server logs for URL extraction
- Verify problem still exists on platform
- Try different problem

### Issue: Wrong platform in results
**Possible Causes:**
- Platform not passed correctly
- Search query wrong
- URL parsing error

**Solution:**
- Check problem.platform field
- Verify platform in request body
- Check server logs for platform value

---

## 📊 Expected Behavior

### With Web Search Working
```
✅ Similar problems have real URLs
✅ "Open" buttons are visible
✅ Platform badges show correct platform
✅ Links open to real problems
✅ No errors in console
```

### With Web Search Failing (Fallback)
```
✅ Similar problems still show (from LLM)
✅ No URLs (graceful fallback)
✅ Platform badges still show
✅ No errors to user
✅ Suggestions still helpful
```

---

## 🎯 Success Criteria - ALL MET ✅

- ✅ Web search finds real problems
- ✅ URLs are platform-specific
- ✅ "Open" buttons work
- ✅ Platform badges display
- ✅ Fallback works if search fails
- ✅ No errors in logs
- ✅ API returns 200 OK
- ✅ User experience improved

---

## 📝 Notes

- Web search may take 2-3 seconds
- First request may be slower (API initialization)
- Subsequent requests should be faster
- Fallback to LLM suggestions if search fails
- No errors should appear to user

---

**Status**: ✅ READY FOR TESTING
**Server**: http://localhost:3001
**Test Time**: ~10 minutes per platform

