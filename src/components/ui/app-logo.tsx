"use client";

interface AppLogoProps {
  className?: string;
  size?: number;
}

export function AppLogo({ className, size = 28 }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LeetCode Tracker"
    >
      <defs>
        <linearGradient
          id="logo-bg"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#9D6FFF" />
          <stop offset="100%" stopColor="#6527C7" />
        </linearGradient>
        <linearGradient
          id="logo-shine"
          x1="0"
          y1="0"
          x2="0"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="32" height="32" rx="8" fill="url(#logo-bg)" />

      {/* Top inner highlight — subtle depth */}
      <rect width="32" height="14" rx="8" fill="url(#logo-shine)" />

      {/* Left bracket — represents code */}
      <path
        d="M12.5 10.5 L10 10.5 L10 21.5 L12.5 21.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />

      {/* Checkmark — represents solved */}
      <path
        d="M15 17 L18 20 L24 12"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
