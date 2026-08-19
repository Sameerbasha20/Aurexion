import { useCallback, useState } from "react";
import supportService from "../services/supportService";
import type { ApiError } from "../../../api/apiErrorHandler";
import type { AdminTicketUpdateInput, SupportTicketDetail } from "../../portal/types/portal.types";

export interface UpdateAdminTicketResult {
  isLoading: boolean;
  error: ApiError | null;
  update: (ticketId: number, input: AdminTicketUpdateInput) => Promise<SupportTicketDetail>;
}

export function useUpdateAdminTicket(): UpdateAdminTicketResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const update = useCallback(async (ticketId: number, input: AdminTicketUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await supportService.updateAdminTicket(ticketId, input);
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

export default useUpdateAdminTicket;
