"use client"

import { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, atomDark, tomorrow, oneLight, nightOwl, dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Download, 
  Palette,
  Layout
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

interface CodeSnippetViewerProps {
  code: string;
  language?: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  theme?: string;
  className?: string;
}

const THEMES = {
  vscode: { name: 'VS Code', style: vscDarkPlus, bg: '#1e1e1e' },
  atom: { name: 'Atom', style: atomDark, bg: '#282c34' },
  tomorrow: { name: 'Tomorrow', style: tomorrow, bg: '#ffffff' },
  light: { name: 'Light', style: oneLight, bg: '#fafafa' },
  nightOwl: { name: 'Night Owl', style: nightOwl, bg: '#011627' },
  dracula: { name: 'Dracula', style: dracula, bg: '#282a36' },
};

const GRADIENTS = [
  { name: 'Sunset', class: 'from-rose-400 via-fuchsia-500 to-indigo-500' },
  { name: 'Ocean', class: 'from-cyan-500 via-blue-600 to-indigo-600' },
  { name: 'Cotton Candy', class: 'from-pink-300 via-purple-300 to-indigo-400' },
  { name: 'Hyper', class: 'from-pink-500 via-red-500 to-yellow-500' },
  { name: 'Gotham', class: 'from-slate-900 via-purple-900 to-slate-900' },
  { name: 'Mojito', class: 'from-emerald-400 via-teal-500 to-cyan-500' },
  { name: 'Aurora', class: 'from-green-300 via-blue-500 to-purple-600' },
  { name: 'Galaxy', class: 'from-indigo-900 via-purple-800 to-pink-800' },
];

const PADDINGS = [
  { name: 'Compact', value: 'p-4' },
  { name: 'Normal', value: 'p-8' },
  { name: 'Spacious', value: 'p-16' },
];

export function CodeSnippetViewer({
  code,
  language = 'javascript',
  title,
  filename,
  showLineNumbers = true,
  theme = 'vscode',
  className
}: CodeSnippetViewerProps) {
  // Generate unique ID for export functionality (fixes issue with multiple viewers on same page)
  const exportId = useMemo(() => `code-export-${Math.random().toString(36).substring(2, 11)}`, []);
  
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [selectedGradient, setSelectedGradient] = useState(1);
  const [selectedPadding, setSelectedPadding] = useState(1); // Normal
  const [exporting, setExporting] = useState(false);

  const currentTheme = THEMES[selectedTheme as keyof typeof THEMES] || THEMES.vscode;
  const isLight = ['tomorrow', 'light'].includes(selectedTheme);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    const element = document.getElementById(exportId);
    if (element) {
      try {
        // Wait for state update (hide controls)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 3, // Higher quality
          useCORS: true,
          logging: false,
        });
        
        const link = document.createElement('a');
        link.download = `${filename || 'snippet'}-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
    setExporting(false);
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Export Container */}
      <div 
        id={exportId}
        className={cn(
          "relative transition-all duration-300 ease-in-out overflow-hidden rounded-xl",
          PADDINGS[selectedPadding].value
        )}
      >
        {/* Gradient Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-100 transition-all duration-500",
          GRADIENTS[selectedGradient].class
        )} />

        {/* Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Main Window */}
        <div 
          className={cn(
            "relative rounded-xl overflow-hidden transition-all duration-300",
            "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]", // Deep shadow
            "border border-white/10" // Subtle border
          )}
          style={{ backgroundColor: currentTheme.bg }}
        >
          {/* Window Chrome / Header */}
          <div className={cn(
            "px-4 py-3 flex items-center justify-between",
            "border-b border-white/5"
          )}>
            <div className="flex items-center gap-4">
              {/* Mac-style Traffic Lights */}
              <div className="flex items-center gap-2 group/lights">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-inner border border-[#E0443E]/50" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner border border-[#DEA123]/50" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-inner border border-[#1AAB29]/50" />
              </div>

              {/* Title */}
              <div className={cn(
                "text-xs font-medium font-mono opacity-70 select-none flex items-center gap-2",
                isLight ? "text-black" : "text-white"
              )}>
                {filename || title || 'untitled'}
              </div>
            </div>

            {/* Right side controls (only visible when not exporting) */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity duration-200",
              exporting ? "opacity-0" : "opacity-0 group-hover:opacity-100"
            )}>
               {/* Copy */}
               <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>

              {/* Padding Control */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedPadding((p) => (p + 1) % PADDINGS.length)}
                title="Toggle Padding"
              >
                <Layout className="h-3 w-3" />
              </Button>
              
              {/* Theme/Gradient Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                    <Palette className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-3">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Backgrounds</DropdownMenuLabel>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {GRADIENTS.map((g, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedGradient(i)}
                        className={cn(
                          "h-8 w-8 rounded-full cursor-pointer ring-offset-2 transition-all hover:scale-110 hover:shadow-lg bg-gradient-to-br",
                          g.class,
                          selectedGradient === i ? "ring-2 ring-primary scale-110" : "ring-0"
                        )}
                        title={g.name}
                      />
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Code Theme</DropdownMenuLabel>
                  {Object.entries(THEMES).map(([key, t]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      className="justify-between text-xs cursor-pointer"
                    >
                      {t.name}
                      {selectedTheme === key && <Check className="h-3 w-3 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleExport}
                disabled={exporting}
                title="Export as PNG"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="relative">
            <SyntaxHighlighter
              language={language}
              style={currentTheme.style}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'transparent',
                fontSize: '13px', // Slightly smaller for cleaner look
                lineHeight: '1.6',
                fontFamily: '"JetBrains Mono", "Fira Code", "Menlo", "Monaco", "Consolas", monospace',
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                color: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
                textAlign: 'right',
                userSelect: 'none',
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
          
          {/* Footer (Optional tech badge) */}
          <div className={cn(
            "px-4 py-2 border-t border-white/5 flex justify-end",
            "text-[10px] font-mono uppercase tracking-wider opacity-40",
            isLight ? "text-black" : "text-white"
          )}>
            {language} • {code.split('\n').length} lines
          </div>
        </div>
      </div>
    </div>
  );
}
