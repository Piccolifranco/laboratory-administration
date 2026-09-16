#!/usr/bin/env node
/**
 * Fails if any route or server action can reach patient data without a session.
 *
 * The real protection is structural: `adminDb()` calls `requireSession()` itself
 * and the raw admin client is never exported, so there is no expression in this
 * codebase that yields an ungated database handle. This script is the backstop
 * that catches a future handler written without one — it does not replace that.
 *
 * Run: node scripts/check-session-coverage.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const API_DIR = path.join(ROOT, "src", "app", "api");
const ACTIONS = path.join(ROOT, "src", "app", "remoteDataSource", "pacientesActions.ts");

/**
 * Routes that must stay reachable WITHOUT a session, with the reason.
 *
 * Do not add to this list without one: every entry is an endpoint anyone on the
 * internet can call. These two are unavoidable — a login endpoint behind a login
 * check would make it impossible to ever log in.
 */
const UNGATED = new Map([
  ["api/auth/login/route.ts", "issues the session; requiring one would be circular"],
  ["api/auth/logout/route.ts", "must clear a broken or expired session, exactly when requireSession() would throw"],
]);

const GATE = "adminDb(";

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name === "route.ts" ? [full] : [];
  });
}

const failures = [];
const checked = [];

// --- Route handlers ---------------------------------------------------------
for (const file of walk(API_DIR)) {
  const rel = path.relative(path.join(ROOT, "src", "app"), file).replaceAll("\\", "/");
  const source = fs.readFileSync(file, "utf8");

  if (UNGATED.has(rel)) {
    // Guard the allowlist itself: an exempt route must not touch patient data.
    if (source.includes(GATE)) {
      failures.push(`${rel} is on the ungated allowlist but calls adminDb()`);
    } else {
      checked.push(`${rel}  (ungated: ${UNGATED.get(rel)})`);
    }
    continue;
  }

  if (source.includes(GATE)) {
    checked.push(`${rel}  (gated)`);
  } else {
    failures.push(`${rel} reaches a route handler without calling adminDb()`);
  }
}

// --- Server actions ---------------------------------------------------------
if (fs.existsSync(ACTIONS)) {
  const source = fs.readFileSync(ACTIONS, "utf8");
  const exported = [...source.matchAll(/export\s+async\s+function\s+(\w+)/g)].map((m) => m[1]);

  if (exported.length === 0) {
    failures.push("pacientesActions.ts exports no async functions — did the file move?");
  }

  for (const name of exported) {
    // Take the body from this export to the next one, or to end of file.
    const start = source.indexOf(`export async function ${name}`);
    const rest = source.slice(start + 1);
    const nextExport = rest.indexOf("\nexport async function ");
    const body = nextExport === -1 ? rest : rest.slice(0, nextExport);

    if (body.includes(GATE)) {
      checked.push(`pacientesActions.ts:${name}  (gated)`);
    } else {
      failures.push(`pacientesActions.ts:${name} does not call adminDb()`);
    }
  }
} else {
  failures.push("pacientesActions.ts not found — did it move?");
}

// --- Report -----------------------------------------------------------------
for (const line of checked) console.log(`  ok    ${line}`);

if (failures.length > 0) {
  console.error("");
  for (const line of failures) console.error(`  FAIL  ${line}`);
  console.error(`\n${failures.length} unguarded entry point(s).`);
  console.error(
    "Every path to patient data must go through adminDb(), which verifies the session."
  );
  process.exit(1);
}

console.log(`\nAll ${checked.length} entry points accounted for.`);
