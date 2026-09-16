#!/usr/bin/env node
/**
 * Measures the diagnosis-block trim and asserts its two invariants.
 *
 * It imports the real `trimVisita` from src/. It deliberately does not
 * reimplement the trim: a copy of the logic here would measure the copy and
 * prove nothing about what actually runs on save.
 *
 * Why a loader hook rather than a bare `import` of the .ts file:
 * Node 24 strips TypeScript types natively, and `trimVisita.ts` itself loads
 * fine that way. Its imports do not. Type stripping never elides imports, so
 * `defaultValues.ts`'s `import { Visitas } from "../../../../types/supabase"`
 * survives into the emitted module and demands a runtime binding that a file
 * of pure interfaces cannot provide; and `types/supabase.ts` is UTF-16LE,
 * which Node's stripper rejects outright before it gets that far. The hook
 * below fixes both without touching a single source file: it decodes UTF-16LE
 * and hands the text to the project's own TypeScript compiler, which does
 * elide type-only imports. It also resolves the `@/*` and `@/types/*` aliases
 * from tsconfig.json and the extensionless specifiers TypeScript allows,
 * neither of which plain Node understands.
 */
import { register } from "node:module";

const ROOT = new URL("../", import.meta.url).href;

// Kept free of backslashes on purpose: this source is embedded in a template
// literal, where every escape would need doubling. String methods, no regexes.
const hookSource = `
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = ${JSON.stringify(ROOT)};
const ts = createRequire(ROOT + "package.json")("typescript");

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"];
const TS_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"];

const isTypeScript = (url) => TS_EXTENSIONS.some((ext) => url.endsWith(ext));

export function resolve(specifier, context, next) {
  let spec = specifier;

  // tsconfig.json paths. "@/types/*" is checked first: it is more specific
  // than "@/*" and points outside src/.
  if (spec.startsWith("@/types/")) {
    spec = new URL("types/" + spec.slice("@/types/".length), ROOT).href;
  } else if (spec.startsWith("@/")) {
    spec = new URL("src/" + spec.slice("@/".length), ROOT).href;
  }

  // TypeScript lets an import omit the extension; Node does not.
  const relative = spec.startsWith("./") || spec.startsWith("../");
  if ((spec.startsWith("file:") || relative) && !SOURCE_EXTENSIONS.some((ext) => spec.endsWith(ext))) {
    const base = spec.startsWith("file:") ? new URL(spec) : new URL(spec, context.parentURL);
    for (const ext of SOURCE_EXTENSIONS) {
      const candidate = new URL(base.href + ext);
      if (existsSync(fileURLToPath(candidate))) {
        spec = candidate.href;
        break;
      }
    }
  }

  return next(spec, context);
}

export function load(url, context, next) {
  if (!url.startsWith("file:") || !isTypeScript(url)) return next(url, context);

  const bytes = readFileSync(fileURLToPath(url));
  // types/supabase.ts is UTF-16LE. Every other source file is UTF-8.
  const text =
    bytes[0] === 0xff && bytes[1] === 0xfe
      ? bytes.toString("utf16le").slice(1)
      : bytes.toString("utf8");
  const withoutBom = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const { outputText } = ts.transpileModule(withoutBom, {
    fileName: fileURLToPath(url),
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  });

  return { format: "module", shortCircuit: true, source: outputText };
}
`;

register("data:text/javascript," + encodeURIComponent(hookSource));

const { trimVisita, DIAGNOSIS_KEY_COUNT } = await import(
  new URL("src/app/remoteDataSource/trimVisita.ts", ROOT).href
);
const { defaultValues } = await import(
  new URL("src/app/ui/NewVisitaDialogBody/defaultValues.ts", ROOT).href
);

const bytes = (value) => Buffer.byteLength(JSON.stringify(value), "utf8");
const n = (value) => value.toLocaleString("en-US");

/** A report exactly as the form submits one today: the whole template. */
function newReport(overrides = {}) {
  return {
    ...structuredClone(defaultValues),
    date: new Date("2026-09-16T12:00:00.000Z"),
    protocol: "C2026-1234",
    status: "completed",
    ...overrides,
  };
}

const failures = [];
function check(passed, label) {
  if (passed) {
    console.log(`  ok    ${label}`);
  } else {
    console.log(`  FAIL  ${label}`);
    failures.push(label);
  }
}

// --- Sizes ---------------------------------------------------------------

const full = newReport();
const trimmed = trimVisita(full);

const fullBytes = bytes(full);
const trimmedBytes = bytes(trimmed);
const savedPct = ((1 - trimmedBytes / fullBytes) * 100).toFixed(1);

// One page of the patient list, as the app loads it.
const PATIENTS_PER_PAGE = 20;
const REPORTS_PER_PATIENT = 3;
const perPage = PATIENTS_PER_PAGE * REPORTS_PER_PATIENT;

console.log("Visit payload trim - measurement\n");
console.log(`Diagnosis blocks derived from the template: ${DIAGNOSIS_KEY_COUNT}`);
console.log(`Keys on a full report: ${Object.keys(full).length}`);
console.log(`Keys after trimming (type "${full.type}"): ${Object.keys(trimmed).length}\n`);

console.log("One report");
console.log(`  before  ${n(fullBytes)} bytes`);
console.log(`  after   ${n(trimmedBytes)} bytes`);
console.log(`  saved   ${n(fullBytes - trimmedBytes)} bytes (${savedPct}%)\n`);

console.log(`One list page (${PATIENTS_PER_PAGE} patients x ${REPORTS_PER_PATIENT} reports)`);
console.log(`  before  ${n(fullBytes * perPage)} bytes (${(fullBytes * perPage / 1024 / 1024).toFixed(2)} MB)`);
console.log(`  after   ${n(trimmedBytes * perPage)} bytes (${(trimmedBytes * perPage / 1024).toFixed(1)} KB)\n`);

// --- Invariant 1: the array never loses a report -------------------------

console.log("Invariants");

const arrayIn = [
  newReport({ type: "pap" }),
  newReport({ type: "biopsiaDiagnosis" }),
  newReport({ type: "cepilladoDiagnosis" }),
  newReport({ type: "" }),
  newReport({ type: "noExiste" }),
  newReport({ type: "pap", id: 7, notes: "control anual" }),
  newReport({ type: "silAltoGradoDiagnosis" }),
];
const arrayOut = arrayIn.map(trimVisita);

check(
  arrayOut.length === arrayIn.length,
  `an array of ${arrayIn.length} reports trims to ${arrayOut.length} reports`
);
check(
  arrayOut.every((report) => report && typeof report === "object"),
  "every trimmed report is still an object"
);

// Fields that are not diagnosis blocks must survive, including the two
// (`id`, `notes`) that are not in the template at all.
const passthrough = arrayOut[5];
check(
  passthrough.id === 7 &&
    passthrough.notes === "control anual" &&
    passthrough.protocol === "C2026-1234" &&
    passthrough.date instanceof Date,
  "non-diagnosis fields survive, including id and notes (absent from the template)"
);
check(
  Boolean(arrayOut[0].pap) && arrayOut[0].biopsiaDiagnosis === undefined,
  'a report of type "pap" keeps its own block and drops the others'
);

// --- Invariant 2: an unrecognized type is returned untouched -------------

for (const unknownType of ["", "noExiste"]) {
  const input = newReport({ type: unknownType });
  const before = JSON.stringify(input);
  const result = trimVisita(input);
  const identical = result === input && JSON.stringify(result) === before;
  check(
    identical,
    `type ${JSON.stringify(unknownType)} is returned byte-for-byte unchanged ` +
      `(${n(bytes(result))} bytes, ${Object.keys(result).length} keys)`
  );
}

// --- Invariant 3: a known type whose block is missing is left untouched ---
// The case closest to the line: `type` names a real diagnosis, but that block
// was never stored. Trimming would drop the other 67 and leave a report with no
// content at all — present in the list, empty inside, nothing looking wrong.
{
  const input = newReport({ type: "pap" });
  delete input.pap;
  const before = JSON.stringify(input);
  const result = trimVisita(input);
  check(
    result === input && JSON.stringify(result) === before,
    `a report whose type names a missing block is returned unchanged ` +
      `(${Object.keys(result).length} keys kept)`
  );
}

console.log("");
if (failures.length > 0) {
  console.error(`FAILED: ${failures.length} assertion(s) did not hold.`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS: sizes measured and both invariants hold.");
