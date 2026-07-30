"use client"

import { useSyncExternalStore } from "react"
import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { VERIFICATION_GROUPS, VERIFICATION_TOTAL } from "@/lib/army-net"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "study-web:army-net-checklist:v1"

type CheckedMap = Record<string, boolean>

const EMPTY: CheckedMap = {}

/**
 * useSyncExternalStore requires a referentially stable snapshot, so the parsed
 * map is cached in the module rather than re-read on every render.
 */
let snapshot: CheckedMap | null = null
const listeners = new Set<() => void>()

function readStored(): CheckedMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return EMPTY

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, value]) => typeof value === "boolean"
      )
    ) as CheckedMap
  } catch {
    return EMPTY
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function getSnapshot(): CheckedMap {
  snapshot ??= readStored()
  return snapshot
}

function getServerSnapshot(): CheckedMap {
  return EMPTY
}

function write(next: CheckedMap) {
  snapshot = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable in private mode; ticks stay in-session.
  }
  listeners.forEach((listener) => listener())
}

function itemKey(groupId: string, index: number) {
  return `${groupId}:${index}`
}

export function VerificationChecklist() {
  const checked = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const completed = Object.values(checked).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <Progress value={(completed / VERIFICATION_TOTAL) * 100}>
          <span className="text-sm font-medium text-foreground">
            {completed} of {VERIFICATION_TOTAL} verified
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto"
            disabled={completed === 0}
            onClick={() => write(EMPTY)}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
        </Progress>
        <p className="mt-3 text-xs text-[var(--mute)]">
          Ticks are saved in this browser only.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {VERIFICATION_GROUPS.map((group) => (
          <div key={group.id}>
            <h3 className="text-base font-semibold tracking-[-0.32px] text-foreground">
              {group.title}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {group.items.map((item, index) => {
                const key = itemKey(group.id, index)
                const isChecked = checked[key] ?? false

                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        className="mt-1"
                        checked={isChecked}
                        onCheckedChange={(value) =>
                          write({ ...checked, [key]: value === true })
                        }
                      />
                      <span
                        className={cn(
                          "text-[15px] leading-6 transition-colors",
                          isChecked
                            ? "text-[var(--mute)] line-through"
                            : "text-muted-foreground"
                        )}
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
