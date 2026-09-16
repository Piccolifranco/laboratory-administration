# Auth Hardening PR 2 — Patient Reads Server-Side — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the patient list, its search and its pagination off the browser and behind `GET /api/pacientes`, so the browser stops querying Supabase for patient data — and fix two real bugs in the "Última Visita" column along the way.

**Architecture:** A Route Handler gated by `adminDb()` (which calls `requireSession()` internally) queries Supabase with the secret key and returns only the columns the list renders, plus a server-derived `ultimaVisita`. `useInfinitePacientes` becomes a `fetch` against it. The patient detail page and all writes stay on the browser until PR 3.

**Tech Stack:** Next 16.2.6 (App Router), React 19, TypeScript 5.9, `@supabase/supabase-js` v2, pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-15-auth-hardening-design.md`

**Branch:** `feature/pacientes-api` (already created off `development`, which has PR 1 merged)

---

## Context from PR 1

PR 1 built the foundation this plan consumes. What matters here:

- `adminDb()` in `src/app/remoteDataSource/supabaseServerSide.ts` is the **only** way to reach patient data. It calls `requireSession()` internally and throws `UnauthorizedError` when there is no valid session. The raw admin client is deliberately not exported.
- `isUnauthorized(error)` and `unauthorizedResponse()` in `src/app/utils/authResponse.ts` exist for exactly this PR and have had no consumer until now.
- `src/proxy.ts` guards page routes but **not** `/api/*`. API routes defend themselves through `adminDb()`.
- `scripts/verify-lockdown.sh` has a forged-cookie check currently reporting `INFO` and expecting 200. **Task 6 promotes it to a hard FAIL expecting 401** — that promise was made in PR 1 and comes due here.

**The hole is still open.** RLS is still off and the publishable key still ships in the bundle. That does not change until PR 4.

## Verification baselines

`pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` reports **14**, not zero, distributed as:

| Count | File |
|---|---|
| 8 | `src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx` |
| 2 | `src/app/remoteDataSource/supabase.ts` |
| 1 | `src/app/ui/status.tsx` |
| 1 | `src/app/ui/NewVisitaDialogBody/defaultValues.ts` |
| 1 | `src/app/(app)/pacientes/pacientes-component.tsx` — `InfiniteScroll` missing its required `loader` prop |
| 1 | `src/app/(app)/paciente/[id]/page.tsx` — `.eq("id", pacienteId)` passes a string where the column is a number |

**Two of these sit in files this PR modifies**, so "no output from a narrow grep" is the wrong bar for them. `pacientes-component.tsx` and `paciente/[id]/page.tsx` each keep exactly one pre-existing error throughout. The bar is the **count staying at 14**, plus no error naming a file the task created.

To get an accurate per-file breakdown, note that paths here contain parentheses (`(app)`), so a regex stopping at the first `(` mangles them:

```bash
pnpm exec tsc --noEmit 2>&1 | grep -E "^.+\([0-9]+,[0-9]+\): error" \
  | sed -E 's/\([0-9]+,[0-9]+\): error.*//' | sort | uniq -c | sort -rn
```

Use narrow greps naming the new files only: `grep -E "api/pacientes|pacientes/types"`. A bare `supabase` matches pre-existing errors in `supabase.ts`.
- No test framework, and adding one is out of scope per the spec.

## Hard rules

- **Never run a database migration, `supabase db push`, `supabase db reset`, `DROP`, or any schema change.** The `pacientes` table holds years of real patient records and there is no staging copy. Nothing in this PR touches the schema.
- **Never read, write, or commit `.env`.** A permission rule blocks `.env*` paths. It is already populated.
- **Line endings:** UTF-8 with **CRLF**, no BOM, except `*.sh` which is LF (enforced by `.gitattributes`). After editing, `sed -i 's/\r\?$/\r/' <file>` — **but** if the file has no trailing newline that appends a stray CR and makes `git diff` show every line as changed. Check with `git diff --stat`; fix with `perl -0777 -i -pe 's/\r\z//' <file>`.
- **`types/supabase.ts` is UTF-16LE**, unlike every other file in this repo. Do not edit it with the usual tools — this plan does not need to, and new types go in a new UTF-8 file.
- Commit messages use conventional-commit prefixes and **no `Co-Authored-By` trailer**. No `-c commit.gpgsign=false` or other bypass flags.

---

## The two bugs being fixed

Both live in the "Última Visita" column of `src/app/ui/Table.tsx`, and both are pre-existing — they are not caused by this PR.

**Bug 1: the column shows the FIRST visit, not the last.** New visits are appended to the end of the `visitas` array (`[...paciente.visitas, visitaWithId]` in `paciente-component.tsx`), so index 0 is the oldest. The detail page reverses the array precisely because of this. But the table reads `paciente.visitas[0].date` under a heading that says "Última Visita", so it has been showing each patient's first-ever consultation, and sorting by that column has been sorting by first visit. Confirmed with the repo owner against real data before fixing.

**Bug 2: a patient with `visitas: []` crashes the row.** The guard is `paciente?.visitas ? ... : ""`, and an empty array is truthy, so it proceeds to `visitas[0].date` and throws on `undefined`. Only a `null` is handled.

Both are fixed by deriving `ultimaVisita` on the server, correctly, once.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/app/(app)/pacientes/types.ts` | `PacienteListItem` (what the API returns) and `PacienteEditableFields` (what an edit may write). New, UTF-8. |
| `src/app/api/pacientes/route.ts` | `GET` — session-gated, returns the narrow list payload with derived `ultimaVisita`. |
| `src/app/(app)/pacientes/useInfinitePacientes.ts` | Fetches the Route Handler instead of Supabase. |
| `src/app/ui/Table.tsx` | Renders and sorts `ultimaVisita` instead of reaching into `visitas`. |
| `src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx` | Submits only editable fields. |
| `src/app/remoteDataSource/supabase.ts` | `updatePaciente` narrowed to editable fields. |
| `scripts/verify-lockdown.sh` | Forged-cookie check promoted to a hard FAIL. |

---

### Task 1: Shared types for the list

**Files:**
- Create: `src/app/(app)/pacientes/types.ts`

- [ ] **Step 1: Write the module**

```ts
import type { Paciente } from "@/types/supabase";

/**
 * One row of `GET /api/pacientes`.
 *
 * Every column of `Paciente` except `visitas` — a JSON array holding every
 * report body, macro and micro text included, which the list does not render
 * and which dominated the old payload. In its place, a single derived date.
 */
export type PacienteListItem = Omit<Paciente, "visitas"> & {
  /** ISO date of the patient's most recent visit, or null when they have none. */
  ultimaVisita: string | null;
};

/**
 * The fields the edit dialog is allowed to change.
 *
 * Writes are restricted to this set so that a derived field like `ultimaVisita`
 * — which is not a column — can never reach an UPDATE, and so that editing a
 * patient cannot clobber `visitas`.
 */
export type PacienteEditableFields = Pick<
  Paciente,
  "firstName" | "lastName" | "age" | "dni" | "doctor" | "obraSocial"
>;

```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect `14`.
Run: `pnpm exec tsc --noEmit 2>&1 | grep "pacientes/types"` → expect no output.
Run: `file "src/app/(app)/pacientes/types.ts"` → must report CRLF.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/pacientes/types.ts"
git commit -m "feat(pacientes): add list and editable-field types"
```

---

### Task 2: The patient list Route Handler

**Files:**
- Create: `src/app/api/pacientes/route.ts`

- [ ] **Step 1: Write the handler**

```ts
import { NextResponse } from "next/server";
import { adminDb } from "@/app/remoteDataSource/supabaseServerSide";
import { isUnauthorized, unauthorizedResponse } from "@/app/utils/authResponse";
import type { PacienteListItem } from "@/app/(app)/pacientes/types";
import type { Visitas } from "@/types/supabase";

const PAGE_SIZE = 20;

/**
 * Columns the list renders or sorts on.
 *
 * `visitas` is selected but never returned: deriving the latest visit date
 * requires reading the JSON, because it lives inside this column rather than in
 * its own table. So this trims the server-to-browser payload, which is what the
 * clinic actually feels on a phone, while the Supabase-to-server hop still
 * carries the blob. Moving `visitas` into its own table is the real fix and is
 * out of scope — it needs a data migration.
 */
const LIST_COLUMNS =
  "id, firstName, lastName, age, dni, doctor, obraSocial, createdAt, visitas";

/**
 * The patient's most recent visit date, or null.
 *
 * Takes the maximum rather than `visitas[0]`. New visits are appended to the
 * end of the array, so index 0 is the OLDEST — the list column labelled
 * "Última Visita" had been showing each patient's first-ever consultation.
 * Skips entries with a missing or unparseable date instead of throwing, and
 * returns null for an empty array, which used to crash the row.
 */
function latestVisitDate(visitas: Visitas[] | null | undefined): string | null {
  if (!visitas || visitas.length === 0) return null;

  let latest: number | null = null;
  for (const visita of visitas) {
    if (!visita?.date) continue;
    const time = new Date(visita.date).getTime();
    if (Number.isNaN(time)) continue;
    if (latest === null || time > latest) latest = time;
  }

  return latest === null ? null : new Date(latest).toISOString();
}

/** Escapes LIKE wildcards so a patient surname containing % or _ searches literally. */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function GET(request: Request) {
  let db;
  try {
    db = await adminDb();
  } catch (error) {
    if (isUnauthorized(error)) return unauthorizedResponse();
    throw error;
  }

  const { searchParams } = new URL(request.url);

  const rawPage = Number(searchParams.get("page") ?? "0");
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const term = (searchParams.get("q") ?? "").trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = db
    .from("pacientes")
    .select(LIST_COLUMNS)
    // Newest patients first. Order the full set server-side BEFORE paginating so
    // .range() walks a stable, globally-ordered list. The id tiebreaker keeps
    // pagination stable when two rows share a createdAt timestamp.
    .order("createdAt", { ascending: false })
    .order("id", { ascending: false });

  if (term) {
    // ilike, not textSearch. textSearch matches whole lexemes, so typing "Per"
    // never found "Perez" — the search box appeared broken for partial names.
    query = query.ilike("lastName", `%${escapeLike(term)}%`);
  }

  const { data, error } = await query.range(from, to);

  if (error) {
    console.error("Error listing pacientes:", error.message);
    return NextResponse.json(
      { error: "No se pudieron cargar los pacientes" },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  const pacientes: PacienteListItem[] = rows.map((row) => {
    const { visitas, ...paciente } = row as typeof row & {
      visitas?: Visitas[] | null;
    };
    return { ...paciente, ultimaVisita: latestVisitDate(visitas) } as PacienteListItem;
  });

  return NextResponse.json({
    pacientes,
    hasMore: pacientes.length === PAGE_SIZE,
  });
}
```

- [ ] **Step 2: Verify it rejects an unauthenticated request**

Start `pnpm dev`, then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/pacientes
```

Expected: `401`. **This is the check the whole round exists for** — an endpoint reaching patient data with the secret key must refuse anyone without a verified session.

- [ ] **Step 3: Verify it rejects a FORGED cookie**

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H 'Cookie: lab_session={"access_token":"x","refresh_token":"y","expires_at":9999999999}' \
  http://localhost:3000/api/pacientes
```

Expected: `401`. In PR 1 this same cookie got a 200 from the proxy, because the proxy is not the trust boundary. Here it must fail: `adminDb()` → `requireSession()` → `getClaims()` rejects the unsigned token.

If this returns 200 or any patient data, **stop immediately and report it** — that is the authentication bypass this round was created to fix, and it would mean `requireSession()` is not doing its job.

- [ ] **Step 4: Verify the payload shape without real data**

You do not have credentials, so you cannot fetch a populated list. Confirm the negative cases above, and confirm the route is registered in the build output in Task 7.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/pacientes/route.ts
git commit -m "feat(pacientes): add session-gated list endpoint

Returns only the columns the list renders plus a server-derived
ultimaVisita, instead of SELECT * with the whole visitas JSON array.
Search moves from textSearch to ilike, so partial surnames match."
```

---

### Task 3: Point the list hook at the endpoint

**Files:**
- Modify: `src/app/(app)/pacientes/useInfinitePacientes.ts`

- [ ] **Step 1: Replace the whole file**

```ts
import { useState, useEffect, useCallback } from "react";
import type { PacienteListItem } from "./types";

export function useInfinitePacientes(searchTerm?: string) {
  const [pacientes, setPacientes] = useState<PacienteListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(pageIndex) });
        if (searchTerm) params.set("q", searchTerm);

        const response = await fetch(`/api/pacientes?${params}`);

        if (response.status === 401) {
          // The session lapsed while the tab was open. A full navigation lets
          // the proxy do the redirecting rather than duplicating that logic.
          window.location.href = "/";
          return;
        }

        if (!response.ok) {
          setError("No se pudieron cargar los pacientes");
          return;
        }

        const data = await response.json();
        setPacientes((prev) =>
          pageIndex === 0 ? data.pacientes : [...prev, ...data.pacientes]
        );
        setHasMore(Boolean(data.hasMore));
      } catch {
        setError("No se pudo conectar. Revisá tu conexión e intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  useEffect(() => {
    setPacientes([]);
    setPage(0);
    setHasMore(true);
    fetchPacientes(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchNext = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPacientes(nextPage);
    }
  };

  return { pacientes, loading, hasMore, fetchNext, error };
}
```

The `supabase` import is gone, and with it the last browser-side read of the patients table.

- [ ] **Step 2: Verify**

Run: `grep -n "supabase" "src/app/(app)/pacientes/useInfinitePacientes.ts"` → expect no output.
Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect `14`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/pacientes/useInfinitePacientes.ts"
git commit -m "feat(pacientes): fetch the list from the API instead of Supabase"
```

---

### Task 4: Render and sort the derived date

**Files:**
- Modify: `src/app/ui/Table.tsx`

- [ ] **Step 1: Change the types**

Replace the `Paciente` import with:

```ts
import type { PacienteListItem } from "@/app/(app)/pacientes/types";
```

Update the prop and sort types — everywhere the file says `Paciente`, it now means `PacienteListItem`:

```ts
type TableProps = {
  pacientes: PacienteListItem[];
  onEditPaciente: (paciente: PacienteListItem) => void;
  loading?: boolean;
};

type SortConfig = {
  key: keyof PacienteListItem;
  direction: "asc" | "desc";
};
```

Note `ultimaVisita` is now a real key of the row type, so the old `keyof Paciente | "ultimaVisita"` union collapses to plain `keyof PacienteListItem`. Update `handleSort`'s signature and the `handleSort(key as ...)` cast in the header map accordingly.

- [ ] **Step 2: Simplify the sort comparator**

Replace the `aValue`/`bValue` derivation inside the `sort` callback:

```ts
      const aRaw = a[key];
      const bRaw = b[key];

      const aValue =
        key === "ultimaVisita" && aRaw ? new Date(aRaw as string) : aRaw ?? "";
      const bValue =
        key === "ultimaVisita" && bRaw ? new Date(bRaw as string) : bRaw ?? "";
```

The rest of the comparator — the null handling and the `<`/`>` comparison — stays exactly as it is.

- [ ] **Step 3: Fix the desktop cell**

Replace the "Última Visita" `<td>` body (the one currently reading `paciente.visitas[0].date`):

```tsx
                        {paciente.ultimaVisita
                          ? format(new Date(paciente.ultimaVisita), "dd/MM/yyyy")
                          : "-"}
```

An empty array now yields `null` from the server and renders as `-` instead of throwing.

- [ ] **Step 4: Fix the mobile card cell**

The mobile card block (around line 230) reads `paciente.visitas[0].date` the same way. Apply the same replacement there.

- [ ] **Step 5: Verify nothing reaches into visitas any more**

Run: `grep -n "visitas" src/app/ui/Table.tsx`
Expected: no output.

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect `14`.
Run: `grep -c 'Ã' src/app/ui/Table.tsx` → expect `0`, and `grep -n "Última"` must render correctly.

- [ ] **Step 6: Commit**

```bash
git add src/app/ui/Table.tsx
git commit -m "fix(pacientes): show the most recent visit in Última Visita

The column read visitas[0], and new visits are appended to the end of the
array, so it had been showing each patient's first-ever consultation and
sorting by that. It now uses the server-derived latest date. A patient
with an empty visitas array renders '-' instead of throwing."
```

---

### Task 5: Restrict what an edit can write

**Files:**
- Modify: `src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx`
- Modify: `src/app/remoteDataSource/supabase.ts`

Why this belongs in PR 2 rather than PR 3: the dialog does `defaultValues: paciente` and submits the resulting object wholesale. Now that rows carry `ultimaVisita`, which is **not a column**, an unrestricted update would send it to Supabase and fail. Narrowing the write also removes the risk of an edit clobbering `visitas`.

- [ ] **Step 1: Narrow `updatePaciente` in `src/app/remoteDataSource/supabase.ts`**

Replace the existing `updatePaciente` with:

```ts
import type { PacienteEditableFields } from "@/app/(app)/pacientes/types";

export const updatePaciente = async (
  id: number,
  updates: PacienteEditableFields
) => {
  // Only the editable fields, never the whole row: the row now carries a
  // derived `ultimaVisita` that is not a column, and a wholesale write could
  // also clobber the visitas array.
  const { data, error } = await supabase
    .from("pacientes")
    .update({
      firstName: updates.firstName,
      lastName: updates.lastName,
      age: updates.age,
      dni: updates.dni,
      doctor: updates.doctor,
      obraSocial: updates.obraSocial,
    })
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error updating paciente:", error);
    return error;
  }
  return data;
};
```

Leave `addPaciente` and `deletePaciente` alone — they move to Server Actions in PR 3.

- [ ] **Step 1b: Add `updatePacienteVisitas` and repoint the detail page — this is not optional**

`updatePaciente` has three call sites, verified: the edit dialog, and **twice in `src/app/(app)/paciente/[id]/paciente-component.tsx`**, at lines 38 and 50, both as `updatePaciente(paciente.id, { ...paciente, visitas: ... })` — one saves a new report, the other edits an existing one.

Narrowing `updatePaciente` without handling those would make **saving a report silently stop working**: the call would succeed, write the six editable fields, quietly discard `visitas`, and the doctor would find her report gone. That is the app's central workflow.

So add a second function beside it in `src/app/remoteDataSource/supabase.ts`:

```ts
/**
 * Writes only the visitas column.
 *
 * Separate from `updatePaciente` so neither function can clobber the other's
 * columns: saving a report must never touch the patient's details, and editing
 * the patient's details must never touch their reports.
 */
export const updatePacienteVisitas = async (id: number, visitas: Visitas[]) => {
  const { data, error } = await supabase
    .from("pacientes")
    .update({ visitas })
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error updating visitas:", error);
    return error;
  }
  return data;
};
```

Add `Visitas` to the existing type import from `../../../types/supabase`.

Then in `paciente-component.tsx`, change both call sites to use it:

```tsx
      await updatePacienteVisitas(paciente.id, newVisitas);
```

```tsx
        await updatePacienteVisitas(paciente.id, visitasCopy);
```

and update the import on line 4 accordingly. The surrounding logic — building `newVisitas`, the `visitasCopy[toEditIndex] = visita` edit path, and the `setLocalVisitas` calls — stays exactly as it is.

**Verify both call sites changed:** `grep -n "updatePaciente\b" "src/app/(app)/paciente/[id]/paciente-component.tsx"` must produce no output, and `grep -c "updatePacienteVisitas" "src/app/(app)/paciente/[id]/paciente-component.tsx"` must be `3` (one import, two calls).

- [ ] **Step 2: Narrow the dialog's submit**

In `EditPacienteDialogBody.tsx`, change the prop type to `PacienteListItem`, and pass only the editable fields as defaults so nothing derived is ever in the form state:

```tsx
  const { register, handleSubmit } = useForm<PacienteEditableFields>({
    defaultValues: {
      firstName: paciente.firstName,
      lastName: paciente.lastName,
      age: paciente.age,
      dni: paciente.dni,
      doctor: paciente.doctor,
      obraSocial: paciente.obraSocial,
    },
  });

  const onSubmit: SubmitHandler<PacienteEditableFields> = async (data) => {
    const updatedPaciente = await updatePaciente(paciente.id, data);
```

Keep the rest of the component — the six `register` calls, the layout, the strings — exactly as they are.

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect `14`.
Run: `grep -rn "updatePaciente" src/` and confirm every call site type-checks.

- [ ] **Step 4: Commit**

```bash
git add src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx \n  src/app/remoteDataSource/supabase.ts \n  "src/app/(app)/paciente/[id]/paciente-component.tsx"
git commit -m "fix(pacientes): write only editable fields when updating a patient"
```

---

### Task 6: Promote the forged-cookie check

**Files:**
- Modify: `scripts/verify-lockdown.sh`

PR 1 wrote this check as `INFO` expecting 200, with a comment saying it must become a hard 401 once a data endpoint exists behind `requireSession()`. Task 2 created that endpoint. The promise comes due.

- [ ] **Step 1: Rewrite check 1**

Point it at `/api/pacientes` instead of `/pacientes`, expect `401`, and count a failure:

```sh
# --- Check 1: forged session cookie is rejected -------------------------------
# The single most important check in this file. An unsigned, hand-written cookie
# must not reach patient data. An earlier draft of this design shipped a version
# where it did: parseSession only type-checked the cookie, nothing verified the
# token, and service_role meant Postgres never saw it either. Every other check
# here passed while the database was wide open.
FORGED='lab_session={"access_token":"x","refresh_token":"y","expires_at":9999999999}'
code=$(curl -s -o /dev/null -w '%{http_code}' -H "Cookie: $FORGED" "$BASE/api/pacientes")
if [ "$code" = "401" ]; then
  echo "PASS  forged cookie -> 401"
else
  echo "FAIL  forged cookie -> $code (expected 401)"
  failures=$((failures + 1))
fi
```

Update the file's header comment: the expectation no longer changes in a future PR, so remove that note and say plainly that this check must always be 401.

- [ ] **Step 2: Add a check that the endpoint refuses an anonymous request**

```sh
# --- Check 4: the list endpoint requires a session ----------------------------
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/pacientes")
if [ "$code" = "401" ]; then
  echo "PASS  no cookie -> /api/pacientes 401"
else
  echo "FAIL  no cookie -> /api/pacientes $code (expected 401)"
  failures=$((failures + 1))
fi
```

- [ ] **Step 3: Run it**

With `pnpm dev` running and after `pnpm build`:

```bash
sh scripts/verify-lockdown.sh
```

Expected: every check PASS, exit 0. Show the literal output.

Confirm the file is still LF: `file scripts/verify-lockdown.sh` must not say CRLF.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-lockdown.sh
git commit -m "chore(auth): require 401 on a forged cookie now that a data endpoint exists"
```

---

### Task 7: Build and close out

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: completes, and the route list includes `ƒ /api/pacientes` alongside the two auth routes and `ƒ Proxy (Middleware)`.

- [ ] **Step 2: Confirm the browser no longer reads the patients table for the list**

Run: `grep -rn "from(\"pacientes\")\|from('pacientes')" src/`

Expected: the only hits are `src/app/api/pacientes/route.ts`, `src/app/remoteDataSource/supabase.ts` (writes, moving in PR 3), and `src/app/(app)/paciente/[id]/page.tsx` (the detail page, moving in PR 3). **`useInfinitePacientes.ts` must not appear.**

- [ ] **Step 3: Bundle check**

```bash
grep -rl "sb_secret" .next/static/ 2>/dev/null; echo "exit=$?"
```

Expected: no output. The secret key must never reach the client.

- [ ] **Step 4: Verification bar**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` → expect `14`.

- [ ] **Step 5: Stop, and hand back for the manual smoke test**

Do not push and do not open a PR. The repo owner runs the interactive checks with real credentials:

- The patient list loads, and the "Última Visita" column now shows each patient's **most recent** visit — this is a visible change, and for patients with several visits the dates will differ from what the clinic is used to seeing.
- Sorting by "Última Visita" orders by most recent.
- Typing a partial surname ("Per") now finds matches ("Perez"), which it did not before.
- Infinite scroll still loads more.
- A patient with no visits shows `-` rather than breaking the list.
- Editing a patient still saves, and opening that patient afterwards still shows all their reports — the check that the narrowed write did not drop `visitas`.
- DevTools → Network: the list request goes to `/api/pacientes`, and its response contains **no `visitas` array**.

---

## What this PR deliberately does not do

- **It does not close the RLS hole.** `public.pacientes` is still readable with the publishable key, which still ships in the bundle, because the detail page and the writes still query from the browser. PR 4 is the cutover.
- The detail page and all writes stay on the browser — PR 3.
- `visitas` stays a JSON column on `pacientes`. Moving it to its own table would fix the remaining payload weight, but it needs a data migration and is out of scope.
- Search still matches surname only, as it always has. Extending it to first names is a separate change.
