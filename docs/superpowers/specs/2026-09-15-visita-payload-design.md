# Visit Payload — Stop Storing 68 Unused Diagnoses Per Report — Design

**Date:** 2026-09-15
**Status:** Design agreed, deferred until after the auth hardening round (PR 4)
**Branch:** not created yet

## Goal

Every saved report stores **32,495 bytes** where **493** would do. This is almost certainly the cause of the clinic's "the page is very slow and sometimes does not load" complaint that started the September 2026 work.

## The measurement

`src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx` initializes its form with `defaultValues: visita || defaultValues`, where `defaultValues` (`./defaultValues.ts`, 35KB of source) is a template carrying **all 68 diagnosis blocks** — biopsia, pap, pólipo de colon, quiste de ovario, and 64 more — each pre-filled with its standard wording. The form submits the whole object, so all 68 are written. The doctor uses one.

| | Stored today | Needed |
|---|---|---|
| One report | 32,495 bytes | 493 bytes |
| Patient with 5 reports | 159 KB | 2 KB |
| Patient with 10 reports | 317 KB | 5 KB |
| One page of the patient list (20 patients × ~3 reports) | **~1.86 MB** | ~28 KB |

98.5% waste. Those 1.86 MB are read out of Supabase and discarded by the server to render 20 names and 20 dates.

## Why it went unnoticed

The Supabase logs show nothing wrong, which is why an earlier look at them came up empty: the queries are fast. The problem is the volume they return, and no "slow query" metric surfaces that.

It also explains why PR 2's payload trim helped less than expected. That narrowed the server→browser hop; the Supabase→server hop still carries the full 1.86 MB.

**It also corrects an earlier diagnosis in `2026-09-15-auth-hardening-design.md`,** which called the `visitas` JSON column the root problem and proposed moving it to its own table as "the real fix". That would have relocated the same bloat. The column shape is secondary; what is stored inside it is the issue. A separate table is still worth doing eventually, but it is not the performance fix.

## Design

Two changes, which must land together.

**1. Trim before writing.** Keep every non-diagnosis field plus only `visita[visita.type]`. Derive the diagnosis key set from `defaultValues` itself rather than hardcoding a list:

```ts
const DIAGNOSIS_KEYS = new Set(
  Object.entries(defaultValues)
    .filter(([, v]) => v !== null && typeof v === "object" && !(v instanceof Date))
    .map(([k]) => k)
);
```

Then drop any key in that set other than the active `type`. Deriving it this way means a field added to `Visitas` later passes through untouched instead of being silently dropped — the safe failure direction for medical records.

Trim in `saveVisitasAction` (`src/app/remoteDataSource/pacientesActions.ts`) so it applies regardless of caller, not in the component.

**2. Merge the template when editing.** Change the form to `defaultValues: visita ? { ...defaultValues, ...visita } : defaultValues`. Without this, opening a trimmed report and switching its diagnosis type would show empty fields instead of the standard wording, because the other blocks are no longer in the stored object.

## What gets dropped, and the guards on it

**Every diagnosis block except the one named by `visita.type`.** Considered and rejected: keeping blocks that differ from the template. The template *is* the standard wording the doctor uses, so a real PAP block legitimately looks almost identical to it, and "how different counts as edited" is not a judgement this code should be making. If she changed the type, she changed it on purpose, and only the active diagnosis is the report.

Two invariants, both enforced in code rather than trusted:

1. **The array never loses a report.** Trimming maps over the reports one-for-one; a guard asserts the output length equals the input length and aborts the write if it does not. This exists to catch a future refactor turning the `map` into a `filter`, not because `map` can drop elements.
2. **A report with an unrecognized `type` is left completely untouched.** This is the real hazard: if `type` were empty or named a block that does not exist, trimming would strip all 68 blocks and leave a report that still appears in the list but has no content — worse than a missing one, because nothing looks wrong. The trim fails toward keeping too much, never toward deleting.

Keys absent from the template — `id`, `notes`, and anything added later — pass through untouched. Only the 68 known diagnosis keys are ever candidates for removal.

Because `saveVisitasAction` receives the whole array, saving any one report also trims that patient's other reports. That is intended: it is how existing data shrinks without a migration.

## Decisions (locked)

- **Its own PR, after the auth hardening round closes.** It changes how clinical records are stored and should not ride along in a PR about access control.
- **Existing rows are left alone.** Each shrinks when someone next edits it. A one-time pass over every patient row would give the full win immediately, but it rewrites real medical records and was judged not worth the risk — see [[feedback-never-run-db-migrations]].

## Consequence of leaving old rows

The list endpoint still reads the old bloat for untouched patients, so the list stays slow in proportion to how many reports predate the change. Worth re-measuring once new reports are being written trimmed, and revisiting the one-time pass then with real numbers.

## Verification

- Save a report, then read the row back and confirm the stored object has one diagnosis block, not 68.
- Open that report for editing, switch the diagnosis type, and confirm the fields come up pre-filled from the template.
- Confirm an older, untrimmed report still opens and edits correctly — the merge must tolerate both shapes.
