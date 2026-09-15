import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { requireSession } from "@/app/utils/session";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY must be set (see .env.example)"
  );
}

const client = createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * The only way to reach patient data. Bypasses RLS completely, so it gates
 * itself: there is deliberately no exported expression in this codebase that
 * yields an ungated admin client. Throws `UnauthorizedError` when there is no
 * valid session.
 *
 * Never import this module from `src/proxy.ts`, directly or transitively —
 * that would inline SUPABASE_SECRET_KEY into the Edge bundle deployed
 * across Vercel's edge network.
 */
export async function adminDb() {
  await requireSession();
  return client;
}

/**
 * Revokes a session upstream at Supabase, killing its refresh token.
 *
 * The one export here that is NOT gated behind `requireSession()`, and
 * deliberately so: logout must work for an expired, revoked or otherwise
 * invalid session — precisely the case where `requireSession()` throws. Gating
 * it would turn logout into a 500 for the user who most needs it to succeed.
 *
 * Safe to leave ungated because it grants no read or write access to patient
 * data: the only thing it can do with the token it is handed is destroy that
 * token's own session. The worst an attacker with a stolen access token can
 * achieve is logging its owner out, which is strictly better than keeping the
 * session alive.
 *
 * Errors are returned, not thrown, and the caller is expected to ignore them.
 *
 * The "local" scope is explicit and load-bearing. `admin.signOut` defaults to
 * "global", which revokes every session for the user on every device — and the
 * clinic shares one account, so a global logout at the front desk would throw
 * the doctor out of her own session mid-report. A logout that unpredictably
 * disrupts a colleague teaches people never to log out at all, which is worse
 * for security than the narrower scope. The answer to a lost device is changing
 * the account password, which revokes everything.
 */
export async function revokeSession(accessToken: string) {
  return client.auth.admin.signOut(accessToken, "local");
}
