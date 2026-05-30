"use client";
import React, { useState } from "react";
import Dialog from "@/app/ui/Dialog";
import { updatePaciente } from "@/app/remoteDataSource/supabase";
import {
  CreateVisita,
  DeletePaciente,
  DownloadPDF,
  EditPaciente,
  EditVisita,
} from "@/app/ui/buttons";
import { NewVisitaDialogBody } from "@/app/ui/NewVisitaDialogBody/NewVisitaDialogBody";
import InvoiceStatus from "@/app/ui/status";
import { Paciente, Visitas } from "@/types/supabase";
import { format, toDate } from "date-fns";
import { CustomPopover } from "@/app/ui/Popover/Popover";
import { pdf } from "@react-pdf/renderer";
import DocumentoPDF from "@/app/ui/DocumentoPDF";
import { useRemoveQueryParam } from "@/app/utils/removeQueryParams";
export type PacienteProps = {
  paciente: Paciente;
  visitas: Visitas[];
  modalOpen: boolean;
};

function PacienteComponent({ paciente, visitas, modalOpen }: PacienteProps) {
  const [localVisitas, setLocalVisitas] = React.useState<Visitas[]>(visitas);

  const reorderedVisitas = [...localVisitas].reverse();
  const { removeQueryParams } = useRemoveQueryParam();
  const onSubmitVisita = async (visita: Visitas) => {
    const visitaId = crypto.randomUUID();
    const visitaWithId = { ...visita, id: visitaId };
    if (!visitaToEdit) {
      const newVisitas = paciente.visitas && paciente.visitas.length > 0
        ? [...paciente?.visitas, visitaWithId]
        : [visitaWithId];
      await updatePaciente(paciente.id, {
        ...paciente,
        visitas: newVisitas,
      });
      setLocalVisitas(newVisitas);
    } else {
      if (paciente.visitas) {
        const toEditIndex = paciente?.visitas?.findIndex(
          (pacienteVisita) => pacienteVisita.id === visitaToEdit.id
        );
        const visitasCopy = paciente?.visitas;
        visitasCopy[toEditIndex] = visita;
        await updatePaciente(paciente.id, {
          ...paciente,
          visitas: visitasCopy,
        });
        setLocalVisitas([...visitasCopy]);
      }
    }
  };
  const [visitaToEdit, setVisitaToEdit] = useState<Visitas | undefined>(
    undefined
  );
  return (
    <div className="flex flex-col max-w-7xl mx-auto">
      <div className="my-2">
        <CreateVisita id={paciente.id} />
      </div>
      <div className="overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-border sm:rounded-lg">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-sunken">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider"
                  >
                    Nombre y Apellido
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider"
                  >
                    Doctor/a
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider"
                  >
                    Diagnostico
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {reorderedVisitas?.map((visita) => {
                  return (
                    <tr key={paciente?.id} className="hover:bg-surface-muted">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-fg">
                        {paciente?.firstName}, {paciente?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-subtle">
                        {paciente?.doctor
                          ? paciente.doctor
                          : visita.secondaryDoctor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-subtle">
                        {visita[visita.type]?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-subtle">
                        {paciente?.visitas && visita.date
                          ? `${format(new Date(visita.date), "dd/MM/yyyy")}`
                          : ""}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-subtle">
                        <InvoiceStatus
                          amount={visita.amount}
                          status={visita.status}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-subtle">
                        <div className="flex gap-3">
                          <EditVisita
                            pacienteId={paciente.id}
                            visita={visita}
                            onEditVisita={() => {
                              setVisitaToEdit(visita);
                            }}
                          />
                          <DownloadPDF
                            onClick={async () => {
                              const blob = await pdf(
                                <DocumentoPDF
                                  visita={visita}
                                  paciente={paciente}
                                />
                              ).toBlob();
                              const pdfURL = URL.createObjectURL(blob);
                              window.open(pdfURL, "_blank");
                              removeQueryParams();
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Dialog
        dialogTitle="Nuevo informe"
        dialogBody={
          <NewVisitaDialogBody
            visita={visitaToEdit}
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
