#!/bin/sh
# verify-lockdown.sh — regression test for the server-side auth lockdown round.
#
# Usage: scripts/verify-lockdown.sh [base-url]        (default http://localhost:3000)
#
# Run it against a running dev or preview server after any change to the proxy,
# the session cookie, or the auth route handlers. It exits non-zero if a check
# fails, so it is safe to wire into CI once a preview URL is available.
#
# Check 1 is the important one, and its EXPECTATION CHANGES IN PR 2. Today a
# forged session cookie returns 200, because the proxy is deliberately not the
# trust boundary: it never verifies a token signature, it only looks at the
# cookie's shape. `requireSession()` does the verifying, and in PR 1 there is no
# data endpoint behind it yet, so nothing is exposed. Once PR 2 adds
# GET /api/pacientes, this check must return 401 and must be promoted from INFO
# to a hard FAIL. It is the single most important check in this file: it is the
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

# --- Check 1: forged session cookie ------------------------------------------
FORGED='lab_session={"access_token":"x","refresh_token":"y","expires_at":9999999999}'
code=$(curl -s -o /dev/null -w '%{http_code}' -H "Cookie: $FORGED" "$BASE/pacientes")
if [ "$code" = "200" ]; then
  echo "INFO  forged cookie -> $code (expected for PR 1; must become 401 in PR 2)"
else
  echo "INFO  forged cookie -> $code (expected 200 in PR 1; investigate)"
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

# --- Check 3: no service_role secret in the client bundle --------------------
if [ ! -d "$ROOT/.next/static" ]; then
  echo "FAIL  no client bundle at .next/static (run: pnpm build)"
  failures=$((failures + 1))
elif grep -rl "sb_secret" "$ROOT/.next/static/" >/dev/null 2>&1; then
  echo "FAIL  sb_secret found in the client bundle:"
  grep -rl "sb_secret" "$ROOT/.next/static/" 2>/dev/null | sed 's/^/        /'
  failures=$((failures + 1))
else
  echo "PASS  no sb_secret in the client bundle"
fi

echo
if [ "$failures" -ne 0 ]; then
  echo "$failures check(s) FAILED"
  exit 1
fi
echo "All checks passed"
