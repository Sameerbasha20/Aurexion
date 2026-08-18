import React from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // TanStack Query QueryClient can be initialized here when npm package is added
  return <>{children}</>;
};

export default QueryProvider;
