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

  getProjects: async (): Promise<any[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.PROJECTS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getRequests: async (): Promise<any[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.REQUESTS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createRequest: async (requestData: { title: string; category?: string; description?: string; priority?: string }): Promise<any> => {
    return axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.REQUESTS, requestData);
  },

  getDocuments: async (): Promise<any[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.DOCUMENTS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getAllTickets: async (): Promise<SupportTicketItem[]> => {
    return supportService.getMyTickets();
  },
};

export default portalService;