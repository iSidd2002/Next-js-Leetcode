"use client"

import * as React from "react"
import {
  Calendar,
  Code,
  CreditCard,
  Settings,
  User,
  Plus,
  Trophy,
  CheckSquare,
  Moon,
  Sun,
  Laptop,
  Calculator,
  Smile,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"

interface CommandMenuProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddProblem?: () => void
    onAddContest?: () => void
}

export function CommandMenu({ open, onOpenChange, onAddProblem, onAddContest }: CommandMenuProps) {
  const { setTheme } = useTheme()
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => {
              onAddProblem?.()
              onOpenChange(false)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Problem</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => {
              onAddContest?.()
              onOpenChange(false)
          }}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Add Contest</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
            {/* These would ideally switch tabs in the parent component, but we'll leave placeholders */}
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Code className="mr-2 h-4 w-4" />
            <span>Problems</span>
          </CommandItem>
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Contests</span>
          </CommandItem>
          <CommandItem onSelect={() => onOpenChange(false)}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Tasks</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => {
              setTheme("light")
              onOpenChange(false)
          }}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => {
              setTheme("dark")
              onOpenChange(false)
          }}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => {
              setTheme("system")
              onOpenChange(false)
          }}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

