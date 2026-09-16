"use client";
import React, { useState } from "react";
import Dialog from "@/app/ui/Dialog";
import { saveVisitasAction } from "@/app/remoteDataSource/pacientesActions";
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
    // Built from `localVisitas`, never from `paciente.visitas`. The latter is
    // the prop from the server render and does not change after a save, so
    // adding a second report without reloading the page used to rebuild the
    // array from stale data and silently drop the first one.
    let nextVisitas: Visitas[];

    if (visitaToEdit) {
      const index = localVisitas.findIndex(
        (candidate) =>
          candidate === visitaToEdit ||
          (visitaToEdit.id != null && candidate.id === visitaToEdit.id)
      );

      // findIndex returns -1 when nothing matches, and `array[-1] = x` creates
      // a property named "-1" rather than replacing an element — a property
      // JSON.stringify then drops. The write would report success and change
      // nothing at all.
      if (index === -1) {
        console.error("No se encontró el informe a editar");
        return;
      }

      nextVisitas = localVisitas.map((candidate, i) =>
        i === index
          ? { ...visita, id: visitaToEdit.id ?? crypto.randomUUID() }
          : candidate
      );
    } else {
      nextVisitas = [...localVisitas, { ...visita, id: crypto.randomUUID() }];
    }

    const result = await saveVisitasAction(paciente.id, nextVisitas);
    if (!result.ok) {
      console.error(result.message);
      return;
    }

    setLocalVisitas(nextVisitas);
    // Without this the next "Nuevo informe" would still see a visitaToEdit and
    // overwrite the report just edited instead of adding one.
    setVisitaToEdit(undefined);
  };
  const [visitaToEdit, setVisitaToEdit] = useState<Visitas | undefined>(
    undefined
  );
  return (
    <div className="flex flex-col max-w-7xl mx-auto">
      <div className="my-2">
        <CreateVisita id={paciente.id} />
      </div>
      <div className="hidden overflow-x-auto md:block">
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
                    // The visit's id, not the patient's: every row shared one
                    // key, so React could not tell the rows apart.
                    <tr key={visita.id} className="hover:bg-surface-muted">
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

      {/* Mobile: visita cards */}
      <div className="space-y-3 md:hidden">
        {reorderedVisitas?.map((visita) => (
          <div
            key={visita.id}
            className="rounded-lg border border-border bg-surface p-4 shadow-sm"
          >
            <div className="text-md font-medium text-fg">
              {visita[visita.type]?.title}
            </div>
            <dl className="mt-2 space-y-1 text-sm text-fg-subtle">
              <div>
                <dt className="inline font-medium">Doctor/a: </dt>
                <dd className="inline">
                  {paciente?.doctor ? paciente.doctor : visita.secondaryDoctor}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Fecha: </dt>
                <dd className="inline">
                  {visita.date
                    ? format(new Date(visita.date), "dd/MM/yyyy")
                    : ""}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center justify-between">
              <InvoiceStatus amount={visita.amount} status={visita.status} />
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
                      <DocumentoPDF visita={visita} paciente={paciente} />
                    ).toBlob();
                    const pdfURL = URL.createObjectURL(blob);
                    window.open(pdfURL, "_blank");
                    removeQueryParams();
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        // The report form is the widest in the app — many diagnosis fields,
        // and macro/micro free text. It needs more room than the default cap.
        width="md:max-w-5xl"
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
