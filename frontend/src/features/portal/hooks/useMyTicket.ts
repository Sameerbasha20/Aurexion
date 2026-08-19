import usePortalQuery from "./usePortalQuery";
import portalService from "../services/portalService";
import type { SupportTicketDetail } from "../types/portal.types";

export function useMyTicket(ticketId: string) {
  const id = Number(ticketId);
  const enabled = Number.isInteger(id) && id > 0;
  return usePortalQuery<SupportTicketDetail>(["portal", "ticket", ticketId], () =>
    enabled ? portalService.getTicket(id) : Promise.reject({ message: "Invalid ticket reference." })
  );
}

export default useMyTicket;