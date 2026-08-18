import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError } from "../../../api/apiErrorHandler";

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
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    queryFnRef.current()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err as ApiError);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...queryKey]);

  const refetch = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return { data, isLoading, isError: !!error, error, refetch };
}

export default usePortalQuery;