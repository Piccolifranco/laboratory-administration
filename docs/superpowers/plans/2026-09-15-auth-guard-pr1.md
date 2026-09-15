# Auth Hardening PR 1 — Server-Side Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move authentication off the browser and into the Next.js server, storing the Supabase session in an `httpOnly` cookie that JavaScript cannot read, and guard every authenticated route.

**Architecture:** Login and logout become Route Handlers that talk to Supabase server-side and reply with nothing but a `Set-Cookie`. A `proxy.ts` (Next 16's name for middleware) guards routes and rotates the refresh token on each visit. Two server-only Supabase clients are introduced: an auth client for sign-in and a `service_role` client that PRs 2 and 3 will use for data. The browser keeps querying Supabase directly with the publishable key for now — that only changes in PRs 2 and 3.

**Tech Stack:** Next 16.2.6 (App Router), React 19, TypeScript 5.9, `@supabase/supabase-js` v2, pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-15-auth-hardening-design.md`

**Branch:** `feature/auth-guard` (already created off `development`)

---

## A note on verification instead of TDD

This repo has **no test framework**, and the approved spec lists standing one up as an explicit non-goal. So this plan does not open with failing unit tests. Every task still ends with a **concrete command and its expected output** — that requirement is not relaxed. Do not mark a step done without running the command and seeing the expected result.

**TypeScript baseline:** `pnpm exec tsc --noEmit` currently reports **15 errors**, all in `src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx`, `src/app/ui/NewVisitaDialogBody/defaultValues.ts`, and `src/app/ui/status.tsx`. None are in files this PR touches. The verification bar for every task is therefore **"still exactly 15 errors, none of them in a file this PR created or modified"** — not zero. If the count rises, you broke something.

**Encoding:** files in this repo are UTF-8 with CRLF line endings and no BOM. Prefer `Edit` or `sed` over wholesale rewrites, and after editing a file containing accented Spanish text, confirm the accents survived (`grep -n "contraseña" <file>`).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/app/utils/sessionCookie.ts` | **Edge-safe.** Cookie name, options, the `StoredSession` shape, and parse/serialize. No `next/headers`, no `server-only` — `proxy.ts` imports this. |
| `src/app/utils/session.ts` | **Node/server-only.** `readSession()` and `requireSession()` built on `next/headers`. Route Handlers, Server Actions, and Server Components import this. |
| `src/app/remoteDataSource/supabaseAuth.ts` | Server-only Supabase client using the publishable key, for sign-in only. |
| `src/app/remoteDataSource/supabaseServerSide.ts` | Server-only `service_role` client. Created here; first used in PR 2. |
| `src/app/api/auth/login/route.ts` | `POST` — verifies credentials, sets the session cookie, returns no token. |
| `src/app/api/auth/logout/route.ts` | `POST` — revokes the session upstream and clears the cookie. |
| `src/proxy.ts` | Route guard plus refresh-token rotation. |

**The split between `sessionCookie.ts` and `session.ts` is not optional.** `proxy.ts` runs in the Edge runtime, where `next/headers` does not exist. Importing `session.ts` from `proxy.ts` will fail at build time.

---

### Task 1: Environment variables and the `server-only` guard

**Files:**
- Modify: `.env` (untracked — edit locally, and mirror the changes in the Vercel dashboard)
- Create: `.env.example`
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Add the new server-side variables to `.env`**

Add these three lines. `SUPABASE_PUBLISHABLE_KEY` takes the same value that `NEXT_PUBLIC_SUPABASE_API_KEY` already holds; the service role key comes from Supabase Dashboard → Project Settings → API Keys → `service_role`.

```
SUPABASE_URL=https://lylnvhhzhyqlbbjgymws.supabase.co
SUPABASE_PUBLISHABLE_KEY=<same value as NEXT_PUBLIC_SUPABASE_API_KEY>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from the Supabase dashboard>
```

Leave `NEXT_PUBLIC_SUPABASE_API_KEY` in place — the browser still needs it until PR 4.

**None of the three carries a `NEXT_PUBLIC_` prefix, and `SUPABASE_SERVICE_ROLE_KEY` must never gain one.** That key bypasses RLS entirely; prefixing it would publish full database admin rights in the client bundle.

- [ ] **Step 2: Create `.env.example` so the required variables are documented in the repo**

```
# Supabase — server-side only. None of these may be prefixed NEXT_PUBLIC_.
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# Bypasses RLS. Server-side only, never logged, never NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Browser Supabase client. Removed in PR 4 of the auth hardening round.
NEXT_PUBLIC_SUPABASE_API_KEY=your-publishable-key
```

- [ ] **Step 3: Verify `.env.example` is not ignored by `.gitignore`**

Run: `git check-ignore -v .env.example`
Expected: **no output and exit code 1** (meaning it is NOT ignored). `.gitignore` line 29 is a literal `.env`, and line 30 is `.env*.local`, so `.env.example` is safe. If it does report a match, add `!.env.example` to `.gitignore`.

- [ ] **Step 4: Install `server-only`**

Run: `pnpm add server-only`
Expected: `package.json` gains `"server-only"` under `dependencies`.

This package has no runtime behavior. It exists purely so that importing a module into a Client Component fails the build with a clear message.

- [ ] **Step 5: Commit**

```bash
git add .env.example package.json pnpm-lock.yaml
git commit -m "chore(auth): document server-side env vars and add server-only guard"
```

---

### Task 2: Edge-safe session cookie module

**Files:**
- Create: `src/app/utils/sessionCookie.ts`

- [ ] **Step 1: Write the module**

Note there is no `import "server-only"` here. This file is imported by `proxy.ts`, which runs in the Edge runtime.

```ts
/**
 * Shape and encoding of the session cookie.
 *
 * Deliberately free of `next/headers` and `server-only` imports: `src/proxy.ts`
 * runs in the Edge runtime and imports this module. Anything needing
 * `next/headers` belongs in `session.ts` instead.
 */

export const SESSION_COOKIE = "lab_session";

/** 90 days, matching the self-renewing session decided in the spec. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export type StoredSession = {
  access_token: string;
  refresh_token: string;
  /** Seconds since the Unix epoch, as Supabase reports it. */
  expires_at: number;
};

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

export function serializeSession(session: StoredSession): string {
  return JSON.stringify(session);
}

/**
 * Parses a cookie value into a session, returning null for anything malformed.
 * Cookie contents are attacker-controllable, so every field is checked.
 */
export function parseSession(raw: string | undefined): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { access_token, refresh_token, expires_at } = parsed as Record<
      string,
      unknown
    >;
    if (typeof access_token !== "string" || access_token.length === 0) return null;
    if (typeof refresh_token !== "string" || refresh_token.length === 0) return null;
    if (typeof expires_at !== "number" || !Number.isFinite(expires_at)) return null;
    return { access_token, refresh_token, expires_at };
  } catch {
    return null;
  }
}

/** True when the access token has expired or is within `marginSeconds` of doing so. */
export function isExpiring(session: StoredSession, marginSeconds = 60): boolean {
  return session.expires_at * 1000 - Date.now() <= marginSeconds * 1000;
}
```

- [ ] **Step 2: Verify it compiles without adding errors**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `15` (the baseline). Then confirm none is in the new file:
Run: `pnpm exec tsc --noEmit 2>&1 | grep "sessionCookie"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/utils/sessionCookie.ts
git commit -m "feat(auth): add edge-safe session cookie shape and parser"
```

---

### Task 3: Server-side session helpers

**Files:**
- Create: `src/app/utils/session.ts`

- [ ] **Step 1: Write the module**

```ts
import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  parseSession,
  type StoredSession,
} from "./sessionCookie";

/** Thrown by `requireSession` when there is no usable session. */
export class UnauthorizedError extends Error {
  constructor(message = "No active session") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Reads the session cookie, or null when absent or malformed. */
export async function readSession(): Promise<StoredSession | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}

/**
 * The single authorization gate for this app.
 *
 * Because the server talks to Supabase with the service_role key, Postgres no
 * longer authorizes anything — this cookie is the only access control. Every
 * Route Handler and every Server Action that touches data must call this first.
 * A handler that forgets is a fully open, admin-privileged endpoint.
 */
export async function requireSession(): Promise<StoredSession> {
  const session = await readSession();
  if (!session) throw new UnauthorizedError();
  return session;
}
```

Note the expiry check lives in `proxy.ts`, which refreshes the cookie before a request reaches a handler. `requireSession` deliberately does not refresh: Server Components cannot write cookies.

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `15`.

- [ ] **Step 3: Commit**

```bash
git add src/app/utils/session.ts
git commit -m "feat(auth): add requireSession helper for server-side authorization"
```

---

### Task 4: Server-only Supabase clients

**Files:**
- Create: `src/app/remoteDataSource/supabaseAuth.ts`
- Modify: `src/app/remoteDataSource/supabaseServerSide.ts` (currently an empty file)

- [ ] **Step 1: Write the auth client**

`src/app/remoteDataSource/supabaseAuth.ts`:

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set (see .env.example)"
  );
}

/**
 * Sign-in only. Kept separate from the service_role client so that nothing in
 * the auth path can reach data with admin privileges.
 *
 * `persistSession: false` is essential: this module is shared across requests
 * on the server, and a persisted session would leak one user's tokens into
 * another request.
 */
export const supabaseAuth = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

- [ ] **Step 2: Write the service_role client**

`src/app/remoteDataSource/supabaseServerSide.ts` (replacing its empty contents):

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.example)"
  );
}

/**
 * Bypasses RLS completely. Every caller must gate itself behind
 * `requireSession()` from `@/app/utils/session` first — see the spec's
 * "Authorization risk and its mitigation".
 *
 * Unused until PR 2; created here so the env wiring lands in one place.
 */
export const supabaseAdmin = createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

- [ ] **Step 3: Verify both compile**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `15`.
Run: `pnpm exec tsc --noEmit 2>&1 | grep -E "supabaseAuth|supabaseServerSide"`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/app/remoteDataSource/supabaseAuth.ts src/app/remoteDataSource/supabaseServerSide.ts
git commit -m "feat(auth): add server-only supabase auth and service_role clients"
```

---

### Task 5: Login route handler

**Files:**
- Create: `src/app/api/auth/login/route.ts`

- [ ] **Step 1: Write the handler**

```ts
import { NextResponse } from "next/server";
import { supabaseAuth } from "@/app/remoteDataSource/supabaseAuth";
import {
  SESSION_COOKIE,
  serializeSession,
  sessionCookieOptions,
  type StoredSession,
} from "@/app/utils/sessionCookie";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  // One generic message for every failure, so the response cannot be used to
  // discover which addresses are registered.
  if (error || !data.session) {
    return NextResponse.json(
      { error: "Correo electrónico o contraseña incorrectos" },
      { status: 401 }
    );
  }

  const session: StoredSession = {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at ?? 0,
  };

  // The body carries no token. The cookie is httpOnly, so the browser's
  // JavaScript never sees one either.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, serializeSession(session), sessionCookieOptions);
  return response;
}
```

- [ ] **Step 2: Start the dev server**

Run: `pnpm dev`
Expected: `Ready` on http://localhost:3000. Leave it running for the next step in a second terminal.

- [ ] **Step 3: Verify a bad password is rejected**

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@example.com","password":"wrong"}'
```

Expected: `HTTP/1.1 401`, body `{"error":"Correo electrónico o contraseña incorrectos"}`, and **no `Set-Cookie` header**.

- [ ] **Step 4: Verify a good password sets an httpOnly cookie**

Use the clinic's real credentials:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<real email>","password":"<real password>"}'
```

Expected: `HTTP/1.1 200`, body exactly `{"ok":true}`, and a `Set-Cookie: lab_session=...` header containing `HttpOnly`, `SameSite=Lax`, and `Path=/`.

**The body must contain no token.** If you see `access_token` in the response body, the handler is wrong — stop and fix it before continuing.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/login/route.ts
git commit -m "feat(auth): add login route handler setting an httpOnly session cookie"
```

---

### Task 6: Logout route handler

**Files:**
- Create: `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Write the handler**

```ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/remoteDataSource/supabaseServerSide";
import { readSession } from "@/app/utils/session";
import { SESSION_COOKIE, sessionCookieOptions } from "@/app/utils/sessionCookie";

export async function POST() {
  const session = await readSession();

  // Revoke upstream so the refresh token dies with the cookie. A failure here
  // must not block logout: clearing the cookie is what actually logs the user
  // out of this app.
  if (session) {
    try {
      await supabaseAdmin.auth.admin.signOut(session.access_token);
    } catch {
      // Intentionally ignored — see above.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
```

- [ ] **Step 2: Verify logout clears the cookie**

With the dev server running, log in and keep the cookie jar, then log out:

```bash
curl -s -c /tmp/jar -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<real email>","password":"<real password>"}'
curl -i -b /tmp/jar -X POST http://localhost:3000/api/auth/logout
```

Expected: `HTTP/1.1 200`, body `{"ok":true}`, and a `Set-Cookie: lab_session=;` header with `Max-Age=0` (or an expiry in the past).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/logout/route.ts
git commit -m "feat(auth): add logout route handler revoking and clearing the session"
```

---

### Task 7: The route guard

**Files:**
- Create: `src/proxy.ts`

- [ ] **Step 1: Write the proxy**

Next 16 resolves `proxyFilePath || middlewareFilePath`, so `proxy.ts` is the current name and a default export is valid.

```ts
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  isExpiring,
  parseSession,
  serializeSession,
  sessionCookieOptions,
  type StoredSession,
} from "@/app/utils/sessionCookie";

const LOGIN_PATH = "/";
const HOME_PATH = "/pacientes";

/**
 * Exchanges a refresh token for a fresh session.
 *
 * Uses plain fetch rather than supabase-js so the Edge bundle stays small and
 * predictable. Returns null when the refresh token has been revoked or expired.
 */
async function refreshSession(refreshToken: string): Promise<StoredSession | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (
      typeof data?.access_token !== "string" ||
      typeof data?.refresh_token !== "string" ||
      typeof data?.expires_at !== "number"
    ) {
      return null;
    }
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let session = parseSession(request.cookies.get(SESSION_COOKIE)?.value);
  let refreshed = false;

  // Rotate the refresh token on the way through, which is what keeps the
  // session alive indefinitely for someone who visits regularly.
  if (session && isExpiring(session)) {
    session = await refreshSession(session.refresh_token);
    refreshed = true;
  }

  const isAuthenticated = session !== null;

  const response =
    !isAuthenticated && pathname !== LOGIN_PATH
      ? NextResponse.redirect(new URL(LOGIN_PATH, request.url))
      : isAuthenticated && pathname === LOGIN_PATH
        ? NextResponse.redirect(new URL(HOME_PATH, request.url))
        : NextResponse.next();

  if (refreshed) {
    if (session) {
      response.cookies.set(SESSION_COOKIE, serializeSession(session), sessionCookieOptions);
    } else {
      response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/pacientes/:path*", "/paciente/:path*", "/estadisticas/:path*"],
};
```

The matcher lists protected routes explicitly rather than excluding static assets with a negative lookahead. `/api/auth/*` is deliberately absent — the login handler must stay reachable to someone without a session.

- [ ] **Step 2: Verify an unauthenticated request to a protected route redirects**

Restart the dev server so the proxy is picked up, then:

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:3000/pacientes
```

Expected: `307 -> http://localhost:3000/`

- [ ] **Step 3: Verify an authenticated request passes through**

```bash
curl -s -c /tmp/jar -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<real email>","password":"<real password>"}'
curl -s -b /tmp/jar -o /dev/null -w "%{http_code}\n" http://localhost:3000/pacientes
```

Expected: `200`

- [ ] **Step 4: Verify a logged-in visitor to the login page is redirected away**

```bash
curl -s -b /tmp/jar -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:3000/
```

Expected: `307 -> http://localhost:3000/pacientes`

- [ ] **Step 5: Verify a tampered cookie is rejected rather than crashing**

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" \
  -H "Cookie: lab_session=not-json" http://localhost:3000/pacientes
```

Expected: `307 -> http://localhost:3000/` — `parseSession` returns null on malformed input, so this is treated as logged out.

- [ ] **Step 6: Commit**

```bash
git add src/proxy.ts
git commit -m "feat(auth): guard authenticated routes and rotate refresh tokens in proxy"
```

---

### Task 8: Point the login page at the route handler

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Remove the Supabase import**

Delete this line:

```ts
import { supabase } from "./utils/supabaseClient";
```

- [ ] **Step 2: Add the `submitting` state**

This is a hook, so it belongs in the component body alongside the existing `useState` calls — not inside `handleLogin`. Add it directly below `const [password, setPassword] = useState("");`:

```tsx
  const [submitting, setSubmitting] = useState(false);
```

- [ ] **Step 3: Replace `handleLogin`**

Replace the whole existing `handleLogin` (it currently calls `signInWithPassword`, writes `localStorage`, `console.log`s the token, and has a commented-out credential check) with:

```tsx
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user, password }),
      });

      if (!response.ok) {
        toast.error("Correo electrónico o contraseña incorrectos");
        return;
      }

      toast.success("Inicio de sesión exitoso");
      // refresh() lets the proxy see the new cookie before we navigate.
      router.refresh();
      router.push("/pacientes");
    } catch {
      toast.error("No se pudo conectar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };
```

Three things go away here and none of them come back: the `localStorage.setItem("accessToken", ...)`, the `console.log("ACCESS TOKEN: ", ...)` that printed the token to the browser console, and the `setTimeout` before navigating.

- [ ] **Step 4: Remove the "Recordarme" checkbox**

The spec retires it — long self-renewing sessions are now the default, so the control would be a lie. Delete the whole `<div className="flex items-center">` block containing `id="remember_me"`. Keep the surrounding `<div className="flex items-center justify-between mb-6">` and the "¿Olvidaste tu contraseña?" link, which stays inert per the spec's non-goals.

- [ ] **Step 5: Disable the submit button while the request is in flight**

On the submit `<button>`, add `disabled={submitting}` and append `disabled:opacity-60` to its `className`.

- [ ] **Step 6: Verify no token reaches the browser**

Restart the dev server, open http://localhost:3000, and log in with the real credentials.

Expected:
- The app lands on `/pacientes`.
- In DevTools → Console, `document.cookie` returns a string that does **not** contain `lab_session`.
- In DevTools → Application → Cookies, `lab_session` is listed with **HttpOnly ✓**.
- In DevTools → Application → Local Storage, there is **no** `accessToken` entry. (If one lingers from a previous session, delete it manually — old browsers keep it until cleared.)
- The Console shows no logged access token.

- [ ] **Step 7: Verify types did not regress**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `15`.
Run: `pnpm exec tsc --noEmit 2>&1 | grep "app/page.tsx"`
Expected: no output — `handleLogin` is now typed, so the old implicit-`any` on `e` is gone.

- [ ] **Step 8: Verify the accented text survived the edit**

Run: `grep -c "Contraseña" src/app/page.tsx`
Expected: `1` (and it must read `Contraseña`, not `ContraseÃ±a`).

- [ ] **Step 9: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(auth): log in through the route handler, drop localStorage token"
```

---

### Task 9: Point the sidebar logout at the route handler

**Files:**
- Modify: `src/app/ui/Sidebar/Sidebar.tsx`

- [ ] **Step 1: Remove the Supabase import**

Delete this line:

```ts
import { supabase } from "@/app/utils/supabaseClient";
```

- [ ] **Step 2: Replace `handleLogout`**

```tsx
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignored: the cookie is cleared server-side, and sending the user to the
      // login screen is the right outcome either way.
    }
    onNavigate?.();
    router.refresh();
    router.push("/");
  };
```

The `supabase.auth.signOut()` call and the `localStorage.removeItem("accessToken")` both go away.

- [ ] **Step 3: Verify logout end to end**

In the browser: log in, click **Salir**.

Expected:
- You land on the login page.
- DevTools → Application → Cookies no longer lists `lab_session`.
- Typing `localhost:3000/pacientes` in the address bar redirects back to the login page instead of showing the patient list. **This is the bypass the whole PR exists to close — confirm it explicitly.**

- [ ] **Step 4: Commit**

```bash
git add src/app/ui/Sidebar/Sidebar.tsx
git commit -m "feat(auth): log out through the route handler"
```

---

### Task 10: Remove the unused credential env vars and open the PR

**Files:**
- Modify: `.env` (local) and the Vercel project settings

- [ ] **Step 1: Confirm the variables really are unused**

Run: `grep -rn "NEXT_PUBLIC_USER\|NEXT_PUBLIC_PASSWORD" src/ types/ next.config.mjs`
Expected: no output. They are leftovers from a hardcoded credential check that was commented out long ago.

- [ ] **Step 2: Delete both lines from `.env`, and delete them in Vercel**

Vercel Dashboard → Project → Settings → Environment Variables → remove `NEXT_PUBLIC_USER` and `NEXT_PUBLIC_PASSWORD` from every environment.

- [ ] **Step 3: Add the new variables in Vercel**

Add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Production, Preview, and Development.

**Check the name of the service role variable twice before saving.** A `NEXT_PUBLIC_` prefix on it would publish database admin rights to every visitor.

- [ ] **Step 4: Verify the production build succeeds**

Run: `pnpm build`
Expected: the build completes, and the route list includes `ƒ /api/auth/login`, `ƒ /api/auth/logout`, and a `Proxy` entry.

- [ ] **Step 5: Confirm no token is present in the client bundle**

Run: `grep -rl "accessToken" .next/static/ 2>/dev/null; echo "exit: $?"`
Expected: no file paths printed. The `localStorage` token is gone from the shipped JavaScript.

- [ ] **Step 6: Full manual smoke test**

Against `pnpm dev`, walk the whole circuit and confirm each step works: log in → the patient list loads → search finds a patient → scrolling loads more → open a patient → create a report → edit a report → download the PDF → log out → typing `/pacientes` redirects to login.

Data still flows from the browser with the publishable key in this PR, so every one of these must keep working exactly as before. **Anything broken here is a regression introduced by this PR, not something PR 2 will fix.**

- [ ] **Step 7: Push and open the PR**

```bash
git push -u origin feature/auth-guard
gh pr create --base development --head feature/auth-guard \
  --title "feat(auth): move authentication to the server with an httpOnly session"
```

In the PR body, state plainly that this PR does **not** yet close the RLS exposure — the table stays reachable with the publishable key until PR 4 — and link the spec.

- [ ] **Step 8: Verify on the Vercel preview deployment**

Repeat Step 6 against the preview URL, and confirm the `lab_session` cookie shows both **HttpOnly** and **Secure** there (locally `secure` is off because `NODE_ENV` is not `production`).

---

## What this PR deliberately does not do

- **It does not close the RLS hole.** `public.pacientes` stays readable with the publishable key until PR 4. This PR is the foundation the next three build on.
- It does not move any data query server-side — that is PRs 2 and 3.
- It does not remove `typescript.ignoreBuildErrors`. Planning turned up 15 pre-existing type errors in `NewVisitaDialogBody.tsx`, `defaultValues.ts`, and `status.tsx`; clearing them is unrelated work that would stall this round.
- It does not add a test framework, per the spec's non-goals.
