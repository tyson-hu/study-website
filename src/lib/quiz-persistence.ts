import type {
  MatchAnswerMap,
  QuizMode,
  TextFieldAnswerMap,
} from "@/types/question";
import type { QuizSetId } from "@/lib/question-sets";

export const QUIZ_PROGRESS_VERSION = 1 as const;

export interface QuizProgressState {
  version: typeof QUIZ_PROGRESS_VERSION;
  setId: QuizSetId;
  mode: QuizMode;
  schemaVersion: string;
  totalQuestions: number;
  currentIndex: number;
  selections: Record<string, string[]>;
  textFieldAnswers: Record<string, TextFieldAnswerMap>;
  matchAnswers: Record<string, MatchAnswerMap>;
  checked: Record<string, boolean>;
  testSubmitted: boolean;
  showResults: boolean;
  updatedAt: number;
}

export interface QuizProgressIdentity {
  setId: QuizSetId;
  mode: QuizMode;
  schemaVersion: string;
  totalQuestions: number;
}

const PROGRESS_EVENT = "study-web:quiz-progress";

/**
 * useSyncExternalStore requires getSnapshot to return a referentially stable
 * value when store data has not changed. Without this cache, load/empty
 * helpers allocate a new object every call and React enters an infinite
 * update loop (minified error #185).
 */
const snapshotCache = new Map<string, QuizProgressState>();

export function getQuizProgressKey(setId: QuizSetId, mode: QuizMode): string {
  return `study-web:quiz-progress:v${QUIZ_PROGRESS_VERSION}:${setId}:${mode}`;
}

function matchesIdentity(
  state: QuizProgressState,
  identity: QuizProgressIdentity
): boolean {
  return (
    state.setId === identity.setId &&
    state.mode === identity.mode &&
    state.schemaVersion === identity.schemaVersion &&
    state.totalQuestions === identity.totalQuestions
  );
}

export function createEmptyQuizProgress(
  identity: QuizProgressIdentity
): QuizProgressState {
  return {
    version: QUIZ_PROGRESS_VERSION,
    setId: identity.setId,
    mode: identity.mode,
    schemaVersion: identity.schemaVersion,
    totalQuestions: identity.totalQuestions,
    currentIndex: 0,
    selections: {},
    textFieldAnswers: {},
    matchAnswers: {},
    checked: {},
    testSubmitted: false,
    showResults: false,
    updatedAt: Date.now(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  if (!isRecord(value)) return false;
  return Object.values(value).every(
    (entry) =>
      Array.isArray(entry) && entry.every((item) => typeof item === "string")
  );
}

function isStringRecordRecord(
  value: unknown
): value is Record<string, Record<string, string>> {
  if (!isRecord(value)) return false;
  return Object.values(value).every((entry) => {
    if (!isRecord(entry)) return false;
    return Object.values(entry).every((item) => typeof item === "string");
  });
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  if (!isRecord(value)) return false;
  return Object.values(value).every((entry) => typeof entry === "boolean");
}

export function isValidQuizProgress(
  value: unknown,
  expected: QuizProgressIdentity
): value is QuizProgressState {
  if (!isRecord(value)) return false;

  return (
    value.version === QUIZ_PROGRESS_VERSION &&
    value.setId === expected.setId &&
    value.mode === expected.mode &&
    value.schemaVersion === expected.schemaVersion &&
    value.totalQuestions === expected.totalQuestions &&
    typeof value.currentIndex === "number" &&
    Number.isInteger(value.currentIndex) &&
    value.currentIndex >= 0 &&
    value.currentIndex < Math.max(expected.totalQuestions, 1) &&
    isStringArrayRecord(value.selections) &&
    isStringRecordRecord(value.textFieldAnswers) &&
    isStringRecordRecord(value.matchAnswers) &&
    isBooleanRecord(value.checked) &&
    typeof value.testSubmitted === "boolean" &&
    typeof value.showResults === "boolean" &&
    typeof value.updatedAt === "number"
  );
}

export function loadQuizProgress(
  expected: QuizProgressIdentity
): QuizProgressState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(
      getQuizProgressKey(expected.setId, expected.mode)
    );
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidQuizProgress(parsed, expected)) {
      window.localStorage.removeItem(
        getQuizProgressKey(expected.setId, expected.mode)
      );
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveQuizProgress(state: QuizProgressState): void {
  const key = getQuizProgressKey(state.setId, state.mode);
  snapshotCache.set(key, state);

  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(PROGRESS_EVENT, {
        detail: key,
      })
    );
  } catch {
    // Ignore quota / private-mode failures; quiz still works in-session.
  }
}

export function clearQuizProgress(setId: QuizSetId, mode: QuizMode): void {
  const key = getQuizProgressKey(setId, mode);
  snapshotCache.delete(key);

  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: key }));
  } catch {
    // Ignore storage failures.
  }
}

export function subscribeToQuizProgress(
  setId: QuizSetId,
  mode: QuizMode
): (onStoreChange: () => void) => () => void {
  const key = getQuizProgressKey(setId, mode);

  return (onStoreChange) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      // Another tab changed storage — drop cache so the next snapshot reloads.
      snapshotCache.delete(key);
      onStoreChange();
    };
    const onCustom = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (custom.detail === key) onStoreChange();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(PROGRESS_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PROGRESS_EVENT, onCustom);
    };
  };
}

export function getQuizProgressSnapshot(
  identity: QuizProgressIdentity
): QuizProgressState {
  const key = getQuizProgressKey(identity.setId, identity.mode);
  const cached = snapshotCache.get(key);
  if (cached && matchesIdentity(cached, identity)) {
    return cached;
  }

  const loaded = loadQuizProgress(identity);
  if (loaded) {
    snapshotCache.set(key, loaded);
    return loaded;
  }

  const empty = createEmptyQuizProgress(identity);
  snapshotCache.set(key, empty);
  return empty;
}
