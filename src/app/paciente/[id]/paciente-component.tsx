"use client";
import React from "react";
import Dialog from "@/app/ui/Dialog";
import { updatePaciente } from "@/app/remoteDataSource/supabase";
import { CreateVisita } from "@/app/ui/buttons";
import { NewVisitaDialogBody } from "@/app/ui/NewVisitaDialogBody/NewVisitaDialogBody";
import InvoiceStatus from "@/app/ui/status";
import { Paciente, Visitas } from "../../../../types/supabase";
import { format } from "date-fns";
export type PacienteProps = {
  paciente: Paciente;
  visitas: Visitas[];
  modalOpen: boolean;
};

function PacienteComponent({ paciente, visitas, modalOpen }: PacienteProps) {
  const onSubmitVisita = (visita: Visitas) => {
    updatePaciente(paciente.id, {
      ...paciente,
      visitas:
        paciente.visitas && paciente.visitas.length > 0
          ? [...paciente?.visitas, visita]
          : [visita],
    });
  };

  return (
    <div className="flex flex-col max-w-7xl mx-auto">
      <div className="my-2">
        <CreateVisita id={paciente.id} />
      </div>
      <div className="overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Nombre y Apellido
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Doctor/a
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Diagnostico
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitas?.map((visita) => (
                  <tr key={paciente?.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {paciente?.firstName}, {paciente?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paciente?.doctor
                        ? paciente.doctor
                        : visita.secondaryDoctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visita[visita.type]?.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paciente?.visitas && visita.date
                        ? `${format(new Date(visita.date), "dd/MM/yyyy")}`
                        : ""}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <InvoiceStatus
                        amount={visita.amount}
                        status={visita.status}
                      />
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-3">
                        <UpdatePaciente id={paciente?.id} />
                        <DeletePaciente id={paciente?.id} />
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Dialog
        dialogTitle="Nuevo informe"
        dialogBody={
          <NewVisitaDialogBody
            paciente={paciente}
            onSubmitHandler={onSubmitVisita}
          />
        }
        dialogFooter={<div />}
        open={modalOpen}
      />
    </div>
  );
}

export { PacienteComponent };
