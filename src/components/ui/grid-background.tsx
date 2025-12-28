"use client";

import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  dotColor?: string;
  showRadialGradient?: boolean;
}

export function GridBackground({
  children,
  className,
  containerClassName,
  dotColor,
  showRadialGradient = true,
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center bg-background",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)]",
          className
        )}
        style={dotColor ? { ["--dot-color" as string]: dotColor } : undefined}
      />
      {showRadialGradient && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      )}
      {children}
    </div>
  );
}

export function DotBackground({
  children,
  className,
  containerClassName,
  dotColor,
  showRadialGradient = true,
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center bg-background",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(hsl(var(--border)/0.5)_1px,transparent_1px)]",
          className
        )}
        style={dotColor ? { ["--dot-color" as string]: dotColor } : undefined}
      />
      {showRadialGradient && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      )}
      {children}
    </div>
  );
}

// Animated version with moving grid
export function AnimatedGridBackground({
  children,
  className,
  containerClassName,
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full overflow-hidden bg-background",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0 animate-grid-flow",
          "[background-size:50px_50px]",
          "[background-image:linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)]",
          className
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      {children}
    </div>
  );
}
