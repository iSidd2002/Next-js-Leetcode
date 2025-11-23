# 🚀 Code Snippet Integration - Quick Start

## ✅ **What's Ready**

- ✅ CodeSnippetViewer component (beautiful display + export)
- ✅ CodeSnippetEditor component (editor + live preview)
- ✅ Database schema updated (codeSnippet, codeLanguage, codeFilename)
- ✅ TypeScript types updated
- ✅ Dependencies installed (react-syntax-highlighter, html2canvas)
- ✅ Build verified - No errors!

---

## 🎯 **Quick Integration**

### Option 1: Add to Problem Form (Recommended)

Add the code snippet editor to your problem form:

```tsx
// In src/components/ProblemForm.tsx (or wherever you edit problems)

import { CodeSnippetEditor } from '@/components/CodeSnippetEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// In your form component:
<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="code">💻 Code Solution</TabsTrigger>
  </TabsList>
  
  <TabsContent value="details">
    {/* Your existing form fields */}
  </TabsContent>
  
  <TabsContent value="code">
    <CodeSnippetEditor
      initialCode={formData.codeSnippet}
      initialLanguage={formData.codeLanguage || 'javascript'}
      initialFilename={formData.codeFilename || 'solution'}
      onSave={(code, language, filename) => {
        setFormData(prev => ({
          ...prev,
          codeSnippet: code,
          codeLanguage: language,
          codeFilename: filename
        }));
      }}
    />
  </TabsContent>
</Tabs>
```

### Option 2: Display in Problem List

Show code snippets in your problem details:

```tsx
// In src/components/ProblemList.tsx (or ProblemCard)

import { CodeSnippetViewer } from '@/components/CodeSnippetViewer';

// In your problem card/details:
{problem.codeSnippet && (
  <div className="mt-4 space-y-2">
    <div className="flex items-center gap-2">
      <Code2 className="h-4 w-4" />
      <span className="text-sm font-semibold">Solution Code</span>
    </div>
    <CodeSnippetViewer
      code={problem.codeSnippet}
      language={problem.codeLanguage || 'javascript'}
      filename={problem.codeFilename}
      title={problem.title}
      showLineNumbers={true}
    />
  </div>
)}
```

### Option 3: Add to Review Dialog

Show code during reviews:

```tsx
// In src/components/EnhancedReviewDialog.tsx

import { CodeSnippetViewer } from '@/components/CodeSnippetViewer';

// Add this section in your dialog:
{problem.codeSnippet && (
  <div className="space-y-2">
    <Label className="flex items-center gap-2">
      <Code2 className="h-4 w-4" />
      Your Solution
    </Label>
    <CodeSnippetViewer
      code={problem.codeSnippet}
      language={problem.codeLanguage || 'javascript'}
      filename={problem.codeFilename}
    />
  </div>
)}
```

---

## 🎨 **Example: Complete Problem Card with Code**

Here's a complete example showing how to display a problem with its beautiful code snippet:

```tsx
import { CodeSnippetViewer } from '@/components/CodeSnippetViewer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2 } from 'lucide-react';

function ProblemCardWithCode({ problem }: { problem: Problem }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{problem.title}</CardTitle>
          <Badge>{problem.difficulty}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Problem details */}
        <div>
          <p className="text-sm text-muted-foreground">{problem.notes}</p>
        </div>
        
        {/* Code snippet (if exists) */}
        {problem.codeSnippet && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Solution</span>
              <Badge variant="outline" className="text-xs">
                {problem.codeLanguage}
              </Badge>
            </div>
            
            <CodeSnippetViewer
              code={problem.codeSnippet}
              language={problem.codeLanguage || 'javascript'}
              filename={problem.codeFilename}
              title={`${problem.title} - Solution`}
              showLineNumbers={true}
            />
            
            <p className="text-xs text-muted-foreground">
              💡 Hover to see options • Click palette to change theme • Click download to export
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🎬 **Example: Standalone Code Snippet Page**

Create a dedicated page for viewing/editing code snippets:

```tsx
'use client'

import { useState } from 'react';
import { CodeSnippetEditor } from '@/components/CodeSnippetEditor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CodeSnippetPage({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(problem.codeSnippet || '');
  const [language, setLanguage] = useState(problem.codeLanguage || 'javascript');
  const [filename, setFilename] = useState(problem.codeFilename || 'solution');

  const handleSave = async (newCode: string, newLang: string, newFile: string) => {
    try {
      // Save to your database/storage
      await updateProblem(problem.id, {
        codeSnippet: newCode,
        codeLanguage: newLang,
        codeFilename: newFile
      });
      
      setCode(newCode);
      setLanguage(newLang);
      setFilename(newFile);
      
      toast.success('Code snippet saved! 🎉');
    } catch (error) {
      toast.error('Failed to save code snippet');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          <p className="text-muted-foreground mt-2">
            Add your beautiful solution code
          </p>
        </div>
        
        <CodeSnippetEditor
          initialCode={code}
          initialLanguage={language}
          initialFilename={filename}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
```

---

## 📱 **Example: Export Button**

Add a button to export code snippet:

```tsx
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ExportCodeButton({ problem }: { problem: Problem }) {
  const handleExport = () => {
    // CodeSnippetViewer has built-in export
    // Just render it and user can click download
    toast.info('Hover over code and click the download button');
  };

  return (
    <Button onClick={handleExport} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Export as Image
    </Button>
  );
}
```

---

## 🎯 **Example: Portfolio Export**

Export all your solutions for portfolio:

```tsx
async function exportAllSolutions(problems: Problem[]) {
  const problemsWithCode = problems.filter(p => p.codeSnippet);
  
  for (const problem of problemsWithCode) {
    // Render CodeSnippetViewer for each
    // User can click download on each one
    // Or automate with html2canvas directly
  }
  
  toast.success(`Ready to export ${problemsWithCode.length} solutions!`);
}
```

---

## ✨ **Pro Tips**

### 1. **Auto-Save**

```tsx
// Debounced auto-save in editor
const debouncedSave = useMemo(
  () =>
    debounce((code: string, lang: string, file: string) => {
      handleSave(code, lang, file);
    }, 1000),
  []
);

<CodeSnippetEditor
  initialCode={code}
  onChange={debouncedSave} // If you add this prop
/>
```

### 2. **Keyboard Shortcuts**

```tsx
// Add Cmd+S / Ctrl+S to save
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave(code, language, filename);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [code, language, filename]);
```

### 3. **Template Library**

```tsx
const CODE_TEMPLATES = {
  'Two Sum': {
    javascript: '// Two Sum solution...',
    python: '# Two Sum solution...',
  },
  'Reverse Linked List': {
    javascript: '// Reverse Linked List...',
    python: '# Reverse Linked List...',
  }
};

// Load template based on problem title
const template = CODE_TEMPLATES[problem.title]?.[language];
```

### 4. **Social Share**

```tsx
const shareOnTwitter = () => {
  const text = `Just solved ${problem.title}! Check out my solution 💻`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
```

---

## 🎨 **Customization Examples**

### Change Default Theme

```tsx
// Set default theme
<CodeSnippetViewer
  code={code}
  language="javascript"
  theme="dracula" // or nightOwl, atom, etc.
/>
```

### Hide Line Numbers

```tsx
<CodeSnippetViewer
  code={code}
  language="python"
  showLineNumbers={false}
/>
```

### Custom Title

```tsx
<CodeSnippetViewer
  code={code}
  language="cpp"
  title="Optimized O(log n) Solution"
  filename="binary-search-optimal.cpp"
/>
```

---

## 🚀 **Quick Start Checklist**

### Setup (Done ✅):
- [x] Components created
- [x] Dependencies installed
- [x] Database schema updated
- [x] Types updated
- [x] Build verified

### Integration (Your Turn):
- [ ] Add CodeSnippetEditor to problem form
- [ ] Display CodeSnippetViewer in problem details
- [ ] Add to review dialog (optional)
- [ ] Test with different languages
- [ ] Test export functionality
- [ ] Customize themes/gradients

---

## 💡 **Need Help?**

Check the complete documentation: `CODE_SNIPPET_FEATURE.md`

---

**Your beautiful code snippets are ready to go! 🎨✨**

Start adding them to your problems today!

