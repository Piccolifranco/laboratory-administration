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
