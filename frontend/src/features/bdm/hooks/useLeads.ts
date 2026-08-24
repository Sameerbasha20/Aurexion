import { useState, useEffect, useCallback } from "react";
import { bdmService, Lead, LeadsResponse, clearBdmCache } from "../services/bdmService";

export function invalidateLeadsCache() {
  clearBdmCache();
}

interface UseLeadsOptions {
  status?: string;
  search?: string;
  source?: string;
  pageSize?: number;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.pageSize || 10);

  const [data, setData] = useState<LeadsResponse | null>(() => {
    return bdmService.getCachedLeads({
      page: 1,
      page_size: pageSize,
      status: options.status,
      search: options.search,
      source: options.source,
    });
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = bdmService.getCachedLeads({
      page: 1,
      page_size: pageSize,
      status: options.status,
      search: options.search,
      source: options.source,
    });
    return !cached;
  });

  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (pageNum: number = 1, force = false) => {
    const cached = bdmService.getCachedLeads({
      page: pageNum,
      page_size: pageSize,
      status: options.status,
      search: options.search,
      source: options.source,
    });

    if (cached && !force) {
      setData(cached);
      setPage(pageNum);
      setIsLoading(false);
      return;
    }

    try {
      if (!cached) {
        setIsLoading(true);
      }
      setError(null);

      const response = await bdmService.getLeads({
        page: pageNum,
        page_size: pageSize,
        status: options.status,
        search: options.search,
        source: options.source,
      }, force);

      setData(response);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, options.status, options.search, options.source]);

  useEffect(() => {
    fetchLeads(page, false);
  }, [page, pageSize, options.status, options.search, options.source]);

  const goToPage = useCallback((pageNum: number) => {
    fetchLeads(pageNum, false);
  }, [fetchLeads]);

  const nextPage = useCallback(() => {
    if (data?.next) goToPage(page + 1);
  }, [data?.next, goToPage, page]);

  const prevPage = useCallback(() => {
    if (data?.previous) goToPage(page - 1);
  }, [data?.previous, goToPage, page]);

  const refetch = useCallback(() => {
    return fetchLeads(page, true);
  }, [fetchLeads, page]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  return {
    leads: data?.results || [],
    totalCount: data?.count || 0,
    currentPage: page,
    pageSize,
    setPageSize: changePageSize,
    totalPages: data ? Math.max(1, Math.ceil(data.count / pageSize)) : 1,
    isLoading,
    error,
    refetch,
    goToPage,
    nextPage,
    prevPage,
    hasNext: !!data?.next,
    hasPrev: !!data?.previous,
  };
}

export function useLead(id: number) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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