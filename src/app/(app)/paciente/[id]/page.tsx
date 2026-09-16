import { notFound, redirect } from "next/navigation";
import { adminDb } from "@/app/remoteDataSource/supabaseServerSide";
import { isUnauthorized } from "@/app/utils/session";
import { PacienteComponent } from "./paciente-component";

export default async function PacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ createVisita?: string }>;
}) {
  const { id: pacienteId } = await params;
  const { createVisita } = await searchParams;

  // The route param is a string; the column is a number. Passing the string
  // worked only because PostgREST coerced it, and it was one of the repo's
  // pre-existing type errors.
  const id = Number(pacienteId);
  if (!Number.isInteger(id)) notFound();

  let db;
  try {
    db = await adminDb();
  } catch (error) {
    // A Server Component cannot return 401 usefully, and it cannot refresh the
    // cookie either. Sending the visitor to the login screen is the honest
    // outcome; proxy.ts handles the same case for navigations.
    if (isUnauthorized(error)) redirect("/");
    throw error;
  }

  const { data: paciente, error } = await db
    .from("pacientes")
    .select()
    .eq("id", id)
    .single();

  if (error || !paciente) notFound();

  return (
    <PacienteComponent
      paciente={paciente}
      modalOpen={createVisita === "true"}
      visitas={paciente.visitas ?? []}
    />
  );
}
