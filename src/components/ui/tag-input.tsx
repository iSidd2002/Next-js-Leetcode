"use client"

import * as React from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add item and press Enter...",
  className,
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag])
      setInputValue("")
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => addTag(inputValue.trim())}
          disabled={!inputValue.trim() || value.length >= maxTags}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-2 py-1 text-xs flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {value.length >= maxTags && (
        <p className="text-xs text-muted-foreground">Maximum {maxTags} items reached</p>
      )}
    </div>
  )
}
