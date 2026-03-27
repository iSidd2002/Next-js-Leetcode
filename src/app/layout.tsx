import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "LeetCode Tracker",
  description: "Master your coding interview journey with spaced repetition and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background`} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="leetcode-tracker-theme"
        >
          {/* Single whisper-level top gradient — dark mode only */}
          <div className="fixed inset-0 z-[-1] dark:bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,hsl(258_90%_67%/0.08),transparent)] pointer-events-none" />
          {/* Subtle grain texture for depth */}
          <div className="fixed inset-0 z-[-1] opacity-[0.025] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
