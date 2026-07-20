"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import {
  createEmptyQuizProgress,
  getQuizProgressSnapshot,
  QUIZ_PROGRESS_VERSION,
  saveQuizProgress,
  subscribeToQuizProgress,
  type QuizProgressIdentity,
  type QuizProgressState,
} from "@/lib/quiz-persistence";

export type QuizProgressMode = "persisted" | "compatible";

export interface QuizProgressApi {
  progress: QuizProgressState;
  updateProgress: (
    updater:
      | Partial<QuizProgressState>
      | ((prev: QuizProgressState) => QuizProgressState)
  ) => void;
  restartQuiz: () => void;
}

function finalizeProgress(
  identity: QuizProgressIdentity,
  next: QuizProgressState
): QuizProgressState {
  return {
    ...next,
    version: QUIZ_PROGRESS_VERSION,
    setId: identity.setId,
    mode: identity.mode,
    schemaVersion: identity.schemaVersion,
    totalQuestions: identity.totalQuestions,
    updatedAt: Date.now(),
  };
}

export function usePersistedQuizProgress(
  identity: QuizProgressIdentity
): QuizProgressApi {
  const serverProgress = useMemo(
    () => createEmptyQuizProgress(identity),
    [identity]
  );

  const subscribe = useMemo(
    () => subscribeToQuizProgress(identity.setId, identity.mode),
    [identity.setId, identity.mode]
  );

  const progress = useSyncExternalStore(
    subscribe,
    () => getQuizProgressSnapshot(identity),
    () => serverProgress
  );

  const updateProgress = useCallback(
    (
      updater:
        | Partial<QuizProgressState>
        | ((prev: QuizProgressState) => QuizProgressState)
    ) => {
      const prev = getQuizProgressSnapshot(identity);
      const next =
        typeof updater === "function"
          ? updater(prev)
          : {
              ...prev,
              ...updater,
            };

      saveQuizProgress(finalizeProgress(identity, next));
    },
    [identity]
  );

  const restartQuiz = useCallback(() => {
    saveQuizProgress(createEmptyQuizProgress(identity));
  }, [identity]);

  return { progress, updateProgress, restartQuiz };
}

/** In-memory progress — no localStorage / external store. Safer on restricted browsers. */
export function useCompatibleQuizProgress(
  identity: QuizProgressIdentity
): QuizProgressApi {
  const identityKey = `${identity.setId}:${identity.mode}:${identity.schemaVersion}:${identity.totalQuestions}`;
  const [progress, setProgress] = useState<QuizProgressState>(() =>
    createEmptyQuizProgress(identity)
  );
  const [activeKey, setActiveKey] = useState(identityKey);

  if (activeKey !== identityKey) {
    setActiveKey(identityKey);
    setProgress(createEmptyQuizProgress(identity));
  }

  const updateProgress = useCallback(
    (
      updater:
        | Partial<QuizProgressState>
        | ((prev: QuizProgressState) => QuizProgressState)
    ) => {
      setProgress((prev) => {
        const next =
          typeof updater === "function"
            ? updater(prev)
            : {
                ...prev,
                ...updater,
              };
        return finalizeProgress(identity, next);
      });
    },
    [identity]
  );

  const restartQuiz = useCallback(() => {
    setProgress(createEmptyQuizProgress(identity));
  }, [identity]);

  return { progress, updateProgress, restartQuiz };
}
