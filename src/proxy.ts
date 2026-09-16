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
