import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "../../api/apiErrorHandler";

interface QueryProviderProps {
  children: React.ReactNode;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount: number, error: unknown) => {
        const err = error as ApiError;
        if (err?.statusCode === 401 || err?.statusCode === 403 || err?.statusCode === 404) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [client] = useState(() => queryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryProvider;
