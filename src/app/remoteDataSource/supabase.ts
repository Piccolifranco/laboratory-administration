"use client";
import { createClient } from "@supabase/supabase-js";
import type { Database, Paciente, Visitas } from "../../../types/supabase";
import type { PacienteEditableFields } from "@/app/(app)/pacientes/types";

export const supabase = createClient<Database>(
  "https://lylnvhhzhyqlbbjgymws.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ""
);

export const addPaciente = async (data: Paciente) =>
  await supabase.from("pacientes").insert(data);

export const updatePaciente = async (
  id: number,
  updates: PacienteEditableFields
) => {
  // Only the editable fields, never the whole row: the row now carries a
  // derived `ultimaVisita` that is not a column, and a wholesale write could
  // also clobber the visitas array.
  const { data, error } = await supabase
    .from("pacientes")
    .update({
      firstName: updates.firstName,
      lastName: updates.lastName,
      age: updates.age,
      dni: updates.dni,
      doctor: updates.doctor,
      obraSocial: updates.obraSocial,
    })
    .eq("id", id)
    // .select() is required: without it PostgREST replies 204 with no body, so
    // both `data` and `error` come back null and a successful write is
    // indistinguishable from a failed one. Callers check the return value.
    .select()
    .single();

  if (error) {
    console.error("Error updating paciente:", error);
    return null;
  }
  return data;
};

/**
 * Writes only the visitas column.
 *
 * Separate from `updatePaciente` so neither function can clobber the other's
 * columns: saving a report must never touch the patient's details, and editing
 * the patient's details must never touch their reports.
 */
export const updatePacienteVisitas = async (id: number, visitas: Visitas[]) => {
  const { data, error } = await supabase
    .from("pacientes")
    .update({ visitas })
    .eq("id", id)
    // See updatePaciente: without .select() a successful write returns null and
    // looks identical to a failure. This one matters most — a report that fails
    // to save silently is a lost medical record.
    .select()
    .single();

  if (error) {
    console.error("Error updating visitas:", error);
    return null;
  }
  return data;
};

export const deletePaciente = async (id: number) => {
  const { data, error } = await supabase
    .from("pacientes")
    .delete()
    .eq("id", id)
    // Same as the updates above: without .select() the deleted row is not
    // returned and a success reads as null.
    .select()
    .single();

  if (error) {
    console.error("Error deleting paciente:", error);
    return null;
  }
  return data;
};
