import { useCallback, useState } from "react";
import portalService from "../services/portalService";
import type { ApiError } from "../../../api/apiErrorHandler";
import type { SupportTicketCreateInput } from "../types/portal.types";

export interface CreateTicketResult {
  isLoading: boolean;
  error: ApiError | null;
  create: (input: SupportTicketCreateInput) => Promise<SupportTicketCreateInput>;
}

export function useCreateTicket(): CreateTicketResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const create = useCallback(async (input: SupportTicketCreateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await portalService.createTicket(input);
      setIsLoading(false);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setIsLoading(false);
      throw apiError;
    }
  }, []);

  return { isLoading, error, create };
}

export default useCreateTicket;