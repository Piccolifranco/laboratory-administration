import "server-only";
import { NextResponse } from "next/server";

export { isUnauthorized } from "./session";

/**
 * The 401 every Route Handler returns when `requireSession()` throws. Carries
 * no detail: a client that is not authorized has no business learning why.
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
