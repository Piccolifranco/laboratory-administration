import { NextResponse } from "next/server";
import { revokeSession } from "@/app/remoteDataSource/supabaseServerSide";
import { readSession } from "@/app/utils/session";
import { SESSION_COOKIE, sessionCookieOptions } from "@/app/utils/sessionCookie";

export async function POST() {
  const session = await readSession();

  // Revoke upstream so the refresh token dies with the cookie. A failure here
  // must not block logout: clearing the cookie is what actually logs the user
  // out of this app.
  if (session) {
    try {
      await revokeSession(session.access_token);
    } catch {
      // Intentionally ignored — see above.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
