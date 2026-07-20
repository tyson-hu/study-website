# Study Set Cards, Brand Rename & Practice Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home quiz + notes sections with two Magic UI media cards (Practice + Notes), rename the product to Tyson's notes, and fix practice-page visuals (problem header contrast + Light Rays background).

**Architecture:** Keep the existing App Router home + quiz routes. Add a `StudySetCards` section that composes catalog data from `listQuizSets()` with Magic UI Glyph Matrix / Kinetic Text media. Brand strings update in header, hero, and metadata. Practice mode wraps the quiz shell with Magic UI Light Rays; the shared quiz problem header switches from `--canvas-soft` to `bg-card`.

**Tech Stack:** Next.js 16 (static export), React 19, Tailwind CSS 4, shadcn/Base UI (`base-nova`), next-themes, Magic UI (`glyph-matrix`, `kinetic-text`, `light-rays`), motion (already installed)

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-study-set-cards-design.md`
- Home CTAs: **Practice** + **Notes** only (no Test button on home)
- Kinetic Text labels: exactly `Essentials` and `Fundamentals`
- Brand copy: exactly `Tyson's notes` (hero may keep trailing period: `Tyson's notes.`)
- Light Rays: **practice mode only**
- Do not remove `/quiz/{set}/test` routes or change quiz scoring / JSON data / Notion URLs
- Install Magic UI via `npx shadcn@latest add "https://magicui.design/r/<name>.json"` (npm package manager)
- Prefer `gap-*` over `space-y-*`; use semantic tokens (`bg-card`, `text-muted-foreground`)
- After each Magic UI add, verify imports use `@/components/ui/...` and `@/lib/utils`

---

## File map

| File | Responsibility |
|------|----------------|
| `src/components/ui/glyph-matrix.tsx` | Magic UI Glyph Matrix (installed) |
| `src/components/ui/kinetic-text.tsx` | Magic UI Kinetic Text (installed) |
| `src/components/ui/light-rays.tsx` | Magic UI Light Rays (installed) |
| `src/components/home/study-set-media.tsx` | Client media block: Glyph Matrix + Kinetic Text overlay |
| `src/components/home/study-set-cards.tsx` | Two study-set cards (title, description, Practice, Notes) |
| `src/components/home/quiz-set-cards.tsx` | **Delete** |
| `src/components/home/notes-heroes.tsx` | **Delete** |
| `src/app/page.tsx` | Compose HeroBand + StudySetCards only |
| `src/components/home/hero-band.tsx` | Brand `h1` → Tyson's notes. |
| `src/components/layout/site-header.tsx` | Brand link → Tyson's notes |
| `src/app/layout.tsx` | Metadata title → Tyson's notes — IT Networking Quiz |
| `src/components/quiz/quiz-app.tsx` | Practice Light Rays shell; problem header `bg-card` |

---

### Task 1: Brand rename to Tyson's notes

**Files:**
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/components/home/hero-band.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: none
- Produces: product name string `Tyson's notes` in header, hero, and document title

- [ ] **Step 1: Update header brand link**

In `src/components/layout/site-header.tsx`, change the Link children from `Study Web` to `Tyson's notes`:

```tsx
<Link
  href="/"
  className="text-sm font-medium tracking-[-0.28px] text-foreground"
>
  Tyson's notes
</Link>
```

- [ ] **Step 2: Update hero headline**

In `src/components/home/hero-band.tsx`, change the `h1` text from `Study Web.` to `Tyson's notes.`:

```tsx
<h1 className="mt-3 text-5xl font-semibold tracking-[-2.4px] text-foreground">
  Tyson's notes.
</h1>
```

- [ ] **Step 3: Update document metadata title**

In `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Tyson's notes — IT Networking Quiz",
  description:
    "Practice Networking Essentials and Network Fundamentals with interactive quiz questions across two study sets.",
};
```

- [ ] **Step 4: Verify brand strings**

Run:

```bash
rg -n "Study Web" src/components/layout/site-header.tsx src/components/home/hero-band.tsx src/app/layout.tsx
rg -n "Tyson's notes" src/components/layout/site-header.tsx src/components/home/hero-band.tsx src/app/layout.tsx
```

Expected: first command finds no matches in those three files; second finds one match in each.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/site-header.tsx src/components/home/hero-band.tsx src/app/layout.tsx
git commit -m "$(cat <<'EOF'
Rename product brand to Tyson's notes.

EOF
)"
```

---

### Task 2: Install Magic UI components

**Files:**
- Create: `src/components/ui/glyph-matrix.tsx`
- Create: `src/components/ui/kinetic-text.tsx`
- Create: `src/components/ui/light-rays.tsx`
- Possibly modify: `package.json` / lockfile if CLI adds deps

**Interfaces:**
- Consumes: shadcn CLI, Magic UI registry URLs
- Produces: `GlyphMatrix`, `KineticText`, `LightRays` exportable from `@/components/ui/...`

- [ ] **Step 1: Install the three Magic UI registry items**

From repo root:

```bash
npx shadcn@latest add "https://magicui.design/r/glyph-matrix.json" "https://magicui.design/r/kinetic-text.json" "https://magicui.design/r/light-rays.json" --yes
```

Expected: three files appear under `src/components/ui/` (or CLI-reported paths). `motion` is already in dependencies.

- [ ] **Step 2: Verify install paths and imports**

Run:

```bash
ls src/components/ui/glyph-matrix.tsx src/components/ui/kinetic-text.tsx src/components/ui/light-rays.tsx
rg -n "from \"@/" src/components/ui/glyph-matrix.tsx src/components/ui/kinetic-text.tsx src/components/ui/light-rays.tsx
```

Expected: all three files exist. Imports should use `@/lib/utils` (and any other `@/` aliases). If any file imports `@/registry/...` or wrong utils paths, rewrite to `@/components/ui/...` / `@/lib/utils`.

- [ ] **Step 3: Confirm exports**

Each file must export:

- `GlyphMatrix` from `glyph-matrix.tsx`
- `KineticText` from `kinetic-text.tsx`
- `LightRays` from `light-rays.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/glyph-matrix.tsx src/components/ui/kinetic-text.tsx src/components/ui/light-rays.tsx package.json package-lock.json
git commit -m "$(cat <<'EOF'
Add Magic UI glyph matrix, kinetic text, and light rays.

EOF
)"
```

(Only stage lockfile/package.json if the CLI changed them.)

---

### Task 3: Build StudySetCards and swap home sections

**Files:**
- Create: `src/components/home/study-set-media.tsx`
- Create: `src/components/home/study-set-cards.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/home/quiz-set-cards.tsx`
- Delete: `src/components/home/notes-heroes.tsx`

**Interfaces:**
- Consumes: `listQuizSets()` → `QuizSetMeta[]` with `id`, `title`, `description`, `notesUrl`; `GlyphMatrix`; `KineticText`; `buttonVariants`
- Produces: `StudySetCards` server component used by home; `StudySetMedia` client component with props `{ label: string }`

- [ ] **Step 1: Create client media component**

Create `src/components/home/study-set-media.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { GlyphMatrix } from "@/components/ui/glyph-matrix"
import { KineticText } from "@/components/ui/kinetic-text"

interface StudySetMediaProps {
  label: string
}

export function StudySetMedia({ label }: StudySetMediaProps) {
  const { resolvedTheme } = useTheme()
  const [color, setColor] = useState("#6B7280")

  useEffect(() => {
    if (!resolvedTheme) return
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000")
  }, [resolvedTheme])

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border bg-background md:h-56">
      <GlyphMatrix
        glyphs="01·•+*/\\<>="
        cellSize={14}
        mutationRate={0.04}
        interval={90}
        fadeBottom={0.6}
        color={color}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <KineticText
          text={label}
          className="pointer-events-auto text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl [font-optical-sizing:auto]"
        />
      </div>
    </div>
  )
}
```

If `KineticText`’s API uses `children` instead of `text`, adapt to the installed component’s actual props (read the installed file).

- [ ] **Step 2: Create StudySetCards**

Create `src/components/home/study-set-cards.tsx`:

```tsx
import Link from "next/link"

import { StudySetMedia } from "@/components/home/study-set-media"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { listQuizSets } from "@/lib/question-sets"
import { cn } from "@/lib/utils"

const kineticLabels: Record<string, string> = {
  essentials: "Essentials",
  fundamentals: "Fundamentals",
}

export function StudySetCards() {
  const quizSets = listQuizSets()

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-foreground">
          Choose your set.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {quizSets.map((set) => (
            <Card
              key={set.id}
              className="shadow-elevation-3 border-border bg-card p-6 md:p-8"
            >
              <StudySetMedia label={kineticLabels[set.id] ?? set.title} />
              <CardHeader className="mt-6 px-0">
                <CardTitle className="text-2xl font-semibold tracking-[-0.96px] text-foreground">
                  {set.title}
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  {set.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <p className="font-mono text-xs text-[var(--mute)]">
                  {set.questionSet.totalQuestions} questions
                </p>
              </CardContent>
              <CardFooter className="mt-6 flex flex-wrap gap-3 border-0 bg-transparent px-0">
                <Link
                  href={`/quiz/${set.id}/practice`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "pill" })
                  )}
                >
                  Practice
                </Link>
                <a
                  href={set.notesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "pill" })
                  )}
                >
                  Notes
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Wire home page and delete old sections**

Replace `src/app/page.tsx` with:

```tsx
import { HeroBand } from "@/components/home/hero-band"
import { StudySetCards } from "@/components/home/study-set-cards"
import { SiteHeader } from "@/components/layout/site-header"

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--canvas-soft)]">
      <SiteHeader />
      <main>
        <HeroBand />
        <StudySetCards />
      </main>
    </div>
  )
}
```

Delete:

- `src/components/home/quiz-set-cards.tsx`
- `src/components/home/notes-heroes.tsx`

- [ ] **Step 4: Verify no stale imports**

Run:

```bash
rg -n "QuizSetCards|NotesHeroes|quiz-set-cards|notes-heroes" src
npm run lint
```

Expected: no matches under `src/`; lint clean (or only pre-existing unrelated warnings).

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/home/study-set-cards.tsx src/components/home/study-set-media.tsx
git add -u src/components/home/quiz-set-cards.tsx src/components/home/notes-heroes.tsx
git commit -m "$(cat <<'EOF'
Replace home quiz and notes sections with study-set cards.

EOF
)"
```

---

### Task 4: Practice Light Rays + problem header contrast

**Files:**
- Modify: `src/components/quiz/quiz-app.tsx`

**Interfaces:**
- Consumes: `LightRays` from `@/components/ui/light-rays`; existing `isPractice` boolean
- Produces: practice shell with Light Rays behind content; problem header using `bg-card`

- [ ] **Step 1: Fix problem header background**

In `src/components/quiz/quiz-app.tsx`, find the question header strip:

```tsx
<div className="border-b border-border bg-[var(--canvas-soft)] px-6 py-5">
```

Change to:

```tsx
<div className="border-b border-border bg-card px-6 py-5">
```

Do this for the main quiz card header (the one rendering `currentQuestion`). If the empty-state card does not use `--canvas-soft` on a header, leave it.

- [ ] **Step 2: Add Light Rays for practice mode**

At top of `quiz-app.tsx`, add:

```tsx
import { LightRays } from "@/components/ui/light-rays"
```

Change the main return shell (the non-empty quiz return around the existing `bg-[var(--canvas-soft)]` wrapper) so practice gets a relative Light Rays layer:

```tsx
return (
  <div
    className={cn(
      "relative flex min-h-full flex-1 flex-col",
      !isPractice && "bg-[var(--canvas-soft)]"
    )}
  >
    {isPractice && (
      <>
        <div className="absolute inset-0 -z-10 bg-[var(--canvas-soft)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <LightRays />
        </div>
      </>
    )}
    <SiteHeader />
    {/* existing sticky header + main unchanged */}
```

Keep the sticky progress header and quiz `Card` as they are (solid `bg-card` / `bg-card/95`) so content stays readable over the rays.

Also apply the same practice Light Rays wrapper to the empty-questions early return if it uses the canvas soft shell and `isPractice` is true — or leave empty state on soft canvas only (acceptable). Prefer consistency: wrap both shells the same way when `isPractice`.

- [ ] **Step 3: Verify mode split**

Confirm mentally / via code review:

- `isPractice === true` → Light Rays present
- `isPractice === false` → no `LightRays`, soft canvas background remains
- Problem header class includes `bg-card` and does **not** include `bg-[var(--canvas-soft)]`

Run:

```bash
rg -n "LightRays|bg-\[var\(--canvas-soft\)\]|bg-card" src/components/quiz/quiz-app.tsx
```

- [ ] **Step 4: Build check**

Run:

```bash
npm run build
```

Expected: build succeeds (static export generates home + four quiz paths).

- [ ] **Step 5: Commit**

```bash
git add src/components/quiz/quiz-app.tsx
git commit -m "$(cat <<'EOF'
Add practice Light Rays and fix quiz problem card contrast.

EOF
)"
```

---

### Task 5: Manual verification pass

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: running app from Task 4 build or `npm run dev`
- Produces: confirmation checklist against the spec success criteria

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Home checklist**

Verify:

1. Header and hero say **Tyson's notes**
2. Browser tab title starts with **Tyson's notes**
3. Exactly two cards; no separate notes hero bands
4. Card media shows Glyph Matrix + Kinetic Text (**Essentials** / **Fundamentals**)
5. **Practice** goes to `/quiz/essentials/practice` or `/quiz/fundamentals/practice`
6. **Notes** opens the Notion URL in a new tab
7. No **Test** button on home cards

- [ ] **Step 3: Practice checklist**

Open `/quiz/essentials/practice`:

1. Light Rays visible behind the quiz UI
2. Problem card top (question section) clearly separated from the page background (no blending)
3. Practice / Check answer still works

- [ ] **Step 4: Test mode sanity**

Open `/quiz/essentials/test`:

1. No Light Rays (soft canvas only)
2. Problem header still has solid card contrast
3. Route still loads

- [ ] **Step 5: Final commit if verification found small fixes**

If any tiny fix was needed during verification, commit it:

```bash
git add -u
git commit -m "$(cat <<'EOF'
Polish study-set cards and practice visuals after verification.

EOF
)"
```

If nothing changed, skip this commit.

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| Two home study cards replacing quiz + notes sections | Task 3 |
| Glyph Matrix + Kinetic Text media | Tasks 2–3 |
| Practice + Notes buttons (no Test on home) | Task 3 |
| Brand rename everywhere | Task 1 |
| Practice Light Rays | Task 4 |
| Problem header contrast fix | Task 4 |
| Keep test routes / data / Notion URLs | Tasks 3–4 (no deletions of routes/data) |
