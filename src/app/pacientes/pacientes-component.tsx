"use client";
import React, { Suspense, useState } from "react";
import { Paciente } from "../../../types/supabase";
import Dialog from "../ui/Dialog";
import { NewPacienteDialogBody } from "../ui/NewPacienteDialog/NewPacienteDialogBody";
import { InvoicesTableSkeleton } from "../ui/skeletons";
import { CreatePaciente } from "../ui/buttons";
import Table from "../ui/Table";
import Search from "../ui/search";
import { EditPacienteDialogBody } from "../ui/EditPacienteDialog/EditPacienteDialogBody";

export type PacientesProps = {
  data: Paciente[];
  isCreatePacienteOpen: boolean;
  isEditPacienteOpen: boolean;
};
const Pacientes = ({
  data,
  isCreatePacienteOpen,
  isEditPacienteOpen,
}: PacientesProps) => {
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
    null
  );

  const handleEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
  };
  return (
    <main className="max-w-7xl mx-auto">
      <div className="pt-2">
        <div className="mt-4 flex items-center justify-between gap-2 md:my-4">
          <Search placeholder="Buscar pacientes..." />
          <CreatePaciente />
        </div>
        <Suspense fallback={<InvoicesTableSkeleton />}>
          <Table pacientes={data || []} onEditPaciente={handleEditPaciente} />
        </Suspense>
      </div>
      <Dialog
        dialogTitle="Agregar Paciente"
        dialogBody={<NewPacienteDialogBody />}
        dialogFooter={<div />}
        open={isCreatePacienteOpen}
      />
      {selectedPaciente && (
        <Dialog
          dialogTitle="Editar Paciente"
          dialogBody={<EditPacienteDialogBody paciente={selectedPaciente} />}
          dialogFooter={<div />}
          open={isEditPacienteOpen}
        />
      )}
    </main>
  );
};

export { Pacientes };
