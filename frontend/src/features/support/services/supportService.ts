import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";
import type {
  AdminTicketUpdateInput,
  AssignableUser,
  ExecutiveTicketUpdateInput,
  SupportTicketCreateInput,
  SupportTicketDetail,
  SupportTicketItem,
  SupportTicketUpdateInput,
} from "../../portal/types/portal.types";

export const supportService = {
  // Client APIs
  getMyTickets: async (): Promise<SupportTicketItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.MY_TICKETS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getMyTicketDetails: async (id: number): Promise<SupportTicketDetail> => {
    const data = await axiosClient.get<any, any>(`${API_ENDPOINTS.PORTAL.MY_TICKETS}${id}/`);
    return data;
  },

  createMyTicket: async (ticket: SupportTicketCreateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.MY_TICKETS, ticket);
    return data;
  },

  updateMyTicket: async (id: number, ticket: SupportTicketUpdateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.patch<any, any>(`${API_ENDPOINTS.PORTAL.MY_TICKETS}${id}/`, ticket);
    return data;
  },

  // Support Executive APIs
  getExecutiveTickets: async (): Promise<SupportTicketItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.TICKETS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getExecutiveTicketDetails: async (id: number): Promise<SupportTicketDetail> => {
    const data = await axiosClient.get<any, any>(`${API_ENDPOINTS.PORTAL.TICKETS}${id}/`);
    return data;
  },

  updateExecutiveTicket: async (id: number, ticket: ExecutiveTicketUpdateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.patch<any, any>(`${API_ENDPOINTS.PORTAL.TICKETS}${id}/`, ticket);
    return data;
  },

  // Admin APIs
  getAdminTickets: async (): Promise<SupportTicketItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.ADMIN_TICKETS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getAdminTicketDetails: async (id: number): Promise<SupportTicketDetail> => {
    const data = await axiosClient.get<any, any>(`${API_ENDPOINTS.PORTAL.ADMIN_TICKETS}${id}/`);
    return data;
  },

  updateAdminTicket: async (id: number, ticket: AdminTicketUpdateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.patch<any, any>(`${API_ENDPOINTS.PORTAL.ADMIN_TICKETS}${id}/`, ticket);
    return data;
  },

  // User list for assigning tickets
  getUsers: async (): Promise<AssignableUser[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.USERS);
    return Array.isArray(data) ? data : (data.results || []);
  },
};

export default supportService;
