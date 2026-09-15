/**
 * Shape and encoding of the session cookie.
 *
 * The cookie is UNTRUSTED TRANSPORT, not a credential. Anyone can hand-write a
 * `Cookie` header, so `parseSession` below is a cheap structural pre-filter and
 * nothing more. Authenticity is established in `session.ts`, by verifying the
 * access token's signature.
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
  // Hardcoded rather than tied to NODE_ENV: production is always HTTPS, and
  // browsers accept Secure cookies on localhost, so the branch bought nothing
  // except a failure mode where the cookie silently ships insecure.
  secure: true,
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
