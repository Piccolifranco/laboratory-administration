# Dependency Upgrade — Design

**Date:** 2026-05-28
**Branch:** `feature/deps-upgrade` (off `development`)
**Status:** Design approved, pending implementation plan

## Goal

Bring every dependency in the laboratory-administration project up to a current, supported, vulnerability-free version, while preserving the existing behavior of the app. No feature work in this branch. No package-manager change (that's the next sub-project). All work performed under `npm` so a single fresh install on a vulnerable tree is never required.

## Scope

**In scope:**
- Bump all production and dev dependencies to current stable versions, *except* TypeScript (hold at 5.x latest — TypeScript 6.0 is too new as of 2026-05-28).
- Remove dead dependencies that are not imported anywhere in `src/`.
- Replace `uniqid` (used once) with the standard `crypto.randomUUID()`.
- Migrate ESLint to v9 flat config (required by the chain).
- Migrate Tailwind to v4 (config moves to CSS, PostCSS plugin renamed).
- Run the official Next.js codemod to handle Next 14 → 16 breaking changes (async route params, caching defaults).

**Out of scope:**
- Switching from npm to pnpm. Handled in the next sub-project.
- Adding the doctor's signature to PDFs.
- Building the backend.
- Any refactoring of the patient/visit data model.
- Any refactoring of the localStorage-based auth.

## Findings from the current tree

### Vulnerabilities (`npm audit`)

| Package | Severity | Path | Fix |
|---|---|---|---|
| `@next/eslint-plugin-next` (via `glob`) | HIGH | transitive through `eslint-config-next` 14.2.4 | requires `eslint-config-next` 16, which requires Next 16 |
| `@typescript-eslint/parser` / `typescript-estree` (via `minimatch`) | HIGH | dev | bump to current versions |
| `@supabase/auth-js` (path routing) | LOW | transitive through `@supabase/supabase-js` 2.43.5 | bump SDK to ≥2.106 |
| `@babel/runtime`, `ajv`, `brace-expansion` | MODERATE | various transitive | resolved by the cascade of the above bumps |

### Dead dependencies (in `package.json`, never imported in `src/`)

- `yup`
- `zod`
- `@hookform/resolvers`
- `date-fns-tz`

### Single-use dependency replaceable with platform standard

- `uniqid` — used exactly once at [src/app/paciente/\[id\]/paciente-component.tsx:33](../../../src/app/paciente/[id]/paciente-component.tsx#L33). Replace with `crypto.randomUUID()`. Also remove `@types/uniqid`.

### Major-version bumps applied

| Package | From | To | Reason |
|---|---|---|---|
| `next` | 14.2.22 | 16.x | Security (CVE chain), framework currency |
| `react` / `react-dom` | 18.x | 19.x | Required peer for Next 16 |
| `eslint` | 8.x | 10.x (flat config) | Security, upstream EOL; v9 is already in maintenance |
| `eslint-config-next` | 14.2.4 | 16.x | Tracks Next |
| `tailwindcss` | 3.4.1 | 4.x | Currency; migration is small for this codebase |
| `@react-pdf/renderer` | 3.4.4 | 4.x | We're about to add a signature here — want clean v4 baseline |
| `date-fns` | 3.6.0 | 4.x | Currency; only `format` and `toDate` used, signatures unchanged |
| `@hookform/resolvers` | 3.3.4 | — | **Removed** (dead dep) |
| `react-toastify` | 10.0.5 | 11.x | Currency |
| `react-infinite-scroll-component` | 6.1.0 | 7.x | Currency |
| `zustand` | 4.5.2 | 5.x | Currency |
| `supabase` (CLI) | 1.176.10 | 2.x | Dev tooling currency |

### Held intentionally

- `typescript` — stays on the 5.x line. Bump 5.8.3 → **5.9.3** (latest 5.x). TypeScript 6.0.3 is brand-new as of 2026-05-28; deferring until it has soaked. `eslint-config-next@16` requires only `typescript >=3.3.1`, so 5.9 is comfortably supported.

## Upgrade order (one commit per step)

The order is chosen so that any regression introduced at step N is clearly attributable to that step. Earlier steps are smaller and isolating.

### Step 1 — Dead-dep cleanup

- Remove `yup`, `zod`, `@hookform/resolvers`, `date-fns-tz`, `uniqid`, `@types/uniqid` from `package.json`.
- Replace the `uniqid()` call in `paciente-component.tsx` with `crypto.randomUUID()`.
- Run `npm install` to regenerate the lockfile.
- Verify: `npm run build` succeeds.
- Commit.

### Step 2 — Next 14 → 16 + React 18 → 19

These are coupled: Next 16 declares React 19 as a peer dependency.

- Run `npx @next/codemod@latest upgrade latest`. Accept the codemod's transformations.
- Hand-fix anything the codemod misses. **Known hotspot:** dynamic route `params` and `searchParams` became `Promise<{...}>` in Next 15+. The codebase has `src/app/paciente/[id]/page.tsx`; verify it `await`s params.
- Update `next.config.*` if the codemod migrated it.
- Verify: `npm run build`, `npm run dev`. Smoke test login → patient list → patient detail → "Crear visita" → generate PDF (Pap, Cepillado, Biopsia each).
- Commit.

### Step 3 — ESLint 8 → 10 flat config + eslint-config-next 16

- Replace `.eslintrc.json` (if present) with `eslint.config.mjs` using the `next/core-web-vitals` flat-config preset.
- Bump `eslint` to 10.x (current line; v9 is in maintenance per npm dist-tags) and `eslint-config-next` to 16.x. This clears the HIGH-severity audit findings on the typescript-eslint + @next/eslint-plugin-next chain.
- Run `npm run lint`. Fix any new findings.
- Commit.

### Step 4 — Tailwind 3 → 4

- Run `npx @tailwindcss/upgrade@latest`. Accept the migrations.
- Hand-fix `bg-opacity-75` → `bg-gray-500/75` in [src/app/ui/Dialog.tsx:40](../../../src/app/ui/Dialog.tsx#L40).
- Update [src/app/globals.css](../../../src/app/globals.css) to v4 syntax (`@import "tailwindcss";` replacing the three `@tailwind` directives).
- Switch PostCSS plugin to `@tailwindcss/postcss` in `postcss.config.*`.
- Verify: `npm run dev`, visual check of every page (login, patient list, patient detail, dialogs).
- Commit.

### Step 5 — date-fns 3 → 4

- Bump `date-fns`. `date-fns-tz` already removed in Step 1.
- The codebase only imports `format` and `toDate`; signatures unchanged in v4. Verify build and a date renders correctly on the patient list.
- Commit.

### Step 6 — @react-pdf/renderer 3 → 4

- Bump `@react-pdf/renderer`.
- Visual diff: generate one PDF of each report type (Pap, Cepillado, Biopsia) before and after, compare side-by-side. Pay attention to font rendering, page breaks, and the absolutely-positioned microscope logo at the bottom-right.
- Commit.

### Step 7 — Long-tail bumps

Single commit, split only if one of them breaks:

- `@supabase/supabase-js` → 2.106.x (re-test auth thoroughly: login, token persistence in localStorage, session refresh on reload).
- `zustand` → 5.x — review [src/app/zuztand/store.js](../../../src/app/zuztand/store.js) for v5 API changes.
- `react-toastify` → 11.x — confirm toasts still appear on login success/failure.
- `react-infinite-scroll-component` → 7.x — confirm patient list still loads more pages on scroll.
- `@headlessui/react`, `@heroicons/react`, `react-icons` — minor bumps, visual smoke.
- `supabase` CLI → 2.x (dev only).
- `postcss` minor.
- `typescript` → 5.9.3.

### Step 8 — Verify clean

- `npm audit` → no HIGH or MODERATE.
- `npm run build` succeeds.
- `npm run lint` succeeds.
- Manual smoke pass on the full critical path.
- Open PR `feature/deps-upgrade` → `development`. Confirm Vercel preview build succeeds.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Next 16 async params break the `[id]` route silently (renders empty) | High if codemod missed it, Low otherwise | Verify codemod output; manual review of `paciente/[id]/page.tsx`; smoke-test patient detail page |
| Tailwind v4 slash-color syntax renders differently than v3 `bg-opacity-*` | Low | Visual eyeball on the dialog backdrop is sufficient |
| @react-pdf/renderer v4 font/layout regression | Medium | Side-by-side PDF compare for all three report types |
| Supabase SDK 2.43 → 2.106 changes localStorage token handling | Low | Manual login + reload test; verify `localStorage.accessToken` still present |
| ESLint flat config preset for `next/core-web-vitals` not yet stable | Low | Documented; well-trodden path by this point |

## Done criteria

1. All seven step-commits land on `feature/deps-upgrade`.
2. `npm audit` shows zero HIGH and zero MODERATE findings.
3. `npm run build` and `npm run lint` succeed locally.
4. Manual smoke test passes on the critical path (login, list, detail, create visit, generate all three PDF report types).
5. PR to `development` opens, Vercel preview build succeeds.
6. README still reflects npm commands (the pnpm switch is a separate PR).

## Non-goals (explicit)

- No new features.
- No behavior changes the user can observe (other than fixed bugs that incidentally surface).
- No refactoring of the `visitas`-as-JSON-array schema, the localStorage auth, or any UI structure.
- No package-manager change.
