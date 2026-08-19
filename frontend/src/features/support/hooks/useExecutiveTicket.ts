import usePortalQuery from "../../portal/hooks/usePortalQuery";
import supportService from "../services/supportService";
import type { SupportTicketDetail } from "../../portal/types/portal.types";

export function useExecutiveTicket(ticketId: string) {
  const id = Number(ticketId);
  const enabled = Number.isInteger(id) && id > 0;
  return usePortalQuery<SupportTicketDetail>(["support", "executive-ticket", ticketId], () =>
    enabled ? supportService.getExecutiveTicketDetails(id) : Promise.reject({ message: "Invalid ticket ID." })
  );
}

export default useExecutiveTicket;
