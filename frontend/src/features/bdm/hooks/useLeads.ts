import { useState, useEffect, useCallback } from "react";
import { bdmService, Lead, LeadsResponse } from "../services/bdmService";

interface UseLeadsOptions {
  status?: string;
  search?: string;
  source?: string;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchLeads = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bdmService.getLeads({
        page: pageNum,
        status: options.status,
        search: options.search,
        source: options.source,
      });
      setData(response);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.search, options.source]);

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  const goToPage = useCallback((pageNum: number) => {
    fetchLeads(pageNum);
  }, [fetchLeads]);

  const nextPage = useCallback(() => {
    if (data?.next) goToPage(page + 1);
  }, [data?.next, goToPage, page]);

  const prevPage = useCallback(() => {
    if (data?.previous) goToPage(page - 1);
  }, [data?.previous, goToPage, page]);

  return {
    leads: data?.results || [],
    totalCount: data?.count || 0,
    currentPage: page,
    totalPages: data ? Math.ceil(data.count / 20) : 0,
    isLoading,
    error,
    refetch: () => fetchLeads(page),
    goToPage,
    nextPage,
    prevPage,
    hasNext: !!data?.next,
    hasPrev: !!data?.previous,
  };
}

export function useLead(id: number) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bdmService.getLead(id);
      setLead(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lead");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchLead();
  }, [id, fetchLead]);

  return { lead, isLoading, error, refetch: fetchLead };
}