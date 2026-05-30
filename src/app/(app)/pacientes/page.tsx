import { Pacientes } from "./pacientes-component";
import Image from "next/image";
import Search from "@/app/ui/search";
import { CreatePaciente } from "@/app/ui/buttons";
import Table from "@/app/ui/Table";
import { Suspense } from "react";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import Dialog from "@/app/ui/Dialog";
import { NewPacienteDialogBody } from "@/app/ui/NewPacienteDialog/NewPacienteDialogBody";
import { Paciente } from "@/types/supabase";
import { supabase } from "@/app/utils/supabaseClient";
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
