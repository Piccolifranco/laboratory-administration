# Auth Hardening PR 3 — Detail Page and Writes Server-Side — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the last browser-side Supabase access — the patient detail page and all four write paths — onto the server, so nothing in the shipped JavaScript can reach the database.

**Architecture:** The detail page becomes a Server Component reading through `adminDb()`. The four writers become Server Actions in one module, each gated by `adminDb()` and returning a discriminated result the client can branch on. The browser Supabase clients are then deleted outright.

**Tech Stack:** Next 16.2.6 (App Router), React 19, TypeScript 5.9, `@supabase/supabase-js` v2, pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-15-auth-hardening-design.md`

**Branch:** `feature/paciente-detalle` (off `development`, which has PRs 1 and 2 merged)

---

## Context from PRs 1 and 2

- `adminDb()` in `src/app/remoteDataSource/supabaseServerSide.ts` is the only way to reach patient data. It calls `requireSession()` internally — which verifies the access token's signature with `getClaims()` — and throws `UnauthorizedError`. The raw client is not exported.
- `revokeSession(accessToken)` is the one deliberately ungated export there, used by logout.
- `isUnauthorized(error)` / `unauthorizedResponse()` live in `src/app/utils/authResponse.ts`.
- `PacienteListItem` and `PacienteEditableFields` live in `src/app/(app)/pacientes/types.ts`.
- `GET /api/pacientes` is the pattern to follow for gating.
- `scripts/verify-lockdown.sh` runs four checks, all passing.

## Deviation from the spec, deliberate

The spec puts "delete `src/app/utils/supabaseClient.ts` and the browser client in `src/app/remoteDataSource/supabase.ts`" in PR 4. This plan does it in **PR 3**, because after this PR nothing imports them and leaving dead clients around invites someone to use one. The practical effect is that the publishable key leaves the client bundle one PR earlier. PR 4 becomes purely the cutover: remove the env var, drop the anon policy, enable RLS.

## Verification baselines

`pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` reports **14**, distributed as:

| Count | File |
|---|---|
| 8 | `src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx` |
| 2 | `src/app/remoteDataSource/supabase.ts` — **both disappear when this PR deletes the file** |
| 1 | `src/app/ui/status.tsx` |
| 1 | `src/app/ui/NewVisitaDialogBody/defaultValues.ts` |
| 1 | `src/app/(app)/pacientes/pacientes-component.tsx` — `InfiniteScroll` missing its `loader` prop |
| 1 | `src/app/(app)/paciente/[id]/page.tsx` — `.eq("id", pacienteId)` string vs number, **fixed by Task 2** |

**This PR lowers the baseline from 14 to 13**, and the count moves during the work. Track it per task:

| After | Count | Why |
|---|---|---|
| Task 1 | **16** | The new actions module writes `doctor` in an insert and an update, and `doctor` is missing from the generated `Insert`/`Update` types, so each resolves to `never`. +2. |
| Task 2 | **15** | The detail page's string-vs-number error is fixed. −1. |
| Task 3 | 15 | Rewiring call sites changes no types. |
| Task 4 | **13** | Deleting `supabase.ts` removes its 2 errors — which are the *same* `doctor` problem, just relocated to the actions module by Task 1. |

So the two `doctor` errors follow the code rather than disappearing. **`doctor` is a real column** — the app has written it since forever and `GET /api/pacientes` selects it — so this is stale generated types, not a schema problem, and there is no runtime effect. Regenerating `types/supabase.ts` with `supabase gen types typescript` (a read-only operation, not a migration) would take the count to 11. That is the repo owner's to run and is not part of this PR.

If the final count is not 13, something else changed.

Paths contain parentheses, so for a per-file breakdown use:

```bash
pnpm exec tsc --noEmit 2>&1 | grep -E "^.+\([0-9]+,[0-9]+\): error" \
  | sed -E 's/\([0-9]+,[0-9]+\): error.*//' | sort | uniq -c | sort -rn
```

## Hard rules

- **Never run a database migration, `supabase db push`, `supabase db reset`, `DROP`, or any schema change.** The `pacientes` table holds years of real patient records and there is no staging copy. Nothing in this PR touches the schema.
- **Never read, write, or commit `.env`.** A permission rule blocks `.env*` paths.
- **Line endings:** UTF-8 with CRLF, no BOM, except `*.sh` which is LF. After editing, `sed -i 's/\r\?$/\r/' <file>`, then `file <file>`. Check `git diff --stat`: a small edit showing as a whole-file diff means a stray trailing CR on a file with no final newline — fix with `perl -0777 -i -pe 's/\r\z//' <file>`.
- **Write code containing backslashes with the Write/Edit tools, never a shell heredoc** — heredocs collapse `\\` to `\` here, which silently broke a regex in PR 2.
- **`types/supabase.ts` is UTF-16LE** — do not edit it, only import from it.
- Commit messages: conventional-commit prefixes, **no `Co-Authored-By` trailer**, no `-c commit.gpgsign=false` or other bypass flags.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/app/remoteDataSource/pacientesActions.ts` | **New.** The four Server Actions, each gated by `adminDb()`. Replaces the browser writers. |
| `src/app/(app)/paciente/[id]/page.tsx` | Reads through `adminDb()`; redirects to login when unauthorized, 404s on a bad id. |
| `src/app/(app)/paciente/[id]/paciente-component.tsx` | Calls the save-visits action. |
| `src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx` | Calls the update action. |
| `src/app/ui/NewPacienteDialog/NewPacienteDialogBody.tsx` | Calls the create action. |
| `src/app/ui/Table.tsx` | Calls the delete action. |
| `src/app/(app)/pacientes/page.tsx` | Loses nine dead imports. |
| `src/app/remoteDataSource/supabase.ts` | **Deleted.** |
| `src/app/utils/supabaseClient.ts` | **Deleted.** |

---

### Task 1: The Server Actions module

**Files:**
- Create: `src/app/remoteDataSource/pacientesActions.ts`

Server Actions are POST endpoints under the hood, and Next checks the request origin, so they carry CSRF protection the hand-rolled writers never had. They **must not throw across the boundary**: Next redacts server error messages in production, so a thrown `UnauthorizedError` reaches the client as an opaque failure. Each action therefore catches and returns a discriminated result.

- [ ] **Step 1: Write the module**

```ts
"use server";

import { adminDb } from "./supabaseServerSide";
import { isUnauthorized } from "@/app/utils/session";
import type { PacienteEditableFields } from "@/app/(app)/pacientes/types";
import type { Paciente, Visitas } from "@/types/supabase";

/**
 * What every action returns.
 *
 * Actions never throw across the server/client boundary: Next redacts server
 * error messages in production, so a thrown UnauthorizedError would reach the
 * caller as an opaque "An error occurred" with no way to tell "log in again"
 * from "the database rejected this".
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "unauthorized" | "error"; message: string };

function fail(error: unknown, fallback: string): ActionResult<never> {
  if (isUnauthorized(error)) {
    return { ok: false, reason: "unauthorized", message: "Sesión expirada" };
  }
  console.error(fallback, error);
  return { ok: false, reason: "error", message: fallback };
}

/** The six fields an edit may change. Anything else on the object is ignored. */
function editableOnly(fields: PacienteEditableFields) {
  return {
    firstName: fields.firstName,
    lastName: fields.lastName,
    age: fields.age,
    dni: fields.dni,
    doctor: fields.doctor,
    obraSocial: fields.obraSocial,
  };
}

export async function createPacienteAction(
  fields: PacienteEditableFields
): Promise<ActionResult<Paciente>> {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .insert(editableOnly(fields))
      // .select() is required: without it PostgREST replies 204 with no body
      // and a successful write is indistinguishable from a failed one.
      .select()
      .single();

    if (error) return fail(error, "No se pudo crear el paciente");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo crear el paciente");
  }
}

export async function updatePacienteAction(
  id: number,
  fields: PacienteEditableFields
): Promise<ActionResult<Paciente>> {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .update(editableOnly(fields))
      .eq("id", id)
      .select()
      .single();

    if (error) return fail(error, "No se pudo actualizar el paciente");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo actualizar el paciente");
  }
}

/**
 * Writes only the visitas column, never the patient's own fields.
 *
 * Kept separate from updatePacienteAction so neither can clobber the other's
 * columns: saving a report must not touch patient details, and editing details
 * must not touch reports.
 */
export async function saveVisitasAction(
  id: number,
  visitas: Visitas[]
): Promise<ActionResult<Paciente>> {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .update({ visitas })
      .eq("id", id)
      .select()
      .single();

    if (error) return fail(error, "No se pudo guardar el informe");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo guardar el informe");
  }
}

export async function deletePacienteAction(
  id: number
): Promise<ActionResult<Paciente>> {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) return fail(error, "No se pudo eliminar el paciente");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo eliminar el paciente");
  }
}
```

- [ ] **Step 2: Export `isUnauthorized` from `session.ts` if it is not there**

`isUnauthorized` currently lives in `src/app/utils/authResponse.ts`, which imports `next/server`. Importing that into a `"use server"` module is fine, but the type guard belongs with the error it guards. **Move `isUnauthorized` into `src/app/utils/session.ts`** (next to `UnauthorizedError`) and have `authResponse.ts` re-export it so existing importers keep working:

```ts
// in session.ts, after UnauthorizedError
/** True when the error came from `requireSession()` rejecting a request. */
export function isUnauthorized(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}
```

```ts
// in authResponse.ts, replacing its own definition
export { isUnauthorized } from "./session";
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -E "pacientesActions|authResponse|utils/session"`
Expected: exactly two errors, both in `pacientesActions.ts`, both `Type 'string' is not assignable to type 'never'` on the `doctor` line — one from the insert, one from the update. That is the stale generated types described above, not a mistake in your code. Anything else is.

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` -> expect **16**.

- [ ] **Step 4: Commit**

```bash
git add src/app/remoteDataSource/pacientesActions.ts src/app/utils/session.ts src/app/utils/authResponse.ts
git commit -m "feat(pacientes): add session-gated server actions for patient writes"
```

---

### Task 2: The detail page reads server-side

**Files:**
- Modify: `src/app/(app)/paciente/[id]/page.tsx`

This is the page the whole round has been building toward. It is currently a Server Component querying with the **publishable key and no session** — the only reason it works is the `anon` SELECT policy that PR 4 deletes. After this task it reads through `adminDb()`.

It also carries one of the 14 baseline type errors: `.eq("id", pacienteId)` passes the route param, a string, where the column is a number.

- [ ] **Step 1: Replace the file**

```tsx
import { notFound, redirect } from "next/navigation";
import { adminDb } from "@/app/remoteDataSource/supabaseServerSide";
import { isUnauthorized } from "@/app/utils/session";
import { PacienteComponent } from "./paciente-component";

export default async function PacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ createVisita?: string }>;
}) {
  const { id: pacienteId } = await params;
  const { createVisita } = await searchParams;

  // The route param is a string; the column is a number. Passing the string
  // worked only because PostgREST coerced it, and it was one of the repo's
  // pre-existing type errors.
  const id = Number(pacienteId);
  if (!Number.isInteger(id)) notFound();

  let db;
  try {
    db = await adminDb();
  } catch (error) {
    // A Server Component cannot return 401 usefully, and it cannot refresh the
    // cookie either. Sending the visitor to the login screen is the honest
    // outcome; proxy.ts handles the same case for navigations.
    if (isUnauthorized(error)) redirect("/");
    throw error;
  }

  const { data: paciente, error } = await db
    .from("pacientes")
    .select()
    .eq("id", id)
    .single();

  if (error || !paciente) notFound();

  return (
    <PacienteComponent
      paciente={paciente}
      modalOpen={createVisita === "true"}
      visitas={paciente.visitas ?? []}
    />
  );
}
```

Note `redirect()` and `notFound()` work by throwing, so they must not sit inside a `try` that swallows errors — hence the narrow `try` around `adminDb()` only.

The unused `InvoiceStatus`, `format`, `Image`, `Link` and `React` imports go away with the rewrite.

- [ ] **Step 2: Verify the page still renders for a logged-out visitor by redirecting**

Start `pnpm dev`:

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:3000/paciente/1
```

Expected: `307 -> http://localhost:3000/` — this comes from `proxy.ts`, which guards the route before the page runs.

- [ ] **Step 3: Verify a non-numeric id does not crash**

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:3000/paciente/abc
```

Expected: `307 -> http://localhost:3000/` (the proxy redirects first, since there is no session). The `notFound()` path is exercised by the repo owner while logged in.

- [ ] **Step 4: Verify the type error is gone**

Run: `pnpm exec tsc --noEmit 2>&1 | grep "paciente/\[id\]/page.tsx"`
Expected: no output. The count should now be **15**.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/paciente/[id]/page.tsx"
git commit -m "feat(paciente): read the detail page through adminDb

It queried with the publishable key and no session, working only because
of the anon SELECT policy that PR 4 removes. Also converts the route
param to a number, which was one of the repo's pre-existing type errors."
```

---

### Task 3: Rewire the four write call sites

**Files:**
- Modify: `src/app/(app)/paciente/[id]/paciente-component.tsx`
- Modify: `src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx`
- Modify: `src/app/ui/NewPacienteDialog/NewPacienteDialogBody.tsx`
- Modify: `src/app/ui/Table.tsx`

Each call site currently gets back a row or `null`. The actions return `ActionResult`, so each check becomes `if (!result.ok)`.

- [ ] **Step 1: `paciente-component.tsx` — saving and editing reports**

Replace the import on line 4:

```ts
import { saveVisitasAction } from "@/app/remoteDataSource/pacientesActions";
```

Both call sites currently read `await updatePacienteVisitas(paciente.id, <array>)`. Replace the new-report one:

```tsx
      const result = await saveVisitasAction(paciente.id, newVisitas);
      if (!result.ok) {
        console.error(result.message);
        return;
      }
      setLocalVisitas(newVisitas);
```

and the edit one:

```tsx
        const result = await saveVisitasAction(paciente.id, visitasCopy);
        if (!result.ok) {
          console.error(result.message);
          return;
        }
        setLocalVisitas([...visitasCopy]);
```

**The `return` on failure matters.** Today the local state updates regardless, so a failed save shows the report on screen as if it had been stored. The doctor would close the page believing the report is saved.

- [ ] **Step 2: `EditPacienteDialogBody.tsx`**

```ts
import { updatePacienteAction } from "@/app/remoteDataSource/pacientesActions";
```

```tsx
    const result = await updatePacienteAction(paciente.id, data);
    removeQueryParams();

    if (!result.ok) {
      console.error(result.message);
      return;
    }

    onSaved?.();
    router.refresh();
```

- [ ] **Step 3: `NewPacienteDialogBody.tsx`**

```ts
import { createPacienteAction } from "@/app/remoteDataSource/pacientesActions";
```

The form is typed `useForm<Paciente>`; narrow it to `PacienteEditableFields` to match the action, importing the type from `@/app/(app)/pacientes/types`. The six `register` calls already cover exactly those fields — check them and report if any register a field outside that set.

```tsx
    const result = await createPacienteAction(data);
    removeQueryParams();

    if (!result.ok) {
      console.error(result.message);
      return;
    }

    onSaved?.();
    router.refresh();
```

- [ ] **Step 4: `Table.tsx` — both delete handlers**

```ts
import { deletePacienteAction } from "../remoteDataSource/pacientesActions";
```

Both handlers become:

```tsx
                    const result = await deletePacienteAction(paciente.id);
                    if (!result.ok) {
                      console.error(result.message);
                      return;
                    }
                    onDeleted?.();
                    router.refresh();
```

- [ ] **Step 5: Verify no call site still imports the old writers**

Run: `grep -rn "remoteDataSource/supabase\"" src/`
Expected: no output.

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` -> expect **15** (unchanged; Task 4 is what drops it).

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/paciente/[id]/paciente-component.tsx" \
  src/app/ui/EditPacienteDialog/EditPacienteDialogBody.tsx \
  src/app/ui/NewPacienteDialog/NewPacienteDialogBody.tsx \
  src/app/ui/Table.tsx
git commit -m "feat(pacientes): write through server actions instead of the browser client

Saving a report now stops on failure instead of updating local state, so
a write that did not reach the database no longer looks like it did."
```

---

### Task 4: Delete the browser Supabase clients

**Files:**
- Delete: `src/app/remoteDataSource/supabase.ts`
- Delete: `src/app/utils/supabaseClient.ts`
- Modify: `src/app/(app)/pacientes/page.tsx`

- [ ] **Step 1: Confirm nothing imports them**

```bash
grep -rn "remoteDataSource/supabase\"\|utils/supabaseClient" src/
```

Expected: only `src/app/(app)/pacientes/page.tsx`, which imports `supabase` and never uses it.

- [ ] **Step 2: Strip the dead imports from `pacientes/page.tsx`**

The file uses only `Pacientes`. Delete the other nine imports — `Image`, `Search`, `CreatePaciente`, `Table`, `Suspense`, `InvoicesTableSkeleton`, `Dialog`, `NewPacienteDialogBody`, `Paciente`, `supabase` — leaving:

```tsx
import { Pacientes } from "./pacientes-component";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const isCreatePacienteOpen = sp.createPaciente === "true";
  const isEditPacienteOpen = sp.editPaciente === "true";

  return (
    <Pacientes
      isCreatePacienteOpen={isCreatePacienteOpen}
      isEditPacienteOpen={isEditPacienteOpen}
    />
  );
}
```

- [ ] **Step 3: Delete both client modules**

```bash
git rm src/app/remoteDataSource/supabase.ts src/app/utils/supabaseClient.ts
```

- [ ] **Step 4: Verify**

Run: `grep -rn "NEXT_PUBLIC_SUPABASE_API_KEY" src/`
Expected: no output. Nothing in the source reads the publishable key any more.

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` -> expect **13**.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(pacientes): delete the browser supabase clients

Nothing imports them now that reads and writes are server-side. The
publishable key is no longer referenced anywhere in src/, so it stops
being inlined into the client bundle."
```

---

### Task 5: Build, bundle check, and close out

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: completes. The route list keeps `ƒ /api/auth/login`, `ƒ /api/auth/logout`, `ƒ /api/pacientes`, `ƒ /paciente/[id]`, `ƒ /pacientes` and `ƒ Proxy (Middleware)`.

- [ ] **Step 2: The milestone check — no Supabase credentials in the client bundle**

```bash
grep -rl "lylnvhhzhyqlbbjgymws" .next/static/ 2>/dev/null; echo "exit=$?"
grep -rl "sb_publishable" .next/static/ 2>/dev/null; echo "exit=$?"
grep -rl "sb_secret" .next/static/ 2>/dev/null; echo "exit=$?"
```

Expected: **no output from any of the three.** In PR 2 the first two still matched. This is the point at which the browser stops carrying any credential for the database at all.

Report the result of each separately and verbatim. If the project ref still appears, find what references it before continuing — that file still ships a client.

- [ ] **Step 3: Add the bundle check to the verification script**

In `scripts/verify-lockdown.sh`, extend check 3 to cover the publishable key and project ref, not just `sb_secret`:

```sh
# --- Check 3: no Supabase credentials in the client bundle -------------------
# From PR 3 on, the browser holds no database credential at all: every read and
# write goes through a session-gated route handler or server action.
leaked=""
for needle in sb_secret sb_publishable lylnvhhzhyqlbbjgymws; do
  if grep -rl "$needle" "$ROOT/.next/static/" >/dev/null 2>&1; then
    leaked="$leaked $needle"
  fi
done
if [ -n "$leaked" ]; then
  echo "FAIL  credentials in the client bundle:$leaked"
  failures=$((failures + 1))
else
  echo "PASS  no supabase credentials in the client bundle"
fi
```

Keep the existing "no bundle at .next/static" guard ahead of it.

- [ ] **Step 4: Run the script**

```bash
sh scripts/verify-lockdown.sh
```

Expected: all four checks PASS, exit 0. Show the literal output.

- [ ] **Step 5: Final verification bar**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` -> expect **13**.

Per-file breakdown should be: 8 `NewVisitaDialogBody.tsx`, 2 `pacientesActions.ts` (the stale `doctor` types), 1 `defaultValues.ts`, 1 `status.tsx`, 1 `pacientes-component.tsx`.

- [ ] **Step 6: Commit and stop**

```bash
git add scripts/verify-lockdown.sh
git commit -m "chore(auth): assert no supabase credentials reach the client bundle"
```

Do not push and do not open a PR.

---

## Manual smoke test, for the repo owner

Every write path changed, so all of them need exercising against a throwaway patient:

- Create a patient → appears in the list without a reload.
- Open the patient → the detail page renders with all their reports.
- Save a report → reload → it is still there.
- Edit a report → reload → the change stuck.
- Edit the patient's details → the row updates, and their reports survive.
- Download a PDF.
- Delete the patient → gone without a reload.
- Log out, then type `/paciente/1` → redirected to the login screen.
- With a bad id while logged in, `/paciente/999999` → the not-found page, not a crash.

## What this PR deliberately does not do

- **It does not close the RLS exposure.** `public.pacientes` still has RLS disabled and the `anon` SELECT policy in place, so the table is still readable by anyone with a publishable key — they just cannot get one from this app's bundle any more. PR 4 drops the policy and enables RLS.
- `visitas` stays a JSON column; moving it needs a migration.
- `typescript.ignoreBuildErrors` stays on; 11 pre-existing errors remain in the visit form.
