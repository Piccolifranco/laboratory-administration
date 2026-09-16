#!/bin/sh
# verify-lockdown.sh — regression test for the server-side auth lockdown round.
#
# Usage: scripts/verify-lockdown.sh [base-url]        (default http://localhost:3000)
#
# Run it against a running dev or preview server after any change to the proxy,
# the session cookie, or the auth route handlers. It exits non-zero if a check
# fails, so it is safe to wire into CI once a preview URL is available.
#
# Check 1 is the important one, and it must always be 401. The proxy is
# deliberately not the trust boundary: it never verifies a token signature, it
# only looks at the cookie's shape. `requireSession()` does the verifying, and
# every data endpoint sits behind it. A forged session cookie must therefore be
# rejected by the data endpoint, not merely waved past the proxy. It is the
# check that would have caught the authentication bypass an earlier draft of
# this design shipped.
#
# NOTE ON LINE ENDINGS: every other file in this repo is CRLF. This file must be
# LF — a CR at the end of the shebang makes the kernel look for `/bin/sh\r` and
# the script dies with "not found". Keep it LF.

set -u

BASE="${1:-http://localhost:3000}"
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
failures=0

echo "Verifying lockdown against $BASE"
echo

# --- Check 1: forged session cookie is rejected -------------------------------
# The single most important check in this file. An unsigned, hand-written cookie
# must not reach patient data. An earlier draft of this design shipped a version
# where it did: parseSession only type-checked the cookie, nothing verified the
# token, and service_role meant Postgres never saw it either. Every other check
# here passed while the database was wide open.
FORGED='lab_session={"access_token":"x","refresh_token":"y","expires_at":9999999999}'
code=$(curl -s -o /dev/null -w '%{http_code}' -H "Cookie: $FORGED" "$BASE/api/pacientes")
if [ "$code" = "401" ]; then
  echo "PASS  forged cookie -> 401"
else
  echo "FAIL  forged cookie -> $code (expected 401)"
  failures=$((failures + 1))
fi

# --- Check 2: unauthenticated access redirects to the login page -------------
set -- $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/pacientes")
code=$1
target=${2:-}
case "$code:$target" in
  307:*/ ) echo "PASS  no cookie -> $code $target" ;;
  *)
    echo "FAIL  no cookie -> $code ${target:-<no redirect>} (expected 307 to /)"
    failures=$((failures + 1))
    ;;
esac

# --- Check 3: no Supabase credentials at all in the client bundle ------------
# From PR 3 on the browser holds no database credential whatsoever: every read
# and write goes through a session-gated route handler or server action. Until
# then the publishable key and the project ref were both inlined into the
# bundle, which was only safe because RLS was off — the very thing being fixed.
# The project ref is included because it identifies the database to attack even
# without a key in hand.
if [ ! -d "$ROOT/.next/static" ]; then
  echo "FAIL  no client bundle at .next/static (run: pnpm build)"
  failures=$((failures + 1))
else
  leaked=""
  for needle in sb_secret sb_publishable lylnvhhzhyqlbbjgymws; do
    if grep -rl "$needle" "$ROOT/.next/static/" >/dev/null 2>&1; then
      leaked="$leaked $needle"
    fi
  done
  if [ -n "$leaked" ]; then
    echo "FAIL  supabase credentials in the client bundle:$leaked"
    for needle in $leaked; do
      grep -rl "$needle" "$ROOT/.next/static/" 2>/dev/null | sed 's/^/        /'
    done
    failures=$((failures + 1))
  else
    echo "PASS  no supabase credentials in the client bundle"
  fi
fi

# --- Check 4: the list endpoint requires a session ----------------------------
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/pacientes")
if [ "$code" = "401" ]; then
  echo "PASS  no cookie -> /api/pacientes 401"
else
  echo "FAIL  no cookie -> /api/pacientes $code (expected 401)"
  failures=$((failures + 1))
fi

echo
if [ "$failures" -ne 0 ]; then
  echo "$failures check(s) FAILED"
  exit 1
fi
echo "All checks passed"
