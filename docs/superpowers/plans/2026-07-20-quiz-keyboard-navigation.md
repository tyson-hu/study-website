# Quiz Keyboard Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add context-aware keyboard navigation and answering on practice and test quiz pages, with quiet shadcn `Kbd` hints on existing controls.

**Architecture:** Pure key helpers live in `src/lib/quiz-keyboard.ts`. A single `useQuizKeyboard` hook attaches a capture-phase `keydown` listener and routes by question type, focus, lock, and mode. Match pending-left state is lifted so the hook and `MatchQuestion` share one selection. Footer/option chrome gets muted `Kbd` chips without new layout sections.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/Base UI (`Kbd`), existing quiz progress APIs in `QuizApp`

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-quiz-keyboard-navigation-design.md`
- Letter **and** number keys map by **display index** (`A`/`1` = first visible option)
- Smart `Enter`: practice Check → Next/Finish; test Next → Submit on last when ≥1 answered
- Text fields: while focused, `←`/`→` move caret (do not change question); `Enter` still Check/Next; `Esc` blurs
- Match: first key = left, second key = right; `Esc` clears pending; second key never switches left
- Match **right** indices follow **shuffled** display order (same order rendered today)
- Quiet `Kbd` only — no shortcuts banner/strip/modal
- Enter label: `Enter` when space allows; `⏎` on compact/small buttons
- Do not change scoring, persistence schema, or question JSON
- Prefer `gap-*` over `space-y-*`; semantic tokens for muted chrome
- No new test runner; verify with `npx tsc --noEmit`, `npm run lint`, and manual keyboard checks in the browser

---

## File map

| File | Responsibility |
|------|----------------|
| `src/components/ui/kbd.tsx` | shadcn `Kbd` (installed) |
| `src/lib/quiz-keyboard.ts` | Pure helpers: option index from key, typing-target detection, modifier ignore |
| `src/hooks/use-quiz-keyboard.ts` | Capture-phase keydown router for quiz actions |
| `src/components/quiz/match-question.tsx` | Controlled pending left; index badges; keyboard-friendly prompt |
| `src/components/quiz/quiz-app.tsx` | Wire hook; lift match pending; `Kbd` on footer actions; optional number hints on choice rows |

---

### Task 1: Install shadcn `Kbd`

**Files:**
- Create: `src/components/ui/kbd.tsx` (via CLI)
- Possibly touch: `src/app/globals.css` (CLI may add tokens)

**Interfaces:**
- Consumes: project `components.json` (`base-nova`)
- Produces: `Kbd` (and related exports if CLI adds `KbdGroup`) from `@/components/ui/kbd`

- [ ] **Step 1: Add the component**

Run:

```bash
npx shadcn@latest add kbd
```

Expected: creates `src/components/ui/kbd.tsx` without interactive prompts failing.

- [ ] **Step 2: Confirm export**

Run:

```bash
rg -n "export.*Kbd" src/components/ui/kbd.tsx
```

Expected: at least one `Kbd` export.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/kbd.tsx src/app/globals.css components.json
git commit -m "Add shadcn Kbd component for quiz shortcut hints."
```

Only stage files the CLI actually changed.

---

### Task 2: Pure keyboard helpers

**Files:**
- Create: `src/lib/quiz-keyboard.ts`

**Interfaces:**
- Consumes: none (DOM types only)
- Produces:
  - `parseOptionIndex(key: string): number | null` — `a`/`A`/`1` → `0`, … `h`/`H`/`8` → `7`; else `null`
  - `isTypingTarget(target: EventTarget | null): boolean` — `input`, `textarea`, `select`, or `contentEditable`
  - `hasShortcutModifier(event: Pick<KeyboardEvent, "metaKey" | "ctrlKey" | "altKey">): boolean`

- [ ] **Step 1: Implement helpers**

Create `src/lib/quiz-keyboard.ts`:

```ts
const LETTER_OFFSET = "a".charCodeAt(0);

/** Map A–H / 1–8 to 0-based option index. Returns null if not an option key. */
export function parseOptionIndex(key: string): number | null {
  if (key.length === 1) {
    const lower = key.toLowerCase();
    if (lower >= "a" && lower <= "h") {
      return lower.charCodeAt(0) - LETTER_OFFSET;
    }
    if (key >= "1" && key <= "8") {
      return Number(key) - 1;
    }
  }
  return null;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function hasShortcutModifier(
  event: Pick<KeyboardEvent, "metaKey" | "ctrlKey" | "altKey">
): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}
```

- [ ] **Step 2: Sanity-check with node**

Run:

```bash
npx --yes tsx -e "
import { parseOptionIndex, isTypingTarget, hasShortcutModifier } from './src/lib/quiz-keyboard.ts';
const cases: [string, number | null][] = [
  ['a', 0], ['A', 0], ['1', 0], ['d', 3], ['4', 3], ['h', 7], ['8', 7], ['i', null], ['0', null], ['Enter', null],
];
for (const [key, expected] of cases) {
  const got = parseOptionIndex(key);
  if (got !== expected) throw new Error(\`parseOptionIndex(\${JSON.stringify(key)}) => \${got}, expected \${expected}\`);
}
if (hasShortcutModifier({ metaKey: true, ctrlKey: false, altKey: false }) !== true) throw new Error('modifier');
if (isTypingTarget(null) !== false) throw new Error('null target');
console.log('ok');
"
```

Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/quiz-keyboard.ts
git commit -m "Add quiz keyboard key-parsing helpers."
```

---

### Task 3: `useQuizKeyboard` hook (nav + Enter + choice keys)

**Files:**
- Create: `src/hooks/use-quiz-keyboard.ts`
- Modify: `src/components/quiz/quiz-app.tsx` (wire hook; choice + nav + Enter only in this task)

**Interfaces:**
- Consumes: `parseOptionIndex`, `isTypingTarget`, `hasShortcutModifier` from `@/lib/quiz-keyboard`; quiz callbacks already in `QuizAppView`
- Produces: `useQuizKeyboard(options: UseQuizKeyboardOptions): void`

```ts
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
  /** Display-ordered option ids for choice questions (question.options map to id). */
  choiceOptionIds: string[];
  onToggleChoice: (optionId: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmitTest: () => void;
  /** Match — wired in Task 4; optional no-ops until then */
  matchLeftIds?: string[];
  matchRightIds?: string[];
  pendingMatchLeftId?: string | null;
  onSetPendingMatchLeft?: (leftId: string | null) => void;
  onPairMatch?: (leftId: string, rightId: string) => void;
};
```

- [ ] **Step 1: Implement the hook**

Create `src/hooks/use-quiz-keyboard.ts` with a `useEffect` that listens on `window` in the **capture** phase so global `Enter` wins over focused option/match rows:

```ts
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
  useEffect(() => {
    if (!options.enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (options.showResults) return;
      if (hasShortcutModifier(event)) return;

      const typing = isTypingTarget(event.target);
      const key = event.key;

      if (key === "Escape") {
        if (typing && event.target instanceof HTMLElement) {
          event.preventDefault();
          event.target.blur();
          return;
        }
        if (options.pendingMatchLeftId && options.onSetPendingMatchLeft) {
          event.preventDefault();
          options.onSetPendingMatchLeft(null);
        }
        return;
      }

      if (key === "Enter") {
        // Always allow Enter for Check/Next even while typing in text fields.
        event.preventDefault();
        event.stopPropagation();

        if (options.quizMode === "practice") {
          if (!options.isCurrentChecked) {
            if (options.isCurrentAnswered) options.onCheck();
            return;
          }
          options.onNext();
          return;
        }

        // test mode
        if (!options.isLastQuestion) {
          options.onNext();
          return;
        }
        if (options.answeredCount >= 1) options.onSubmitTest();
        return;
      }

      if (key === "ArrowLeft" || key === "ArrowRight") {
        if (typing) return; // caret movement
        event.preventDefault();
        if (key === "ArrowLeft") options.onPrev();
        else options.onNext();
        return;
      }

      if (typing) return;
      if (options.optionsLocked) return;

      const index = parseOptionIndex(key);
      if (index === null) return;

      if (
        options.questionType === "single_choice" ||
        options.questionType === "multiple_choice"
      ) {
        const optionId = options.choiceOptionIds[index];
        if (!optionId) return;
        event.preventDefault();
        options.onToggleChoice(optionId);
        return;
      }

      // Match handled in Task 4 — keep branch ready:
      if (options.questionType === "match") {
        const leftIds = options.matchLeftIds ?? [];
        const rightIds = options.matchRightIds ?? [];
        const pending = options.pendingMatchLeftId ?? null;

        if (!pending) {
          const leftId = leftIds[index];
          if (!leftId || !options.onSetPendingMatchLeft) return;
          event.preventDefault();
          options.onSetPendingMatchLeft(leftId);
          return;
        }

        const rightId = rightIds[index];
        if (!rightId || !options.onPairMatch) return;
        event.preventDefault();
        options.onPairMatch(pending, rightId);
        options.onSetPendingMatchLeft?.(null);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }); // depend on a stable serialized options object or list primitive deps explicitly
}
```

**Dependency note:** Do not omit the dependency array. Pass an explicit dependency list of the primitive fields and stable `useCallback` handlers from `QuizAppView`. Prefer listing every field from `options` used inside the effect rather than `options` as a whole if the parent recreates the object each render — or memoize the options object in the parent.

- [ ] **Step 2: Wire into `QuizAppView` (choice + nav + Enter)**

Near other hooks in `QuizAppView` (`src/components/quiz/quiz-app.tsx`):

```ts
const choiceOptionIds = currentQuestion?.options.map((o) => o.id) ?? [];

const isCurrentAnswered = currentQuestion
  ? isQuestionAnswered(
      currentQuestion,
      currentSelection,
      currentTextFieldAnswers,
      currentMatchAnswer
    )
  : false;

useQuizKeyboard({
  enabled: Boolean(currentQuestion) && !showResults,
  quizMode,
  optionsLocked,
  isCurrentChecked,
  isCurrentAnswered,
  isLastQuestion: currentIndex === totalQuestions - 1,
  answeredCount,
  showResults,
  questionType: currentQuestion?.type,
  choiceOptionIds,
  onToggleChoice: (optionId) => {
    if (!currentQuestion) return;
    toggleOption(currentQuestion, optionId);
  },
  onCheck: checkCurrent,
  onNext: goNext,
  onPrev: goPrev,
  onSubmitTest: submitTest,
});
```

Import `useQuizKeyboard` from `@/hooks/use-quiz-keyboard`.

Ensure `toggleOption` for **single_choice** still replaces (existing behavior) and for **multiple_choice** toggles — letter keys call the same function.

- [ ] **Step 3: Typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Manual smoke (choice)**

Run `npm run dev`, open `/quiz/essentials/practice`, and verify:

1. `1` / `A` selects first option  
2. `Enter` checks (when answered)  
3. `Enter` or `→` goes next after check  
4. `←` goes previous  
5. In a text_input question, arrows move caret while focused  

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-quiz-keyboard.ts src/components/quiz/quiz-app.tsx
git commit -m "Add quiz keyboard hook for nav, Enter, and choice keys."
```

---

### Task 4: Match two-phase keyboard + controlled pending

**Files:**
- Modify: `src/components/quiz/match-question.tsx`
- Modify: `src/components/quiz/quiz-app.tsx`
- Modify: `src/hooks/use-quiz-keyboard.ts` only if wiring gaps remain

**Interfaces:**
- Consumes: hook match fields from Task 3
- Produces: controlled pending API on `MatchQuestion`; display-ordered `matchRightIds` for the hook

- [ ] **Step 1: Support controlled pending + expose shuffled right order**

Update `MatchQuestion` props:

```ts
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
```

Replace internal `selectedLeftId` / `setSelectedLeftId` with `pendingLeftId` / `onPendingLeftIdChange`.

Keep mouse behavior:

- Left click → `onPendingLeftIdChange(current === leftId ? null : leftId)` (toggle still OK for mouse)
- Right click → pair via `onChange`, then `onPendingLeftIdChange(null)`
- Keyboard rule remains: second key always pairs right; use `Esc` to clear (hook)

After computing `shuffledRight`, sync order to parent:

```ts
useEffect(() => {
  onRightOrderChange?.(shuffledRight.map((pair) => pair.id));
}, [shuffledRight, onRightOrderChange]);
```

Add index badges on left (`pairs` order) and right (`shuffledRight` order), e.g. muted mono `A` / optional small number — reuse existing visual language; do not add a new instruction card. Tweak the helper prompt to one line:

```tsx
<p className="text-sm text-muted-foreground">
  Select a left item, then its match on the right. Keys: left, then right.
</p>
```

- [ ] **Step 2: Lift state in `QuizAppView`**

```ts
const [pendingMatchLeftId, setPendingMatchLeftId] = useState<string | null>(null);
const [matchRightIds, setMatchRightIds] = useState<string[]>([]);

// Clear pending when question changes
useEffect(() => {
  setPendingMatchLeftId(null);
  setMatchRightIds([]);
}, [currentQuestion?.id]);
```

Pass into `MatchQuestion` and extend `useQuizKeyboard(...)`:

```ts
matchLeftIds: currentQuestion?.matchPairs?.map((p) => p.id) ?? [],
matchRightIds,
pendingMatchLeftId,
onSetPendingMatchLeft: setPendingMatchLeftId,
onPairMatch: (leftId, rightId) => {
  if (!currentQuestion) return;
  // Mirror MatchQuestion right-click: clear other lefts using same rightId
  const current = currentMatchAnswer;
  for (const [otherLeft, matchedRight] of Object.entries(current)) {
    if (matchedRight === rightId && otherLeft !== leftId) {
      setMatchAnswer(currentQuestion.id, otherLeft, null);
    }
  }
  setMatchAnswer(currentQuestion.id, leftId, rightId);
},
```

Extract the “clear conflicting right” logic into a small local helper if it duplicates `handleRightClick` — keep behavior identical to mouse pairing.

- [ ] **Step 3: Manual smoke (match)**

On a match question in practice:

1. Press `1` → left item highlights  
2. Press `2` → pairs with 2nd **visible** right description  
3. `Esc` before second key clears highlight  
4. Complete all pairs → `Enter` checks  

- [ ] **Step 4: Commit**

```bash
git add src/components/quiz/match-question.tsx src/components/quiz/quiz-app.tsx src/hooks/use-quiz-keyboard.ts
git commit -m "Wire match questions into quiz keyboard two-phase selection."
```

---

### Task 5: Quiet `Kbd` guidance on existing controls

**Files:**
- Modify: `src/components/quiz/quiz-app.tsx` (footer buttons + optional choice number hint)
- Modify: `src/components/quiz/match-question.tsx` if badges not finished in Task 4

**Interfaces:**
- Consumes: `Kbd` from `@/components/ui/kbd`
- Produces: muted shortcut chips on Previous / Next / Check / Submit; choice rows keep letter badge (optional number `Kbd` when unlocked)

- [ ] **Step 1: Annotate footer actions**

In the `CardFooter` button group, append muted `Kbd` chips without changing button layout structure. Example pattern:

```tsx
import { Kbd } from "@/components/ui/kbd";

<Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
  <ArrowLeft data-icon="inline-start" />
  Previous
  <Kbd className="ml-1 text-muted-foreground">←</Kbd>
</Button>

<Button variant="outline" onClick={goNext} /* existing disabled */>
  {isPractice && currentIndex === totalQuestions - 1 ? "Finish" : "Next"}
  <ArrowRight data-icon="inline-end" />
  <Kbd className="text-muted-foreground">→</Kbd>
</Button>

{isPractice && !isCurrentChecked && (
  <Button onClick={checkCurrent}>
    Check answer
    <Kbd className="ml-1 hidden sm:inline-flex">Enter</Kbd>
    <Kbd className="ml-1 inline-flex sm:hidden">⏎</Kbd>
  </Button>
)}

{!isPractice && !testSubmitted && (
  <Button onClick={submitTest} disabled={answeredCount === 0}>
    Submit test
    <Kbd className="ml-1 hidden sm:inline-flex">Enter</Kbd>
    <Kbd className="ml-1 inline-flex sm:hidden">⏎</Kbd>
  </Button>
)}
```

Adjust classes to match installed `Kbd` API (if `Kbd` already includes muted styles, avoid fighting them — only add spacing/`hidden sm:inline-flex` as needed). Do **not** introduce a new footer row or help card.

- [ ] **Step 2: Choice row number hint (optional, unlocked only)**

Where `OptionRow` shows the letter badge, when `!optionsLocked`, render a small muted number twin for index+1 (cap display at existing option count). If it crowds the row on mobile, hide the number below `sm` and keep the letter badge only.

- [ ] **Step 3: Visual check**

Confirm on desktop + narrow viewport:

- Question card / footer alignment unchanged (no new section)  
- `Enter` vs `⏎` swaps at the `sm` breakpoint  
- Locked/checked questions do not show select-number hints  

- [ ] **Step 4: Commit**

```bash
git add src/components/quiz/quiz-app.tsx src/components/quiz/match-question.tsx
git commit -m "Add quiet Kbd shortcut hints to quiz actions."
```

---

### Task 6: End-to-end verification (practice + test)

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: full feature from Tasks 1–5
- Produces: confirmation against spec success criteria

- [ ] **Step 1: Lint + typecheck**

```bash
npx tsc --noEmit
npm run lint
```

Expected: both succeed (or only pre-existing unrelated warnings).

- [ ] **Step 2: Practice checklist**

| # | Action | Expected |
|---|--------|----------|
| 1 | Single choice: `A`/`1` → `Enter` → `Enter`/`→` | Select, check, next |
| 2 | Multiple choice: toggle several letters → `Enter` | Multi select + check |
| 3 | Match: left key then right key → `Enter` | Pair + check |
| 4 | Text: type in field; press `←` | Caret moves, question stays |
| 5 | Text: `Enter` then blur/`Esc`; `→` | Check then navigate |
| 6 | Results dialog open | Shortcuts do not change questions |
| 7 | Cmd/Ctrl + key | Ignored |

- [ ] **Step 3: Test mode checklist**

Open `/quiz/essentials/test`:

| # | Action | Expected |
|---|--------|----------|
| 1 | Answer + `Enter` | Next (no check toast) |
| 2 | Last question + ≥1 answered + `Enter` | Submit test / results |
| 3 | Last question + 0 answered + `Enter` | No-op |

- [ ] **Step 4: Final commit if verification fixed anything**

Only if Step 2–3 required code fixes; otherwise no empty commit.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Single `useQuizKeyboard` controller | 3 |
| `←`/`→` navigate; disabled while typing | 3 |
| Smart `Enter` practice + test | 3 |
| Letter + number option index | 2, 3 |
| Guards: dialog, modifiers, locked, typing | 3 |
| Match two-phase + Esc clear pending | 4 |
| Text focus-aware arrows / Enter / Esc blur | 3 |
| Quiet `Kbd` on existing controls | 5 |
| `Enter` vs `⏎` by space | 5 |
| No scoring/persistence/schema changes | all |
| Success criteria manual proof | 6 |
