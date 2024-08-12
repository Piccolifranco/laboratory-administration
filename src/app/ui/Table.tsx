import React from "react";
import { DeletePaciente, EditPaciente } from "./buttons";
import { Paciente } from "../../../types/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { deletePaciente } from "../remoteDataSource/supabase";
import { CustomPopover } from "./Popover/Popover";
import { useRouter } from "next/navigation";

type TableProps = {
  pacientes: Paciente[];
  onEditPaciente: (paciente: Paciente) => void;
};

const Table = ({ pacientes, onEditPaciente }: TableProps) => {
  const router = useRouter();
  return (
    <div className="flex flex-col">
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
                    Edad
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    DNI
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
                    Obra Social
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Última Visita
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
                {pacientes.map((paciente) => {
                  const handleDeletePaciente = async () => {
                    await deletePaciente(paciente.id);
                    router.refresh();

                    // window.location.reload();
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
