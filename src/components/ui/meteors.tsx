"use client"

import React, { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    []
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Spread across the container rather than the viewport, so meteors stay
    // inside smaller surfaces such as cards.
    const spread = () => {
      const width = container.offsetWidth || window.innerWidth

      setMeteorStyles(
        [...new Array(number)].map(() => ({
          "--angle": -angle + "deg",
          top: "-5%",
          left: `${Math.floor(Math.random() * width)}px`,
          animationDelay: Math.random() * (maxDelay - minDelay) + minDelay + "s",
          animationDuration:
            Math.floor(
              Math.random() * (maxDuration - minDuration) + minDuration
            ) + "s",
        }))
      )
    }

    spread()

    const observer = new ResizeObserver(spread)
    observer.observe(container)
    return () => observer.disconnect()
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle])

  return (
    <span
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 block overflow-hidden"
    >
      {meteorStyles.map((style, idx) => (
        // Meteor Head
        <span
          key={idx}
          style={{ ...style }}
          className={cn(
            "animate-meteor pointer-events-none absolute size-0.5 rotate-(--angle) rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]",
            className
          )}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-12.5 -translate-y-1/2 bg-linear-to-r from-zinc-500 to-transparent" />
        </span>
      ))}
    </span>
  )
}
