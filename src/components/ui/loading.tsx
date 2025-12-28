'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Beautiful app loading screen
export function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Animated logo placeholder */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-20 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-white animate-bounce-subtle" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
          </div>
        </div>
        
        {/* Loading spinner */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-muted" />
            <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-1">Loading your workspace</h2>
          <p className="text-sm text-muted-foreground">Preparing your coding journey...</p>
        </div>
      </div>
      
      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`stat-card shimmer stagger-${i + 1}`} style={{ opacity: 0, animation: `fadeIn 0.4s ease-out forwards ${i * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      
      {/* Charts section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 shimmer">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border bg-card p-6 shimmer">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
      
      {/* Heatmap skeleton */}
      <div className="rounded-xl border bg-card p-6 shimmer">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Problem list skeleton
export function ProblemListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      
      {/* Search bar */}
      <div className="px-4">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      
      {/* Table header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Table rows */}
      {[...Array(rows)].map((_, i) => (
        <div 
          key={i} 
          className="px-4 py-4 border-b shimmer"
          style={{ opacity: 0, animation: `fadeIn 0.3s ease-out forwards ${i * 0.05}s` }}
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shimmer", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="stat-card shimmer">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-20 mb-1" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-muted/30">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex gap-4 p-4 border-b shimmer"
          style={{ opacity: 0, animation: `fadeIn 0.3s ease-out forwards ${rowIndex * 0.05}s` }}
        >
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Spinner component
export function Spinner({ size = 'default', className }: { size?: 'sm' | 'default' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    default: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };
  
  return (
    <div className={cn("relative", className)}>
      <div className={cn("rounded-full border-muted", sizeClasses[size])} />
      <div className={cn("absolute top-0 left-0 rounded-full border-primary border-t-transparent animate-spin", sizeClasses[size])} />
    </div>
  );
}

// Loading button content
export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

// Content loader with placeholder
export function ContentLoader({ 
  isLoading, 
  children, 
  skeleton 
}: { 
  isLoading: boolean; 
  children: React.ReactNode; 
  skeleton: React.ReactNode;
}) {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  return <>{children}</>;
}

export default {
  AppLoadingScreen,
  DashboardSkeleton,
  ProblemListSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  Spinner,
  LoadingDots,
  ContentLoader,
};
