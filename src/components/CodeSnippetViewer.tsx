"use client"

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, atomDark, tomorrow, oneLight, nightOwl, dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Palette,
  Code2,
  Share2,
  Sparkles
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
  vscode: { name: 'VS Code Dark', style: vscDarkPlus, bg: 'from-[#1e1e1e] to-[#2d2d30]' },
  atom: { name: 'Atom Dark', style: atomDark, bg: 'from-[#282c34] to-[#21252b]' },
  tomorrow: { name: 'Tomorrow', style: tomorrow, bg: 'from-gray-50 to-gray-100' },
  light: { name: 'One Light', style: oneLight, bg: 'from-gray-50 to-white' },
  nightOwl: { name: 'Night Owl', style: nightOwl, bg: 'from-[#011627] to-[#01111d]' },
  dracula: { name: 'Dracula', style: dracula, bg: 'from-[#282a36] to-[#1e1f29]' },
};

const GRADIENTS = [
  { name: 'Sunset', class: 'from-orange-400 via-red-500 to-pink-500' },
  { name: 'Ocean', class: 'from-blue-400 via-cyan-500 to-teal-500' },
  { name: 'Forest', class: 'from-green-400 via-emerald-500 to-teal-500' },
  { name: 'Purple', class: 'from-purple-400 via-pink-500 to-red-500' },
  { name: 'Night', class: 'from-gray-700 via-gray-800 to-gray-900' },
  { name: 'Aurora', class: 'from-cyan-400 via-blue-500 to-purple-600' },
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
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [exporting, setExporting] = useState(false);

  const currentTheme = THEMES[selectedTheme as keyof typeof THEMES] || THEMES.vscode;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    const element = document.getElementById('code-snippet-export');
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `${filename || 'code-snippet'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
    setExporting(false);
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Background gradient container for export */}
      <div 
        id="code-snippet-export"
        className="relative rounded-xl overflow-hidden"
      >
        {/* Gradient background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-10",
          GRADIENTS[selectedGradient].class
        )} />
        
        {/* Main container */}
        <div className="relative backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {/* Window chrome */}
          <div className={cn(
            "px-4 py-3 border-b border-white/10 bg-gradient-to-r",
            currentTheme.bg,
            "flex items-center justify-between"
          )}>
            <div className="flex items-center gap-3">
              {/* Mac-style dots */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              
              {/* Title/Filename */}
              {(title || filename) && (
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {title || filename}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons - hidden during export */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Theme selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Palette className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Code Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      className={selectedTheme === key ? 'bg-accent' : ''}
                    >
                      {theme.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Background</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {GRADIENTS.map((gradient, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => setSelectedGradient(index)}
                      className={selectedGradient === index ? 'bg-accent' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded bg-gradient-to-r",
                          gradient.class
                        )} />
                        {gradient.name}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Copy button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              {/* Export button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                disabled={exporting}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Code content */}
          <div className="relative">
            <SyntaxHighlighter
              language={language}
              style={currentTheme.style}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                color: 'rgba(255, 255, 255, 0.3)',
                userSelect: 'none',
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>

          {/* Decorative shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" 
            style={{
              transform: 'translateX(-100%)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

