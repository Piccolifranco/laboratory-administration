# Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) — many tasks require visual inspection of UI/PDF rendering, codemod-output review, and judgment calls that aren't safe to dispatch to a fresh subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all dependencies of the laboratory-administration project up to current, vulnerability-free versions while preserving observable app behavior.

**Architecture:** Eight sequential tasks, each one commit. Order chosen so a regression at task N is attributable to that task. All work on `feature/deps-upgrade` (already cut off `development`). Package manager stays npm throughout — the pnpm migration is a separate, later PR.

**Tech Stack:** Next.js (14.2.22 → 16.x), React (18 → 19), TypeScript (5.8.3 → 5.9.3), Tailwind CSS (3 → 4), ESLint (8 → 10, flat config), @react-pdf/renderer (3 → 4), date-fns (3 → 4), Supabase JS SDK, zustand, react-toastify, react-infinite-scroll-component.

**Verification model:** This project has no test suite. Verification at every task is: (a) `npm run build` succeeds, (b) `npm run dev` starts cleanly, (c) the smoke-test critical path passes manually, (d) `npm audit` is consulted at the end. The smoke-test critical path is defined once in Task 0 and referenced by name in every later task.

---

## Task 0: Pre-flight — capture starting state

**Files:** none modified. This task only records the baseline so we can compare later.

**Smoke-test critical path** (referenced from every later task):
1. `npm run dev` starts without errors.
2. Visit `/`, log in with valid credentials. Toast appears, redirected to `/pacientes`.
3. The patient list renders. Scroll triggers another page load (infinite scroll).
4. The search bar filters patients (debounced).
5. Click into a patient. Their detail page renders with their list of visitas.
6. Click "Crear visita". The dialog opens. Close it.
7. Generate a PDF for an existing visit of each report type: **Pap**, **Cepillado**, **Biopsia**. All three must render visually identical to the saved reference PDFs (see step 4 below).

- [ ] **Step 1: Confirm branch and clean tree**

Run: `git status && git branch --show-current`
Expected:
```
On branch feature/deps-upgrade
nothing to commit, working tree clean
feature/deps-upgrade
```

- [ ] **Step 2: Confirm starting Node + npm versions and record them**

Run: `node --version && npm --version`
Expected: `v24.x.x` or newer, `npm 10.x` or newer.
If Node is older than v20, stop and install Node 20 LTS or 24 before proceeding (Next 16 requires Node 18.18+, but Node 24 is what's already on this machine).

- [ ] **Step 3: Record baseline `npm audit` for later comparison**

Run: `npm audit --json > /tmp/audit-before.json 2>&1; npm audit | head -5`
Expected (approximate):
```
# npm audit report
...
N vulnerabilities (X moderate, Y high)
```
Save the count for comparison after Task 8.

- [ ] **Step 4: Generate and save reference PDFs for each report type**

This is the visual-baseline for the @react-pdf/renderer 3→4 bump in Task 6.

- Start `npm run dev`.
- Log in, navigate to a patient that has at least one of each report type (Pap, Cepillado, Biopsia). If no single patient covers all three, use three different patients.
- Click "Descargar PDF" for one visit of each type.
- Save the three downloaded PDFs to `/tmp/baseline-pap.pdf`, `/tmp/baseline-cepillado.pdf`, `/tmp/baseline-biopsia.pdf`.
- Stop `npm run dev`.

If the data does not include all three report types, document which ones are missing and skip the comparison for those — but flag it in the Task 6 verification.

- [ ] **Step 5: No commit** (Task 0 produces no file changes)

---

## Task 1: Dead-dep cleanup + uniqid → crypto.randomUUID()

**Why this task is first:** It is the smallest change with the largest noise-reduction effect. Removing five unused packages narrows the surface area of every later upgrade step (fewer transitive resolutions, fewer peer-dep warnings, smaller `node_modules`).

**Files:**
- Modify: `package.json` (remove 6 dependency entries)
- Modify: `src/app/paciente/[id]/paciente-component.tsx:12,33` (replace `uniqid` usage)

- [ ] **Step 1: Verify dead deps truly have no imports**

Run from project root:
```
git grep -nE "from ['\"](yup|zod|date-fns-tz|@hookform/resolvers)['\"]" -- src/ || echo "no matches found"
git grep -n "uniqid" -- src/
```
Expected:
- First command: `no matches found`
- Second command: one match, in `src/app/paciente/[id]/paciente-component.tsx`

If either is unexpected, stop and update the plan with the new findings before proceeding.

- [ ] **Step 2: Replace `uniqid` import and usage in paciente-component.tsx**

File: `src/app/paciente/[id]/paciente-component.tsx`

Change line 12 from:
```ts
import uniqid from "uniqid";
```
to: **delete the line entirely**.

Change line 33 from:
```ts
const visitaId = uniqid();
```
to:
```ts
const visitaId = crypto.randomUUID();
```

`crypto.randomUUID()` is available in the browser globals (Node 19+ also exposes it globally) — no import needed. The only caller passes the ID to `updatePaciente` for storage in Supabase; the format change from `uniqid`'s base-36 timestamp to a UUIDv4 string does not affect storage or lookups (the `visita.id` is only used for find-by-id within an array, which works for any string format).

- [ ] **Step 3: Remove the five dead deps from package.json**

Run:
```
npm uninstall yup zod @hookform/resolvers date-fns-tz uniqid @types/uniqid
```
Expected: command exits 0. `package.json` no longer contains any of: `yup`, `zod`, `@hookform/resolvers`, `date-fns-tz`, `uniqid`, `@types/uniqid`. `package-lock.json` regenerates.

- [ ] **Step 4: Verify build still passes**

Run: `npm run build`
Expected: build succeeds, no missing-module errors. Note that `next.config.mjs` has `typescript.ignoreBuildErrors: true` set, so type errors are not surfaced by `npm run build`. Also run:
```
npx tsc --noEmit
```
Expected: no errors related to the removed packages or the `uniqid` replacement. (Pre-existing type errors elsewhere are out of scope — record them but do not fix in this task.)

- [ ] **Step 5: Smoke-test the changed code path**

Run: `npm run dev`. Log in, navigate to a patient, click "Crear visita", fill the form, submit. Confirm the new visit appears with a UUIDv4-looking id in the URL bar / inspector if you can inspect the writes (open Supabase dashboard or read it back). The exact id format doesn't matter — only that submission succeeds without runtime error.

- [ ] **Step 6: Commit**

```
git add package.json package-lock.json src/app/paciente/[id]/paciente-component.tsx
git commit -m "chore: drop dead deps and replace uniqid with crypto.randomUUID

Removes yup, zod, @hookform/resolvers, date-fns-tz, uniqid, and
@types/uniqid -- none were imported in src/. Replaces the single
uniqid() call in paciente-component with crypto.randomUUID(), a
platform standard available on Node 19+ and all modern browsers.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Next 14 → 16 + React 18 → 19

**Why this task is second:** It is the largest single change. Doing it on a freshly-cleaned tree (Task 1 just finished) minimizes the chance that codemod confusion is caused by dead-dep noise.

**Files:**
- Modify: `package.json` (next, react, react-dom, @types/react, @types/react-dom)
- Modify: `src/app/paciente/[id]/page.tsx` (async params/searchParams)
- Possibly modify: `next.config.mjs`, any caching-related code (codemod-driven)

- [ ] **Step 1: Run the official Next.js codemod**

Run:
```
npx -y @next/codemod@latest upgrade latest
```
Follow the prompts. Accept all transformations. The codemod will:
- Bump `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom` in `package.json`.
- Apply the `next-async-request-api` codemod (params/searchParams → Promise).
- Apply caching default codemods if applicable.

Expected: command exits 0 with a summary of files modified.

- [ ] **Step 2: Manually verify the codemod handled the dynamic route correctly**

File: `src/app/paciente/[id]/page.tsx`

The pre-upgrade file (lines 9–24) was:
```ts
export default async function PacientePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { createVisita: string };
}) {
  const pacienteId = params.id;
  const fetchedPaciente = await supabase
    .from("pacientes")
    .select()
    .eq("id", pacienteId)
    .single();
  const paciente = fetchedPaciente.data;
  const visitas = fetchedPaciente.data?.visitas;
  const modalOpen = searchParams.createVisita === "true";
```

The post-upgrade file must look like:
```ts
export default async function PacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ createVisita: string }>;
}) {
  const { id: pacienteId } = await params;
  const { createVisita } = await searchParams;
  const fetchedPaciente = await supabase
    .from("pacientes")
    .select()
    .eq("id", pacienteId)
    .single();
  const paciente = fetchedPaciente.data;
  const visitas = fetchedPaciente.data?.visitas;
  const modalOpen = createVisita === "true";
```

If the codemod did this — proceed. If not, hand-edit the file to match exactly the above.

- [ ] **Step 3: Search for any other route files that read params or searchParams**

Run:
```
git grep -nE "(^|[^a-zA-Z])(params|searchParams)([^a-zA-Z]|$)" -- "src/app/**/page.tsx" "src/app/**/layout.tsx"
```
Expected: only the `[id]/page.tsx` route should show usage. If other routes appear, repeat Step 2's pattern for each.

- [ ] **Step 4: Reinstall and build**

Run:
```
rm -rf node_modules
npm install
npm run build
```
Expected: install completes (may show some peer-warning noise — record but do not act unless install fails). Build succeeds.

If build fails, the most common cause at this jump is: a `'use client'` boundary that previously relied on synchronous params now being silently broken because `'use client'` components cannot await the Promise — server components must `await` before passing the resolved values to client components. The codebase's pattern already does this (server `page.tsx` resolves and passes plain data to client `PacienteComponent`), so this should be fine, but verify.

- [ ] **Step 5: Smoke-test the critical path** (from Task 0)

Run `npm run dev`. Execute steps 1–6 of the critical path. For step 7 (PDF generation), generate ONE PDF of any single type — full PDF comparison comes in Task 6 after `@react-pdf/renderer` itself is upgraded.

Pay special attention to:
- Patient detail page renders correctly (this is the `[id]` route we just modified).
- The "Crear visita" query-param flow still works (`?createVisita=true` opens the dialog).

- [ ] **Step 6: Commit**

```
git add -A
git commit -m "feat: upgrade Next.js 14 to 16 and React 18 to 19

Runs the @next/codemod upgrade tool. Converts the [id] dynamic route's
params/searchParams to the awaited Promise form required by Next 15+.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: ESLint 8 → 10 (flat config) + eslint-config-next 16

**Why this task is third:** Now that Next 16 is in, `eslint-config-next@16` is the right pairing. This step clears the HIGH-severity audit findings on the typescript-eslint and @next/eslint-plugin-next chains.

**Files:**
- Delete: `.eslintrc.json`
- Create: `eslint.config.mjs`
- Modify: `package.json` (eslint, eslint-config-next)

- [ ] **Step 1: Delete the legacy ESLint config**

Run: `rm .eslintrc.json`

- [ ] **Step 2: Install ESLint 10 and the current eslint-config-next**

Run:
```
npm install --save-dev eslint@latest eslint-config-next@latest
```
Expected: both pulled in at their latest stable; check `package.json` shows `eslint` at `10.x` and `eslint-config-next` at `16.x`.

- [ ] **Step 3: Create the flat-config file**

Create file `eslint.config.mjs` with the following contents:
```js
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals"),
];
```

This uses `@eslint/eslintrc`'s `FlatCompat` shim to wrap `next/core-web-vitals` as a flat-config block. `eslint-config-next@16` ships a native flat-config export at `eslint-config-next/flat`, but `FlatCompat` is the path with the broadest compatibility if `eslint-config-next/flat` is missing or renamed at the time of execution. If `eslint-config-next` exposes a flat preset directly, switch to:
```js
import next from "eslint-config-next/flat";
export default [next];
```

Verify which path applies by running:
```
node -e "console.log(Object.keys(require('eslint-config-next/package.json').exports || {}))"
```
If the output contains `"./flat"`, use the direct-import form. Otherwise use `FlatCompat`.

- [ ] **Step 4: Install @eslint/eslintrc only if FlatCompat path is taken**

If using the `FlatCompat` form, run:
```
npm install --save-dev @eslint/eslintrc
```

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: completes. Any new findings are most likely to be:
- `react/no-unescaped-entities` warnings on Spanish text containing apostrophes.
- `@next/next/no-img-element` warnings — there are existing `<img>` usages that should ideally be `<Image>` but are not in scope for this branch.
- Warnings on unused variables in form-related files where dead-dep imports used to live.

For each finding, decide:
- **Fix inline** if the change is one line and clearly correct.
- **Disable rule for that file** with a comment if the lint rule is not appropriate for the existing code (e.g., `@next/next/no-img-element` in PDF-related code).
- **Leave** if it is pre-existing tech debt not caused by this upgrade.

The goal is not zero warnings; it is "lint runs to completion with no new errors caused by this upgrade."

- [ ] **Step 6: Run build to confirm nothing regressed**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```
git add -A
git commit -m "feat: migrate ESLint to v10 flat config

Replaces .eslintrc.json with eslint.config.mjs using the
next/core-web-vitals preset. Bumps eslint to 10.x and eslint-config-next
to 16.x. Clears the HIGH-severity audit findings on the typescript-eslint
and @next/eslint-plugin-next chains.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Tailwind 3 → 4

**Why this task is fourth:** Tailwind 4's PostCSS plugin and CSS-first config are independent of the Next/React/ESLint chain we just upgraded, but doing it after those means any Tailwind-related build error is unambiguously Tailwind's.

**Files:**
- Modify: `package.json` (tailwindcss, add @tailwindcss/postcss)
- Modify: `postcss.config.mjs` (plugin rename)
- Modify: `src/app/globals.css` (v3 directives → v4 single @import)
- Modify: `src/app/ui/Dialog.tsx:40` (`bg-opacity-75` → slash syntax)
- Possibly modify: `tailwind.config.ts` (the upgrade tool may migrate to a CSS `@theme` block, but the config is so minimal it may be left alone)

- [ ] **Step 1: Run the official Tailwind upgrade tool**

Run:
```
npx -y @tailwindcss/upgrade@latest
```
Follow the prompts. Accept transformations. The tool will:
- Update `package.json` to install `tailwindcss@^4` and `@tailwindcss/postcss`.
- Rewrite `postcss.config.mjs` to use `@tailwindcss/postcss` instead of `tailwindcss`.
- Convert `src/app/globals.css` from the three `@tailwind base/components/utilities;` directives to a single `@import "tailwindcss";`.
- Possibly migrate `tailwind.config.ts` content into a `@theme` block in CSS, or leave the config file as-is using the v3-compat path.

- [ ] **Step 2: Verify postcss config is correct**

File: `postcss.config.mjs` — must contain something equivalent to:
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

If the upgrade tool left it pointing at `tailwindcss: {}`, hand-edit it to the above.

- [ ] **Step 3: Verify globals.css uses v4 syntax**

File: `src/app/globals.css` — must start with:
```css
@import "tailwindcss";
```
(not the three `@tailwind` directives.)

Keep the `.overflow-hidden { overflow: hidden !important; }` rule that was already there.

- [ ] **Step 4: Hand-fix the bg-opacity-75 usage**

File: `src/app/ui/Dialog.tsx:40`

Change:
```tsx
<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
```
to:
```tsx
<div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
```

This is the modal backdrop. In v4, `bg-opacity-*` utilities still work via the v3-compat layer, but the slash syntax (`bg-{color}/{opacity}`) is the canonical v4 form. Doing this explicitly avoids relying on the compat layer for a single utility.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: build succeeds. If it fails with a PostCSS error about `tailwindcss` being a plugin, return to Step 2 — the postcss config did not get updated.

- [ ] **Step 6: Visual smoke-test**

Run `npm run dev`. Walk through the critical path (Task 0). Pay specific visual attention to:
- The modal backdrop (the `bg-gray-500/75` div) — should be a translucent gray overlay, not jet-black or fully opaque.
- The login page background and the heading bar at the top of every page (which uses `bg-gray-900`).
- The gradient utilities (`bg-gradient-radial`, `bg-gradient-conic`) — verify they still work if used anywhere. (Grep first: `git grep -nE "gradient-radial|gradient-conic" -- src/`. If unused, no action.)
- Patient table row hovers and the search-bar focus ring.

- [ ] **Step 7: Commit**

```
git add -A
git commit -m "feat: migrate Tailwind CSS 3 to 4

Runs @tailwindcss/upgrade; switches PostCSS plugin to
@tailwindcss/postcss; converts globals.css to the single @import
'tailwindcss' form; replaces the one bg-opacity-75 usage with the
v4 slash syntax (bg-gray-500/75).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: date-fns 3 → 4

**Files:**
- Modify: `package.json` (date-fns)

- [ ] **Step 1: Bump date-fns**

Run: `npm install date-fns@latest`
Expected: `package.json` shows `date-fns` at `^4.x`.

- [ ] **Step 2: Verify the only used functions still have compatible signatures**

Confirm imports are still valid:
```
npx -y grep -rn "from ['\"]date-fns['\"]" src/
```
Expected: four files import `format` (and one also imports `toDate`). Both functions have identical signatures in v4 vs v3 for our usage (passing a `Date` and a format string).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Smoke-test date rendering**

Run `npm run dev`. Navigate to a patient detail page that has at least one visit. The visit list must show dates formatted as `dd/MM/yyyy` (the format used in `pdfComponents.tsx` and `paciente-component.tsx`). If dates render as "Invalid Date" or as a different format, stop and investigate.

- [ ] **Step 5: Commit**

```
git add package.json package-lock.json
git commit -m "feat: upgrade date-fns 3 to 4

Only format() and toDate() are used; signatures unchanged in v4.
date-fns-tz was already removed in the dead-dep cleanup (Task 1).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: @react-pdf/renderer 3 → 4

**Why this task is sixth (not earlier):** The signature feature (next sub-project) will be built on this file, so a clean v4 baseline is more valuable than minimizing per-PR risk. We isolate the bump in its own commit so any rendering regression is unambiguously attributable.

**Files:**
- Modify: `package.json` (@react-pdf/renderer)

- [ ] **Step 1: Bump the package**

Run: `npm install @react-pdf/renderer@latest`
Expected: `package.json` shows `@react-pdf/renderer` at `^4.x`.

- [ ] **Step 2: Verify imports still resolve**

Run:
```
git grep -n "from ['\"]@react-pdf/renderer['\"]" -- src/
```
Expected: only `src/app/ui/pdfComponents.tsx` and `src/app/ui/DocumentoPDF.tsx` import from the package, using `Document`, `Page`, `Text`, `View`, `StyleSheet`, `Svg`, `Path`, `Image`. All these are stable v3 → v4 exports.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Side-by-side PDF visual diff**

Run `npm run dev`. For each report type (Pap, Cepillado, Biopsia), generate a PDF using the *same patient and visit* as the baseline PDFs saved in Task 0 Step 4. Save them to `/tmp/post-upgrade-pap.pdf`, `/tmp/post-upgrade-cepillado.pdf`, `/tmp/post-upgrade-biopsia.pdf`.

Open each pair side-by-side (any PDF viewer). Look for:
- Font rendering: weight, size, kerning.
- Page breaks: same content on the same page.
- The absolutely-positioned microscope-logo image at bottom-right of every page.
- Table-like flex rows for patient details (nombre/edad, doctor/protocolo, etc.).

If anything visibly differs, document the difference. Some minor regressions (e.g., subpixel font hinting changes) may be acceptable. A major regression (logo missing, page break in wrong place, text overflowing) is a stop-and-investigate condition.

If a baseline PDF for a given report type was missing in Task 0, skip that comparison and note the gap.

- [ ] **Step 5: Commit**

```
git add package.json package-lock.json
git commit -m "feat: upgrade @react-pdf/renderer 3 to 4

Visually validated against baseline PDFs for Pap, Cepillado, and
Biopsia report types. Gives us a clean v4 baseline before adding the
doctor's signature to pdfComponents.tsx in the next sub-project.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Long-tail bumps

**Files:** `package.json` only.

Each sub-step is one `npm install` followed by build + targeted smoke. Combine into ONE commit unless a specific package breaks — then split that one out.

- [ ] **Step 1: Bump Supabase JS SDK**

Run: `npm install @supabase/supabase-js@latest`
Smoke-test specifically:
- Log out (close tab or clear cookies).
- Log in via the login page. Confirm the toast appears and `/pacientes` loads.
- Reload `/pacientes` directly. Confirm it still loads (token persistence).
- Open browser devtools → Application → Local Storage → confirm `accessToken` is set.

The current code uses `supabase.auth.signInWithPassword` and `supabase.from(...).select()/insert()/update()/delete()` — all of which are stable across the 2.43 → 2.106 range. If any auth flow breaks, stop and inspect the Supabase SDK CHANGELOG for that version range.

- [ ] **Step 2: Bump zustand**

Run: `npm install zustand@latest`
Smoke-test: the zustand store at `src/app/zuztand/store.js` is a simple `create((set) => ({ ... }))` pattern. It is currently imported nowhere significant (verify: `git grep -n "useLoginStore" -- src/`). If unused, the bump is mechanical. If used, log in and confirm the store's `email` survives a reload.

- [ ] **Step 3: Bump react-toastify**

Run: `npm install react-toastify@latest`
Smoke-test: trigger a success toast (log in correctly) and a failure toast (log in with wrong password). Both must appear in their previous positions.

- [ ] **Step 4: Bump react-infinite-scroll-component**

Run: `npm install react-infinite-scroll-component@latest`
Smoke-test: open `/pacientes`, scroll to the bottom of the list, confirm a second batch loads. The hook `useInfinitePacientes` at `src/app/pacientes/useInfinitePacientes.ts` is the integration point; verify no console errors.

- [ ] **Step 5: Bump the icon and headless-ui libraries**

Run:
```
npm install @headlessui/react@latest @heroicons/react@latest react-icons@latest
```
Smoke-test: dialogs still open and animate (headlessui), the microscope icon in the page header still renders (react-icons), and any heroicons usage still renders.

- [ ] **Step 6: Bump the Supabase CLI (dev tool)**

Run: `npm install --save-dev supabase@latest`
This is a dev-only tool for local Supabase development. No runtime smoke-test needed; verify only that `npx supabase --version` runs.

- [ ] **Step 7: Bump postcss and TypeScript**

Run:
```
npm install --save-dev postcss@latest typescript@5.9.3
```
Pin `typescript` to exactly `5.9.3` (the latest 5.x release) — TypeScript 6 is intentionally held back.

Build: `npm run build && npx tsc --noEmit`
Expected: both succeed.

- [ ] **Step 8: Bump use-debounce**

Run: `npm install use-debounce@latest`
Smoke-test: search the patient list — the debounce on the search input must still delay queries.

- [ ] **Step 9: Bump @react-pdf-renderer-already done in Task 6**

(skip — already at v4.)

- [ ] **Step 10: Bump react-hook-form**

Run: `npm install react-hook-form@latest`
Smoke-test: open the "Nuevo Paciente" or "Crear Visita" dialog, fill out a field, submit. Form should validate and submit as before.

- [ ] **Step 11: Build and full smoke-test**

Run: `npm run build && npm run dev`
Walk through the entire critical path from Task 0 once.

- [ ] **Step 12: Commit**

```
git add -A
git commit -m "feat: long-tail dependency bumps

Bumps Supabase SDK, zustand 5, react-toastify 11,
react-infinite-scroll-component 7, headless-ui, heroicons, react-icons,
supabase CLI 2, postcss, TypeScript to 5.9.3 (holding TS 6),
use-debounce, react-hook-form.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

If any single bump in Steps 1–10 broke something requiring investigation, abandon this consolidated commit and split into two commits: one for the broken package (after fixing), one for the rest.

---

## Task 8: Final verification and PR

**Files:** none modified beyond what previous tasks touched. This task validates the cumulative result.

- [ ] **Step 1: Confirm `npm audit` is clean**

Run: `npm audit`
Expected:
- Zero HIGH severity findings.
- Zero MODERATE severity findings.
- Any remaining LOW findings (rare) — document in the PR description, do not block.

If HIGH or MODERATE remain, do not open the PR. Investigate by running `npm audit` (without `--json`) and reading the human-readable report. Either bump the offending package further or add a justified exception to the PR description.

- [ ] **Step 2: Confirm build, lint, and typecheck all succeed**

Run:
```
npm run build
npm run lint
npx tsc --noEmit
```
Expected: all three exit 0. Pre-existing lint warnings are acceptable; new errors are not.

- [ ] **Step 3: Full critical-path smoke test**

Run `npm run dev`. Walk through the entire Task 0 critical path one final time. Generate all three PDF types one more time and compare to the baselines.

- [ ] **Step 4: Push the branch**

```
git push -u origin feature/deps-upgrade
```

- [ ] **Step 5: Open the PR against `development`**

Use the GitHub CLI:
```
gh pr create --base development --title "feat: upgrade all dependencies to current stable versions" --body "$(cat <<'EOF'
## Summary

Brings every dependency in the project up to a current stable version,
clearing all HIGH and MODERATE npm-audit findings on the previous tree.

### Major bumps

- Next.js 14.2.22 → 16.x (codemod for async params/searchParams)
- React 18 → 19
- Tailwind CSS 3 → 4 (CSS-first config, PostCSS plugin renamed)
- ESLint 8 → 10 (flat config; eslint-config-next 16)
- @react-pdf/renderer 3 → 4 (visually validated against pre-upgrade baselines)
- date-fns 3 → 4
- zustand 4 → 5, react-toastify 10 → 11, react-infinite-scroll-component 6 → 7

### Held intentionally

- TypeScript stays on the 5.x line (5.8.3 → 5.9.3). TypeScript 6 is too
  new to absorb here; revisit separately.

### Dropped (unused in src/)

- yup, zod, @hookform/resolvers, date-fns-tz, uniqid, @types/uniqid

`uniqid()` replaced by `crypto.randomUUID()` in paciente-component.tsx.

## Test plan

This project has no automated test suite. Verification is manual:

- [ ] Vercel preview build succeeds
- [ ] Login and toast work
- [ ] Patient list renders and infinite-scrolls
- [ ] Search debounces correctly
- [ ] Patient detail page renders (this is the `[id]` route affected by
      Next 16 async params)
- [ ] "Crear visita" dialog opens and submits
- [ ] All three PDF report types (Pap, Cepillado, Biopsia) generate and
      match the pre-upgrade baseline visually

## Out of scope

- Package manager switch (npm → pnpm) — separate sub-project.
- Doctor's signature on PDFs — separate sub-project, will sit on top of
  the @react-pdf/renderer v4 baseline this PR establishes.

Spec: docs/superpowers/specs/2026-05-28-deps-upgrade-design.md
EOF
)"
```

- [ ] **Step 6: Watch the Vercel preview build**

The PR triggers a Vercel preview deployment. Wait for it to finish (5–10 minutes typically). Click through to the preview URL and re-run the critical path against the deployed preview, not just local. This catches build-vs-runtime divergences (e.g., something that works in `next dev` but not in `next build`).

- [ ] **Step 7: Done**

Mark the dep-upgrade sub-project complete. Move on to the pnpm migration sub-project (separate spec, separate plan, separate `feature/pnpm-migration` branch off `development`).

---

## Risks and rollback strategy

Each task is one commit. If any task's verification step fails irrecoverably:

1. **Soft rollback** (preferred): `git reset --hard HEAD~1` to undo only the failed task's commit, then investigate without losing the previous task's progress.
2. **Hard rollback**: `git checkout development && git branch -D feature/deps-upgrade` and start over (only if multiple tasks compound a problem).

Do NOT `git reset --hard` further back than one commit without explicit user confirmation.

## Out of scope (reaffirmed)

This plan does not address, and the PR resulting from it must not include:
- Switching the package manager.
- Adding the doctor's signature.
- Refactoring auth, the `visitas`-as-JSON-array schema, or any UI structure.
- Fixing the typo'd `zuztand/` directory name.
- Removing the `typescript.ignoreBuildErrors: true` escape hatch in `next.config.mjs`.
- Adding a test suite.

Each of those is its own future decision.
