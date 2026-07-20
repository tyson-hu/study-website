# Quiz keyboard navigation

**Date:** 2026-07-20  
**Status:** Approved for planning  
**Approach:** One context-aware keyboard controller on the quiz shell (Approach 1)

## Goal

Add keyboard navigation and answering to practice and test modes so users can move between questions and submit answers without the mouse — including single choice, multiple choice, match, and text input — without breaking typing or cluttering the quiz visuals.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Architecture | Single `useQuizKeyboard` hook on quiz shell; routes by type / focus / lock / mode |
| Choice select | Letter keys **and** number keys by option index (`A`/`1`, `B`/`2`, … up to option count, max 8) |
| Check / Next | Smart `Enter`: Check when unchecked; Next (or Finish) after checked |
| Match | Two-phase with same letter/number keys: left then right |
| Text input | Focus-aware: while focused, arrows move caret; `Enter` still Check/Next |
| Scope | Practice **and** test modes |
| Guidance UI | Quiet shadcn `Kbd` chips on existing controls — no new banner/strip |

## Global key map

| Key | Behavior |
|-----|----------|
| `←` / `→` | Previous / Next question. **Disabled while a text field is focused** (caret moves instead). |
| `Enter` | **Practice:** if current question not checked → Check only when answered (else no-op); if checked → Next, or Finish on last. **Test:** Next; on last question with ≥1 answered → Submit test; on last with nothing answered → no-op. |
| `A`–`H` / `1`–`8` | Map to option **index** (1st option = A/1). Case-insensitive. Ignore if index ≥ option count. |
| `Esc` | Clear pending match left selection; if a text field is focused, blur it so arrows navigate again. |

### Guards (always ignore select/nav shortcuts when)

- Results dialog is open
- `metaKey` / `ctrlKey` / `altKey` held
- Options locked (practice checked, or test submitted) — for select/toggle/match keys only
- Focus in `<input>`, `<textarea>`, or `contenteditable` — **except** allow `Enter` (Check/Next) and `Esc` (blur)

## Answering by question type

### Single choice

- Letter/number selects that option (replaces previous selection).
- After Check, select keys no-op until navigation.

### Multiple choice

- Letter/number **toggles** that option on/off.
- `Enter` checks when `isQuestionAnswered` is true (≥1 selected), same as today.

### Match (two-phase)

1. **No pending left:** letter/number selects a left item by index and sets it as pending (highlight). Index past left count → no-op.
2. **Pending left set:** letter/number selects a right item by index and pairs it (`matchAnswers[qId][leftId] = rightId`), then clears pending. Index past right count → no-op.
3. **Change pending left:** `Esc` clears pending; then press a new left key. (Second key while pending always means “pick right,” never “switch left.”)
4. **Re-pair:** with no pending, select an already-paired left again, then a new right (replaces the pair).
5. `Esc` with no pending → no-op (unless a text field is focused — then blur).
6. After Check, locked like today.

Pending left is **local UI state** (not persisted in quiz progress).

### Text input

- No letter/number option shortcuts.
- While a field is focused: normal typing; `Enter` = Check/Next; `←`/`→` move caret.
- After blur (click away or `Esc`): `←`/`→` navigate questions.
- Auto-focus first field on question appear is optional polish; not required for v1.

## Test mode specifics

- No per-question Check; `Enter` never calls `checkCurrent`.
- `Enter` on non-last → `goNext`.
- `Enter` on last + `answeredCount ≥ 1` → `submitTest`.
- `Enter` on last + nothing answered → no-op (same as disabled Submit).
- Last-question Next button stays disabled until submit (existing behavior); keyboard follows the same rule via Submit on last.

## Architecture

### New pieces

| Piece | Role |
|-------|------|
| `useQuizKeyboard` | `window`/`document` `keydown` listener; context routing; preventDefault when handling |
| Match pending state | In match UI or quiz view: `pendingLeftId: string \| null` |
| shadcn `Kbd` | Add via CLI; use for quiet hints on existing buttons/badges |

### Hook inputs (conceptual)

Current question, quiz mode, locked/checked flags, answer mutators (`toggleOption`, `setMatchAnswer`, …), navigation (`goPrev`, `goNext`, `checkCurrent`, `submitTest`), answered/checked predicates, results-dialog open, pending left setter.

### Integration points

- Primary: `QuizApp` / `QuizAppView` in `src/components/quiz/quiz-app.tsx`
- Match UI: `src/components/quiz/match-question.tsx` (pending highlight + badges)
- Text UI: no shortcut ownership beyond focus detection
- Types unchanged in `src/types/question.ts`

## Keyboard guidance UI (quiet)

**Principle:** Annotate existing controls. Do not add a shortcuts banner, card, or sticky bar that competes with the question.

| Control | Annotation |
|---------|------------|
| Previous button | `<Kbd>←</Kbd>` |
| Next / Finish button | `<Kbd>→</Kbd>` |
| Check answer button | `<Kbd>Enter</Kbd>` when space allows; `<Kbd>⏎</Kbd>` on small/compact buttons |
| Submit test button | same as Check (`Enter` or `⏎` by available space) |
| Choice option rows | Existing letter badge is the primary hint; optional muted number `<Kbd>` beside it if space allows |
| Match columns | Letter/number badges on left and right items; keep single prompt line (may tweak copy to “key left, then right” without a second instruction block) |
| Text | No letter/number `Kbd`s; Check still shows Enter |

### Visual rules

- `Kbd` uses muted/secondary styling (chrome, not content)
- Hide select-related hints when options are locked
- Narrow screens: keep `Kbd` on footer actions; drop optional number twins if cramped
- **Enter label:** prefer the word `Enter` when the control has room; use `⏎` when the full word would crowd a small button (e.g. icon-sized or dense footer on mobile). Same key either way.
- No first-run modal, coach marks, or separate shortcuts page (out of scope)

## Out of scope

- Jump-to-question grid via keyboard
- Customizable keybindings
- Screen-reader command palette
- Changing scoring, persistence, or question data schema

## Success criteria

1. Practice: complete a single-choice and multiple-choice question with only keyboard (select → Enter check → Enter/→ next).
2. Practice: complete a match question with letter/number two-phase pairing + Enter check.
3. Practice: type a text answer; Enter checks; arrows do not change question while focused; after blur, arrows navigate.
4. Test: Enter advances; Enter on last submits when ≥1 answered.
5. Guidance `Kbd`s visible on actions without adding a new layout section or breaking card/footer alignment.
6. Shortcuts do not fire inside results dialog or with modifier keys.
