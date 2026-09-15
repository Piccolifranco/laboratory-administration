import type { Paciente } from "@/types/supabase";

/**
 * One row of `GET /api/pacientes`.
 *
 * Every column of `Paciente` except `visitas` — a JSON array holding every
 * report body, macro and micro text included, which the list does not render
 * and which dominated the old payload. In its place, a single derived date.
 */
export type PacienteListItem = Omit<Paciente, "visitas"> & {
  /** ISO date of the patient's most recent visit, or null when they have none. */
  ultimaVisita: string | null;
};

/**
 * The fields the edit dialog is allowed to change.
 *
 * Writes are restricted to this set so that a derived field like `ultimaVisita`
 * — which is not a column — can never reach an UPDATE, and so that editing a
 * patient cannot clobber `visitas`.
 */
export type PacienteEditableFields = Pick<
  Paciente,
  "firstName" | "lastName" | "age" | "dni" | "doctor" | "obraSocial"
>;
