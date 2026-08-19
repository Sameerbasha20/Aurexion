import usePortalQuery from "../../portal/hooks/usePortalQuery";
import supportService from "../services/supportService";
import type { SupportTicketItem } from "../../portal/types/portal.types";

export function useExecutiveTickets() {
  return usePortalQuery<SupportTicketItem[]>(["support", "executive-tickets"], () =>
    supportService.getExecutiveTickets()
  );
}

export default useExecutiveTickets;
