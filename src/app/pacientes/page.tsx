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
export default function PacientesPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isCreatePacienteOpen = searchParams.createPaciente === "true";
  const isEditPacienteOpen = searchParams.editPaciente === "true";

  return (
    <Pacientes
      isCreatePacienteOpen={isCreatePacienteOpen}
      isEditPacienteOpen={isEditPacienteOpen}
    />
  );
}
