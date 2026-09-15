import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { requireSession } from "@/app/utils/session";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.example)"
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
 * that would inline SUPABASE_SERVICE_ROLE_KEY into the Edge bundle deployed
 * across Vercel's edge network.
 */
export async function adminDb() {
  await requireSession();
  return client;
}
