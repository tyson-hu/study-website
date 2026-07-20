"use client";

import { useEffect, useSyncExternalStore } from "react";
import { unstable_catchError, type ErrorInfo } from "next/error";
import { useSearchParams } from "next/navigation";

import { QuizApp, type QuizAppProps } from "@/components/quiz/quiz-app";
import {
  isCompatibleModePreferred,
  preferCompatibleMode,
} from "@/lib/quiz-compatible";

type ShellProps = Omit<QuizAppProps, "progressMode">;

function QuizPersistErrorFallback(
  props: ShellProps,
  { error }: ErrorInfo
) {
  useEffect(() => {
    preferCompatibleMode();
    console.error("Quiz persisted mode failed; using compatible mode.", error);
  }, [error]);

  return <QuizApp {...props} progressMode="compatible" />;
}

const QuizPersistBoundary = unstable_catchError(QuizPersistErrorFallback);

const emptySubscribe = () => () => {};

/**
 * Loads the quiz in persisted mode when possible. Falls back to compatible
 * (in-memory) mode when storage is blocked, `?compatible=1` is set, or the
 * persisted UI throws at runtime.
 */
export function QuizShell(props: ShellProps) {
  const searchParams = useSearchParams();
  const forcedByQuery = searchParams.get("compatible") === "1";

  const compatible = useSyncExternalStore(
    emptySubscribe,
    () => forcedByQuery || isCompatibleModePreferred(),
    () => forcedByQuery
  );

  useEffect(() => {
    if (forcedByQuery) preferCompatibleMode();
  }, [forcedByQuery]);

  if (compatible) {
    return <QuizApp {...props} progressMode="compatible" />;
  }

  return (
    <QuizPersistBoundary {...props}>
      <QuizApp {...props} progressMode="persisted" />
    </QuizPersistBoundary>
  );
}
