"use client"

import { useTheme } from "next-themes"

import { GlyphMatrix } from "@/components/ui/glyph-matrix"
import { KineticText } from "@/components/ui/kinetic-text"
import { LineShadowText } from "@/components/ui/line-shadow-text"
import { Meteors } from "@/components/ui/meteors"
import { Particles } from "@/components/ui/particles"
import { SparklesText } from "@/components/ui/sparkles-text"

export type StudySetMediaVariant = "meteors" | "glyph" | "particles"

const SPARKLE_COLORS = { first: "#7928ca", second: "#ff0080" }

interface StudySetMediaProps {
  label: string
  variant?: StudySetMediaVariant
}

export function StudySetMedia({
  label,
  variant = "glyph",
}: StudySetMediaProps) {
  const words = label.split(" ")
  const lastWord = words[words.length - 1]
  const leadingWords = words.slice(0, -1).join(" ")
  const { resolvedTheme } = useTheme()
  const color =
    resolvedTheme === "dark"
      ? "#ffffff"
      : resolvedTheme === "light"
        ? "#000000"
        : "#6B7280"

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border bg-background md:h-56">
      {variant === "meteors" ? (
        <Meteors number={24} />
      ) : variant === "particles" ? (
        <Particles
          className="absolute inset-0"
          quantity={140}
          staticity={30}
          ease={50}
          size={0.8}
          color={color}
        />
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
        {variant === "meteors" ? (
          <SparklesText
            colors={SPARKLE_COLORS}
            className="pointer-events-auto text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl"
          >
            {label}
          </SparklesText>
        ) : variant === "particles" ? (
          <span className="pointer-events-auto text-4xl font-semibold tracking-tighter text-foreground md:text-5xl">
            {leadingWords ? `${leadingWords} ` : null}
            <LineShadowText className="italic" shadowColor="var(--foreground)">
              {lastWord}
            </LineShadowText>
          </span>
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
