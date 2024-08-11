"use client";
import { createClient } from "@supabase/supabase-js";
import type { Database, Paciente } from "../../../types/supabase";

export const supabase = createClient<Database>(
  "https://lylnvhhzhyqlbbjgymws.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ""
);

export const addPaciente = async (data: Paciente) =>
  await supabase.from("pacientes").insert(data);

export const updatePaciente = async (id: number, updates: Paciente) => {
  const { data, error } = await supabase
    .from("pacientes")
    .update(updates)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error updating paciente:", error);
    return error;
  }
  console.log({ data });

  return data;
};

export const deletePaciente = async (id: number) => {
  const { data, error } = await supabase
    .from("pacientes")
    .delete()
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error deleting paciente:", error);
    return error;
  }
  console.log("Paciente deleted:", data);
  return data;
};
