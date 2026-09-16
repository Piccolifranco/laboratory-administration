import { Pacientes } from "./pacientes-component";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const isCreatePacienteOpen = sp.createPaciente === "true";
  const isEditPacienteOpen = sp.editPaciente === "true";

  return (
    <Pacientes
      isCreatePacienteOpen={isCreatePacienteOpen}
      isEditPacienteOpen={isEditPacienteOpen}
    />
  );
}
