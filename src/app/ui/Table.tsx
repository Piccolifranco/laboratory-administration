import React, { useState } from "react";
import { DeletePaciente, EditPaciente } from "./buttons";
import type { PacienteListItem } from "@/app/(app)/pacientes/types";
import { format } from "date-fns";
import Link from "next/link";
import { deletePaciente } from "../remoteDataSource/supabase";
import { useRouter } from "next/navigation";

import PatientTableSkeleton from "./PatientTableSkeleton";

type TableProps = {
  pacientes: PacienteListItem[];
  onEditPaciente: (paciente: PacienteListItem) => void;
  loading?: boolean;
};

type SortConfig = {
  key: keyof PacienteListItem;
  direction: "asc" | "desc";
};

const Table = ({ pacientes, onEditPaciente, loading = false }: TableProps) => {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sortedPacientes = React.useMemo(() => {
    if (!sortConfig) return pacientes;

    const sorted = [...pacientes];
    sorted.sort((a, b) => {
      const key = sortConfig.key;

      const aRaw = a[key];
      const bRaw = b[key];

      const aValue =
        key === "ultimaVisita" && aRaw ? new Date(aRaw as string) : aRaw ?? "";
      const bValue =
        key === "ultimaVisita" && bRaw ? new Date(bRaw as string) : bRaw ?? "";

      // Handle null/undefined values
      if (aValue === null || aValue === undefined)
        return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue === null || bValue === undefined)
        return sortConfig.direction === "asc" ? -1 : 1;

      // Sort by Date or other data types
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [pacientes, sortConfig]);

  const handleSort = (key: keyof PacienteListItem) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div className="flex flex-col">
      <div className="hidden overflow-x-auto md:block">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-border sm:rounded-lg">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-sunken">
                <tr>
                  {[
                    { key: "lastName", label: "Nombre y Apellido" },
                    { key: "age", label: "Edad" },
                    { key: "dni", label: "DNI" },
                    { key: "doctor", label: "Doctor/a" },
                    { key: "obraSocial", label: "Obra Social" },
                    { key: "ultimaVisita", label: "Última Visita" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(key as keyof PacienteListItem)}
                    >
                      {label}
                      {sortConfig?.key === key && (
                        <span>
                          {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                        </span>
                      )}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-fg-muted uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {sortedPacientes.length === 0 && loading ? (
                  <PatientTableSkeleton />
                ) : (
                  <>
                    {sortedPacientes.map((paciente) => {
                  const handleDeletePaciente = async () => {
                    await deletePaciente(paciente.id);
                    router.refresh();
                  };
                  return (
                    <tr key={paciente.id} className="hover:bg-surface-muted">
                      <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-fg">
                        <Link href={`/paciente/${paciente.id}`}>
                          {paciente?.lastName}, {paciente.firstName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-fg-subtle">
                        {paciente?.age ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-fg-subtle">
                        {paciente?.dni ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-fg-subtle">
                        {paciente?.doctor ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-fg-subtle">
                        {paciente?.obraSocial ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-fg-subtle">
                        {paciente.ultimaVisita
                          ? format(new Date(paciente.ultimaVisita), "dd/MM/yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-subtle">
                        <div className="flex gap-3">
                          <EditPaciente
                            paciente={paciente}
                            onEditPaciente={onEditPaciente}
                          />
                          <DeletePaciente onClick={handleDeletePaciente} />
                        </div>
                      </td>
                    </tr>
                  );
                    })}
                    {loading && sortedPacientes.length > 0 && <PatientTableSkeleton />}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {sortedPacientes.length === 0 && loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg bg-surface-sunken"
              />
            ))}
          </>
        ) : (
          sortedPacientes.map((paciente) => {
            const handleDeletePacienteCard = async () => {
              await deletePaciente(paciente.id);
              router.refresh();
            };
            return (
              <div
                key={paciente.id}
                className="rounded-lg border border-border bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/paciente/${paciente.id}`}
                    className="text-md font-medium text-fg"
                  >
                    {paciente?.lastName}, {paciente.firstName}
                  </Link>
                  <div className="flex gap-2">
                    <EditPaciente
                      paciente={paciente}
                      onEditPaciente={onEditPaciente}
                    />
                    <DeletePaciente onClick={handleDeletePacienteCard} />
                  </div>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-fg-subtle">
                  <div>
                    <dt className="inline font-medium">Edad: </dt>
                    <dd className="inline">{paciente?.age ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">DNI: </dt>
                    <dd className="inline">{paciente?.dni ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Doctor/a: </dt>
                    <dd className="inline">{paciente?.doctor ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">OS: </dt>
                    <dd className="inline">{paciente?.obraSocial ?? "-"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="inline font-medium">Última visita: </dt>
                    <dd className="inline">
                      {paciente.ultimaVisita
                        ? format(new Date(paciente.ultimaVisita), "dd/MM/yyyy")
                        : "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })
        )}
        {loading && sortedPacientes.length > 0 && (
          <div className="h-28 animate-pulse rounded-lg bg-surface-sunken" />
        )}
      </div>
    </div>
  );
};

export default Table;
