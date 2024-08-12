import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Paciente, Visitas } from "../../../types/supabase";
import { Button, ButtonProps } from "@headlessui/react";
import Dialog from "./Dialog";
import { useState } from "react";
import { FaDownload } from "react-icons/fa";

export function CreatePaciente() {
  return (
    <Link
      href="/pacientes?createPaciente=true"
      className="flex h-10 items-center rounded-lg bg-amber-600 px-4 text-md font-medium text-white transition-colors hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Nuevo paciente</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function EditPaciente({
  paciente,
  onEditPaciente,
}: {
  paciente: Paciente;
  onEditPaciente: (paciente: Paciente) => void;
}) {
  const handleClick = () => {
    onEditPaciente(paciente);
  };
  return (
    <Link
      onClick={handleClick}
      href="/pacientes?editPaciente=true"
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}
export function EditVisita({
  visita,
  onEditVisita,
  pacienteId,
}: {
  visita: Visitas;
  onEditVisita: (visita: Visitas) => void;
  pacienteId: number;
}) {
  const handleClick = () => {
    onEditVisita(visita);
  };
  return (
    <Link
      onClick={handleClick}
      href={`/paciente/${pacienteId}?createVisita=true`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeletePaciente(props: ButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };
  return (
    <>
      <Dialog
        width="w-fit"
        dialogTitle="Eliminar Paciente"
        dialogBody={
          <div className="pb-4 pt-4 font-medium text-lg">
            Estas seguro de que quieres eliminar este paciente?
          </div>
        }
        dialogFooter={
          <div className="flex gap-4 justify-center w-[100%]">
            <button
              onClick={closeModal}
              className="rounded-md flex border p-2 text-black bg-slate-200 hover:bg-slate-300  items-center gap-2"
            >
              Cancelar
              <XMarkIcon className="w-5" />
            </button>
            <button
              {...props}
              className="rounded-md flex border p-2 text-white bg-red-500 hover:bg-red-700 items-center gap-2"
            >
              Eliminar
              <TrashIcon className="w-5" />
            </button>
          </div>
        }
        open={modalOpen}
      />
      <button
        {...props}
        onClick={openModal}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}
export function DownloadPDF(props: ButtonProps) {
  return (
    <Button {...props} className="rounded-md border p-2 hover:bg-gray-100">
      <FaDownload className="w-5" />
    </Button>
  );
}

export function CreateVisita({ id }: { id: number }) {
  return (
    <Link
      href={`/paciente/${id}?createVisita=true`}
      className="flex h-10 my-1 items-center justify-center rounded-lg bg-amber-600 px-4 text-lg font-medium text-white transition-colors hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Nueva Visita</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}
