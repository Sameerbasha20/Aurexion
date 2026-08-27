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

// ── DTO Interfaces ────────────────────────────────────────────────────────────
export interface ClientProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile?: {
    role: string;
    avatar?: string;
    company?: string;
  };
}

export interface ProjectItem {
  id: number;
  name: string;
  description?: string;
  status: string;
  progress?: number;
  start_date?: string;
  end_date?: string;
  lead_id?: number;
  created_at?: string;
}

export interface MilestoneItem {
  id: number;
  project: number;
  title: string;
  due_date: string;
  status: string;
  description?: string;
}

export interface DeliverableItem {
  id: number;
  milestone?: number;
  title: string;
  file_url?: string;
  status: string;
  created_at?: string;
}

export interface RequestItem {
  id: number;
  subject: string;
  description: string;
  status: string;
  category?: string;
  created_at: string;
  updated_at?: string;
}

export interface ConsultationItem {
  id: number;
  title: string;
  scheduled_at: string;
  status: string;
  notes?: string;
  meeting_link?: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  file_url: string;
  category?: string;
  uploaded_at: string;
}

export interface PortalNotification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
  link?: string;
}

export interface NotificationActionResponse {
  success: boolean;
  message?: string;
}
// ─────────────────────────────────────────────────────────────────────────────

// In-Memory Cache Store & Promise Deduplication for Client Portal
const portalCache = new Map<string, { data: unknown; timestamp: number }>();
const portalPromises = new Map<string, Promise<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function clearPortalCache(keyPrefix?: string) {
  if (!keyPrefix) {
    portalCache.clear();
    portalPromises.clear();
    return;
  }
  for (const key of portalCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      portalCache.delete(key);
      portalPromises.delete(key);
    }
  }
}

function getFromCache<T>(key: string): T | null {
  const cached = portalCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  portalCache.set(key, { data, timestamp: Date.now() });
}

export const portalService = {
  getProfile: async (forceRefresh = false): Promise<PortalProfile> => {
    const cacheKey = "profile";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<ClientProfile, ClientProfile>(API_ENDPOINTS.AUTH.ME);
        const result = data as PortalProfile;
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
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

  getProjects: async (forceRefresh = false): Promise<ClientProjectItem[]> => {
    const cacheKey = "projects";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<ClientProjectItem[], ClientProjectItem[]>(API_ENDPOINTS.PORTAL.PROJECTS);
        const result: any = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  getMilestones: async (forceRefresh = false): Promise<ProjectMilestone[]> => {
    const cacheKey = "milestones";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<ProjectMilestone[], ProjectMilestone[]>(API_ENDPOINTS.PORTAL.MILESTONES);
        const result: any = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  getDeliverables: async (forceRefresh = false): Promise<SprintDeliverable[]> => {
    const cacheKey = "deliverables";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<SprintDeliverable[], SprintDeliverable[]>(API_ENDPOINTS.PORTAL.DELIVERABLES);
        const result: any = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  getRequests: async (forceRefresh = false): Promise<ClientRequestItem[]> => {
    const cacheKey = "requests";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<ClientRequestItem[], ClientRequestItem[]>(API_ENDPOINTS.PORTAL.REQUESTS);
        const result: any = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  createRequest: async (requestData: { title: string; category?: string; description?: string; priority?: string; project?: number | null }): Promise<ClientRequestItem> => {
    const res = await axiosClient.post<ClientRequestItem, ClientRequestItem>(API_ENDPOINTS.PORTAL.REQUESTS, requestData);
    clearPortalCache("requests");
    return res;
  },

  getConsultations: async (forceRefresh = false): Promise<ConsultationRequestItem[]> => {
    const cacheKey = "consultations";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<ConsultationRequestItem[], ConsultationRequestItem[]>(API_ENDPOINTS.PORTAL.CONSULTATIONS);
        const result: any = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  createConsultation: async (consultationData: {
    request_type: "technical_review" | "status_call";
    title: string;
    description?: string;
    preferred_date?: string | null;
    project?: number | null;
  }): Promise<ConsultationRequestItem> => {
    const res = await axiosClient.post<ConsultationRequestItem, ConsultationRequestItem>(API_ENDPOINTS.PORTAL.CONSULTATIONS, consultationData);
    clearPortalCache("consultations");
    return res;
  },

  getDocuments: async (forceRefresh = false): Promise<ClientDocumentItem[]> => {
    const cacheKey = "documents";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<ClientDocumentItem[], ClientDocumentItem[]>(API_ENDPOINTS.PORTAL.DOCUMENTS);
        const result: any = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  downloadDocument: async (documentId: number): Promise<{ id: number; title: string; file_url: string; file_size: string }> => {
    const endpoint = API_ENDPOINTS.PORTAL.DOCUMENT_DOWNLOAD(documentId);
    return axiosClient.get(endpoint);
  },

  getNotifications: async (forceRefresh = false): Promise<ClientNotificationItem[]> => {
    const cacheKey = "notifications";
    if (!forceRefresh) {
      const cached = getFromCache<any>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)! as any;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<ClientNotificationItem[], ClientNotificationItem[]>(API_ENDPOINTS.PORTAL.NOTIFICATIONS);
        const result: any = Array.isArray(data) ? data : ((data as any)?.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  markNotificationRead: async (id: number): Promise<NotificationActionResponse> => {
    const res = await axiosClient.post<NotificationActionResponse, NotificationActionResponse>(API_ENDPOINTS.PORTAL.NOTIFICATION_READ(id));
    clearPortalCache("notifications");
    return res;
  },

  markAllNotificationsRead: async (): Promise<NotificationActionResponse> => {
    const res = await axiosClient.post<NotificationActionResponse, NotificationActionResponse>(API_ENDPOINTS.PORTAL.NOTIFICATION_READ_ALL);
    clearPortalCache("notifications");
    return res;
  },

  getAllTickets: async (): Promise<SupportTicketItem[]> => {
    return supportService.getMyTickets();
  },
};

export default portalService;
