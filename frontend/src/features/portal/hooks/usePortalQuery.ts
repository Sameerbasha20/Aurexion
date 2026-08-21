import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ApiError } from "../../../api/apiErrorHandler";
import { subscribeSupportDataChanged } from "../../support/services/supportEvents";

export interface PortalQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function usePortalQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>
): PortalQueryResult<T> {
  const queryClient = useQueryClient();

  const query = useQuery<T, ApiError>({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in memory for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    const isSupportQuery = queryKey.some(
      (k) => typeof k === "string" && (k === "support" || k.includes("ticket"))
    );
    if (isSupportQuery) {
      const unsubscribe = subscribeSupportDataChanged(() => {
        queryClient.invalidateQueries({ queryKey });
      });
      return unsubscribe;
    }
  }, [queryKey, queryClient]);

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}

export default usePortalQuery;