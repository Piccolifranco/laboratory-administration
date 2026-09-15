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
 * `persistSession: false` prevents localStorage writes and NOTHING MORE: it
 * swaps in an in-memory store held on this module singleton, shared by every
 * request on this process. Cross-request isolation therefore comes from never
 * relying on the client's ambient session — always pass tokens explicitly.
 * Never call `refreshSession()` with no argument, `getSession()`, or
 * `setSession()` on this client.
 */
export const supabaseAuth = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
