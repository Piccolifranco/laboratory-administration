# pnpm Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) — the final verification is a Vercel preview build the user must confirm. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the laboratory-administration project from npm to pnpm 11.4.0 with zero behavioral change.

**Architecture:** Six sequential tasks on `feature/pnpm-migration` (already cut off `development`). Lockfile transition is two-staged: Task 2 commits the new `pnpm-lock.yaml` while keeping `package-lock.json` for rollback safety; Task 3 deletes the npm lockfile only after the pnpm install + verification pass.

**Tech Stack:** pnpm 11.4.0 (managed via corepack), Node 22 LTS minimum (Franco runs Node 24 locally, Vercel will use the latest 22.x).

**Verification model:** Same as the deps-upgrade — no automated test suite, so verification is `pnpm run build`, `pnpm run lint`, `pnpm audit`, and manual critical-path smoke test. Critical path defined in Task 0.

---

## Task 0: Pre-flight

**Files:** none modified.

**Smoke-test critical path** (referenced from Task 3 and Task 5):
1. App starts cleanly.
2. Login → toast → redirect to `/pacientes`.
3. Patient list renders, infinite-scrolls, search debounces.
4. Patient detail page renders with visitas.
5. "Crear visita" dialog opens and closes.
6. PDF generation works for each available report type (Pap, Cepillado, Biopsia).

- [ ] **Step 1: Confirm branch and clean tree**

Run: `git status && git branch --show-current`
Expected:
```
On branch feature/pnpm-migration
nothing to commit, working tree clean
feature/pnpm-migration
```
(The spec commit on this branch already exists from earlier.)

- [ ] **Step 2: Confirm Node ≥22 and corepack is available**

Run: `node --version && corepack --version`
Expected: Node ≥ v22, corepack any version (it ships with Node).

- [ ] **Step 3: Confirm the current state — npm lockfile present, no pnpm artifacts**

Run: `ls package-lock.json pnpm-lock.yaml 2>&1`
Expected: `package-lock.json` exists, `pnpm-lock.yaml` does not.

- [ ] **Step 4: No commit** (Task 0 produces no file changes).

---

## Task 1: `package.json` edits (no install)

**Files:** Modify: `package.json`

- [ ] **Step 1: Add `packageManager`, `engines`, and `pnpm.overrides` to `package.json`**

Open `package.json`. Add three top-level fields. The exact final file should look like this:

```json
{
  "name": "laboratory-administration",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@11.4.0",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "@headlessui/react": "^2.2.10",
    "@heroicons/react": "^2.2.0",
    "@react-pdf/renderer": "^4.5.1",
    "@supabase/supabase-js": "^2.106.2",
    "date-fns": "^4.3.0",
    "next": "^16.2.6",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-hook-form": "^7.76.1",
    "react-icons": "^5.6.0",
    "react-infinite-scroll-component": "^7.2.0",
    "react-toastify": "^11.1.0",
    "use-debounce": "^10.1.1",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.5",
    "@tailwindcss/postcss": "^4.3.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "^16.2.6",
    "postcss": "^8.5.15",
    "supabase": "^2.101.0",
    "tailwindcss": "^4.3.0",
    "typescript": "~5.9.3"
  },
  "overrides": {
    "postcss": "^8.5.15"
  },
  "pnpm": {
    "overrides": {
      "postcss": "^8.5.15"
    }
  }
}
```

The three changes from the current file:
- New `packageManager` key after `private` — pinned to exactly `pnpm@11.4.0`.
- New `engines` block after `packageManager` — pins Node ≥22.0.0.
- New top-level `pnpm` block at the end mirroring `overrides` under `pnpm.overrides`.

- [ ] **Step 2: Verify the diff is exactly those three additions**

Run: `git diff package.json`
Expected: three insertions (packageManager line, engines block, pnpm block). No other lines changed.

- [ ] **Step 3: Commit (no install)**

Run:
```
git add package.json
git commit -m "chore(pnpm): pin packageManager, engines.node, and mirror overrides

Prepares for pnpm migration without yet installing or generating
a pnpm lockfile. Pins pnpm@11.4.0 via the packageManager field for
corepack to pick up. Adds engines.node >=22.0.0. Mirrors the npm
overrides block under pnpm.overrides so the postcss fix for Next 16's
nested copy survives once pnpm becomes the resolver."
```

---

## Task 2: Enable corepack and convert lockfile (npm still resolves)

**Files:**
- Create: `pnpm-lock.yaml`

The repo will end this task with BOTH `package-lock.json` and `pnpm-lock.yaml` present. That's intentional — `package-lock.json` stays as a rollback safety net until Task 3 verifies the pnpm install actually works.

- [ ] **Step 1: Enable corepack**

Run: `corepack enable`
Expected: command exits 0. No output is normal.

If `corepack enable` fails with a permissions error on Windows, run a PowerShell terminal as Administrator and retry. This is a one-time per-machine setup; it does not block the migration itself.

- [ ] **Step 2: Confirm corepack picks up the pinned pnpm version**

Run: `pnpm --version`
Expected: `11.4.0` (corepack lazy-installs the version pinned in `packageManager` on first use; the first invocation may take a few seconds).

If the version printed is something else, corepack isn't reading the project's `packageManager` field. Investigate before continuing.

- [ ] **Step 3: Import the npm lockfile**

Run: `pnpm import`
Expected: command exits 0. `pnpm-lock.yaml` is created in the project root with the same resolved versions as `package-lock.json`.

- [ ] **Step 4: Verify `pnpm-lock.yaml` exists**

Run: `ls pnpm-lock.yaml package-lock.json 2>&1`
Expected: both files listed.

- [ ] **Step 5: Commit `pnpm-lock.yaml`**

```
git add pnpm-lock.yaml
git commit -m "chore(pnpm): import lockfile from package-lock.json

Generates pnpm-lock.yaml via 'pnpm import', preserving the resolved
version graph from PR #1's lockfile -- no version drift. package-lock.json
intentionally retained until the pnpm install in the next commit verifies."
```

---

## Task 3: Switch over to pnpm

**Files:**
- Delete: `package-lock.json`
- (Untracked changes to `node_modules/` — gitignored)

- [ ] **Step 1: Delete the npm lockfile and node_modules**

Run:
```
rm package-lock.json
rm -rf node_modules
```
Expected: both removed. `git status` shows `package-lock.json` as deleted.

- [ ] **Step 2: Install with pnpm**

Run: `pnpm install`
Expected:
- Command exits 0.
- Output shows resolved/installed package counts.
- New `node_modules/` materializes (pnpm uses content-addressable storage + symlinks; the directory layout looks different from npm's flat `node_modules/`, but that's expected).
- The resolved version graph matches what was in `pnpm-lock.yaml` (no drift).

Possible warnings:
- Peer-dep warnings — record but don't act unless install fails.
- Build-script confirmation prompts (pnpm asks before running install scripts of nested packages it doesn't recognize) — accept by running `pnpm install --ignore-scripts=false` if prompted, or for known packages run `pnpm approve-builds`.

If install fails irrecoverably, run `git reset --hard HEAD~1` to revert to the Task 2 commit (which has both lockfiles) and investigate.

- [ ] **Step 3: Run `pnpm audit`**

Run: `pnpm audit`
Expected: zero HIGH and zero MODERATE findings. (The deps-upgrade PR cleared the tree; the override block carries the postcss fix to the pnpm-resolved tree as well.)

If any HIGH or MODERATE appears, the most likely cause is the override not being picked up — verify the `pnpm.overrides` block exists at the top level of `package.json` and `pnpm-lock.yaml`'s metadata reflects the override (search `pnpm-lock.yaml` for `postcss`).

- [ ] **Step 4: Run `pnpm run build`**

Run: `pnpm run build`
Expected: build succeeds. Same output structure as `npm run build` from the previous PR (4 routes built: `/`, `/_not-found`, `/paciente/[id]`, `/pacientes`).

If the build fails with a "module not found" error for a transitive dep, the cause is pnpm's stricter isolation — fix is adding the affected pattern to `.npmrc`:
```
public-hoist-pattern[]=*<pkg>*
```
Stop and ask before adding `.npmrc` workarounds — it's a real escape hatch, not a default.

- [ ] **Step 5: Run `pnpm run lint`**

Run: `pnpm run lint`
Expected: completes. Same 7 problems (2 errors, 5 warnings) as the deps-upgrade PR — these are pre-existing tech debt, not caused by this migration.

- [ ] **Step 6: Manual critical-path smoke test**

Start the dev server: `pnpm run dev`
Walk the critical path from Task 0 — login, patient list, search, detail page, create-visita dialog, PDFs for the available report types.

Stop the dev server with Ctrl+C.

- [ ] **Step 7: Commit the package-lock.json deletion**

```
git add package-lock.json
git status
# verify ONLY 'package-lock.json' deletion is staged, nothing else
git commit -m "chore(pnpm): remove package-lock.json after successful pnpm install

pnpm install verified against pnpm-lock.yaml: pnpm audit clean,
pnpm run build succeeds, pnpm run lint completes, manual critical-path
smoke test passes. npm lockfile no longer needed."
```

---

## Task 4: README update

**Files:** Modify: `README.md`

- [ ] **Step 1: Read the current README**

Run: `cat README.md`
Confirm the existing content references `npm run dev`, `yarn dev`, `pnpm dev`, and `bun dev`. (The default create-next-app boilerplate lists multiple package managers.)

- [ ] **Step 2: Replace the README content**

Replace the entire content of `README.md` with the following. (The plan uses a four-backtick outer fence so the inner triple-backtick code fences in the README are unescaped — write them as plain triple backticks.)

````markdown
# Laboratory Administration

Next.js + Supabase app for tracking patients and generating PDF medical reports for a pathology clinic.

## Requirements

- Node.js ≥22.0.0
- pnpm — installed automatically via corepack on first use (no global install needed)

## Getting started

Enable corepack once per machine:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command       | What it does                           |
| ------------- | -------------------------------------- |
| `pnpm dev`    | Start the Next.js dev server           |
| `pnpm build`  | Build the production bundle            |
| `pnpm start`  | Run the production build               |
| `pnpm lint`   | Run ESLint                             |
| `pnpm audit`  | Check dependencies for vulnerabilities |

## Deploy

Deployed on Vercel. The Vercel project auto-detects pnpm via the `pnpm-lock.yaml` and `packageManager` field in `package.json`.

- `master` is the production branch.
- `development` is the integration branch; PRs land here first, then promote to `master` at release points.
````

- [ ] **Step 3: Commit**

```
git add README.md
git commit -m "docs: update README for pnpm + the new branching model

Replaces the default create-next-app boilerplate with project-specific
setup instructions reflecting pnpm + corepack and the master/development
workflow."
```

---

## Task 5: Push, open PR, verify Vercel preview

- [ ] **Step 1: Push the branch**

Run: `git push -u origin feature/pnpm-migration`
Expected: push succeeds.

- [ ] **Step 2: Open the PR against `development`**

```
gh pr create --base development --title "chore: migrate from npm to pnpm" --body "$(cat <<'EOF'
## Summary

Switches the project from npm to pnpm 11.4.0, with zero behavioral change to the app and zero deploy-config change on Vercel.

## What changed

- **`packageManager`** pinned to `pnpm@11.4.0` for corepack to manage.
- **`engines.node`** pinned to `>=22.0.0` (Node 22 LTS).
- **`overrides`** block mirrored under **`pnpm.overrides`** so the postcss fix for Next 16's nested copy survives the migration.
- **`package-lock.json`** removed; **`pnpm-lock.yaml`** added (imported from the npm lockfile via `pnpm import` to avoid version drift).
- **`README.md`** updated to reflect pnpm commands and the master/development workflow.

## What did NOT change

- No dependency version changes — the dep tree is exactly the one that shipped in PR #1.
- No source-code changes.
- No Vercel project config — Vercel auto-detects pnpm via `pnpm-lock.yaml` + `packageManager`.

## Test plan

Verified locally:
- [x] `pnpm install` succeeds against the imported lockfile.
- [x] `pnpm audit` shows zero HIGH/MODERATE.
- [x] `pnpm run build` succeeds (4 routes built).
- [x] `pnpm run lint` runs to completion (same 7 pre-existing findings as PR #1).
- [x] Critical path: login, patient list + infinite scroll, search, patient detail, create-visita, all available PDF report types.

To verify on this PR:
- [ ] Vercel preview build succeeds with pnpm.
- [ ] Critical path passes on the deployed preview.

## Out of scope

- The doctor's signature on PDFs — next sub-project.
- Adding a backend — final sub-project.

Spec: [docs/superpowers/specs/2026-05-28-pnpm-migration-design.md](docs/superpowers/specs/2026-05-28-pnpm-migration-design.md)
Plan: [docs/superpowers/plans/2026-05-28-pnpm-migration.md](docs/superpowers/plans/2026-05-28-pnpm-migration.md)
EOF
)"
```

Expected: PR created, gh prints the URL.

- [ ] **Step 3: Verify Vercel preview**

Open the PR on GitHub. The Vercel bot will post a preview URL within a minute or two. Click through:
- Build log shows pnpm being used (look for "Installing dependencies with pnpm" or similar).
- Preview deploys successfully.
- Critical-path smoke test passes on the deployed preview URL.

- [ ] **Step 4: Done**

Mark the pnpm migration complete. Next sub-project: doctor's signature on the PDF reports.

---

## Rollback

The two-stage lockfile transition gives clean rollback points:

- **If Task 3 install fails:** `git reset --hard HEAD~1` returns to the Task 2 commit (both lockfiles present). Investigate the install failure and re-attempt.
- **If Task 3 install succeeds but smoke test fails:** `git reset --hard HEAD~2` returns to the Task 1 commit (only `package-lock.json`, no pnpm artifacts). Run `rm pnpm-lock.yaml node_modules -rf && npm install` to go back to npm.
- **If everything fails:** `git checkout development && git branch -D feature/pnpm-migration` discards the branch entirely.

Do NOT `git reset --hard` more than one commit without user confirmation.

## Out of scope (reaffirmed)

- Adding `.npmrc` / `.pnpmrc` customization (only if observed-needed during Task 3).
- pnpm workspaces.
- Any dependency version changes.
- Any source-code changes.
- Adding a CI/CD config that runs `pnpm install` on PRs (Vercel handles the preview build).