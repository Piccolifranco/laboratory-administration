import { NextResponse } from "next/server";
import { adminDb } from "@/app/remoteDataSource/supabaseServerSide";
import { isUnauthorized, unauthorizedResponse } from "@/app/utils/authResponse";
import type { PacienteListItem } from "@/app/(app)/pacientes/types";
import type { Visitas } from "@/types/supabase";

const PAGE_SIZE = 20;

/**
 * Columns the list renders or sorts on.
 *
 * `visitas` is selected but never returned: deriving the latest visit date
 * requires reading the JSON, because it lives inside this column rather than in
 * its own table. So this trims the server-to-browser payload, which is what the
 * clinic actually feels on a phone, while the Supabase-to-server hop still
 * carries the blob. Moving `visitas` into its own table is the real fix and is
 * out of scope — it needs a data migration.
 */
const LIST_COLUMNS =
  "id, firstName, lastName, age, dni, doctor, obraSocial, createdAt, visitas";

/**
 * The patient's most recent visit date, or null.
 *
 * Takes the maximum rather than `visitas[0]`. New visits are appended to the
 * end of the array, so index 0 is the OLDEST — the list column labelled
 * "Última Visita" had been showing each patient's first-ever consultation.
 * Skips entries with a missing or unparseable date instead of throwing, and
 * returns null for an empty array, which used to crash the row.
 */
function latestVisitDate(visitas: Visitas[] | null | undefined): string | null {
  if (!visitas || visitas.length === 0) return null;

  let latest: number | null = null;
  for (const visita of visitas) {
    if (!visita?.date) continue;
    const time = new Date(visita.date).getTime();
    if (Number.isNaN(time)) continue;
    if (latest === null || time > latest) latest = time;
  }

  return latest === null ? null : new Date(latest).toISOString();
}

/**
 * Escapes LIKE wildcards so a patient surname containing % or _ searches
 * literally. The backslashes are doubled on purpose: `\\` is one literal
 * backslash in the pattern, and in the replacement `` `\\${char}` `` produces
 * backslash-plus-character. Writing `` `\${char}` `` instead escapes the dollar
 * sign and emits the literal text "${char}", which is the opposite of escaping.
 */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function GET(request: Request) {
  let db;
  try {
    db = await adminDb();
  } catch (error) {
    if (isUnauthorized(error)) return unauthorizedResponse();
    throw error;
  }

  const { searchParams } = new URL(request.url);

  const rawPage = Number(searchParams.get("page") ?? "0");
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const term = (searchParams.get("q") ?? "").trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = db
    .from("pacientes")
    .select(LIST_COLUMNS)
    // Newest patients first. Order the full set server-side BEFORE paginating so
    // .range() walks a stable, globally-ordered list. The id tiebreaker keeps
    // pagination stable when two rows share a createdAt timestamp.
    .order("createdAt", { ascending: false })
    .order("id", { ascending: false });

  if (term) {
    // ilike, not textSearch. textSearch matches whole lexemes, so typing "Per"
    // never found "Perez" — the search box appeared broken for partial names.
    query = query.ilike("lastName", `%${escapeLike(term)}%`);
  }

  const { data, error } = await query.range(from, to);

  if (error) {
    console.error("Error listing pacientes:", error.message);
    return NextResponse.json(
      { error: "No se pudieron cargar los pacientes" },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  const pacientes: PacienteListItem[] = rows.map((row) => {
    const { visitas, ...paciente } = row as typeof row & {
      visitas?: Visitas[] | null;
    };
    return { ...paciente, ultimaVisita: latestVisitDate(visitas) } as PacienteListItem;
  });

  return NextResponse.json({
    pacientes,
    hasMore: pacientes.length === PAGE_SIZE,
  });
}
