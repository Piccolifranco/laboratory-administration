# Color Tokenization — Design

**Date:** 2026-05-29
**Branch:** `feature/color-tokens` (off `development`)
**Status:** Design approved, pending implementation plan

## Goal

Replace hardcoded color classes/values throughout the app with a semantic design-token system, and extend the palette with the tokens the upcoming **sidebar** and **statistics** features will need. Establishing tokens now (before those features) means they're built on tokens from the start instead of being retrofitted.

This is a **foundation** task: it changes how colors are referenced, with **zero intended visual change** to the existing app (tokens alias the colors already in use).

## Context (audit findings)

~180 color usages across ~15 files, all Tailwind utility classes. The only raw hex anywhere is the PDF header border `#000` in [src/app/ui/pdfComponents.tsx](../../../src/app/ui/pdfComponents.tsx). Implicit semantic roles already in use:

- Primary/brand action → `amber-500/600` (all primary buttons)
- Danger → `red-600/700` (errors, delete)
- Success → `green-500` ("paid" status)
- Accent/focus → `blue-500/600` (focus rings, link, checkbox)
- Neutrals → `gray-50…900`, `slate-200/300`, `white`, `black`
- Dark structural → `gray-900/800` (header bar, login/dark buttons)
- Decorative → skeleton loading gradient (`green/blue/purple-200/400`)

## Decisions (locked)

- **Semantic-role tokens** (not literal palette naming).
- **Keep amber** as the primary/brand color (no rebrand). Pure refactor.
- **No dark mode** (single theme; YAGNI).
- **Design the extended palette now** (sidebar + chart tokens), per user request.
- **Leave the skeleton decorative gradient as literal classes** (not a semantic color).

## Mechanism

Tailwind 4 `@theme` block in [src/app/globals.css](../../../src/app/globals.css). Semantic tokens **alias the existing Tailwind palette CSS variables**, preserving exact current colors and giving a single swap-point per role:

```css
@import "tailwindcss";

@theme {
  /* brand */
  --color-primary: var(--color-amber-600);
  --color-primary-hover: var(--color-amber-500);
  --color-primary-foreground: var(--color-white);

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

  /* text */
  --color-text: var(--color-gray-900);
  --color-text-muted: var(--color-gray-700);
  --color-text-subtle: var(--color-gray-500);
  --color-text-inverse: var(--color-white);

  /* borders */
  --color-border: var(--color-gray-200);
  --color-border-strong: var(--color-gray-300);

  /* overlay (modal backdrop, used as bg-overlay/75) */
  --color-overlay: var(--color-gray-500);

  /* sidebar (provisional; may adjust when the sidebar is built) */
  --color-sidebar: var(--color-gray-900);
  --color-sidebar-text: var(--color-gray-300);
  --color-sidebar-text-active: var(--color-white);
  --color-sidebar-item-hover: var(--color-gray-800);
  --color-sidebar-item-active: var(--color-amber-600);

  /* categorical chart palette (provisional; refine when building charts) */
  --color-chart-1: var(--color-amber-600);
  --color-chart-2: var(--color-blue-600);
  --color-chart-3: var(--color-teal-500);
  --color-chart-4: var(--color-rose-500);
  --color-chart-5: var(--color-violet-500);
  --color-chart-6: var(--color-green-600);
  --color-chart-7: var(--color-orange-500);
  --color-chart-8: var(--color-cyan-600);
}
```

These auto-generate utilities (`bg-primary`, `text-text-muted`, `border-border`, `bg-chart-1`, etc.). Chart tokens are also usable inline via `var(--color-chart-1)` when feeding a charting lib.

## Token reference

### Core (replaces existing — zero visual change)

| Token | Aliases | Replaces in code |
|---|---|---|
| `primary` | amber-600 | `bg-amber-600` |
| `primary-hover` | amber-500 | `hover:bg-amber-500` |
| `primary-foreground` | white | `text-white` on primary buttons |
| `accent` | blue-600 | links, `text-blue-600`, `ring-blue-600`, `outline-blue-600` |
| `accent-ring` | blue-500 | `ring-blue-500` |
| `danger` | red-600 | `text-red-600` errors |
| `danger-hover` | red-700 | `hover:bg-red-700` |
| `success` | green-500 | `bg-green-500` ("paid") |
| `surface` | white | `bg-white` panels |
| `surface-muted` | gray-50 | `bg-gray-50` stripes |
| `surface-sunken` | gray-100 | `bg-gray-100` headers/hover |
| `surface-inverse` | gray-900 | `bg-gray-900` header/buttons |
| `surface-inverse-hover` | gray-800 | `hover:bg-gray-800` |
| `text` | gray-900 | `text-gray-900` |
| `text-muted` | gray-700 | `text-gray-700` |
| `text-subtle` | gray-500 | `text-gray-500` |
| `text-inverse` | white | `text-white` on dark |
| `border` | gray-200 | `border-gray-200`, `divide-gray-200` |
| `border-strong` | gray-300 | `border-gray-300` inputs |

**Status mapping note:** the "pending" status currently uses `red-500`. It will map to `danger`. "paid" → `success`. No new warning token (YAGNI).

**Edge cases:**
- `bg-gray-500/75` (modal backdrop in Dialog.tsx) → `bg-overlay/75` via the `--color-overlay` token (defined above).
- `slate-200/300` + `text-black` (one secondary button in buttons.tsx:91) → **left as literal classes**, a documented exception. Remapping slate→gray would be a (tiny) visual change, and this spec promises zero visual change. It'll get normalized when we touch buttons during the sidebar/responsive work.

### New (provisional)

Sidebar + chart tokens as in the `@theme` block above. Marked provisional: the sidebar tokens may be tuned when the sidebar layout is designed (#2), and the chart palette refined when charts are built (#4). They are defined now so those features start on tokens.

### react-pdf

react-pdf cannot read CSS variables (not DOM). Create [src/app/ui/pdfColors.ts](../../../src/app/ui/pdfColors.ts) exporting plain hex constants:

```ts
export const pdfColors = {
  border: "#000000",
  text: "#000000",
} as const;
```

[pdfComponents.tsx](../../../src/app/ui/pdfComponents.tsx) uses `pdfColors.border` instead of the literal `"#000"`. Keeps PDF colors named/centralized for future changes. (The PDF is otherwise monochrome black-on-white.)

## Migration approach

Mechanical, file-by-file: for each file in the audit, replace hardcoded color utility classes with their token equivalents per the reference table. Verify with `pnpm run build` + a visual spot-check of each screen. Because tokens alias the exact current colors, the app should look identical.

**Files in scope** (from the audit): `layout.tsx`, `page.tsx`, `ui/Dialog.tsx`, `ui/buttons.tsx`, `pacientes/pacientes-component.tsx`, `ui/PatientTableSkeleton.tsx`, `paciente/[id]/paciente-component.tsx`, `ui/NewPacienteDialog/NewPacienteDialogBody.tsx`, `ui/search.tsx`, `ui/EditPacienteDialog/EditPacienteDialogBody.tsx`, `ui/status.tsx`, `ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx`, `ui/Table.tsx`, `ui/skeletons.tsx`, plus `globals.css` (token definitions) and `pdfComponents.tsx` (pdfColors).

**Explicitly left alone:** the skeleton decorative gradient classes (`from/via/to-green/blue/purple-*`, `via-white`) in `PatientTableSkeleton.tsx` / `skeletons.tsx`.

## Verification

No automated tests. Verification is visual:
1. `pnpm run build` succeeds.
2. Walk each screen (login, patient list + table + skeletons, patient detail, dialogs, search, status badges) and confirm colors look identical to before.
3. Generate one PDF and confirm the header border still renders.

## Done criteria

1. `@theme` token block defined in `globals.css`.
2. All in-scope files use token utility classes; no hardcoded palette classes remain except the documented decorative-gradient exception.
3. `pdfColors.ts` exists and is used by the PDF border.
4. App is visually unchanged; `pnpm build` passes.
5. Sidebar + chart tokens defined and ready for #2/#4.

## Non-goals

- No visual redesign / rebrand (amber stays).
- No dark mode.
- No new UI (sidebar/statistics are separate sub-projects; this only defines their tokens).
- No tokenizing the decorative skeleton gradient.
- No spacing/typography/radius tokens — colors only (could be a future foundation pass).