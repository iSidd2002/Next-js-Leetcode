# 🎨 Beautiful Code Snippets - Pika.Style Integration

## ✨ **Feature Overview**

Inspired by **pika.style**, this feature adds beautiful code snippet visualization and sharing to your LeetCode tracker!

### What You Get:
- 🎨 **Beautiful Syntax Highlighting** - 6 themes (VS Code, Atom, Dracula, etc.)
- 🌈 **Gradient Backgrounds** - 6 gorgeous gradients (Sunset, Ocean, Forest, etc.)
- 📸 **Export to Image** - Download as PNG for portfolio/sharing
- 💻 **Multi-Language Support** - 14+ programming languages
- ✨ **Mac-Style Chrome** - Beautiful window mockups
- 📝 **Code Editor** - Built-in editor with templates
- 🔄 **Live Preview** - See changes in real-time

---

## 🎯 **Where It's Used**

### 1. **Problem Details**
Save your solution code with beautiful styling

### 2. **Review Cards**
Show code snippets during problem reviews

### 3. **Notes Section**
Embed formatted code in problem notes

### 4. **Export Feature**
Generate beautiful images for portfolio

### 5. **Social Sharing**
Share your solutions on Twitter/LinkedIn

---

## 🚀 **Components**

### 1. **CodeSnippetViewer**

Beautiful code display with export functionality.

#### Features:
- ✅ 6 Syntax Themes
- ✅ 6 Background Gradients
- ✅ Mac-style window chrome
- ✅ Line numbers
- ✅ Copy to clipboard
- ✅ Export as PNG image
- ✅ Hover shimmer effect

#### Usage:
```tsx
import { CodeSnippetViewer } from '@/components/CodeSnippetViewer';

<CodeSnippetViewer
  code={`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`}
  language="javascript"
  filename="solution.js"
  title="Two Sum - Optimal Solution"
  showLineNumbers={true}
/>
```

### 2. **CodeSnippetEditor**

Interactive code editor with live preview.

#### Features:
- ✅ 14+ language support
- ✅ Built-in templates
- ✅ Live preview mode
- ✅ Edit/Preview toggle
- ✅ Auto-save capability

#### Usage:
```tsx
import { CodeSnippetEditor } from '@/components/CodeSnippetEditor';

<CodeSnippetEditor
  initialCode={problem.codeSnippet}
  initialLanguage={problem.codeLanguage || 'javascript'}
  initialFilename={problem.codeFilename || 'solution'}
  onSave={(code, language, filename) => {
    updateProblem({
      codeSnippet: code,
      codeLanguage: language,
      codeFilename: filename
    });
  }}
/>
```

---

## 🎨 **Visual Examples**

### Theme Options:

```
┌─────────────────────────────────────────┐
│  🔴 🟡 🟢    solution.js               │
├─────────────────────────────────────────┤
│  1  function twoSum(nums, target) {    │
│  2    const map = new Map();            │
│  3                                       │
│  4    for (let i = 0; i < nums.length; │
│  5      const complement = target - ... │
│  6                                       │
│  7      if (map.has(complement)) {      │
│  8        return [map.get(complement... │
│  9      }                                │
│ 10                                       │
│ 11      map.set(nums[i], i);            │
│ 12    }                                  │
│ 13                                       │
│ 14    return [];                         │
│ 15  }                                    │
└─────────────────────────────────────────┘
     ↓ With Beautiful Gradient ↓
[Sunset/Ocean/Forest/Purple/Night/Aurora]
```

### Available Themes:

| Theme | Style | Best For |
|-------|-------|----------|
| **VS Code Dark** | Professional dark | Default, interviews |
| **Atom Dark** | Warm dark | Long coding sessions |
| **Tomorrow** | Clean light | Documentation |
| **One Light** | Minimal light | Presentations |
| **Night Owl** | Blue dark | Night coding |
| **Dracula** | Purple dark | Fun, creative |

### Background Gradients:

| Gradient | Colors | Vibe |
|----------|--------|------|
| **Sunset** | Orange → Red → Pink | Warm, energetic |
| **Ocean** | Blue → Cyan → Teal | Cool, calm |
| **Forest** | Green → Emerald → Teal | Natural, fresh |
| **Purple** | Purple → Pink → Red | Creative, bold |
| **Night** | Gray → Dark Gray | Professional |
| **Aurora** | Cyan → Blue → Purple | Magical, stunning |

---

## 📦 **Database Schema**

```prisma
model Problem {
  // ... existing fields ...
  
  // Code snippet fields
  codeSnippet   String?  // The solution code
  codeLanguage  String?  // javascript, python, etc.
  codeFilename  String?  // solution.js, etc.
}
```

### TypeScript Interface:

```typescript
interface Problem {
  // ... existing fields ...
  codeSnippet?: string;
  codeLanguage?: string;
  codeFilename?: string;
}
```

---

## 🔧 **Integration Guide**

### Step 1: Add to Problem Form

```tsx
// In ProblemForm.tsx or similar
import { CodeSnippetEditor } from '@/components/CodeSnippetEditor';

<CodeSnippetEditor
  initialCode={problemToEdit?.codeSnippet}
  initialLanguage={problemToEdit?.codeLanguage || 'javascript'}
  initialFilename={problemToEdit?.codeFilename}
  onSave={(code, language, filename) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      codeSnippet: code,
      codeLanguage: language,
      codeFilename: filename
    }));
  }}
/>
```

### Step 2: Display in Problem Details

```tsx
// In ProblemList.tsx or ProblemCard.tsx
import { CodeSnippetViewer } from '@/components/CodeSnippetViewer';

{problem.codeSnippet && (
  <div className="mt-4">
    <h4 className="font-semibold mb-2">Solution</h4>
    <CodeSnippetViewer
      code={problem.codeSnippet}
      language={problem.codeLanguage || 'javascript'}
      filename={problem.codeFilename}
      title={problem.title}
    />
  </div>
)}
```

### Step 3: Add to Review Dialog

```tsx
// In EnhancedReviewDialog.tsx
{problem.codeSnippet && (
  <div className="space-y-2">
    <Label>Your Solution</Label>
    <CodeSnippetViewer
      code={problem.codeSnippet}
      language={problem.codeLanguage || 'javascript'}
      filename={problem.codeFilename}
      showLineNumbers={true}
    />
  </div>
)}
```

---

## 🎯 **Use Cases**

### 1. **Portfolio Export**

```tsx
const exportForPortfolio = async (problem: Problem) => {
  if (!problem.codeSnippet) return;
  
  // CodeSnippetViewer automatically handles export
  // User clicks the download button
  // PNG image is generated and downloaded
};
```

### 2. **Social Media Sharing**

```tsx
// Generate beautiful code snippet image
// Export as PNG
// Share on Twitter, LinkedIn, etc.

const shareOnTwitter = () => {
  const text = `Just solved "${problem.title}" on ${problem.platform}! 🎉`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
```

### 3. **Interview Preparation**

```tsx
// Save multiple solutions for the same problem
const solutions = [
  {
    code: '// Brute force solution...',
    language: 'javascript',
    filename: 'bruteforce.js'
  },
  {
    code: '// Optimized solution...',
    language: 'javascript',
    filename: 'optimized.js'
  }
];
```

### 4. **Learning Notes**

```tsx
// Add code snippets to problem notes
const noteWithCode = `
## My Approach

1. Use a hash map to store complements
2. Iterate through the array once

\`\`\`javascript
${problem.codeSnippet}
\`\`\`

Time: O(n), Space: O(n)
`;
```

---

## 🎨 **Customization**

### Add Custom Themes:

```tsx
// In CodeSnippetViewer.tsx
const THEMES = {
  ...existing themes,
  myTheme: { 
    name: 'My Custom Theme', 
    style: myCustomStyle, 
    bg: 'from-custom-start to-custom-end' 
  },
};
```

### Add Custom Gradients:

```tsx
const GRADIENTS = [
  ...existing gradients,
  { name: 'Custom', class: 'from-custom-400 to-custom-600' },
];
```

### Add More Languages:

```tsx
// In CodeSnippetEditor.tsx
const LANGUAGES = [
  ...existing languages,
  { value: 'scala', label: 'Scala' },
  { value: 'haskell', label: 'Haskell' },
];
```

---

## 📸 **Export Functionality**

### How It Works:

1. User clicks **Download** button
2. `html2canvas` captures the code snippet
3. Converts to PNG image (2x resolution)
4. Downloads to user's computer

### Export Settings:

```typescript
const exportSettings = {
  backgroundColor: null,  // Transparent
  scale: 2,              // High resolution (2x)
  logging: false,        // No console logs
};
```

### File Naming:

```typescript
const filename = `${problem.codeFilename || 'code-snippet'}.png`;
// Examples:
// - solution.js.png
// - twosum-optimal.png
// - code-snippet.png (default)
```

---

## 🔥 **Advanced Features**

### 1. **Shimmer Animation**

Beautiful hover effect:

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 2. **Copy to Clipboard**

```tsx
const handleCopy = async () => {
  await navigator.clipboard.writeText(code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

### 3. **Theme Persistence**

```tsx
// Save user's preferred theme
localStorage.setItem('codeTheme', selectedTheme);
localStorage.setItem('codeGradient', selectedGradient);
```

---

## 🌟 **Best Practices**

### 1. **Code Length**

✅ **Do**: Keep snippets under 50 lines for best display
❌ **Don't**: Paste entire files (use key sections)

### 2. **Language Selection**

✅ **Do**: Match language to actual code
❌ **Don't**: Use generic highlighting

### 3. **File Naming**

✅ **Do**: Use descriptive names (`twosum-optimal.js`)
❌ **Don't**: Use generic names (`solution.js`)

### 4. **Themes**

✅ **Do**: Choose themes that match your use case
❌ **Don't**: Change themes too frequently in portfolio

---

## 📊 **Performance**

### Bundle Size:
- `react-syntax-highlighter`: ~150KB (gzipped)
- `html2canvas`: ~60KB (gzipped)
- **Total**: ~210KB additional

### Optimization Tips:
- Use dynamic imports for large themes
- Lazy load html2canvas
- Cache exported images
- Use webp format for smaller files

---

## 🐛 **Troubleshooting**

### Issue: Export button doesn't work

**Solution**: Check if element has id="code-snippet-export"

### Issue: Syntax highlighting not working

**Solution**: Verify language value matches supported languages

### Issue: Theme not changing

**Solution**: Ensure theme key exists in THEMES object

### Issue: Copy fails on HTTPS

**Solution**: Clipboard API requires HTTPS or localhost

---

## ✅ **Checklist**

### Implementation:
- [x] CodeSnippetViewer component
- [x] CodeSnippetEditor component
- [x] Database schema updated
- [x] TypeScript types updated
- [x] Dependencies installed
- [ ] Integrate into Problem Form
- [ ] Add to Problem Details
- [ ] Add to Review Dialog

### Testing:
- [ ] Test all themes
- [ ] Test all gradients
- [ ] Test export functionality
- [ ] Test copy to clipboard
- [ ] Test with different code lengths
- [ ] Test on mobile devices

---

## 🎉 **Summary**

### What You Got:
- 🎨 Beautiful code snippet viewer (pika.style inspired)
- 📝 Interactive code editor with templates
- 🌈 6 themes + 6 gradients
- 📸 Export to PNG functionality
- 💻 14+ language support
- ✨ Mac-style window chrome
- 🎯 Ready for integration

### Key Benefits:
- ✅ Professional code presentation
- ✅ Portfolio-ready exports
- ✅ Social media sharing
- ✅ Better learning experience
- ✅ Interview preparation tool

---

**Your code snippets now look absolutely stunning! 🚀✨**

Start adding beautiful code to your problems today!

