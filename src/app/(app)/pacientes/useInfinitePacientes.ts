import { useState, useEffect, useCallback } from "react";
import type { PacienteListItem } from "./types";

export function useInfinitePacientes(searchTerm?: string) {
  const [pacientes, setPacientes] = useState<PacienteListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(pageIndex) });
        if (searchTerm) params.set("q", searchTerm);

        const response = await fetch(`/api/pacientes?${params}`);

        if (response.status === 401) {
          // The session lapsed while the tab was open. A full navigation lets
          // the proxy do the redirecting rather than duplicating that logic.
          window.location.href = "/";
          return;
        }

        if (!response.ok) {
          setError("No se pudieron cargar los pacientes");
          return;
        }

        const data = await response.json();
        setPacientes((prev) =>
          pageIndex === 0 ? data.pacientes : [...prev, ...data.pacientes]
        );
        setHasMore(Boolean(data.hasMore));
      } catch {
        setError("No se pudo conectar. Revisá tu conexión e intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

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

  /**
   * Reloads the list from page 0.
   *
   * Callers must invoke this after creating, editing or deleting a patient.
   * `router.refresh()` is not enough any more: it revalidates Server
   * Components, and since this list is fetched client-side the screen would
   * keep showing stale rows until a manual reload.
   */
  const refetch = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPacientes(0);
  }, [fetchPacientes]);

  return { pacientes, loading, hasMore, fetchNext, error, refetch };
}
