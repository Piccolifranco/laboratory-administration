import { supabase } from "@/app/layout";
import { PacienteComponent } from "./paciente-component";
import InvoiceStatus from "@/app/ui/status";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function PacientePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { createVisita: string };
}) {
  const pacienteId = params.id;
  const fetchedPaciente = await supabase
    .from("pacientes")
    .select()
    .eq("id", pacienteId)
    .single();
  const paciente = fetchedPaciente.data;
  const visitas = fetchedPaciente.data?.visitas;
  const modalOpen = searchParams.createVisita === "true";
  return (
    paciente && (
      <PacienteComponent
        paciente={paciente}
        modalOpen={modalOpen}
        visitas={visitas ?? []}
      />
    )
  );
}
