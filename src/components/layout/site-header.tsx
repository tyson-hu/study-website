import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <Link
        href="/"
        className="text-sm font-medium tracking-[-0.28px] text-foreground"
      >
        {"Tyson's notes"}
      </Link>
      <ThemeToggle />
    </header>
  )
}
