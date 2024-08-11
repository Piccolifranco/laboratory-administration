"use client";
import { createClient } from "@supabase/supabase-js";
import type { Database, Paciente } from "../../../types/supabase";

export const supabase = createClient<Database>(
  "https://lylnvhhzhyqlbbjgymws.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bG52aGh6aHlxbGJiamd5bXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MjA3MzUsImV4cCI6MjAzNDM5NjczNX0.nFOeaQqh5WYlLlBKssniRY-NRmZt1Xp9yDfBnzaiGnA"
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
