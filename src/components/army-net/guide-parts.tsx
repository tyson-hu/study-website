import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GuideSectionProps {
  id: string
  number: string
  title: string
  summary?: string
  children: ReactNode
}

export function GuideSection({
  id,
  number,
  title,
  summary,
  children,
}: GuideSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card className="shadow-elevation-2 border-border bg-card p-6 md:p-8">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-[var(--mute)]">{number}</span>
          <h2 className="text-2xl font-semibold tracking-[-0.96px] text-foreground">
            {title}
          </h2>
        </div>
        {summary ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {summary}
          </p>
        ) : null}
        <div className="mt-7 space-y-6">{children}</div>
      </Card>
    </section>
  )
}

interface SubsectionProps {
  label?: string
  title: string
  children: ReactNode
}

export function Subsection({ label, title, children }: SubsectionProps) {
  return (
    <div className="border-t border-border pt-7 first:border-t-0 first:pt-0">
      <h3 className="text-lg font-semibold tracking-[-0.4px] text-foreground">
        {label ? (
          <span className="mr-2 font-mono text-base font-normal text-[var(--mute)]">
            {label}.
          </span>
        ) : null}
        {title}
      </h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  )
}

export function GuideText({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
      {children}
    </p>
  )
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-secondary px-1 py-0.5 font-mono text-[13px] text-foreground">
      {children}
    </code>
  )
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-3 text-[15px] leading-7 text-muted-foreground"
        >
          <span
            aria-hidden
            className="mt-3 size-1 shrink-0 rounded-full bg-[var(--mute)]"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-3 text-[15px] leading-7 text-muted-foreground"
        >
          <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px] text-muted-foreground tabular-nums">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

interface CalloutProps {
  title: string
  tone?: "info" | "important"
  children: ReactNode
}

export function Callout({ title, tone = "info", children }: CalloutProps) {
  const important = tone === "important"

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        important
          ? "border-[color-mix(in_oklch,var(--chart-1),transparent_70%)] bg-[color-mix(in_oklch,var(--chart-1),transparent_94%)]"
          : "border-border bg-muted/50"
      )}
    >
      <p
        className={cn(
          "font-mono text-xs tracking-[0.02em] uppercase",
          important ? "text-[var(--chart-1)]" : "text-[var(--mute)]"
        )}
      >
        {title}
      </p>
      <div className="mt-2 space-y-2 text-[15px] leading-7 text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

interface FieldTableProps {
  columns: [string, string]
  rows: [ReactNode, ReactNode][]
  /** Renders the first column in monospace for symbols and field names. */
  monoFirstColumn?: boolean
}

export function FieldTable({
  columns,
  rows,
  monoFirstColumn = true,
}: FieldTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[420px] border-collapse text-left text-[15px]">
        <thead>
          <tr className="bg-muted/50">
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-2.5 font-mono text-xs font-normal tracking-[0.02em] text-[var(--mute)] uppercase"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-border">
              <td
                className={cn(
                  "w-[38%] px-4 py-2.5 align-top text-foreground",
                  monoFirstColumn && "font-mono text-[13px]"
                )}
              >
                {row[0]}
              </td>
              <td className="px-4 py-2.5 align-top leading-6 text-muted-foreground">
                {row[1]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
