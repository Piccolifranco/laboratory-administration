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
