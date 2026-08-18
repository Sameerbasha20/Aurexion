import { useState } from "react";

export interface UsePaginationResult {
  page: number;
  limit: number;
  offset: number;
  totalPages: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setTotalItems: (total: number) => void;
}

export function usePagination(initialLimit = 10): UsePaginationResult {
  const [page, setPageInternal] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = initialLimit;

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const offset = (page - 1) * limit;

  const setPage = (newPage: number) => {
    const boundedPage = Math.max(1, Math.min(newPage, totalPages));
    setPageInternal(boundedPage);
  };

  const nextPage = () => setPage(page + 1);
  const prevPage = () => setPage(page - 1);

  return {
    page,
    limit,
    offset,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    setTotalItems,
  };
}

export default usePagination;
