# Home Quiz Sets & DESIGN.md Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a stacked Study Web home (quiz set pickers + Notion note heroes), deep quiz routes per set/mode, a merged Essentials JSON, and a full UI restyle that strictly follows `DESIGN.md`.

**Architecture:** Route-driven Next.js App Router pages (`/` marketing home; `/quiz/[set]/[mode]` quiz). A catalog in `question-sets.ts` owns both sets’ metadata, questions, and Notion URLs. Static export requires `generateStaticParams` for all four quiz paths. Visual tokens and marketing components map 1:1 to `DESIGN.md`.

**Tech Stack:** Next.js 16 (`output: "export"`), React 19, Tailwind CSS 4, shadcn/Base UI, next-themes, Geist / Geist Mono (or Inter + JetBrains Mono fallbacks), lucide-react

## Global Constraints

- **UI source of truth:** `/Users/tysonhu/Documents/Study-Web/DESIGN.md` — every visual change must match its colors, typography, spacing, elevation, shapes, hero mesh, and Do’s/Don’ts. No purple primary theme, no weight-700 display, no heavy single drop-shadows, no miniaturized gradient swatches.
- **Primary CTA:** ink `#171717` (light) / polarity-flipped white-on-ink (dark marketing CTAs as specified).
- **Hero decoration:** multi-stop mesh (develop `#007cf0→#00dfd8`, preview `#7928ca→#ff0080`, ship `#ff4d4d→#f9cb28`) at hero scale only.
- **Routes:** `/quiz/essentials/practice|test`, `/quiz/fundamentals/practice|test`; invalid → `notFound()`.
- **Data:** merge essentials into `src/data/network-essentials.json`; delete `src/data/questions.json`.
- **Static export:** `next.config.ts` has `output: "export"` — quiz dynamic segment **must** export `generateStaticParams`.
- **Theme:** keep light + dark via next-themes; both tokenized per DESIGN.md.
- Spec: `docs/superpowers/specs/2026-07-19-home-quiz-sets-redesign-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `scripts/merge-network-essentials.mjs` | One-shot merge + validation (then delete after use, or keep for regen) |
| `src/data/network-essentials.json` | Merged Essentials `QuestionSet` |
| `src/data/questions.json` | **Delete** after merge |
| `src/data/network-fundamentals.json` | Unchanged Fundamentals set |
| `src/lib/question-sets.ts` | Catalog: ids, titles, notes URLs, loaders, `getQuizSet`, `isQuizSetId`, `isQuizMode` |
| `src/lib/quiz.ts` | Remove multi-set `mergeQuestionSets`; keep evaluate/helpers; export `prepareEssentialsQuestions` only if merge script needs shared logic — prefer merge script owns conversion |
| `src/app/globals.css` | DESIGN.md CSS variables (light + dark) |
| `src/app/layout.tsx` | Fonts (Geist), metadata, shell |
| `src/app/page.tsx` | Home composition |
| `src/app/quiz/[set]/[mode]/page.tsx` | Quiz route + `generateStaticParams` |
| `src/components/home/hero-band.tsx` | Brand hero + mesh |
| `src/components/home/quiz-set-cards.tsx` | Essentials / Fundamentals cards with Practice + Test links |
| `src/components/home/notes-heroes.tsx` | Two Notion note bands |
| `src/components/layout/site-header.tsx` | Brand + theme toggle |
| `src/components/ui/mesh-gradient.tsx` | Hero mesh backdrop |
| `src/components/ui/button.tsx` | Add `pill` / marketing size variants aligned to DESIGN.md |
| `src/components/quiz/quiz-app.tsx` | Quiz-only; props `{ questionSet, mode }`; remove internal home screen |

---

### Task 1: Merge Essentials JSON

**Files:**
- Create: `scripts/merge-network-essentials.mjs`
- Modify: `src/data/network-essentials.json` (overwrite with merged QuestionSet)
- Delete: `src/data/questions.json`
- Test: run merge script assertions (inline)

**Interfaces:**
- Consumes: current `network-essentials.json` (array), `questions.json` (`questions` array)
- Produces: `QuestionSet` file with unique IDs, continuous numbering, text-input conversion for original essentials `number <= 9`

- [ ] **Step 1: Write the merge script with failing assertions first**

Create `scripts/merge-network-essentials.mjs`:

```js
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const essentialsPath = path.join(root, "src/data/network-essentials.json");
const questionsPath = path.join(root, "src/data/questions.json");

function normalizeTextMode(n) {
  if (n === 1 || n === 2) return "ipv6";
  if (n === 4 || n === 7 || n === 9) return "hex";
  return "exact";
}

function toTextInput(q) {
  const acceptedAnswers = q.options.filter((o) => o.isCorrect).map((o) => o.text);
  return {
    ...q,
    type: "text_input",
    options: [],
    correctOptionIds: [],
    acceptedAnswers,
    textMatchMode: normalizeTextMode(q.number),
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const essentialsRaw = JSON.parse(fs.readFileSync(essentialsPath, "utf8"));
const questionsRaw = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

assert(Array.isArray(essentialsRaw), "essentials must be array before merge");
assert(Array.isArray(questionsRaw.questions), "questions.json missing questions");

const ne = essentialsRaw.map((q, i) => {
  const withId = { ...q, id: `ne-${q.id}`, number: i + 1 };
  return q.number <= 9 ? toTextInput(withId) : withId;
});

const orig = questionsRaw.questions.map((q, i) => ({
  ...q,
  id: `orig-${q.id}`,
  number: ne.length + i + 1,
}));

const questions = [...ne, ...orig];
const ids = new Set(questions.map((q) => q.id));
assert(ids.size === questions.length, "duplicate question ids");
assert(
  questions.every((q, i) => q.number === i + 1),
  "numbers must be continuous from 1"
);
assert(
  ne.slice(0, 9).every((q) => q.type === "text_input"),
  "first 9 original essentials must be text_input"
);

const out = {
  title: "Networking Essentials",
  source: "Network Essentials Practice Exam + Question Set",
  totalQuestions: questions.length,
  schemaVersion: "1.1",
  questions,
};

assert(out.totalQuestions === questions.length, "totalQuestions mismatch");
assert(out.totalQuestions === 205, `expected 205 questions, got ${out.totalQuestions}`);

fs.writeFileSync(essentialsPath, JSON.stringify(out, null, 2) + "\n");
fs.unlinkSync(questionsPath);
console.log(`Merged ${out.totalQuestions} questions into network-essentials.json; deleted questions.json`);
```

- [ ] **Step 2: Run script (expect pass + files updated)**

Run: `node scripts/merge-network-essentials.mjs`

Expected: prints merged count `205`; `questions.json` gone; `network-essentials.json` is an object with `questions` array length 205.

- [ ] **Step 3: Sanity-check file shape**

Run:

```bash
node -e "const d=require('./src/data/network-essentials.json'); console.log(d.title,d.totalQuestions,d.questions[0].type,d.questions[0].id); console.log(require('fs').existsSync('./src/data/questions.json'))"
```

Expected: `Networking Essentials 205 text_input ne-q001` and `false`.

- [ ] **Step 4: Commit**

```bash
git add src/data/network-essentials.json scripts/merge-network-essentials.mjs
git add -u src/data/questions.json
git commit -m "Merge essentials and questions into one question set."
```

---

### Task 2: Question set catalog

**Files:**
- Modify: `src/lib/question-sets.ts`
- Modify: `src/lib/quiz.ts` (remove `mergeQuestionSets` and helpers only used by it: `convertToTextInput`, `inferTextMatchMode` if unused)
- Create: `scripts/verify-question-sets.mjs`
- Modify: any imports of old `questionSet` export

**Interfaces:**
- Consumes: merged `network-essentials.json`, `network-fundamentals.json`
- Produces:

```ts
export type QuizSetId = "essentials" | "fundamentals";

export interface QuizSetMeta {
  id: QuizSetId;
  title: string;
  description: string;
  questionSet: QuestionSet;
  notesUrl: string;
  notesLabel: string;
}

export const QUIZ_SET_IDS: QuizSetId[];
export function isQuizSetId(value: string): value is QuizSetId;
export function isQuizMode(value: string): value is QuizMode;
export function getQuizSet(id: QuizSetId): QuizSetMeta;
export function listQuizSets(): QuizSetMeta[];
```

Notion URLs (exact):

- Essentials: `https://app.notion.com/p/Networking-Essentials-3755f826b2fc80e1bf6fcc7ce710233f?source=copy_link`
- Fundamentals: `https://app.notion.com/p/Network-Fundamental-3955f826b2fc80538519d4592037c110?source=copy_link`

- [ ] **Step 1: Write verify script (fail until catalog exists)**

`scripts/verify-question-sets.mjs`:

```js
import assert from "node:assert/strict";

// After implementation, this imports compiled logic via duplicating checks against JSON:
import essentials from "../src/data/network-essentials.json" with { type: "json" };
import fundamentals from "../src/data/network-fundamentals.json" with { type: "json" };

assert.equal(essentials.title, "Networking Essentials");
assert.equal(essentials.totalQuestions, essentials.questions.length);
assert.equal(fundamentals.title, "Network Fundamentals");
assert.equal(fundamentals.totalQuestions, fundamentals.questions.length);
assert.ok(essentials.questions.length > 0);
assert.ok(fundamentals.questions.length > 0);
console.log("question set JSON ok", essentials.totalQuestions, fundamentals.totalQuestions);
```

- [ ] **Step 2: Implement `src/lib/question-sets.ts`**

```ts
import type { QuestionSet, QuizMode } from "@/types/question";
import networkEssentialsData from "@/data/network-essentials.json";
import networkFundamentalsData from "@/data/network-fundamentals.json";

export type QuizSetId = "essentials" | "fundamentals";

export interface QuizSetMeta {
  id: QuizSetId;
  title: string;
  description: string;
  questionSet: QuestionSet;
  notesUrl: string;
  notesLabel: string;
}

const essentials = networkEssentialsData as QuestionSet;
const fundamentals = networkFundamentalsData as QuestionSet;

const catalog: Record<QuizSetId, QuizSetMeta> = {
  essentials: {
    id: "essentials",
    title: "Networking Essentials",
    description: "IPv6, addressing, and essentials practice exam questions.",
    questionSet: essentials,
    notesUrl:
      "https://app.notion.com/p/Networking-Essentials-3755f826b2fc80e1bf6fcc7ce710233f?source=copy_link",
    notesLabel: "Networking Essentials notes",
  },
  fundamentals: {
    id: "fundamentals",
    title: "Network Fundamentals",
    description: "Routing, switching, and core networking fundamentals.",
    questionSet: fundamentals,
    notesUrl:
      "https://app.notion.com/p/Network-Fundamental-3955f826b2fc80538519d4592037c110?source=copy_link",
    notesLabel: "Network Fundamentals notes",
  },
};

export const QUIZ_SET_IDS: QuizSetId[] = ["essentials", "fundamentals"];

export function isQuizSetId(value: string): value is QuizSetId {
  return value === "essentials" || value === "fundamentals";
}

export function isQuizMode(value: string): value is QuizMode {
  return value === "practice" || value === "test";
}

export function getQuizSet(id: QuizSetId): QuizSetMeta {
  return catalog[id];
}

export function listQuizSets(): QuizSetMeta[] {
  return QUIZ_SET_IDS.map((id) => catalog[id]);
}
```

- [ ] **Step 3: Strip obsolete merge from `quiz.ts`**

Delete `mergeQuestionSets`, `convertToTextInput`, and `inferTextMatchMode` from `src/lib/quiz.ts` if nothing else imports them. Grep to confirm:

Run: `rg "mergeQuestionSets|convertToTextInput|from \\\"@/lib/question-sets\\\"" src`

Expected: no `mergeQuestionSets` usages; `question-sets` only exports catalog APIs.

- [ ] **Step 4: Run verify script**

Run: `node scripts/verify-question-sets.mjs`

Expected: `question set JSON ok 205 217` (fundamentals count may be 217).

- [ ] **Step 5: Commit**

```bash
git add src/lib/question-sets.ts src/lib/quiz.ts scripts/verify-question-sets.mjs
git commit -m "Add quiz set catalog for essentials and fundamentals."
```

---

### Task 3: DESIGN.md design tokens & fonts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `package.json` (add `geist` package if using Vercel Geist)

**UI checklist (must match DESIGN.md):**

| Token | Light value |
|-------|-------------|
| `--background` / canvas-soft | `#fafafa` |
| `--card` / canvas | `#ffffff` |
| `--foreground` / ink | `#171717` |
| `--muted-foreground` / body | `#4d4d4d` |
| `--border` / hairline | `#ebebeb` |
| `--primary` | `#171717` |
| `--primary-foreground` | `#ffffff` |
| `--destructive` | `#ee0000` |
| link (utility class or `--link`) | `#0070f3` |

Dark: polarity-flip — background `#171717`, foreground near-white, primary CTA white/light on dark surfaces, hairlines at low-opacity white. **Do not** use cyan/purple as `--primary`.

Also add CSS utilities:

```css
--shadow-level-2: 0px 1px 1px #00000005, 0px 2px 2px #0000000a, inset 0 0 0 1px #00000014;
--shadow-level-3: 0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a, inset 0 0 0 1px #00000014;
--radius: 0.5rem; /* ~8px marketing cards; pills via rounded-full / rounded-[100px] */
--font-family-sans: var(--font-geist-sans), Inter, system-ui, sans-serif;
--font-family-mono: var(--font-geist-mono), ui-monospace, monospace;
```

- [ ] **Step 1: Install Geist**

Run: `npm install geist`

- [ ] **Step 2: Wire fonts in `layout.tsx`**

```tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
// body className includes GeistSans.variable GeistMono.variable
// set CSS variables --font-geist-sans / --font-geist-mono per geist docs
```

Update metadata description to mention two quiz sets (not a single 205-count merge).

- [ ] **Step 3: Rewrite `:root` and `.dark` in `globals.css` to DESIGN.md hex values**

Map shadcn semantic tokens to the table above. Add:

```css
:root {
  --link: #0070f3;
  --canvas-soft: #fafafa;
  --mute: #888888;
  --gradient-develop: linear-gradient(90deg, #007cf0, #00dfd8);
  --gradient-preview: linear-gradient(90deg, #7928ca, #ff0080);
  --gradient-ship: linear-gradient(90deg, #ff4d4d, #f9cb28);
}
```

- [ ] **Step 4: Visual verify**

Run: `npm run dev` — open `/` (temporary old page OK). In DevTools confirm `--primary` is `#171717` in light mode.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/app/globals.css src/app/layout.tsx
git commit -m "Restyle theme tokens to match DESIGN.md."
```

---

### Task 4: Marketing primitives (mesh, pill buttons, header)

**Files:**
- Create: `src/components/ui/mesh-gradient.tsx`
- Modify: `src/components/ui/button.tsx`
- Create: `src/components/layout/site-header.tsx`

**Interfaces:**
- Produces: `<MeshGradient className? />`, button `size="pill"` / `variant` primary|secondary marketing, `<SiteHeader />`

- [ ] **Step 1: Implement `MeshGradient`**

Full-bleed absolute decorative layer (hero only). Use a blurred multi-stop radial/conic stack with the three gradient pairs from DESIGN.md — large, soft, centered; never icon-sized.

```tsx
export function MeshGradient({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* layered blurred blobs: develop, preview, ship colors */}
    </div>
  );
}
```

- [ ] **Step 2: Extend `buttonVariants`**

Add sizes:

```ts
pill: "h-12 rounded-[100px] px-3 text-base font-medium",
"pill-sm": "h-8 rounded-[100px] px-2 text-sm font-medium",
```

Ensure `default` variant uses ink primary from tokens (already after Task 3). Secondary marketing: `outline` or dedicated `secondary` with white/canvas bg + ink text + hairline border.

- [ ] **Step 3: `SiteHeader`**

Sticky 64px bar: left brand link to `/` (“Study Web”), right `ThemeToggle`. Canvas bg, hairline bottom border. Body-sm nav typography. No purple shimmer.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/mesh-gradient.tsx src/components/ui/button.tsx src/components/layout/site-header.tsx
git commit -m "Add mesh gradient, pill buttons, and site header."
```

---

### Task 5: Home page composition

**Files:**
- Create: `src/components/home/hero-band.tsx`
- Create: `src/components/home/quiz-set-cards.tsx`
- Create: `src/components/home/notes-heroes.tsx`
- Modify: `src/app/page.tsx`

**UI (DESIGN.md):**

1. Hero: mono eyebrow (`font-mono text-xs`), display headline sentence-case with period (e.g. `Study networking with focused quizzes.`), one `body-lg` lead, mesh behind. Brand name is hero-level. No stats strip in hero.
2. Quiz section: `display-lg` section title; two cards with Level 2–3 shadow; mono caption `{n} questions`; Link pills to `/quiz/{id}/practice` and `/quiz/{id}/test`.
3. Notes: light band then dark polarity band; each `Open notes →` external link with `target="_blank"` `rel="noopener noreferrer"`.

- [ ] **Step 1: Implement home components using `listQuizSets()`**

`quiz-set-cards.tsx` maps `listQuizSets()` → two cards with:

```tsx
<Link href={`/quiz/${set.id}/practice`}>Practice</Link>
<Link href={`/quiz/${set.id}/test`}>Test</Link>
```

Use `Button` pill styles via `asChild` or className on `Link`.

- [ ] **Step 2: Replace `src/app/page.tsx`**

```tsx
import { SiteHeader } from "@/components/layout/site-header";
import { HeroBand } from "@/components/home/hero-band";
import { QuizSetCards } from "@/components/home/quiz-set-cards";
import { NotesHeroes } from "@/components/home/notes-heroes";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--canvas-soft)]">
      <SiteHeader />
      <main>
        <HeroBand />
        <QuizSetCards />
        <NotesHeroes />
      </main>
    </div>
  );
}
```

Do **not** render `QuizApp` on `/`.

- [ ] **Step 3: Manual DESIGN.md check on `/`**

Run: `npm run dev` → open `http://localhost:3000`

Verify:

- [ ] Near-white canvas, ink headline, not purple
- [ ] Mesh only in hero, large
- [ ] Two quiz cards with Practice + Test
- [ ] Two Notion heroes open correct URLs
- [ ] Theme toggle flips to dark polarity cleanly

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/home/
git commit -m "Build home screen with quiz sets and Notion heroes."
```

---

### Task 6: Quiz deep routes + slim QuizApp

**Files:**
- Create: `src/app/quiz/[set]/[mode]/page.tsx`
- Modify: `src/components/quiz/quiz-app.tsx`
- Read Next docs: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`

**Interfaces:**
- `QuizApp({ questionSet: QuestionSet; mode: QuizMode })`
- Remove internal `screen === "home"` branch and mode picker; start in quiz immediately
- Back control: `Link` to `/` (and optionally keep restart)

- [ ] **Step 1: Create quiz page with static params**

```tsx
import { notFound } from "next/navigation";
import { QuizApp } from "@/components/quiz/quiz-app";
import {
  getQuizSet,
  isQuizMode,
  isQuizSetId,
  QUIZ_SET_IDS,
} from "@/lib/question-sets";
import type { QuizMode } from "@/types/question";

export function generateStaticParams() {
  const modes: QuizMode[] = ["practice", "test"];
  return QUIZ_SET_IDS.flatMap((set) =>
    modes.map((mode) => ({ set, mode }))
  );
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ set: string; mode: string }>;
}) {
  const { set, mode } = await params;
  if (!isQuizSetId(set) || !isQuizMode(mode)) notFound();
  const meta = getQuizSet(set);
  return <QuizApp questionSet={meta.questionSet} mode={mode} />;
}
```

(Confirm `params` Promise vs sync against this Next 16 docs before coding.)

- [ ] **Step 2: Slim `QuizApp`**

- Props: `{ questionSet, mode }` — initialize `quizMode` from `mode` prop (fixed for the session; no home mode toggle required).
- Delete home screen JSX (DotPattern welcome card, ModeOption picker, ShimmerButton start).
- Add header back link to `/` via `SiteHeader` or inline `Link`.
- Restyle quiz chrome to DESIGN.md tokens (ink primary, hairline borders, remove `AnimatedGradientText` purple shimmer and decorative DotPattern if they fight the system).
- Keep practice/test evaluation behavior unchanged.

- [ ] **Step 3: Build (static export must succeed)**

Run: `npm run build`

Expected: success; static paths include `/quiz/essentials/practice`, `/quiz/essentials/test`, `/quiz/fundamentals/practice`, `/quiz/fundamentals/test`.

- [ ] **Step 4: Manual route check**

Run: `npm run dev`

- Visit each of the four routes — quiz starts immediately in correct mode/set.
- Visit `/quiz/nope/practice` — 404.
- Complete one practice question check; confirm feedback still works.

- [ ] **Step 5: Commit**

```bash
git add src/app/quiz src/components/quiz/quiz-app.tsx
git commit -m "Add deep quiz routes and remove in-app home screen."
```

---

### Task 7: DESIGN.md polish pass (home + quiz)

**Files:**
- Modify as needed: home components, `quiz-app.tsx`, `button.tsx`, `globals.css`, remove unused decorative components from quiz if orphaned

**Mandatory Do’s/Don’ts audit (from DESIGN.md):**

- [ ] Primary CTAs are ink `#171717`, not purple/blue fills
- [ ] Marketing CTAs use ~100px pill radius
- [ ] Display type weight ≤ 600; sentence-case headlines
- [ ] Mesh only on home hero (and optionally notes atmospheric — prefer notes use flat light/dark bands without miniaturized gradient icons)
- [ ] Cards use stacked shadow + inset hairline, not heavy drop-shadow
- [ ] Mono only for eyebrows / technical captions
- [ ] Dark mode polarity flip works without purple glow aesthetic
- [ ] Remove or stop using: `AnimatedGradientText` purple, `ShimmerButton` as primary marketing CTA, dense purple `DotPattern` hero look

- [ ] **Step 1: Apply audit fixes**

- [ ] **Step 2: `npm run build` + `npm run lint`**

Expected: both pass.

- [ ] **Step 3: Final manual walkthrough**

1. `/` — brand hero, two quiz cards, two Notion heroes  
2. Essentials Practice → answer → check  
3. Fundamentals Test → answer few → submit results → back home  
4. Toggle dark on home and quiz  

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "Polish UI to match DESIGN.md do and don't rules."
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Stacked home: hero → quiz cards → notes | Task 5 |
| Practice + Test CTAs per set | Task 5 |
| Deep routes `/quiz/{set}/{mode}` | Task 6 |
| Invalid → notFound | Task 6 |
| Merge essentials + delete questions.json | Task 1 |
| Catalog + Notion URLs | Task 2 |
| DESIGN.md tokens light+dark | Task 3, 7 |
| Mesh hero, pills, elevation | Task 4, 5, 7 |
| QuizApp quiz-only | Task 6 |
| Static export params | Task 6 |
| Theme toggle retained | Task 4–6 |

## Plan self-review

- No TBD placeholders in steps.
- `QuizSetId` / `getQuizSet` / `isQuizMode` names consistent across Tasks 2, 5, 6.
- DESIGN.md called out in Global Constraints and Task 7 audit.
- `generateStaticParams` required because of `output: "export"`.
