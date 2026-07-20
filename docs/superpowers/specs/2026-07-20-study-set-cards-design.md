# Study set cards, brand rename & practice page polish

**Date:** 2026-07-20  
**Status:** Approved for planning  
**Approach:** Replace home quiz + notes sections with two media cards (Approach A)

## Goal

Unify question sets and notes into two home cards (Essentials / Fundamentals) with Magic UI media, rename the product to **Tyson's notes**, and fix practice-page visuals (problem card contrast + Light Rays background).

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Home layout | HeroBand kept; replace `QuizSetCards` + `NotesHeroes` with one `StudySetCards` section |
| Card actions | **Practice** + **Notes** only (drop Test from home CTAs; test routes remain available) |
| Card media | Magic UI Glyph Matrix background + Kinetic Text overlay (“Essentials” / “Fundamentals”) |
| Notes | Existing Notion URLs, open in new tab |
| Brand | “Tyson's notes” everywhere: header, hero `h1`, document `<title>` |
| Practice background | Magic UI Light Rays behind quiz UI (practice mode only) |
| Problem card contrast | Question header uses card surface (`bg-card`), not `--canvas-soft` |

## Home (`/`)

Page stack:

1. `SiteHeader` — brand link text **Tyson's notes**
2. `HeroBand` — `h1` **Tyson's notes.** (lead copy can stay study-focused)
3. **`StudySetCards`** — two-column grid of study-set cards
4. Remove `QuizSetCards` and `NotesHeroes` (delete those component files)

### Study set card anatomy

Matches the reference vertical hierarchy:

| Zone | Content |
|------|---------|
| Media | Rounded media panel: Glyph Matrix fill; Kinetic Text centered (“Essentials” or “Fundamentals”) |
| Title | Catalog title (`Networking Essentials` / `Network Fundamentals`) |
| Body | Catalog description from `listQuizSets()` |
| Actions | Primary **Practice** → `/quiz/{id}/practice`; secondary **Notes** → `notesUrl` (`target="_blank"`, `rel="noopener noreferrer"`) |

Data source remains `listQuizSets()` in `src/lib/question-sets.ts`. No catalog schema changes required.

### Magic UI installs (home)

- `glyph-matrix` — `npx shadcn@latest add "https://magicui.design/r/glyph-matrix.json"`
- `kinetic-text` — `npx shadcn@latest add "https://magicui.design/r/kinetic-text.json"`

Media blocks are client components (Glyph Matrix uses theme/animation; Kinetic Text is interactive). Prefer a small client media subcomponent so the home page / section can stay a server component where possible.

## Branding

| Location | Before | After |
|----------|--------|-------|
| `site-header.tsx` | Study Web | Tyson's notes |
| `hero-band.tsx` `h1` | Study Web. | Tyson's notes. |
| `layout.tsx` metadata `title` | Study Web — IT Networking Quiz | Tyson's notes — IT Networking Quiz |

No other product-name strings need changing for this scope.

## Practice page (`/quiz/{set}/practice`)

### Problem section blending

**Cause:** Question header strip uses `bg-[var(--canvas-soft)]`, same as the page shell, so the top of the quiz card merges into the background.

**Fix:** Use `bg-card` (or omit the soft fill) on that header so the entire problem card reads as one bordered/elevated panel.

Applies to the shared quiz card chrome in `quiz-app.tsx` (same component for practice and test — contrast fix benefits both).

### Light Rays background

- Install Magic UI `light-rays` — `npx shadcn@latest add "https://magicui.design/r/light-rays.json"`
- Practice mode only: wrap/page shell uses a relative container with `LightRays` behind content
- Quiz card and sticky chrome stay above rays with solid/opaque surfaces (`bg-card`, existing blur header) for readability
- Test mode keeps the current soft canvas background (no Light Rays)

## Out of scope

- Removing or changing `/quiz/{set}/test` routes
- Changing quiz scoring, question data, or Notion URLs
- Redesigning home HeroBand beyond the brand rename
- Applying Light Rays to test mode or the home page

## File impact (expected)

| Action | Path |
|--------|------|
| Add | `src/components/home/study-set-cards.tsx` (+ optional client media child) |
| Delete | `src/components/home/quiz-set-cards.tsx`, `src/components/home/notes-heroes.tsx` |
| Edit | `src/app/page.tsx`, `src/components/home/hero-band.tsx`, `src/components/layout/site-header.tsx`, `src/app/layout.tsx`, `src/components/quiz/quiz-app.tsx` |
| Add (registry) | Magic UI `glyph-matrix`, `kinetic-text`, `light-rays` under `src/components/ui/` |

## Success criteria

1. Home shows exactly two study cards; no separate notes hero bands.
2. Each card media shows Glyph Matrix + Kinetic Text label; Practice and Notes work.
3. Product name reads **Tyson's notes** in header, hero, and browser tab.
4. Practice page has Light Rays behind the quiz; problem card top no longer blends into the page background.
5. Test routes and Practice quiz behavior still work.
