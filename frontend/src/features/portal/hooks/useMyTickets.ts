import usePortalQuery from "./usePortalQuery";
import portalService from "../services/portalService";
import type { SupportTicketItem } from "../types/portal.types";

export function useMyTickets() {
  return usePortalQuery<SupportTicketItem[]>(["portal", "my-tickets"], () => portalService.getMyTickets());
}

export default useMyTickets;