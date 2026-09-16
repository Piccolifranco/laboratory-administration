import "server-only";
import { cookies } from "next/headers";
import { supabaseAuth } from "@/app/remoteDataSource/supabaseAuth";
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

/** True when the error came from `requireSession()` rejecting a request. */
export function isUnauthorized(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
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
 * longer authorizes anything — this is the only access control. So the cookie
 * is treated as untrusted transport and the token inside it is verified:
 * `getClaims` checks the signature against the project's JWKS and, unless
 * `allowExpired` is set, validates `exp` against the current time. Trusting the
 * cookie's own `expires_at` field instead would let an attacker pick it.
 */
export async function requireSession(): Promise<StoredSession> {
  const session = await readSession();
  if (!session) throw new UnauthorizedError();

  const { data, error } = await supabaseAuth.auth.getClaims(session.access_token);
  if (error || !data) {
    throw new UnauthorizedError("Invalid or expired session token");
  }

  return session;
}
