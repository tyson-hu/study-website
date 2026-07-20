"use client"

import { useTheme } from "next-themes"

import { ComicText } from "@/components/ui/comic-text"
import { GlyphMatrix } from "@/components/ui/glyph-matrix"
import { KineticText } from "@/components/ui/kinetic-text"
import { RetroGrid } from "@/components/ui/retro-grid"

export type StudySetMediaVariant = "retro" | "glyph"

interface StudySetMediaProps {
  label: string
  variant?: StudySetMediaVariant
}

export function StudySetMedia({
  label,
  variant = "glyph",
}: StudySetMediaProps) {
  const { resolvedTheme } = useTheme()
  const color =
    resolvedTheme === "dark"
      ? "#ffffff"
      : resolvedTheme === "light"
        ? "#000000"
        : "#6B7280"

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border bg-background md:h-56">
      {variant === "retro" ? (
        <RetroGrid />
      ) : (
        <GlyphMatrix
          glyphs="01·•+*/\\<>="
          cellSize={14}
          mutationRate={0.04}
          interval={90}
          fadeBottom={0.6}
          color={color}
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        {variant === "retro" ? (
          <ComicText fontSize={2.5} className="pointer-events-auto">
            {label}
          </ComicText>
        ) : (
          <KineticText
            as="span"
            text={label}
            className="pointer-events-auto text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl [font-optical-sizing:auto]"
          />
        )}
      </div>
    </div>
  )
}
