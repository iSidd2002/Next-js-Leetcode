"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "./border-beam";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  showBorderBeam?: boolean;
  hoverEffect?: boolean;
}

export function GlowCard({
  children,
  className,
  glowColor = "hsl(var(--primary))",
  showBorderBeam = false,
  hoverEffect = true,
  ...props
}: GlowCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-500",
        hoverEffect && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Glow effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}15, transparent 40%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
      
      {/* Border beam */}
      {showBorderBeam && <BorderBeam />}
    </div>
  );
}

// Stat card with animated number
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const colorMap = {
  default: {
    bg: "from-slate-500/10 to-slate-500/5",
    icon: "bg-slate-500/10 text-slate-500",
    glow: "hsl(var(--primary))",
  },
  success: {
    bg: "from-emerald-500/10 to-emerald-500/5",
    icon: "bg-emerald-500/10 text-emerald-500",
    glow: "rgb(16 185 129)",
  },
  warning: {
    bg: "from-amber-500/10 to-amber-500/5",
    icon: "bg-amber-500/10 text-amber-500",
    glow: "rgb(245 158 11)",
  },
  danger: {
    bg: "from-red-500/10 to-red-500/5",
    icon: "bg-red-500/10 text-red-500",
    glow: "rgb(239 68 68)",
  },
  info: {
    bg: "from-blue-500/10 to-blue-500/5",
    icon: "bg-blue-500/10 text-blue-500",
    glow: "rgb(59 130 246)",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = "default",
  className,
}: StatCardProps) {
  const colors = colorMap[color];
  
  return (
    <GlowCard 
      className={cn("p-6", className)} 
      glowColor={colors.glow}
      showBorderBeam={false}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", colors.bg)} />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={cn("rounded-lg p-2.5", colors.icon)}>
              {icon}
            </div>
          )}
        </div>
        {trend && trendValue && (
          <div className="mt-4 flex items-center gap-1">
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-emerald-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </GlowCard>
  );
}

// Feature card with icon and gradient
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  gradient = "from-primary/20 via-primary/10 to-transparent",
  className,
}: FeatureCardProps) {
  return (
    <GlowCard className={cn("p-6", className)} showBorderBeam>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />
      <div className="relative z-10 space-y-4">
        <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </GlowCard>
  );
}
