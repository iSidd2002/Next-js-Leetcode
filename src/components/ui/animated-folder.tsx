"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
}: AnimatedFolderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card overflow-hidden transition-colors duration-200",
        isOpen && "border-border/80",
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors duration-150"
      >
        {/* Chevron */}
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-muted-foreground/60 shrink-0"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.div>

        {/* Optional icon (small, no background box) */}
        {icon && (
          <span className="text-muted-foreground/70 shrink-0 text-xs font-mono">
            {icon}
          </span>
        )}

        {/* Title */}
        <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
          {title}
        </span>

        {/* Badges inline */}
        {badge}

        {/* Count */}
        {count !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {count}
          </span>
        )}
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.2, ease: "easeOut" },
                opacity: { duration: 0.15, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: "easeIn" },
                opacity: { duration: 0.1 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Topic-specific folder
interface TopicFolderProps extends Omit<AnimatedFolderProps, "icon" | "title"> {
  topic: string;
  difficulty?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export function TopicFolder({
  topic,
  difficulty,
  count,
  children,
  defaultOpen,
  className,
  ...props
}: TopicFolderProps) {
  return (
    <AnimatedFolder
      title={topic}
      count={count}
      defaultOpen={defaultOpen}
      className={className}
      badge={
        difficulty && (
          <div className="flex items-center gap-1.5 shrink-0">
            {difficulty.easy > 0 && (
              <span className="text-[11px] text-emerald-500/80 tabular-nums">
                {difficulty.easy}E
              </span>
            )}
            {difficulty.medium > 0 && (
              <span className="text-[11px] text-amber-500/80 tabular-nums">
                {difficulty.medium}M
              </span>
            )}
            {difficulty.hard > 0 && (
              <span className="text-[11px] text-red-500/80 tabular-nums">
                {difficulty.hard}H
              </span>
            )}
          </div>
        )
      }
      {...props}
    >
      {children}
    </AnimatedFolder>
  );
}
