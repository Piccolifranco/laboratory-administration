import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { Paciente } from "../../../types/supabase";

const PAGE_SIZE = 20;

export function useInfinitePacientes(searchTerm?: string) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = useCallback(async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    let from = pageIndex * PAGE_SIZE;
    let to = from + PAGE_SIZE - 1;
    let query = supabase.from("pacientes").select();
    if (searchTerm) {
      query = query.textSearch("lastName", searchTerm);
    }
    const { data, error } = await query.range(from, to);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data) {
      setPacientes((prev) => (pageIndex === 0 ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    setPacientes([]);
    setPage(0);
    setHasMore(true);
    fetchPacientes(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchNext = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPacientes(nextPage);
    }
  };

  return { pacientes, loading, hasMore, fetchNext, error };
}
