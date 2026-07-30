"use client"

import { useEffect, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { ARMY_NET_SECTIONS } from "@/lib/army-net"
import { cn } from "@/lib/utils"

function useActiveSection() {
  const [activeId, setActiveId] = useState(ARMY_NET_SECTIONS[0].id)

  useEffect(() => {
    const elements = ARMY_NET_SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    // The heading nearest below the header bar wins, so overlapping sections
    // never leave the previous entry highlighted.
    const readActive = () => {
      const line = 120
      let current = elements[0]

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= line) current = element
      }

      setActiveId(current.id)
    }

    let frame = requestAnimationFrame(readActive)
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(readActive)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return activeId
}

function SectionList({
  activeId,
  onSelect,
}: {
  activeId: string
  onSelect?: () => void
}) {
  return (
    <ol className="space-y-0.5">
      {ARMY_NET_SECTIONS.map((section) => {
        const active = section.id === activeId

        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={onSelect}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "font-mono text-[11px]",
                  active ? "text-foreground" : "text-[var(--mute)]"
                )}
              >
                {section.number}
              </span>
              {section.title}
            </a>
          </li>
        )
      })}
    </ol>
  )
}

export function GuideToc() {
  const activeId = useActiveSection()
  const [open, setOpen] = useState(false)
  const activeSection =
    ARMY_NET_SECTIONS.find((section) => section.id === activeId) ??
    ARMY_NET_SECTIONS[0]

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-foreground shadow-elevation-2"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="font-mono text-xs text-[var(--mute)]">
              {activeSection.number}
            </span>
            <span className="truncate">{activeSection.title}</span>
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-[var(--mute)] transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {open ? (
          <nav
            aria-label="Guide sections"
            className="mt-2 rounded-lg border border-border bg-card p-2 shadow-elevation-2"
          >
            <SectionList
              activeId={activeId}
              onSelect={() => setOpen(false)}
            />
          </nav>
        ) : null}
      </div>

      <nav
        aria-label="Guide sections"
        className="sticky top-24 hidden lg:block"
      >
        <p className="px-2.5 pb-2 font-mono text-xs tracking-[0.02em] text-[var(--mute)] uppercase">
          On this page
        </p>
        <SectionList activeId={activeId} />
      </nav>
    </>
  )
}
