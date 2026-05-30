# Color Tokenization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) — verification is a visual spot-check of each screen that only the user can confirm. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded Tailwind color classes with semantic design tokens (Tailwind 4 `@theme`), with zero intended visual change, and define the sidebar + chart tokens the upcoming features need.

**Architecture:** Define tokens once in `globals.css` (aliasing existing Tailwind palette variables), then migrate files group-by-group, each group its own commit verified by `pnpm build` + visual spot-check.

**Tech Stack:** Tailwind CSS 4 (`@theme` CSS variables), Next 16, react-pdf (separate hex constants).

**Verification model:** No automated tests. Each task: apply mapping → `pnpm run build` → visually confirm the touched screens look identical → commit.

---

## Two deviations from the spec (self-review fixes, applied in this plan)

1. **Text tokens renamed `text*` → `fg*`** to avoid the awkward generated class `text-text`. So `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-fg-inverse` (classes `text-fg`, `text-fg-muted`, etc.). The spec's `primary-foreground` is dropped as redundant — all white text on color/dark uses `text-fg-inverse`.
2. **Danger normalized to one shade.** Today errors use `red-600` but the delete button and "pending" badge use `red-500`. Tokenizing consolidates the danger fill to `--color-danger` = `red-600` (+ `danger-hover` = `red-700`). This deepens the delete button and pending badge from red-500→red-600 — the single, barely-perceptible intentional visual change. Flagged in the PR.

3. **A handful of one-off neutral shades normalize to the nearest token** (all imperceptible or non-rendering):
   - `layout.tsx` `border-gray-700` has **no `border` width class**, so it renders nothing today — mapping it is a cosmetic no-op.
   - `page.tsx` forgot-password link `hover:text-gray-800` → `hover:text-fg-muted` (gray-700): a hair lighter on hover of a non-functional link.
   - skeleton `border-gray-100` → `border-border` (gray-200): a hair darker on loader edges.
   - `pacientes-component.tsx` list error `text-red-500` → `text-danger` (red-600): consistent with the danger normalization.

Everything else aliases the exact current color (zero change).

## Master mapping table

Apply this everywhere unless a task says otherwise:

| Hardcoded class | Token class |
|---|---|
| `bg-amber-600` | `bg-primary` |
| `hover:bg-amber-500` | `hover:bg-primary-hover` |
| `ring-amber-600` | `ring-primary` |
| `text-blue-600` | `text-accent` |
| `ring-blue-600` | `ring-accent` |
| `outline-blue-600` | `outline-accent` |
| `ring-blue-500` | `ring-accent-ring` |
| `text-red-600` | `text-danger` |
| `bg-red-500` | `bg-danger` |
| `hover:bg-red-700` | `hover:bg-danger-hover` |
| `bg-green-500` | `bg-success` |
| `bg-white` | `bg-surface` |
| `bg-gray-50` | `bg-surface-muted` |
| `bg-gray-100` | `bg-surface-sunken` |
| `bg-gray-900` | `bg-surface-inverse` |
| `bg-gray-800` / `hover:bg-gray-800` | `bg-surface-inverse-hover` / `hover:bg-surface-inverse-hover` |
| `text-gray-900` | `text-fg` |
| `text-gray-700` | `text-fg-muted` |
| `text-gray-500` | `text-fg-subtle` |
| `text-white` | `text-fg-inverse` |
| `border-gray-200` | `border-border` |
| `divide-gray-200` | `divide-border` |
| `border-gray-300` | `border-border-strong` |
| `bg-gray-500` (in `bg-gray-500/75`) | `bg-overlay` (→ `bg-overlay/75`) |
| `peer-focus:text-gray-900` | `peer-focus:text-fg` |
| `border-gray-100` | `border-border` (gray-100 borders → border token; see note) |

**Left as literal (documented exceptions):**
- Skeleton decorative gradient: `from/via/to-{green,blue,purple}-{200,400}`, `via-white`, and `to-green-300` in `PatientTableSkeleton.tsx` / `skeletons.tsx`.
- The one secondary "Cancelar" button in `buttons.tsx:91`: `text-black bg-slate-200 hover:bg-slate-300`.

**Note on `border-gray-100`:** appears in skeletons. Since skeletons are non-critical decorative loaders, map their structural `bg-gray-100`/`border-gray-100`/`bg-gray-200` to `surface-sunken`/`border`/? — see Task 6 for the skeleton-specific handling (we tokenize the neutral structure but leave the colored gradient).

---

## Task 0: Pre-flight

**Files:** none.

- [ ] **Step 1: Branch + clean tree**

Run: `git status && git branch --show-current`
Expected: `feature/color-tokens`, clean (the spec commit is already here).

- [ ] **Step 2: Baseline visual reference**

Run `pnpm dev`. Open and eyeball each screen so you have a "before" mental reference: login (`/`), patient list (`/pacientes`) incl. the loading skeleton + search + status badges, patient detail (`/paciente/<id>`), and the dialogs (create/edit patient, new visita, delete confirm). Generate one PDF. Stop the server.

- [ ] **Step 3: No commit.**

---

## Task 1: Define tokens + pdfColors (foundation; no usage yet)

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/app/ui/pdfColors.ts`

- [ ] **Step 1: Add the `@theme` block to `globals.css`**

Replace the contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  /* brand */
  --color-primary: var(--color-amber-600);
  --color-primary-hover: var(--color-amber-500);

  /* accent / focus */
  --color-accent: var(--color-blue-600);
  --color-accent-ring: var(--color-blue-500);

  /* status */
  --color-danger: var(--color-red-600);
  --color-danger-hover: var(--color-red-700);
  --color-success: var(--color-green-500);

  /* surfaces */
  --color-surface: var(--color-white);
  --color-surface-muted: var(--color-gray-50);
  --color-surface-sunken: var(--color-gray-100);
  --color-surface-inverse: var(--color-gray-900);
  --color-surface-inverse-hover: var(--color-gray-800);

  /* foreground (text) */
  --color-fg: var(--color-gray-900);
  --color-fg-muted: var(--color-gray-700);
  --color-fg-subtle: var(--color-gray-500);
  --color-fg-inverse: var(--color-white);

  /* borders + overlay */
  --color-border: var(--color-gray-200);
  --color-border-strong: var(--color-gray-300);
  --color-overlay: var(--color-gray-500);

  /* sidebar (provisional — for the sidebar feature) */
  --color-sidebar: var(--color-gray-900);
  --color-sidebar-text: var(--color-gray-300);
  --color-sidebar-text-active: var(--color-white);
  --color-sidebar-item-hover: var(--color-gray-800);
  --color-sidebar-item-active: var(--color-amber-600);

  /* categorical chart palette (provisional — for statistics) */
  --color-chart-1: var(--color-amber-600);
  --color-chart-2: var(--color-blue-600);
  --color-chart-3: var(--color-teal-500);
  --color-chart-4: var(--color-rose-500);
  --color-chart-5: var(--color-violet-500);
  --color-chart-6: var(--color-green-600);
  --color-chart-7: var(--color-orange-500);
  --color-chart-8: var(--color-cyan-600);
}

.overflow-hidden {
  overflow: hidden !important;
}
```

- [ ] **Step 2: Create `src/app/ui/pdfColors.ts`**

```ts
// react-pdf cannot read CSS variables (it does not render to the DOM),
// so PDF colors live here as plain hex constants.
export const pdfColors = {
  border: "#000000",
  text: "#000000",
} as const;
```

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: succeeds. No usage yet, so no visual change. (Defining unused `@theme` tokens is fine.)

- [ ] **Step 4: Commit**

```
git add src/app/globals.css src/app/ui/pdfColors.ts
git commit -m "feat(tokens): define color tokens in @theme and pdfColors constants"
```

---

## Task 2: Leaf/shared components — status, search, buttons

**Files:**
- Modify: `src/app/ui/status.tsx`
- Modify: `src/app/ui/search.tsx`
- Modify: `src/app/ui/buttons.tsx`

- [ ] **Step 1: `status.tsx`** — apply mapping:
  - `text-white` (line 14 and the `text-white` on icons lines 24, 30) → `text-fg-inverse`
  - `bg-red-500` (pending, line 16) → `bg-danger`
  - `bg-green-500` (paid, line 17) → `bg-success`

- [ ] **Step 2: `search.tsx`** — apply mapping:
  - `border-gray-200` (line 21) → `border-border`
  - `placeholder:text-gray-500` (line 21) → `placeholder:text-fg-subtle`
  - `text-gray-500` (line 27) → `text-fg-subtle`
  - `peer-focus:text-gray-900` (line 27) → `peer-focus:text-fg`

- [ ] **Step 3: `buttons.tsx`** — apply mapping to all buttons:
  - `bg-amber-600` → `bg-primary`; `hover:bg-amber-500` → `hover:bg-primary-hover`; `text-white` → `text-fg-inverse`; `focus-visible:outline-blue-600` → `focus-visible:outline-accent` (CreatePaciente line 18, CreateVisita line 129)
  - `hover:bg-gray-100` (Edit/EditVisita/Delete/DownloadPDF lines 40, 62, 110, 119) → `hover:bg-surface-sunken`
  - `bg-gray-100` (DeletePaciente footer line 88) → `bg-surface-sunken`
  - Delete confirm button (line 98): `text-white` → `text-fg-inverse`, `bg-red-500` → `bg-danger`, `hover:bg-red-700` → `hover:bg-danger-hover`
  - **LEAVE line 91** (`text-black bg-slate-200 hover:bg-slate-300`) unchanged — documented exception.

- [ ] **Step 4: Build + visual check**

Run: `pnpm run build`, then `pnpm dev`. Check: status badges (pending red / paid green), search bar, all buttons (create, edit, delete dialog with its red Eliminar + slate Cancelar). Confirm identical (delete button is now red-600 vs red-500 — the one intentional micro-change).

- [ ] **Step 5: Commit**

```
git add src/app/ui/status.tsx src/app/ui/search.tsx src/app/ui/buttons.tsx
git commit -m "refactor(tokens): migrate status, search, buttons to color tokens"
```

---

## Task 3: Dialogs

**Files:**
- Modify: `src/app/ui/Dialog.tsx`
- Modify: `src/app/ui/NewPacienteDialog/NewPacienteDialogBody.tsx`
- Modify: `src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx`
- Modify: `src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx`

- [ ] **Step 1: `Dialog.tsx`**
  - `bg-gray-500` (line 40, in `bg-gray-500/75`) → `bg-overlay` (result: `bg-overlay/75`)
  - `bg-white` (lines 54, 58) → `bg-surface`
  - `text-gray-900` (line 62) → `text-fg`

- [ ] **Step 2: `NewPacienteDialogBody.tsx`**
  - `text-red-600` (error spans, lines 51, 68, 115, 132) → `text-danger`
  - submit button (line 137): `bg-amber-600` → `bg-primary`, `text-white` → `text-fg-inverse`, `focus:ring-blue-600` → `focus:ring-accent`
  - (The inputs use `border-input`, `bg-background`, `ring-ring`, `text-muted-foreground` — these are NOT Tailwind palette colors; they're undefined utility names that resolve to nothing/inherit. Leave them; out of scope — they're a pre-existing shadcn-ish leftover, not a hardcoded palette color.)

- [ ] **Step 3: `EditPacienteDialogBody.tsx`** — same pattern as Step 2:
  - `text-red-600` (lines 54, 71, 118, 135) → `text-danger`
  - submit button (line 140): `bg-amber-600` → `bg-primary`, `text-white` → `text-fg-inverse`, `focus:ring-blue-600` → `focus:ring-accent`

- [ ] **Step 4: `NewVisitaDialogBody.tsx`**
  - `bg-white` (line 803) → `bg-surface`; `border-gray-200` (line 803) → `border-border`
  - submit buttons (lines 806, 813): `bg-amber-600` → `bg-primary`, `text-white` → `text-fg-inverse`, `ring-amber-600` → `ring-primary`

- [ ] **Step 5: Build + visual check**

Run: `pnpm run build`, then `pnpm dev`. Open each dialog: create patient (+ trigger a validation error to see red text), edit patient, new visita, and the modal backdrop (translucent gray overlay). Confirm identical.

- [ ] **Step 6: Commit**

```
git add src/app/ui/Dialog.tsx "src/app/ui/NewPacienteDialog/NewPacienteDialogBody.tsx" "src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx" "src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx"
git commit -m "refactor(tokens): migrate dialogs to color tokens"
```

---

## Task 4: Tables & lists

**Files:**
- Modify: `src/app/ui/Table.tsx`
- Modify: `src/app/pacientes/pacientes-component.tsx`
- Modify: `src/app/paciente/[id]/paciente-component.tsx`

- [ ] **Step 1: `Table.tsx`** — apply mapping:
  - `border-gray-200` → `border-border`; `divide-gray-200` → `divide-border`
  - `bg-gray-100` (thead, line 79) → `bg-surface-sunken`
  - `text-gray-700` (th, lines 92, 107) → `text-fg-muted`
  - `bg-white` (tbody, line 113) → `bg-surface`
  - `bg-gray-50` (line 124) → `bg-surface-muted`
  - `text-gray-900` (line 125) → `text-fg`
  - `text-gray-500` (lines 130, 133, 136, 139, 142, 150) → `text-fg-subtle`

- [ ] **Step 2: `pacientes-component.tsx`**
  - `text-red-500` (error, line 46) → `text-danger` (note: error was red-500 here; consolidating to danger/red-600 — consistent with the danger normalization)
  - `text-gray-500` (endMessage, line 51) → `text-fg-subtle`

- [ ] **Step 3: `paciente/[id]/paciente-component.tsx`** — apply mapping:
  - `border-gray-200` (line 68) → `border-border`; `divide-gray-200` (lines 69, 111) → `divide-border`
  - `bg-gray-100` (line 70) → `bg-surface-sunken`
  - `text-gray-700` (lines 74, 81, 87, 93, 99, 105) → `text-fg-muted`
  - `bg-white` (line 111) → `bg-surface`
  - `bg-gray-50` (line 114) → `bg-surface-muted`
  - `text-gray-900` (line 115) → `text-fg`
  - `text-gray-500` (lines 118, 123, 126, 132, 138) → `text-fg-subtle`

- [ ] **Step 4: Build + visual check**

Run: `pnpm run build`, then `pnpm dev`. Check the patient list table (header, row stripes, hover, muted cell text) and the patient detail table. Trigger the list error path if easy (otherwise skip). Confirm identical.

- [ ] **Step 5: Commit**

```
git add src/app/ui/Table.tsx src/app/pacientes/pacientes-component.tsx "src/app/paciente/[id]/paciente-component.tsx"
git commit -m "refactor(tokens): migrate patient tables and lists to color tokens"
```

---

## Task 5: App shell & login

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: `layout.tsx`** (header bar)
  - `border-gray-700` (line 23) → `border-border-strong` (closest neutral; gray-700 border is a one-off — acceptable as border-strong, or leave literal if you prefer exact. Map to `border-border-strong`.)
  - `bg-gray-900` (line 23) → `bg-surface-inverse`
  - `text-white` (lines 25, 27) → `text-fg-inverse`

- [ ] **Step 2: `page.tsx`** (login)
  - `bg-gray-100` (line 40) → `bg-surface-sunken`
  - `bg-white` (line 41) → `bg-surface`
  - `text-gray-900` (lines 50, 99, 107) → `text-fg`
  - `text-gray-700` (lines 57, 75) → `text-fg-muted`
  - `border-gray-300` (lines 65, 83, 95) → `border-border-strong`
  - `focus:ring-blue-600` (lines 65, 83) → `focus:ring-accent`
  - `text-blue-600` (line 95) → `text-accent`
  - `focus:ring-blue-500` (line 95) → `focus:ring-accent-ring`
  - `text-gray-800` (line 107, the `hover:text-gray-800`) → `hover:text-fg-muted` (gray-800≈gray-700 muted; acceptable normalization) — OR leave literal. Map to `hover:text-fg-muted`.
  - login button (line 115): `text-white` → `text-fg-inverse`, `bg-gray-900` → `bg-surface-inverse`, `hover:bg-gray-800` → `hover:bg-surface-inverse-hover`, `focus:ring-blue-500` → `focus:ring-accent-ring`

- [ ] **Step 3: Build + visual check**

Run: `pnpm run build`, then `pnpm dev`. Check the dark header bar on every page and the full login screen (inputs, focus rings, the dark "Iniciar Sesión" button, links). Confirm identical.

- [ ] **Step 4: Commit**

```
git add src/app/layout.tsx src/app/page.tsx
git commit -m "refactor(tokens): migrate app shell and login to color tokens"
```

---

## Task 6: Skeletons (neutrals only; keep decorative gradient)

**Files:**
- Modify: `src/app/ui/skeletons.tsx`
- Modify: `src/app/ui/PatientTableSkeleton.tsx`

- [ ] **Step 1: `skeletons.tsx`** — map ONLY the neutral structure:
  - `bg-white` → `bg-surface`
  - `bg-gray-50` → `bg-surface-muted`
  - `bg-gray-100` → `bg-surface-sunken`
  - `bg-gray-200` → `bg-border` (gray-200 used as the shimmer block fill; map to the border token which aliases gray-200 — same color)
  - `border-gray-100` → `border-border` (gray-100→border token note: this changes gray-100→gray-200 border, a hair darker on skeleton edges; acceptable on a loader. If you'd rather be exact, leave literal — but prefer the token.)
  - `text-gray-900` (line 179) → `text-fg`
  - **LEAVE** `via-white` (line 3) as literal (part of the shimmer gradient).

- [ ] **Step 2: `PatientTableSkeleton.tsx`**
  - `bg-white` (line 16) → `bg-surface`
  - **LEAVE** the gradient classes (lines 12, 14): `from-green-200 via-blue-200 to-purple-200`, `from-purple-400 via-blue-400 to-green-300` — documented decorative exception.

- [ ] **Step 3: Build + visual check**

Run: `pnpm run build`, then `pnpm dev`, and reload `/pacientes` to catch the loading skeleton (throttle network in devtools if it flashes too fast). Confirm the skeleton + its colored shimmer animation look identical.

- [ ] **Step 4: Commit**

```
git add src/app/ui/skeletons.tsx src/app/ui/PatientTableSkeleton.tsx
git commit -m "refactor(tokens): migrate skeleton neutrals (keep decorative gradient)"
```

---

## Task 7: PDF colors

**Files:**
- Modify: `src/app/ui/pdfComponents.tsx`

- [ ] **Step 1: Import and use `pdfColors`**

Add the import after the existing imports:
```ts
import { pdfColors } from "./pdfColors";
```
Change the `headerBox` style (currently `borderColor: "#000"`):
```ts
  headerBox: {
    borderWidth: 1,
    borderColor: pdfColors.border,
    padding: 20,
    marginBottom: 10,
  },
```

- [ ] **Step 2: Build + visual check**

Run: `pnpm run build`, then `pnpm dev`. Generate one PDF of each type; confirm the header border still renders identically.

- [ ] **Step 3: Commit**

```
git add src/app/ui/pdfComponents.tsx
git commit -m "refactor(tokens): use pdfColors constant for PDF border"
```

---

## Task 8: Final verification + sweep + PR

- [ ] **Step 1: Confirm no stray hardcoded palette classes remain**

Run:
```
git grep -nE "(bg|text|border|ring|outline|divide|placeholder|from|via|to)-(gray|slate|red|green|blue|amber|teal|rose|violet|orange|cyan|purple)-[0-9]{2,3}" -- src/ ":!src/app/ui/skeletons.tsx" ":!src/app/ui/PatientTableSkeleton.tsx"
```
Expected: only the documented `buttons.tsx:91` slate exception. If anything else appears, migrate it per the mapping table and amend the relevant commit.

- [ ] **Step 2: Full build + lint**

Run: `pnpm run build && pnpm run lint`
Expected: build succeeds; lint shows only the pre-existing findings (no new errors).

- [ ] **Step 3: Full visual walkthrough**

Run `pnpm dev`. Walk every screen from Task 0's baseline and confirm the app looks identical (except the intentional delete-button/pending-badge red-500→red-600 deepening).

- [ ] **Step 4: Push + PR**

```
git push -u origin feature/color-tokens
gh pr create --base development --title "refactor: tokenize colors into a semantic design-token system" --body "<summary per the spec: tokens defined in @theme aliasing existing palette; zero visual change except danger red-500->red-600 normalization; sidebar + chart tokens defined for upcoming features; pdfColors for PDF; skeleton gradient + one slate button left as documented exceptions. Spec + plan links.>"
```

- [ ] **Step 5: Vercel preview check, then done.**

---

## Out of scope (reaffirmed)

- No visual redesign (amber stays); no dark mode.
- No spacing/typography/radius tokens (colors only).
- The shadcn-ish `border-input`/`bg-background`/`ring-ring`/`text-muted-foreground` utility names in the dialog form inputs are undefined leftovers, not palette colors — left alone.
- Building the actual sidebar/statistics UI (separate sub-projects; this only defines their tokens).