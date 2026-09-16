# Auth Hardening PR 4 — The RLS Cutover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the exposure this whole round exists for. `public.pacientes` becomes unreachable by anything except the backend.

**Architecture:** No application code changes the data path. This PR adds a coverage check, removes a now-unused environment variable, and runs two SQL statements in the Supabase dashboard.

**Spec:** `docs/superpowers/specs/2026-09-15-auth-hardening-design.md`

**Branch:** `feature/rls-cutover` (off `development`, which has PRs 1–3 merged)

---

## STOP — read this before anything else

**`master` is 54 commits behind `development`. Production is still running the old code**, which queries Supabase directly from the browser using the publishable key, and which works *only* because of the `anon` SELECT policy this PR deletes.

**Enabling RLS before production runs PRs 1–3 breaks the clinic's app instantly.** Not degraded — broken. The patient list, every report, every save.

So the order is not negotiable:

1. Merge `development` → `master`.
2. Deploy, and **verify production actually works** against the real database with a real login.
3. Only then drop the policy and enable RLS.

Steps 1 and 2 are the repo owner's. This plan covers the code side (Tasks 1–2) and gives him a runbook for the rest (Task 3). **Task 3 must not be executed by an agent.**

## There is no rehearsal for this

Local development, Vercel previews and production all point at the same Supabase project. There is no staging copy, and creating one would mean a schema operation, which is forbidden — the `pacientes` table holds years of real patient records.

So enabling RLS is live for everyone the moment it runs. That shapes the runbook: do it when the clinic is closed, with the rollback statement already typed into a second tab, and verify within seconds rather than minutes.

## Hard rules

- **Never run a database migration, `supabase db push`, `supabase db reset`, `DROP TABLE`, or any schema change.** The two statements in Task 3 change no data and no schema, and both are reversible in one command — but they are still run by the repo owner in the dashboard, not by an agent.
- **Never read, write, or commit `.env`.** A permission rule blocks `.env*` paths.
- **Line endings:** UTF-8 with CRLF, no BOM, except `*.sh` which is LF (enforced by `.gitattributes`).
- Commit messages: conventional-commit prefixes, **no `Co-Authored-By` trailer**, no bypass flags.

## Verification baseline

`pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"` reports **13**. Two of those are in `pacientesActions.ts` (`doctor` missing from the generated `Insert`/`Update` types — stale types, real column). This PR should not change the count.

---

### Task 1: The `requireSession()` coverage check

**Files:**
- Create: `scripts/check-session-coverage.mjs`

The spec called the authorization mitigation "structural, not disciplinary", and the structural part is already done: `adminDb()` gates itself, and the raw admin client is never exported. This check is the backstop that catches a future handler added without one — it does not replace the structure.

- [ ] **Step 1: Write the check**

It must assert two things:

1. Every `route.ts` under `src/app/api/` either calls `adminDb()` or appears in an explicit allowlist. The allowlist holds exactly the auth routes, which **must** stay reachable without a session — otherwise nobody could ever log in.
2. Every exported function in `src/app/remoteDataSource/pacientesActions.ts` calls `adminDb()`.

Write it as a plain Node script (no dependencies), exiting non-zero with the offending files named. Give the allowlist a comment explaining why each entry is exempt, so a future reader cannot quietly add a third.

- [ ] **Step 2: Run it**

Run: `node scripts/check-session-coverage.mjs`
Expected: passes, naming the files it checked. Then deliberately break it — comment out the `adminDb()` call in `src/app/api/pacientes/route.ts`, re-run, confirm it **fails** and names that file, then restore. **A check that has never failed has not been tested.** Show both outputs.

- [ ] **Step 3: Wire it into the verification script**

Add it as check 5 in `scripts/verify-lockdown.sh`, so one command covers the whole posture.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-session-coverage.mjs scripts/verify-lockdown.sh
git commit -m "chore(auth): check every data route gates itself behind a session"
```

---

### Task 2: Remove the publishable key from the codebase

**Files:**
- Modify: `.env.example`

Nothing in `src/` has read `NEXT_PUBLIC_SUPABASE_API_KEY` since PR 3 deleted the browser clients. What remains is the documentation of it.

- [ ] **Step 1: Drop the variable from `.env.example`**

Remove these two lines:

```
# Browser Supabase client. Removed in PR 4 of the auth hardening round.
NEXT_PUBLIC_SUPABASE_API_KEY=your-publishable-key
```

leaving only `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`.

**Note for agents:** a permission rule blocks `.env*` paths in this environment, so this step may have to be done by the repo owner. If you cannot write the file, say so plainly rather than working around the block.

- [ ] **Step 2: Confirm the source is clean**

```bash
grep -rn "NEXT_PUBLIC" src/ next.config.mjs
```

Expected: no output at all. Not one `NEXT_PUBLIC_` variable remains in the application.

- [ ] **Step 3: Rebuild and re-verify the bundle**

```bash
rm -rf .next && pnpm build
sh scripts/verify-lockdown.sh
```

Expected: all checks PASS. The bundle check must still find no `sb_publishable`, no `sb_secret`, and no project ref.

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "chore(auth): drop the publishable key from the documented env"
```

---

### Task 3: The cutover — RUNBOOK FOR THE REPO OWNER, NOT FOR AN AGENT

Everything below happens in the Vercel and Supabase dashboards. No agent executes any of it.

#### Before you start

- [ ] `development` is merged to `master`, deployed, and **verified working in production with a real login** — patient list, open a patient, save a report.
- [ ] The clinic is not working right now. This is the one step with no rehearsal.
- [ ] A second browser tab is open on the Supabase SQL editor with the rollback statement below already typed, unrun.
- [ ] You know how to reach Vercel's instant rollback for the previous deployment.

#### Step 1 — Vercel

- [ ] Delete `NEXT_PUBLIC_SUPABASE_API_KEY` from Production, Preview and Development.
- [ ] Confirm `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` are present in all three, and that the secret is marked Sensitive.
- [ ] Redeploy. Environment variable changes do not reach existing deployments, and Next inlines build-time values — a variable changed without a redeploy does nothing.
- [ ] Verify production still works after the redeploy, before touching the database.

#### Step 2 — Check for other exposed tables

- [ ] Supabase → Advisors → Security. Confirm `public.pacientes` is the only table reported. If anything else appears, stop and tell me — the plan assumed one table.

#### Step 3 — Read the policy before deleting it

- [ ] Supabase → Authentication → Policies → `pacientes`. Confirm the only policy is still `"Policy with table joins"` — `FOR SELECT`, `TO anon`, `USING (true)`. If a second policy has appeared since 2026-09-15, stop and tell me.

#### Step 4 — The cutover

In the SQL editor, run:

```sql
DROP POLICY "Policy with table joins" ON public.pacientes;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
```

No policies are created. With RLS on and no policies, the table is unreachable for `anon` and `authenticated`. The `service_role` key your backend uses bypasses RLS, which is what keeps the app working.

#### Step 5 — Verify immediately, in this order

- [ ] `sh scripts/verify-lockdown.sh https://<your-production-url>` — all checks PASS.
- [ ] Anonymous `curl` returns nothing:
  ```bash
  curl -s "https://lylnvhhzhyqlbbjgymws.supabase.co/rest/v1/pacientes?select=id&limit=1" \
    -H "apikey: <publishable key>"
  ```
  Expected: `[]` or a 401. **Before this change it returned the entire patient table.** This is the single command that proves the round worked.
- [ ] In the app: log in, list patients, open one, save a report on a throwaway patient, delete it.
- [ ] Supabase → Advisors → Security: the two CRITICAL findings are gone.

#### If anything is broken

```sql
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
```

That restores service immediately. The dropped policy can be recreated afterwards if needed:

```sql
CREATE POLICY "Policy with table joins" ON public.pacientes
  FOR SELECT TO anon USING (true);
```

Roll back first, diagnose second. The clinic working matters more than the hole being closed for another hour.

---

## Done criteria

- An anonymous request with the publishable key returns no patient rows.
- The Supabase Advisor reports no CRITICAL findings on `public.pacientes`.
- No `NEXT_PUBLIC_` variable exists in the application or in Vercel.
- `scripts/verify-lockdown.sh` passes against production.
- `node scripts/check-session-coverage.mjs` passes.
- The clinic can log in, read patients, and save reports.

## What this round still leaves open

- **Report payload bloat.** Each saved report stores 32,495 bytes where 493 would do. Almost certainly the cause of the reported slowness. Designed in `docs/superpowers/specs/2026-09-15-visita-payload-design.md`, deferred to its own PR next.
- `visitas` remains a JSON column on `pacientes`.
- `typescript.ignoreBuildErrors` stays on; 13 pre-existing type errors remain, 2 of them fixable by regenerating `types/supabase.ts`.
- Supabase Auth → Sessions still has no time-box or inactivity timeout, so refresh tokens do not expire on their own.
