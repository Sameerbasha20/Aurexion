import usePortalQuery from "../../portal/hooks/usePortalQuery";
import supportService from "../services/supportService";
import type { SupportTicketItem } from "../../portal/types/portal.types";

export function useAdminTickets() {
  return usePortalQuery<SupportTicketItem[]>(["support", "admin-tickets"], () =>
    supportService.getAdminTickets()
  );
}

export default useAdminTickets;
