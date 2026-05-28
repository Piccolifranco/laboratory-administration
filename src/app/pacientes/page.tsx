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
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const isCreatePacienteOpen = sp.createPaciente === "true";
  const isEditPacienteOpen = sp.editPaciente === "true";

  return (
    <Pacientes
      isCreatePacienteOpen={isCreatePacienteOpen}
      isEditPacienteOpen={isEditPacienteOpen}
    />
  );
}
