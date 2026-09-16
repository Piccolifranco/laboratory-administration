"use server";

import { adminDb } from "./supabaseServerSide";
import { trimVisita } from "./trimVisita";
import { isUnauthorized } from "@/app/utils/session";
import type { PacienteEditableFields } from "@/app/(app)/pacientes/types";
import type { Paciente, Visitas } from "@/types/supabase";

/**
 * What every action returns.
 *
 * Actions never throw across the server/client boundary: Next redacts server
 * error messages in production, so a thrown UnauthorizedError would reach the
 * caller as an opaque "An error occurred" with no way to tell "log in again"
 * from "the database rejected this".
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "unauthorized" | "error"; message: string };

function fail(error: unknown, fallback: string): ActionResult<never> {
  if (isUnauthorized(error)) {
    return { ok: false, reason: "unauthorized", message: "Sesión expirada" };
  }
  console.error(fallback, error);
  return { ok: false, reason: "error", message: fallback };
}

/** The six fields an edit may change. Anything else on the object is ignored. */
function editableOnly(fields: PacienteEditableFields) {
  return {
    firstName: fields.firstName,
    lastName: fields.lastName,
    age: fields.age,
    dni: fields.dni,
    doctor: fields.doctor,
    obraSocial: fields.obraSocial,
  };
}

export async function createPacienteAction(
  fields: PacienteEditableFields
): Promise<ActionResult<Paciente>> {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .insert(editableOnly(fields))
      // .select() is required: without it PostgREST replies 204 with no body
      // and a successful write is indistinguishable from a failed one.
      .select()
      .single();

    if (error) return fail(error, "No se pudo crear el paciente");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo crear el paciente");
  }
}

export async function updatePacienteAction(
  id: number,
  fields: PacienteEditableFields
): Promise<ActionResult<Paciente>> {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .update(editableOnly(fields))
      .eq("id", id)
      .select()
      .single();

    if (error) return fail(error, "No se pudo actualizar el paciente");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo actualizar el paciente");
  }
}

/**
 * Writes only the visitas column, never the patient's own fields.
 *
 * Kept separate from updatePacienteAction so neither can clobber the other's
 * columns: saving a report must not touch patient details, and editing details
 * must not touch reports.
 */
export async function saveVisitasAction(
  id: number,
  visitas: Visitas[]
): Promise<ActionResult<Paciente>> {
  try {
    const trimmed = visitas.map(trimVisita);

    // Invariant: trimming shrinks each report, never the array. `map` cannot
    // drop elements, so this guards against a future refactor turning it into
    // a filter — losing a report is the one outcome that must never happen.
    if (trimmed.length !== visitas.length) {
      console.error(
        `Trim changed the report count (${visitas.length} -> ${trimmed.length}); refusing to write.`
      );
      return { ok: false, reason: "error", message: "No se pudo guardar el informe" };
    }

    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .update({ visitas: trimmed })
      .eq("id", id)
      .select()
      .single();

    if (error) return fail(error, "No se pudo guardar el informe");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo guardar el informe");
  }
}

export async function deletePacienteAction(
  id: number
): Promise<ActionResult<Paciente>> {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("pacientes")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) return fail(error, "No se pudo eliminar el paciente");
    return { ok: true, data: data as Paciente };
  } catch (error) {
    return fail(error, "No se pudo eliminar el paciente");
  }
}
