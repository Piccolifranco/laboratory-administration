import "server-only";
import { NextResponse } from "next/server";
import { UnauthorizedError } from "./session";

/** True when the error came from `requireSession()` rejecting a request. */
export function isUnauthorized(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

/**
 * The 401 every Route Handler returns when `requireSession()` throws. Carries
 * no detail: a client that is not authorized has no business learning why.
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
