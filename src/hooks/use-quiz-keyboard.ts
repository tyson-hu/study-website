"use client";

import { useEffect } from "react";

import {
  hasShortcutModifier,
  isTypingTarget,
  parseOptionIndex,
} from "@/lib/quiz-keyboard";
import type { Question } from "@/types/question";

export type UseQuizKeyboardOptions = {
  enabled: boolean;
  quizMode: "practice" | "test";
  optionsLocked: boolean;
  isCurrentChecked: boolean;
  isCurrentAnswered: boolean;
  isLastQuestion: boolean;
  answeredCount: number;
  showResults: boolean;
  questionType: Question["type"] | undefined;
  choiceOptionIds: string[];
  onToggleChoice: (optionId: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmitTest: () => void;
  matchLeftIds?: string[];
  matchRightIds?: string[];
  pendingMatchLeftId?: string | null;
  onSetPendingMatchLeft?: (leftId: string | null) => void;
  onPairMatch?: (leftId: string, rightId: string) => void;
};

export function useQuizKeyboard(options: UseQuizKeyboardOptions): void {
  const {
    enabled,
    quizMode,
    optionsLocked,
    isCurrentChecked,
    isCurrentAnswered,
    isLastQuestion,
    answeredCount,
    showResults,
    questionType,
    choiceOptionIds,
    onToggleChoice,
    onCheck,
    onNext,
    onPrev,
    onSubmitTest,
    matchLeftIds,
    matchRightIds,
    pendingMatchLeftId,
    onSetPendingMatchLeft,
    onPairMatch,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (showResults) return;
      if (hasShortcutModifier(event)) return;

      const typing = isTypingTarget(event.target);
      const key = event.key;

      if (key === "Escape") {
        if (typing && event.target instanceof HTMLElement) {
          event.preventDefault();
          event.target.blur();
          return;
        }
        if (pendingMatchLeftId && onSetPendingMatchLeft) {
          event.preventDefault();
          onSetPendingMatchLeft(null);
        }
        return;
      }

      if (key === "Enter") {
        // Always allow Enter for Check/Next even while typing in text fields.
        event.preventDefault();
        event.stopPropagation();

        if (quizMode === "practice") {
          if (!isCurrentChecked) {
            if (isCurrentAnswered) onCheck();
            return;
          }
          onNext();
          return;
        }

        // test mode
        if (!isLastQuestion) {
          onNext();
          return;
        }
        if (!isCurrentChecked && answeredCount >= 1) onSubmitTest();
        return;
      }

      if (key === "ArrowLeft" || key === "ArrowRight") {
        if (typing) return; // caret movement
        event.preventDefault();
        if (key === "ArrowLeft") onPrev();
        else onNext();
        return;
      }

      if (typing) return;
      if (optionsLocked) return;

      const index = parseOptionIndex(key);
      if (index === null) return;

      if (
        questionType === "single_choice" ||
        questionType === "multiple_choice"
      ) {
        const optionId = choiceOptionIds[index];
        if (!optionId) return;
        event.preventDefault();
        onToggleChoice(optionId);
        return;
      }

      // Match handled in Task 4 — keep branch ready:
      if (questionType === "match") {
        const leftIds = matchLeftIds ?? [];
        const rightIds = matchRightIds ?? [];
        const pending = pendingMatchLeftId ?? null;

        if (!pending) {
          const leftId = leftIds[index];
          if (!leftId || !onSetPendingMatchLeft) return;
          event.preventDefault();
          onSetPendingMatchLeft(leftId);
          return;
        }

        const rightId = rightIds[index];
        if (!rightId || !onPairMatch) return;
        event.preventDefault();
        onPairMatch(pending, rightId);
        onSetPendingMatchLeft?.(null);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    enabled,
    quizMode,
    optionsLocked,
    isCurrentChecked,
    isCurrentAnswered,
    isLastQuestion,
    answeredCount,
    showResults,
    questionType,
    choiceOptionIds,
    onToggleChoice,
    onCheck,
    onNext,
    onPrev,
    onSubmitTest,
    matchLeftIds,
    matchRightIds,
    pendingMatchLeftId,
    onSetPendingMatchLeft,
    onPairMatch,
  ]);
}
