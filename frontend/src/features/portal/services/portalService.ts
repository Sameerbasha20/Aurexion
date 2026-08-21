import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";
import supportService from "../../support/services/supportService";
import type {
  PortalProfile,
  SupportTicketCreateInput,
  SupportTicketDetail,
  SupportTicketItem,
  SupportTicketUpdateInput,
  ClientProjectItem,
  ProjectMilestone,
  SprintDeliverable,
  ClientRequestItem,
  ConsultationRequestItem,
  ClientDocumentItem,
  ClientNotificationItem,
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

  getProjects: async (): Promise<ClientProjectItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.PROJECTS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getMilestones: async (): Promise<ProjectMilestone[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.MILESTONES);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getDeliverables: async (): Promise<SprintDeliverable[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.DELIVERABLES);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getRequests: async (): Promise<ClientRequestItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.REQUESTS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createRequest: async (requestData: { title: string; category?: string; description?: string; priority?: string; project?: number | null }): Promise<ClientRequestItem> => {
    return axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.REQUESTS, requestData);
  },

  getConsultations: async (): Promise<ConsultationRequestItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.CONSULTATIONS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createConsultation: async (consultationData: {
    request_type: "technical_review" | "status_call";
    title: string;
    description?: string;
    preferred_date?: string | null;
    project?: number | null;
  }): Promise<ConsultationRequestItem> => {
    return axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.CONSULTATIONS, consultationData);
  },

  getDocuments: async (): Promise<ClientDocumentItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.DOCUMENTS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  downloadDocument: async (documentId: number): Promise<{ id: number; title: string; file_url: string; file_size: string }> => {
    const endpoint = API_ENDPOINTS.PORTAL.DOCUMENT_DOWNLOAD(documentId);
    return axiosClient.get<any, any>(endpoint);
  },

  getNotifications: async (): Promise<ClientNotificationItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.NOTIFICATIONS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  markNotificationRead: async (id: number): Promise<any> => {
    return axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.NOTIFICATION_READ(id));
  },

  markAllNotificationsRead: async (): Promise<any> => {
    return axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.NOTIFICATION_READ_ALL);
  },

  getAllTickets: async (): Promise<SupportTicketItem[]> => {
    return supportService.getMyTickets();
  },
};

export default portalService;