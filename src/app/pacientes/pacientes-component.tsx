"use client";
import React, { useState } from "react";
import { Paciente } from "../../../types/supabase";
import Dialog from "../ui/Dialog";
import { NewPacienteDialogBody } from "../ui/NewPacienteDialog/NewPacienteDialogBody";
import { InvoicesTableSkeleton } from "../ui/skeletons";
import { CreatePaciente } from "../ui/buttons";
import Table from "../ui/Table";
import Search from "../ui/search";
import { EditPacienteDialogBody } from "../ui/EditPacienteDialog/EditPacienteDialogBody";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfinitePacientes } from "./useInfinitePacientes";
import { useDebounce } from "use-debounce";



export type PacientesProps = {
  isCreatePacienteOpen: boolean;
  isEditPacienteOpen: boolean;
};
const Pacientes = ({
  isCreatePacienteOpen,
  isEditPacienteOpen,
}: PacientesProps) => {
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
  const { pacientes, loading, hasMore, fetchNext, error } = useInfinitePacientes(debouncedSearchTerm);

  const handleEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
  };


  return (
    <main className="max-w-7xl mx-auto">
      <div className="pt-2">
        <div className="mt-4 flex items-center justify-between gap-2 md:my-4">
          <Search
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <CreatePaciente />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <InfiniteScroll
          dataLength={pacientes.length}
          next={fetchNext}
          hasMore={hasMore}
          endMessage={<p className="text-center py-4 text-gray-500">No hay más pacientes.</p>}
        >
          <Table pacientes={pacientes} onEditPaciente={handleEditPaciente} loading={loading} />
        </InfiniteScroll>
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
