# Visit Payload Trim — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop storing 68 diagnosis templates in every saved report. Each report goes from **32,495 bytes to ~493**.

**Architecture:** One pure function trims a report down to its own diagnosis block; `saveVisitasAction` applies it to every report before writing. The visit form merges the template under the stored report so a trimmed report still opens with all types pre-filled.

**Tech Stack:** Next 16.2.6, React 19, TypeScript 5.9, pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-15-visita-payload-design.md`

**Branch:** `feature/visita-payload` (off `development`)

---

## Why this exists

The visit form is initialized from `src/app/ui/NewVisitaDialogBody/defaultValues.ts`, a template carrying **all 68 diagnosis blocks** pre-filled with their standard wording, and submits the whole object. The doctor fills one; all 68 are stored. Measured:

| | Stored | Needed |
|---|---|---|
| One report | 32,495 bytes | 493 bytes |
| Patient with 10 reports | 317 KB | 5 KB |
| One page of the list (20 patients × ~3 reports) | **~1.86 MB** | ~28 KB |

That 1.86 MB is read out of Supabase and thrown away to render 20 names and 20 dates. It is almost certainly the slowness the clinic reported, and it is why the Supabase logs looked clean — the queries are fast, the volume is not.

## The shape of the data

Verified against the template, not assumed:

- **8 fields are not diagnoses** and always survive: `date` (a Date), `secondaryDoctor`, `material`, `colpo`, `protocol`, `status`, `type`, `amount`.
- **68 fields are diagnosis blocks**, all plain objects.
- `id` and `notes` are **not in the template** at all. They must still pass through — the trim only ever considers the 68 known diagnosis keys.

## Two invariants, enforced in code

These come from the repo owner and are not negotiable:

1. **The array never loses a report.** A guard asserts the trimmed array has the same length as the input and aborts the write otherwise. It exists to catch a future refactor turning the `map` into a `filter`.
2. **A report whose `type` is unrecognized is left completely untouched.** This is the real hazard: trimming a report with an empty or unknown `type` would strip all 68 blocks and leave something that still appears in the list with no content — worse than a missing report, because nothing looks wrong. **Fail toward keeping too much.**

## Hard rules

- **Never run a database migration, `supabase db push`, `supabase db reset`, `DROP`, or any schema change.** The `pacientes` table holds years of real patient records and there is no staging copy. This PR changes what is written, never the schema, and never rewrites rows on its own.
- **Never read, write, or commit `.env`.** A permission rule blocks `.env*` paths.
- **Line endings:** UTF-8 with CRLF, no BOM, except `*.sh` which is LF. After editing, `sed -i 's/\r\?$/\r/' <file>`, then `file <file>`. Check `git diff --stat`: a small edit showing as a whole-file diff means a stray trailing CR on a file with no final newline — fix with `perl -0777 -i -pe 's/\r\z//' <file>`.
- **Write files containing backslashes with Write/Edit, never a shell heredoc** — heredocs collapse `\\` to `\` here.
- **`types/supabase.ts` is UTF-16LE** — do not edit it, only import from it.
- Commit messages: conventional-commit prefixes, **no `Co-Authored-By` trailer**, no bypass flags.

## Verification baseline

`pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` reports **13**. Two are in `pacientesActions.ts` (`doctor` missing from the generated `Insert`/`Update` types — stale types, real column). This PR should not change the count.

---

### Task 1: The trim function

**Files:**
- Create: `src/app/remoteDataSource/trimVisita.ts`

A separate module rather than a helper inside the actions file, so it can be exercised directly by the measurement script in Task 3.

- [ ] **Step 1: Write it**

```ts
import { defaultValues } from "@/app/ui/NewVisitaDialogBody/defaultValues";
import type { Visitas } from "@/types/supabase";

/**
 * The 68 diagnosis blocks, derived from the template rather than hardcoded.
 *
 * Deriving it means a field added to `Visitas` later is never silently dropped:
 * anything not in this set passes through untouched. `date` is excluded by the
 * Date check — it is the one non-diagnosis field that is an object.
 */
const DIAGNOSIS_KEYS = new Set(
  Object.entries(defaultValues)
    .filter(
      ([, value]) =>
        value !== null && typeof value === "object" && !(value instanceof Date)
    )
    .map(([key]) => key)
);

/**
 * Strips the diagnosis blocks a report does not use.
 *
 * The form is seeded from a template holding all 68 diagnoses pre-filled and
 * submits the lot, so every stored report carried 32KB where ~493 bytes were
 * meaningful. Only the block named by `visita.type` is the report.
 *
 * Returns the report untouched when `type` names no known block. That case
 * would otherwise strip all 68 and leave a report that still shows up in the
 * list with nothing in it — worse than losing it, because nothing looks wrong.
 */
export function trimVisita(visita: Visitas): Visitas {
  if (!visita || typeof visita !== "object") return visita;
  if (!visita.type || !DIAGNOSIS_KEYS.has(visita.type)) return visita;

  const trimmed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(visita)) {
    if (!DIAGNOSIS_KEYS.has(key) || key === visita.type) {
      trimmed[key] = value;
    }
  }
  return trimmed as Visitas;
}

/** Exported for the measurement script; not part of the runtime path. */
export const DIAGNOSIS_KEY_COUNT = DIAGNOSIS_KEYS.size;
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect **13**.
Run: `pnpm exec tsc --noEmit 2>&1 | grep "trimVisita"` → expect no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/remoteDataSource/trimVisita.ts
git commit -m "feat(visitas): add the diagnosis-block trim"
```

---

### Task 2: Apply it on write

**Files:**
- Modify: `src/app/remoteDataSource/pacientesActions.ts`

- [ ] **Step 1: Trim inside `saveVisitasAction`**

Add the import, then trim before the update. Place the guard between them:

```ts
import { trimVisita } from "./trimVisita";
```

```ts
    const trimmed = visitas.map(trimVisita);

    // Invariant: trimming shrinks each report, never the array. `map` cannot
    // drop elements, so this guards against a future refactor turning it into
    // a filter — losing a report is the one outcome that must never happen.
    if (trimmed.length !== visitas.length) {
      console.error(
        `Trim changed the report count (${visitas.length} -> ${trimmed.length}); refusing to write.`
      );
      return { ok: false, reason: "error", message: "No se pudo guardar el informe" };
    }

    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .update({ visitas: trimmed })
```

Keep the rest of the action — the `try`/`catch`, the `.select().single()`, the `fail()` handling — exactly as it is.

Note this trims the patient's **whole** array, not just the report being saved. That is intended: it is how existing data shrinks without a migration.

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect **13**.
Run: `node scripts/check-session-coverage.mjs` → still passes; the action must still call `adminDb()`.

- [ ] **Step 3: Commit**

```bash
git add src/app/remoteDataSource/pacientesActions.ts
git commit -m "feat(visitas): trim unused diagnosis blocks before writing

Every saved report carried all 68 diagnosis templates; only the one named
by its type is the report. A guard aborts the write if trimming ever
changes the number of reports."
```

---

### Task 3: Prove the numbers

**Files:**
- Create: `scripts/measure-visita-payload.mjs`

A claim of "98.5% smaller" that nobody ran is not evidence.

- [ ] **Step 1: Write the script**

It must load the template, build a realistic report from it, run `trimVisita`, and print before/after sizes plus the projected size of one list page. It must also assert the two invariants:

- Trimming an array of N reports returns N reports.
- Trimming a report whose `type` is `""` or `"noExiste"` returns it **unchanged**, byte for byte.

Exit non-zero if either fails.

Since the module is TypeScript, either import it through a small runtime transpile or duplicate the derivation — **do not duplicate the trim logic itself**, or the script stops testing the real thing. Prefer running it through `node --experimental-strip-types` if the installed Node supports it (check with `node --version`; 22.6+ supports the flag, 23+ has it on by default), and say which route you took.

- [ ] **Step 2: Run it**

Show the literal output. Expected shape: ~32,495 bytes before, ~493 after, and both invariant assertions passing.

- [ ] **Step 3: Commit**

```bash
git add scripts/measure-visita-payload.mjs
git commit -m "chore(visitas): measure the payload trim and assert its invariants"
```

---

### Task 4: Keep editing a trimmed report working

**Files:**
- Modify: `src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx`

**This task is what makes Task 2 safe.** The form currently initializes with:

```ts
    defaultValues: visita || defaultValues,
```

Once reports are trimmed, opening one for editing seeds the form with a report that has one diagnosis block. If the doctor then switches the type, the fields for the new type come up **empty** instead of carrying the standard wording — she would have to retype boilerplate she has never had to type.

- [ ] **Step 1: Merge the template underneath**

```ts
    // The stored report wins, the template fills the gaps. Reports are trimmed
    // to their own diagnosis block on save, so without this merge, switching
    // the type while editing would show empty fields instead of the standard
    // wording. Untrimmed older reports are unaffected — their own blocks simply
    // override more of the template.
    defaultValues: visita ? { ...defaultValues, ...visita } : defaultValues,
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect **13**.
Run: `pnpm build` → completes.

- [ ] **Step 3: Commit**

```bash
git add src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx
git commit -m "fix(visitas): seed the edit form from the template under the report

Trimmed reports carry only their own diagnosis block, so switching type
while editing showed empty fields instead of the standard wording."
```

---

### Task 5: Build and hand back

- [ ] **Step 1: Full verification**

```bash
rm -rf .next && pnpm build
sh scripts/verify-lockdown.sh
node scripts/measure-visita-payload.mjs
pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: build completes, all five lockdown checks PASS, the measurement passes both assertions, tsc reports 13.

- [ ] **Step 2: Stop**

Do not push, do not open a PR.

---

## Manual smoke test, for the repo owner

This changes what gets written to medical records, so it needs exercising on a throwaway patient before it reaches production.

- Create a report. Save it. **Reload.** It is there, with its content intact.
- Open it for editing, **switch the diagnosis type**, and confirm the new type's fields come up pre-filled with the standard wording rather than empty.
- Save the switched report, reload, and confirm the new type's content is what persisted.
- Open a patient who already has **several older reports**, save any one of them, then reload and confirm **every** report is still listed with its content. This is the invariant that matters: saving one report rewrites the whole array.
- Download a PDF from a trimmed report and confirm it renders the same as before.

## What this does not do

- **Existing reports only shrink when their patient's array is next saved.** A patient nobody touches keeps their old bloat, so the list stays slow in proportion to how much history predates this change. Worth re-measuring afterwards and revisiting the one-time pass with real numbers.
- The request from browser to server still carries the untrimmed object; trimming is server-side. That is a one-off per save, not a per-page-load cost.
- `visitas` remains a JSON column on `pacientes`.
