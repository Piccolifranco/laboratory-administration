import { NextResponse } from "next/server";
import { supabaseAuth } from "@/app/remoteDataSource/supabaseAuth";
import {
  SESSION_COOKIE,
  serializeSession,
  sessionCookieOptions,
  type StoredSession,
} from "@/app/utils/sessionCookie";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  // One generic message for every failure, so the response cannot be used to
  // discover which addresses are registered.
  if (error || !data.session) {
    return NextResponse.json(
      { error: "Correo electrónico o contraseña incorrectos" },
      { status: 401 }
    );
  }

  const session: StoredSession = {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    // NOT `?? 0`. A zero here poisons the cookie: `isExpiring` would return
    // true forever, so the proxy would attempt a refresh on every single
    // request. Supabase rotates refresh tokens on use, so concurrent requests
    // would race, one would present an already-consumed token, Supabase would
    // treat it as reuse and revoke the session — logging the doctor out
    // mid-report, apparently at random.
    expires_at:
      data.session.expires_at ??
      Math.floor(Date.now() / 1000) + (data.session.expires_in ?? 3600),
  };

  const serialized = serializeSession(session);

  // Browsers drop an oversized Set-Cookie *silently*: the user would be bounced
  // back to the login screen with a 200 and no error anywhere. Fail loudly
  // instead. A real Supabase session serializes to roughly 1.1KB.
  if (serialized.length > 3500) {
    console.error(
      `Session cookie too large (${serialized.length} bytes); refusing to set it.`
    );
    return NextResponse.json({ error: "Error de sesión" }, { status: 500 });
  }

  // The body carries no token. The cookie is httpOnly, so the browser's
  // JavaScript never sees one either.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, serialized, sessionCookieOptions);
  return response;
}
