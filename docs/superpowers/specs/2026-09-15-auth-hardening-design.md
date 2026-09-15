# Auth Hardening — Server-Side Sessions and RLS Lockdown — Design

**Date:** 2026-09-15
**Branch:** `feature/auth-guard` (off `development`)
**Status:** Design approved, pending implementation plan

## Goal

Close a critical data exposure: `public.pacientes` has RLS **disabled**, and its only policy is `FOR SELECT TO anon USING (true)`. The Supabase publishable key ships in the browser bundle, so anyone who loads the site can read, modify, or delete every patient record via the REST API without logging in. The login screen is cosmetic — there is no route protection and no server-side session check.

This work moves all Supabase access behind the Next.js server, puts the session in an `httpOnly` cookie, and locks the table down so that only the backend can reach it.

## Context (audit findings)

- No `middleware.ts` / `proxy.ts`; no route guards. Typing `/pacientes` grants access.
- `src/app/page.tsx` authenticates in the browser and stores the token in `localStorage`.
- Supabase Advisor reports two CRITICAL issues on `public.pacientes`: *Policy Exists RLS Disabled* and *RLS Disabled in Public*.
- The single existing policy is named `"Policy with table joins"` (a leftover Supabase template name; it contains no joins) and grants unrestricted `SELECT` to `anon`.
- No policies exist for `INSERT` / `UPDATE` / `DELETE`. Enabling RLS without writing new policies would leave reads just as open while breaking every write.
- The `.env` was committed in history (`b70636b`) and the repo is public, but those keys were rotated in July 2026 and are inert. `.env` is untracked and ignored as of `abc09cf`.

## Decisions (locked)

- **The browser never holds a token.** Session lives in an `httpOnly` cookie. This rules out the stock `@supabase/ssr` browser-client pattern, which stores the session in a JS-readable `document.cookie` so the browser can query Supabase directly.
- **All data access moves server-side** — Route Handlers and Server Actions. This is the "backend" from the modernization plan: no Nest, no Express, no extra hosting.
- **The server uses `service_role`.** RLS is enabled with **no policies at all**, making the table unreachable for `anon` and `authenticated`. Only the backend gets in. With a single shared clinic account, per-user policies buy nothing.
- **The cookie is not trusted; the JWT inside it is verified.** The cookie is untrusted transport. Authenticity comes from verifying the `access_token`'s signature with `supabaseAuth.auth.getClaims(token)`, and expiry comes from the verified `exp` claim. See "Cookie authenticity" below — this was added after review found that the original design authorized anyone who hand-wrote a cookie.
- **Sessions are long and self-renewing.** ~90-day cookie, refresh token rotated by the proxy on each visit. The decorative "Recordarme" checkbox is removed — that is now the default behavior. **This depends on Supabase configuration the code cannot express:** sessions have no time-box and no inactivity timeout by default, so the refresh token is effectively immortal until Auth → Sessions is configured in the dashboard. Set both there and record the values here.
- **Four sequential PRs**, each deployable with the app working.
- **`src/proxy.ts`, not `middleware.ts`.** Next 16 resolves `proxyFilePath || middlewareFilePath`; `proxy` is the canonical name in 16.2.6 and `middleware` is a fallback.

## Architecture

### Supabase clients (server only)

- `src/app/remoteDataSource/supabaseServerSide.ts` — currently an empty file; becomes the `service_role` client used for all data access. Reads `SUPABASE_SECRET_KEY` (**not** `NEXT_PUBLIC_`). Starts with `import "server-only"` so the build fails loudly if a client component ever imports it.
- `src/app/remoteDataSource/supabaseAuth.ts` — a separate auth-only client, publishable key, server-side only, used solely for `signInWithPassword` and `refreshSession`. Kept apart from the `service_role` client so that nothing in the auth path can accidentally reach data with admin privileges.

### Session cookie

`httpOnly`, `Secure`, `SameSite=Lax`, `path=/`, `maxAge` ~90 days. Holds the Supabase session (access token + refresh token), well under the 4KB cookie limit.

### `src/proxy.ts`

Runs on protected routes. Reads the cookie; if the access token is near expiry, refreshes it via the refresh token and rewrites the cookie. Redirects to `/` when there is no valid session. Refresh tokens rotate on use, so the session survives indefinitely with regular visits and lapses on its own after prolonged inactivity.

### Cookie authenticity

`httpOnly`, `Secure`, and `SameSite` constrain what a *browser* does with a cookie the server issued. They constrain nothing about what an arbitrary HTTP client puts in a `Cookie` header. A cookie whose contents are merely well-formed is not a credential.

The first draft of this design missed that: the cookie held `{access_token, refresh_token, expires_at}` as plain JSON, the parser checked only that the fields were strings and a number, and nothing ever verified the token — `service_role` meant Postgres never saw it either. `curl -H 'Cookie: lab_session={"access_token":"x","refresh_token":"y","expires_at":9999999999}'` would have been a full authentication bypass, and the verification plan could not have detected it: the Supabase Advisor would read green, no key would appear in the bundle, and the smoke test would pass.

So the JSON wrapper is **untrusted transport**, and the access token inside it is the credential:

- `parseSession` stays exactly as it is, demoted to a cheap structural pre-filter. It is no longer the trust boundary.
- `requireSession()` verifies the access token's signature with `supabaseAuth.auth.getClaims(token)` and takes expiry from the **verified `exp` claim**, never from the cookie's `expires_at` field.
- A forged or expired token yields `UnauthorizedError`, the same as no cookie at all.

`getClaims` uses Web Crypto (`crypto.subtle`), so it runs in both the Edge and Node runtimes and needs no new dependency.

**Configuration dependency:** `getClaims` verifies locally against the cached JWKS only for asymmetric signing keys. If the project still uses the legacy HS256 shared secret, it falls back to `getUser()` — a network round trip to Supabase on every verification. The project must be migrated to asymmetric signing keys (Project Settings → JWT Keys) before this ships.

`src/proxy.ts` is not the trust boundary and deliberately does not verify. It does the cheap checks — cookie present, not expired by the wrapper's own claim — and rotates the refresh token. Forging a cookie gets an attacker past the proxy and no further: every path to data goes through `adminDb()`, which verifies.

### Authorization risk and its mitigation

Because the server uses `service_role`, Postgres no longer authorizes anything — the cookie is the only access control. A Route Handler that forgets its session check is a fully open, admin-privileged endpoint. Previously RLS would have caught that mistake.

Mitigation has to be structural, not disciplinary — and review showed the first draft was not. Exporting `supabaseAdmin` as a bare singleton made the insecure handler *shorter* to write than the secure one: one import and no gate. A `grep` for `requireSession` in PR 4 is disciplinary by definition — it catches the mistake after it is written, matches on text, and is defeated by a call that is present but unreachable.

So the admin client is never exported. `src/app/remoteDataSource/supabaseServerSide.ts` exports only:

```ts
export async function adminDb() {
  await requireSession();
  return client;
}
```

`const db = await adminDb()` becomes both the shortest and the only way to reach patient data, and no expression in the codebase yields an ungated admin client. The PR 4 `grep` stays as a cheap backstop, not as the primary defense.

`requireSession()` **throws** `UnauthorizedError` rather than returning a result — a forgotten `if (!result.ok)` continues silently, while a thrown error cannot be ignored. But a bare throw surfaces as a **500**, not the 401 this spec originally claimed, which would leave the login page unable to distinguish "session expired" from "server broken". So a shared wrapper maps `UnauthorizedError` to a 401 `NextResponse` in Route Handlers and to `redirect("/")` in Server Components.

`proxy.ts` is a second layer, never the only one.

## Delivery

### PR 1 — Server-side auth

New: `src/proxy.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/utils/session.ts`, `src/app/remoteDataSource/supabaseServerSide.ts`.

Changed: `src/app/page.tsx` posts credentials to the login handler instead of calling Supabase, drops `localStorage`, and types `handleLogin(e)` as `React.FormEvent`; the "Recordarme" checkbox is removed. `src/app/ui/Sidebar/Sidebar.tsx` posts to the logout handler. `NEXT_PUBLIC_USER` and `NEXT_PUBLIC_PASSWORD` are removed from `.env` and from Vercel — they are referenced nowhere in `src/`.

The app keeps working unchanged. After this PR the browser no longer holds a Supabase session at all, which is fine: the client-side queries still standing authenticate with nothing but the publishable key, and they succeed because RLS is still off. Those queries move server-side in PRs 2 and 3, and only then does the key become removable.

### PR 2 — Patient reads

New: `GET /api/pacientes?page=&q=`. `src/app/(app)/pacientes/useInfinitePacientes.ts` fetches from it instead of Supabase.

Two fixes land here:

- **Narrow the payload.** The current `.select()` is `SELECT *`, which drags the entire `visitas` JSON array — every report body, macro and micro text included — for all 20 patients per page, to render a list showing name, doctor, and one date. The handler selects only the displayed columns. **`Table.tsx` reads `paciente.visitas[0].date` for its date column and for its `ultimaVisita` sort**, so dropping `visitas` naively breaks both; the handler returns `ultimaVisita` as a **server-derived field** instead. One date replaces an array of full reports.
- **`textSearch` to `ilike`.** `textSearch` matches whole lexemes, so typing "Per" does not find "Perez". It also forces a sequential scan with no index. `ilike` is both correct and faster here.

### PR 3 — Detail page and writes

`src/app/(app)/paciente/[id]/page.tsx` switches to the `service_role` client behind `requireSession()`. `addPaciente`, `updatePaciente`, and `deletePaciente` become Server Actions.

`EditPacienteDialogBody` uses `defaultValues: paciente` and submits the whole object back through `updatePaciente`. Combined with PR 2, `visitas` would no longer be present on the row. In practice `undefined` keys drop out of the JSON body and the column survives untouched — but that is luck, not design. **The update Server Action writes only the editable fields, never the whole row.** This also removes the lost-update risk in `onSubmitVisita`, which currently rewrites the patient's entire `visitas` array on every new report.

### PR 4 — The cutover

Remove `NEXT_PUBLIC_SUPABASE_API_KEY` from the code and from Vercel. Delete `src/app/utils/supabaseClient.ts` and the browser client in `src/app/remoteDataSource/supabase.ts`. Drop the `"Policy with table joins"` policy. Then:

```sql
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
```

No policies are created. Confirm in the dashboard that no other table in `public` is missing RLS before flipping, and enable it on any that are.

Add the `requireSession()` coverage check.

Removing `typescript.ignoreBuildErrors` from `next.config.mjs` was originally scoped here, but planning found **15 pre-existing type errors** in `NewVisitaDialogBody.tsx`, `defaultValues.ts`, and `status.tsx` — files this round does not touch. Dropping the flag would fail the build on unrelated code during the most delicate PR of the round, so it is deferred to its own piece of work.

## Verification

`scripts/verify-lockdown.sh`, runnable after any deploy:

1. `curl` `/rest/v1/pacientes` with the publishable key. Today it returns the whole table; after PR 4 it must return empty or 401.
2. `grep` for the key and for `supabase.co` across `.next/static/`. Zero matches required.
3. **Forged-cookie check.** `curl` a protected endpoint with a hand-written `lab_session` cookie carrying a syntactically valid but unsigned token, and assert **401**. Checks 1 and 2 both pass while the app is wide open to a forged cookie — this is the check that would have caught the original design's bypass, and it is the reason the script exists at all.

Manual, in the browser: `document.cookie` exposes no token, and DevTools shows the session cookie flagged `HttpOnly`.

Manual smoke test of the full circuit: log in, list, search, infinite-scroll, open a patient, create a report, edit a report, download the PDF, log out, then type `/pacientes` directly and confirm the redirect.

## Rollback

PR 4 is the only step with real risk. Keep the SQL to recreate the anon policy at hand, and Vercel offers instant rollback to the previous deployment. PRs 1-3 revert normally.

## Risks

- **Exposure window.** The table stays open until PR 4 ships, because the browser needs anonymous access until its last query moves server-side. Sequencing does not extend this — a single large PR would close it at the same moment — but it is real, and it argues for keeping PRs 2 and 3 moving.
- **`service_role` in Vercel env.** This key bypasses everything. It must be set server-side only, never with a `NEXT_PUBLIC_` prefix, and never logged.
- **A missed `requireSession()`** turns a handler into an open admin endpoint. Hence the PR 4 coverage check.

## Non-goals (explicit)

- **Moving `visitas` into its own table.** It is a JSON column on `pacientes` today, which is a genuine modeling problem, but fixing it means a data migration and belongs to its own round.
- **A test suite.** The repo has no testing infrastructure; standing one up is its own project. `verify-lockdown.sh` covers what is critical here without opening that front.
- **Password reset.** The "¿Olvidaste tu contraseña?" link stays inert.
- **Roles and multi-user.** The clinic shares one account.
- **The rest of the performance round** (dynamic `react-pdf` import, etc.). Only what falls out of PR 2 for free is pulled forward.

## Done criteria

- The publishable key appears nowhere in the built client bundle.
- An anonymous `curl` against `pacientes` with that key returns no rows.
- The session cookie is `HttpOnly` and no token is reachable from JavaScript.
- Navigating directly to `/pacientes` without a session redirects to the login screen.
- Every Route Handler and Server Action calls `requireSession()` first.
- The full manual smoke test passes against the Vercel preview deployment.
