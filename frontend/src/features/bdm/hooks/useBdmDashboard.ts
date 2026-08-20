import { useState, useEffect, useCallback } from "react";
import { bdmService, DashboardData, clearBdmCache } from "../services/bdmService";

export function invalidateBdmDashboardCache() {
  clearBdmCache();
}

export function useBdmDashboard() {
  const [data, setData] = useState<DashboardData | null>(() => bdmService.getCachedDashboard());
  const [isLoading, setIsLoading] = useState<boolean>(!bdmService.getCachedDashboard());
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    const cached = bdmService.getCachedDashboard();
    if (cached && !force) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    try {
      if (!cached) {
        setIsLoading(true);
      }
      setError(null);
      const response = await bdmService.getDashboardData(force);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bdmService.getCachedDashboard()) {
      fetchData(false);
    }
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}