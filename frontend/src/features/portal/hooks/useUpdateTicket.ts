import { useCallback, useState } from "react";
import portalService from "../services/portalService";
import type { ApiError } from "../../../api/apiErrorHandler";
import type { SupportTicketUpdateInput } from "../types/portal.types";

export interface UpdateTicketResult {
  isLoading: boolean;
  error: ApiError | null;
  update: (ticketId: number, input: SupportTicketUpdateInput) => Promise<SupportTicketUpdateInput>;
}

export function useUpdateTicket(): UpdateTicketResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const update = useCallback(async (ticketId: number, input: SupportTicketUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await portalService.updateTicket(ticketId, input);
      setIsLoading(false);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setIsLoading(false);
      throw apiError;
    }
  }, []);

  return { isLoading, error, update };
}

export default useUpdateTicket;