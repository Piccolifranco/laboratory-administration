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
