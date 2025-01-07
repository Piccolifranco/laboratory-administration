import React, { useState } from "react";
import { DeletePaciente, EditPaciente } from "./buttons";
import { Paciente } from "../../../types/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { deletePaciente } from "../remoteDataSource/supabase";
import { useRouter } from "next/navigation";

type TableProps = {
  pacientes: Paciente[];
  onEditPaciente: (paciente: Paciente) => void;
};

type SortConfig = {
  key: keyof Paciente | "ultimaVisita";
  direction: "asc" | "desc";
};

const Table = ({ pacientes, onEditPaciente }: TableProps) => {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sortedPacientes = React.useMemo(() => {
    if (!sortConfig) return pacientes;

    const sorted = [...pacientes];
    sorted.sort((a, b) => {
      const key = sortConfig.key;

      let aValue =
        key === "ultimaVisita"
          ? a.visitas?.[0]?.date
            ? new Date(a.visitas[0].date)
            : null
          : a[key as keyof Paciente] || "";
      let bValue =
        key === "ultimaVisita"
          ? b.visitas?.[0]?.date
            ? new Date(b.visitas[0].date)
            : null
          : b[key as keyof Paciente] || "";

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

  const handleSort = (key: keyof Paciente | "ultimaVisita") => {
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
      <div className="overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
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
                      className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort(key as keyof Paciente | "ultimaVisita")
                      }
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
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPacientes.map((paciente) => {
                  const handleDeletePaciente = async () => {
                    await deletePaciente(paciente.id);
                    router.refresh();
                  };
                  return (
                    <tr key={paciente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                        <Link href={`/paciente/${paciente.id}`}>
                          {paciente?.lastName}, {paciente.firstName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                        {paciente?.age ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                        {paciente?.dni ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                        {paciente?.doctor ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                        {paciente?.obraSocial ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                        {paciente?.visitas
                          ? `${format(
                              new Date(paciente.visitas[0].date),
                              "dd/MM/yyyy"
                            )}`
                          : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
