# 📅 Manual Review Days Feature

## Overview

You can now set **custom review intervals** manually without relying on the automatic quality-based system (Easy/Medium/Hard).

---

## ✨ Features

### **Two Review Modes**

#### 1. **Quality Based** (Original)
- Rate your performance: Again, Hard, Good, Easy, Perfect
- System calculates next review date automatically using spaced repetition algorithm
- Adaptive intervals based on your performance history

#### 2. **Custom Days** (New!)
- **Manually set** the exact number of days for your next review
- Perfect for when you want full control over scheduling
- Choose from **quick presets** or enter any custom value (1-365 days)

---

## 🎯 How to Use

### **Step 1: Open Review Dialog**
1. Go to the **"Review"** tab
2. Click the **"Review"** button on any problem that's due for review

### **Step 2: Choose Review Mode**
The dialog has **two tabs**:

#### **Quality Based Tab** (Default)
- Select how well you did: Again, Hard, Good, Easy, Perfect
- System calculates optimal interval based on:
  - Your rating
  - Problem difficulty
  - Review history
  - Custom interval settings

#### **Custom Days Tab** (Manual Control)
- Enter exact number of days (1-365)
- Or use quick presets:
  - **1 day** - Review tomorrow
  - **3 days** - Short-term review
  - **7 days** - Weekly review
  - **14 days** - Bi-weekly
  - **30 days** - Monthly
  - **60 days** - Every 2 months
  - **90 days** - Quarterly

### **Step 3: Optional Enhancements**
Both modes support:
- ⏱️ **Time taken** (track how long it took)
- 🏷️ **Quick tags** (tricky-edge-case, need-revisit, pattern-recognized, etc.)
- 📝 **Notes** (what you learned, edge cases, patterns)

### **Step 4: Submit**
- **Quality Based**: "Complete Review" button
- **Custom Days**: "Review in X days" button

---

## 📊 When to Use Each Mode

### Use **Quality Based** when:
- ✅ You want optimal spaced repetition
- ✅ You trust the algorithm to schedule reviews
- ✅ You're following a structured learning path
- ✅ You want adaptive intervals based on performance

### Use **Custom Days** when:
- ✅ You have a specific interview date
- ✅ You want to review before a contest
- ✅ You know a problem needs review at a specific time
- ✅ You're on a custom study schedule
- ✅ You want full manual control

---

## 🎨 UI Preview

### Quality Based Mode
```
┌─────────────────────────────────────┐
│ [Quality Based] [Custom Days]       │
├─────────────────────────────────────┤
│                                     │
│ How did you do?                     │
│                                     │
│ [Again] [Hard] [Good] [Easy] [Perfect] │
│                                     │
│ ⏱️  Time taken (optional)           │
│ 🏷️  Quick tags                      │
│ 📝 Additional notes                 │
│                                     │
│           [Complete Review]         │
└─────────────────────────────────────┘
```

### Custom Days Mode
```
┌─────────────────────────────────────┐
│ [Quality Based] [Custom Days]       │
├─────────────────────────────────────┤
│                                     │
│ 📅 Review this problem in           │
│                                     │
│     [  7  ] days                    │
│                                     │
│ Quick presets:                      │
│ [1] [3] [7] [14] [30] [60] [90]    │
│                                     │
│ Next review: Jan 1, 2026            │
│                                     │
│ ⏱️  Time taken (optional)           │
│ 🏷️  Quick tags                      │
│ 📝 Additional notes                 │
│                                     │
│      [Review in 7 days]             │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Data Stored
When using **Custom Days** mode:
```typescript
{
  interval: customDays,           // Your chosen interval
  nextReviewDate: calculatedDate, // Exact date (today + customDays)
  repetition: repetition + 1,     // Increments review count
  isReview: true,                 // Marks for review list
  notes: "your notes",            // Optional notes
  dateSolved: currentDate         // Timestamp
}
```

### API Changes
```typescript
onReview(
  problemId: string,
  quality: number,          // 1-5 for quality, 3 (neutral) for manual
  notes?: string,
  timeTaken?: number,
  tags?: string[],
  customDays?: number       // NEW: Optional custom interval
)
```

---

## 💡 Pro Tips

1. **Interview Prep**: Set all problems to review **3 days before** your interview
2. **Contest Prep**: Review similar problems **1 day before** the contest
3. **Long-term Retention**: Use **90 days** for problems you've mastered
4. **Quick Refresh**: Use **1 day** for problems you struggled with
5. **Mixed Approach**: Use quality-based for most, custom days for special cases

---

## 🚀 Example Use Cases

### Use Case 1: Interview in 2 Weeks
```
Problem: Two Sum
Custom Days: 7 days
Notes: "Review 1 week before interview"
→ Review on: Dec 31, 2025
```

### Use Case 2: Weekly Review
```
Problem: Binary Tree Traversal
Custom Days: 7 days
Tags: pattern-recognized
→ Review every week
```

### Use Case 3: Quick Fix
```
Problem: Sliding Window
Custom Days: 1 day
Notes: "Struggled with edge case, need immediate review"
→ Review tomorrow
```

---

## 🎉 Benefits

### Flexibility
- ✅ Mix and match both modes
- ✅ Switch between them anytime
- ✅ No commitment to one approach

### Control
- ✅ Full control over scheduling
- ✅ Adapt to your calendar
- ✅ Customize for events

### Simplicity
- ✅ No complex ratings when you just want a date
- ✅ Quick presets for common intervals
- ✅ Clear next review date display

---

## 🔮 Future Enhancements

Potential future additions:
- 📆 Calendar view of scheduled reviews
- 🔄 Bulk custom scheduling for multiple problems
- 📊 Analytics comparing quality-based vs custom effectiveness
- ⚡ Smart suggestions based on patterns
- 🎯 Goal-based scheduling (e.g., "Review all before Jan 15")

---

## ❓ FAQ

**Q: Does manual scheduling affect my spaced repetition stats?**
A: Manual reviews still increment repetition count and are tracked in review history. The interval is just set manually instead of calculated.

**Q: Can I switch between modes for the same problem?**
A: Yes! Each review is independent. Use quality-based one time, custom days the next.

**Q: What happens to my review history?**
A: All reviews (quality or custom) are saved in your review history with timestamps and notes.

**Q: Is there a recommended interval?**
A: For most problems:
- **New concepts**: 1-3 days
- **Familiar topics**: 7-14 days  
- **Mastered problems**: 30-90 days

**Q: Can I set more than 365 days?**
A: Currently capped at 365 days to ensure problems don't get forgotten indefinitely.

---

## 📚 Related Features

- **Enhanced Settings**: Customize quality-based intervals
- **Review History**: Track all past reviews
- **Quick Tags**: Categorize problems efficiently
- **Time Tracking**: Monitor solving speed improvements

---

**Enjoy your new manual scheduling power!** 🚀

---

*Last Updated: Nov 23, 2025*  
*Version: 1.0*

