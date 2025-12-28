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
          {/* Surreal Golden Hour Gradients */}
          {/* Top Right Sun (Gold) */}
          <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-50 dark:opacity-30 pointer-events-none" />
          
          {/* Bottom Left Ocean (Teal) */}
          <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50 dark:opacity-30 pointer-events-none" />
          
          {/* Subtle Noise Texture for "Canvas" feel (Optional, but fits the art theme) */}
          <div className="fixed inset-0 z-[-1] opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
