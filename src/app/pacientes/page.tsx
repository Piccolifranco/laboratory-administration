import { Pacientes } from "./pacientes-component";
import Image from "next/image";
import Search from "../ui/search";
import { CreatePaciente } from "../ui/buttons";
import Table from "../ui/Table";
import { Suspense } from "react";
import { InvoicesTableSkeleton } from "../ui/skeletons";
import Dialog from "../ui/Dialog";
import { NewPacienteDialogBody } from "../ui/NewPacienteDialog/NewPacienteDialogBody";
import { Paciente } from "../../../types/supabase";
import { supabase } from "../utils/supabaseClient";
export default async function PacientesPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data, error } = await supabase.from("pacientes").select();

  const searchTerm = searchParams.search;
  let results;
  if (searchTerm) {
    results = await supabase
      .from("pacientes")
      .select()
      .textSearch("lastName", searchTerm);
    console.log({ results });
  }

  const isCreatePacienteOpen = searchParams.createPaciente === "true";
  const isEditPacienteOpen = searchParams.editPaciente === "true";

  return (
    <Pacientes
      data={searchTerm ? results?.data : data}
      isCreatePacienteOpen={isCreatePacienteOpen}
      isEditPacienteOpen={isEditPacienteOpen}
    />
  );
}
