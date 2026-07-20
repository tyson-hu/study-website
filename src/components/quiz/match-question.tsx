"use client";

import { useEffect, useMemo } from "react";
import { ArrowRight, CheckCircle2, Link2, XCircle } from "lucide-react";

import { formatQuizText } from "@/lib/format-text";
import { cn } from "@/lib/utils";
import type { MatchPair, Question } from "@/types/question";

function shufflePairs(pairs: MatchPair[], seed: string): MatchPair[] {
  const items = [...pairs];
  let hash = 0;

  for (let index = 0; index < seed.length; index++) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % 100000;
  }

  for (let index = items.length - 1; index > 0; index--) {
    hash = (hash * 1103515245 + 12345) % 2147483647;
    const swapIndex = hash % (index + 1);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function indexBadgeLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

interface MatchQuestionProps {
  question: Question;
  matchAnswer: Record<string, string>;
  disabled: boolean;
  showFeedback: boolean;
  onChange: (leftId: string, rightId: string | null) => void;
  /** Controlled pending left (keyboard + click share this). */
  pendingLeftId: string | null;
  onPendingLeftIdChange: (leftId: string | null) => void;
  /** Notify parent of display-ordered right ids after shuffle (for keyboard index). */
  onRightOrderChange?: (rightIds: string[]) => void;
}

export function MatchQuestion({
  question,
  matchAnswer,
  disabled,
  showFeedback,
  onChange,
  pendingLeftId,
  onPendingLeftIdChange,
  onRightOrderChange,
}: MatchQuestionProps) {
  const pairs = useMemo(
    () => question.matchPairs ?? [],
    [question.matchPairs]
  );

  const shuffledRight = useMemo(
    () => shufflePairs(pairs, question.id),
    [pairs, question.id]
  );

  useEffect(() => {
    onRightOrderChange?.(shuffledRight.map((pair) => pair.id));
  }, [shuffledRight, onRightOrderChange]);

  const rightById = useMemo(
    () => new Map(pairs.map((pair) => [pair.id, pair])),
    [pairs]
  );

  const usedRightIds = new Set(Object.values(matchAnswer));

  const handleLeftClick = (leftId: string) => {
    if (disabled) return;
    onPendingLeftIdChange(pendingLeftId === leftId ? null : leftId);
  };

  const handleRightClick = (rightId: string) => {
    if (disabled || !pendingLeftId) return;

    for (const [leftId, matchedRightId] of Object.entries(matchAnswer)) {
      if (matchedRightId === rightId && leftId !== pendingLeftId) {
        onChange(leftId, null);
      }
    }

    onChange(pendingLeftId, rightId);
    onPendingLeftIdChange(null);
  };

  const clearMatch = (leftId: string) => {
    if (disabled) return;
    onChange(leftId, null);
    onPendingLeftIdChange(null);
  };

  const getLeftState = (leftId: string) => {
    if (!showFeedback) return "default" as const;
    if (!matchAnswer[leftId]) return "missed" as const;
    return matchAnswer[leftId] === leftId ? ("correct" as const) : ("incorrect" as const);
  };

  const getRightState = (rightId: string) => {
    if (!showFeedback) return "default" as const;

    const matchedLeftId = Object.entries(matchAnswer).find(
      ([, value]) => value === rightId
    )?.[0];

    if (!matchedLeftId) return "default" as const;
    return matchedLeftId === rightId ? ("correct" as const) : ("incorrect" as const);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Select a left item, then its match on the right. Keys: left, then right.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-muted-foreground">
            Items
          </p>
          {pairs.map((pair, index) => {
            const matchedRightId = matchAnswer[pair.id];
            const matchedRight = matchedRightId
              ? rightById.get(matchedRightId)
              : undefined;
            const state = getLeftState(pair.id);
            const isSelected = pendingLeftId === pair.id;

            return (
              <div
                key={pair.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => handleLeftClick(pair.id)}
                onKeyDown={(event) => {
                  if (disabled) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleLeftClick(pair.id);
                  }
                }}
                className={cn(
                  "flex cursor-pointer flex-col gap-2 rounded-xl border bg-background p-4 text-left transition-colors",
                  disabled && "cursor-default",
                  !disabled && "hover:border-primary/40 hover:bg-accent/20",
                  isSelected && "border-primary ring-2 ring-primary/30",
                  state === "correct" && "border-green-500/50 bg-green-500/10",
                  state === "incorrect" &&
                    "border-destructive/50 bg-destructive/10",
                  state === "missed" && "border-amber-500/50 bg-amber-500/10"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-medium",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-[var(--canvas-soft)] text-muted-foreground"
                      )}
                    >
                      {indexBadgeLabel(index)}
                    </span>
                    <span className="text-base font-semibold">
                      {pair.left}
                    </span>
                  </div>
                  {state === "correct" && (
                    <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                  )}
                  {state === "incorrect" && (
                    <XCircle className="size-4 shrink-0 text-destructive" />
                  )}
                </div>

                {matchedRight && !showFeedback && (
                  <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                    <Link2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="line-clamp-2">
                      {formatQuizText(matchedRight.right)}
                    </span>
                    {!disabled && (
                      <button
                        type="button"
                        className="ml-auto shrink-0 text-xs text-primary underline-offset-2 hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearMatch(pair.id);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {showFeedback && state !== "correct" && (
                  <p className="text-xs text-muted-foreground">
                    Correct: {formatQuizText(pair.right)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-muted-foreground">
            Descriptions
          </p>
          {shuffledRight.map((pair, index) => {
            const isUsed = usedRightIds.has(pair.id);
            const isSelectedTarget =
              pendingLeftId !== null && !isUsed && !disabled;
            const state = getRightState(pair.id);

            return (
              <button
                key={`right-${pair.id}`}
                type="button"
                disabled={disabled || (isUsed && !showFeedback)}
                onClick={() => handleRightClick(pair.id)}
                className={cn(
                  "rounded-xl border bg-background p-4 text-left text-sm leading-relaxed transition-colors",
                  isSelectedTarget &&
                    "cursor-pointer hover:border-primary/40 hover:bg-accent/20",
                  isUsed &&
                    !showFeedback &&
                    "border-primary/30 bg-primary/5 opacity-80",
                  disabled && "cursor-default",
                  state === "correct" && "border-green-500/50 bg-green-500/10",
                  state === "incorrect" &&
                    "border-destructive/50 bg-destructive/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-medium",
                      "border-border bg-[var(--canvas-soft)] text-muted-foreground"
                    )}
                  >
                    {indexBadgeLabel(index)}
                  </span>
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    {isUsed && !showFeedback && (
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    )}
                    <span>{formatQuizText(pair.right)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
