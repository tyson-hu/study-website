"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CommandBlockProps {
  code: string
  caption?: string
  /** Diagrams and trees are reference art, not commands to run. */
  copyable?: boolean
  className?: string
}

export function CommandBlock({
  code,
  caption,
  copyable = true,
  className,
}: CommandBlockProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; the text stays selectable either way.
    }
  }

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-muted/40",
        className
      )}
    >
      {caption || copyable ? (
        <figcaption className="flex h-9 items-center justify-between gap-3 border-b border-border px-3">
          <span className="truncate font-mono text-xs text-[var(--mute)]">
            {caption ?? ""}
          </span>
          {copyable ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={copied ? "Copied" : "Copy to clipboard"}
              onClick={handleCopy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          ) : null}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-foreground">
        <code>{code}</code>
      </pre>
    </figure>
  )
}
