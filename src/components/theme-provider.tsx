"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ThemeProviderState = {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: {
  children: React.ReactNode
  defaultTheme?: "light" | "dark" | "system"
  storageKey?: string
}) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Hydrate theme from localStorage after component mounts
  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem(storageKey) as "light" | "dark" | "system"
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (newTheme: "light" | "dark" | "system") => {
      if (mounted) {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider value={{ theme: defaultTheme, setTheme: () => {} }}>
        {children}
      </ThemeProviderContext.Provider>
    )
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 