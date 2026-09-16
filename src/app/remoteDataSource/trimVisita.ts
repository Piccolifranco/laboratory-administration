import { defaultValues } from "@/app/ui/NewVisitaDialogBody/defaultValues";
import type { Visitas } from "@/types/supabase";

/**
 * The 68 diagnosis blocks, derived from the template rather than hardcoded.
 *
 * Deriving it means a field added to `Visitas` later is never silently dropped:
 * anything not in this set passes through untouched. `date` is excluded by the
 * Date check — it is the one non-diagnosis field that is an object.
 */
const DIAGNOSIS_KEYS = new Set(
  Object.entries(defaultValues)
    .filter(
      ([, value]) =>
        value !== null && typeof value === "object" && !(value instanceof Date)
    )
    .map(([key]) => key)
);

/**
 * Strips the diagnosis blocks a report does not use.
 *
 * The form is seeded from a template holding all 68 diagnoses pre-filled and
 * submits the lot, so every stored report carried 32KB where ~493 bytes were
 * meaningful. Only the block named by `visita.type` is the report.
 *
 * Returns the report untouched when `type` names no known block. That case
 * would otherwise strip all 68 and leave a report that still shows up in the
 * list with nothing in it — worse than losing it, because nothing looks wrong.
 */
export function trimVisita(visita: Visitas): Visitas {
  if (!visita || typeof visita !== "object") return visita;
  if (!visita.type || !DIAGNOSIS_KEYS.has(visita.type)) return visita;

  const trimmed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(visita)) {
    if (!DIAGNOSIS_KEYS.has(key) || key === visita.type) {
      trimmed[key] = value;
    }
  }
  return trimmed as Visitas;
}

/** Exported for the measurement script; not part of the runtime path. */
export const DIAGNOSIS_KEY_COUNT = DIAGNOSIS_KEYS.size;
