import Image from "next/image";
import Search from "../ui/search";
import { CreatePaciente } from "../ui/buttons";
import Table from "../ui/Table";
import { supabase } from "../layout";
import { Suspense } from "react";
import { InvoicesTableSkeleton } from "../ui/skeletons";
import Dialog from "../ui/Dialog";

export default async function PacientesPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  console.log({ params, searchParams });
  const { data, error } = await supabase.from("pacientes").select();

  return (
    <main className="max-w-7xl mx-auto">
      <div className="pt-2">
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Buscar pacientes..." />
          <CreatePaciente />
        </div>
        <Suspense fallback={<InvoicesTableSkeleton />}>
          <Table pacientes={data || []} />
        </Suspense>
      </div>
      <Dialog
        dialogTitle="Agregar Paciente"
        dialogBody={<div />}
        dialogFooter={<div />}
        open={searchParams.createPaciente === "true"}
      />
    </main>
  );
}
