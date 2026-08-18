import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";
import supportService from "../../support/services/supportService";
import type {
  PortalProfile,
  SupportTicketCreateInput,
  SupportTicketDetail,
  SupportTicketItem,
  SupportTicketUpdateInput,
} from "../types/portal.types";

export const portalService = {
  getProfile: async (): Promise<PortalProfile> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.AUTH.ME);
    return data as PortalProfile;
  },

  getMyTickets: async (): Promise<SupportTicketItem[]> => {
    return supportService.getMyTickets();
  },

  getTicket: async (ticketId: number): Promise<SupportTicketDetail> => {
    return supportService.getMyTicketDetails(ticketId);
  },

  createTicket: async (ticketData: SupportTicketCreateInput): Promise<SupportTicketDetail> => {
    return supportService.createMyTicket(ticketData);
  },

  updateTicket: async (ticketId: number, ticketData: SupportTicketUpdateInput): Promise<SupportTicketDetail> => {
    return supportService.updateMyTicket(ticketId, ticketData);
  },

  // Backward-compatible empty accessors retained for shared Admin dashboards.
  getProjects: async (): Promise<{ id: string; title: string; deadline: string; completion: number }[]> => {
    return [];
  },
  getDocuments: async (): Promise<{ id: string; name: string; path: string }[]> => {
    return [];
  },
  getAllTickets: async (): Promise<SupportTicketItem[]> => {
    return supportService.getMyTickets();
  },
};

export default portalService;