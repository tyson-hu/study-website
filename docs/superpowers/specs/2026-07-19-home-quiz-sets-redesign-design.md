# Home screen, quiz set routing & DESIGN.md redesign

**Date:** 2026-07-19  
**Status:** Approved for planning  
**Approach:** Route-driven pages (Approach 1)

## Goal

Turn Study Web into a clear study hub: pick a question set and mode from a redesigned home page, open Notion notes from dedicated heroes, and run quizzes on shareable deep routes — all restyled to the Vercel-inspired system in `DESIGN.md`.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Home layout | Stacked: brand hero → quiz-set cards → Notion note heroes |
| Quiz entry | Each set card exposes Practice + Test pill CTAs |
| Routing | `/quiz/{set}/{mode}` deep routes |
| Theme | Keep light + dark; restyle both to DESIGN.md tokens |
| Essentials data | Physically merge `network-essentials.json` + `questions.json` into `network-essentials.json`; delete `questions.json` |

## Information architecture & routes

### Home (`/`)

Single stacked page:

1. **Brand hero** — product name as hero-level signal, short lead, mesh-gradient atmospheric backdrop (DESIGN.md `hero-band`).
2. **Quiz sets** — two interactive cards:
   - Networking Essentials → Practice / Test CTAs
   - Network Fundamentals → Practice / Test CTAs
3. **Notes heroes** — two full-width bands linking to Notion (new tab):
   - Essentials: `https://app.notion.com/p/Networking-Essentials-3755f826b2fc80e1bf6fcc7ce710233f?source=copy_link`
   - Fundamentals: `https://app.notion.com/p/Network-Fundamental-3955f826b2fc80538519d4592037c110?source=copy_link`

### Quiz routes

| Path | Set | Mode |
|------|-----|------|
| `/quiz/essentials/practice` | Merged Essentials | Practice |
| `/quiz/essentials/test` | Merged Essentials | Test |
| `/quiz/fundamentals/practice` | Fundamentals | Practice |
| `/quiz/fundamentals/test` | Fundamentals | Test |

- Invalid `set` or `mode` → `notFound()`.
- Quiz chrome includes back-to-home control.
- After results: back home or restart same route.

## Data & question sets

### Merge Essentials

Combine current sources into one `QuestionSet` file at `src/data/network-essentials.json`:

- Source A: `network-essentials.json` (raw `Question[]`, ~48 items)
- Source B: `questions.json` (`QuestionSet.questions`, ~157 items)

Output shape:

```json
{
  "title": "Networking Essentials",
  "source": "Network Essentials Practice Exam + Question Set",
  "totalQuestions": 205,
  "schemaVersion": "1.1",
  "questions": []
}
```

(`totalQuestions` must equal `questions.length` after merge — currently ~48 + ~157 ≈ 205.)

Merge rules (preserve existing quiz behavior):

1. Essentials block first: prefix IDs with `ne-`, renumber from 1.
2. Preserve text-input conversion for original Essentials items with `number <= 9` (same logic as today’s `mergeQuestionSets` / `convertToTextInput`).
3. Append former `questions.json` items next with `orig-` ID prefix; renumber continuously; ensure unique IDs across the file.
4. Delete `src/data/questions.json` after merge; update all imports.

### Fundamentals

Keep `src/data/network-fundamentals.json` as a standalone `QuestionSet`. Prefix IDs at load time if needed for consistency (`nf-…`), but do not merge with Essentials.

### Catalog

Replace the single exported `questionSet` with a catalog in `src/lib/question-sets.ts`, e.g.:

```ts
type QuizSetId = "essentials" | "fundamentals";
type QuizMode = "practice" | "test";

interface QuizSetMeta {
  id: QuizSetId;
  title: string;
  description: string;
  questionSet: QuestionSet;
  notesUrl: string;
  notesLabel: string;
}
```

Home and quiz route pages both consume this catalog (titles, counts, Notion URLs, questions).

## Visual redesign (`DESIGN.md`)

### Tokens

Restyle `src/app/globals.css` (and related theme plumbing) to DESIGN.md:

- **Light:** canvas `#ffffff` / `#fafafa`, ink `#171717`, body `#4d4d4d`, mute `#888888`, hairline `#ebebeb`, link `#0070f3`
- **Dark:** polarity-flipped surfaces (ink backgrounds, light text, muted hairlines) — same structure, not a purple/glow theme
- **Brand gradient:** develop → preview → ship mesh at **hero scale only**
- **Typography:** Geist + Geist Mono (Inter + JetBrains Mono fallbacks); display weight max 600; aggressive negative tracking on display sizes; sentence-case headlines
- **Elevation:** stacked soft shadows + inset hairline (Levels 1–4); no single heavy drop-shadow
- **CTAs:** marketing pills (`rounded.pill` ~100px); tighter radius for in-quiz chrome where appropriate

### Home composition

- Hero: mono eyebrow + display headline + one lead sentence + optional secondary CTA scroll/jump (no clutter: no stats strips, no card grid in hero)
- Quiz cards: white/canvas cards with Level 2–3 elevation; mono caption for question count; Practice (primary pill) + Test (secondary pill)
- Notes: two bands — one light `showcase-band-light`, one polarity-flipped `showcase-band-dark` — each with title, short line, “Open notes →” external link

### Quiz surfaces

- Same token system; no mesh gradient on quiz routes
- Keep practice/test behavior, progress, feedback, results
- Theme toggle remains on home and quiz

## Components & flow

### Components

| Piece | Responsibility |
|-------|----------------|
| Home page (`/`) | Brand hero, quiz-set cards, notes heroes |
| `app/quiz/[set]/[mode]/page.tsx` | Resolve catalog entry + mode; render quiz |
| `QuizApp` | Quiz-only client UI; props: `questionSet`, `mode` |
| Shared header | Brand link home + theme toggle |

### Happy path

1. User lands on `/`
2. Clicks Practice or Test on a set card
3. Navigates to `/quiz/{set}/{mode}`
4. Completes quiz (practice: per-question check; test: submit-all)
5. Returns home or restarts same route

### Edge cases

- Unknown set/mode → not found
- Empty/malformed question set → calm empty state + link home
- Notion links → `target="_blank"` + `rel="noopener noreferrer"`

## Out of scope

- Auth, saved progress, score history
- In-app question editing
- Changing practice/test scoring rules beyond set scoping
- Separate notes pages (links open Notion only)

## Success criteria

1. Home clearly offers Essentials vs Fundamentals quizzes and both Notion notes.
2. Deep links for each set × mode work and are shareable.
3. Essentials quiz uses the single merged JSON; `questions.json` is gone.
4. Visual language matches DESIGN.md in light and dark (ink CTAs, hairlines, mesh hero, pill marketing buttons).
5. Existing quiz interaction model (practice vs test) still works per set.
