"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnimatedFolderProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  accentColor?: string;
}

export function AnimatedFolder({
  title,
  count,
  children,
  defaultOpen = false,
  className,
  icon,
  badge,
  accentColor = "primary",
}: AnimatedFolderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300",
        isOpen && "ring-1 ring-primary/20 shadow-lg shadow-primary/5",
        className
      )}
    >
      {/* Folder Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left transition-all duration-300",
          "hover:bg-muted/50",
          isOpen && "bg-gradient-to-r from-primary/5 to-transparent"
        )}
      >
        {/* Folder Icon with Animation */}
        <div className="relative">
          <motion.div
            initial={false}
            animate={{ 
              scale: isOpen ? 1.1 : 1,
              rotate: isOpen ? -5 : 0 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "p-2 rounded-lg transition-colors duration-300",
              isOpen 
                ? "bg-primary/20 text-primary" 
                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}
          >
            {icon || (isOpen ? (
              <FolderOpen className="h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            ))}
          </motion.div>
          
          {/* Glow effect when open */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-primary/20 rounded-lg blur-md -z-10"
            />
          )}
        </div>

        {/* Title and Count */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold truncate transition-colors duration-300",
              isOpen ? "text-primary" : "text-foreground"
            )}>
              {title}
            </h3>
            {badge}
          </div>
          {count !== undefined && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {count} {count === 1 ? 'problem' : 'problems'}
            </p>
          )}
        </div>

        {/* Count Badge */}
        {count !== undefined && (
          <Badge 
            variant="secondary" 
            className={cn(
              "transition-all duration-300",
              isOpen && "bg-primary/20 text-primary"
            )}
          >
            {count}
          </Badge>
        )}

        {/* Chevron */}
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-muted-foreground"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      {/* Folder Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: "easeIn" },
                opacity: { duration: 0.1 }
              }
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Topic-specific folder with color coding
interface TopicFolderProps extends Omit<AnimatedFolderProps, 'icon' | 'title'> {
  topic: string;
  difficulty?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  'Array': '[]',
  'String': 'Aa',
  'Hash Table': '#',
  'Dynamic Programming': 'DP',
  'Math': '+-',
  'Sorting': '[]',
  'Greedy': '$',
  'Depth-First Search': '{}',
  'Binary Search': '/',
  'Database': 'DB',
  'Breadth-First Search': '<>',
  'Tree': '^',
  'Matrix': '[]',
  'Two Pointers': '>>',
  'Bit Manipulation': '01',
  'Stack': '[]',
  'Heap': '^',
  'Graph': 'o-',
  'Design': '*',
  'Linked List': '->',
  'Backtracking': '<-',
  'Simulation': '~',
  'Sliding Window': '[]',
  'Union Find': 'UF',
  'Recursion': '()',
};

export function TopicFolder({
  topic,
  difficulty,
  count,
  children,
  defaultOpen,
  className,
  ...props
}: TopicFolderProps) {
  const topicIcon = TOPIC_ICONS[topic] || topic.charAt(0).toUpperCase();
  
  return (
    <AnimatedFolder
      title={topic}
      count={count}
      children={children}
      defaultOpen={defaultOpen}
      className={className}
      icon={
        <span className="font-mono text-sm font-bold">
          {topicIcon}
        </span>
      }
      badge={
        difficulty && (
          <div className="flex items-center gap-1">
            {difficulty.easy > 0 && (
              <span className="text-xs text-emerald-500">{difficulty.easy}E</span>
            )}
            {difficulty.medium > 0 && (
              <span className="text-xs text-amber-500">{difficulty.medium}M</span>
            )}
            {difficulty.hard > 0 && (
              <span className="text-xs text-red-500">{difficulty.hard}H</span>
            )}
          </div>
        )
      }
    />
  );
}
