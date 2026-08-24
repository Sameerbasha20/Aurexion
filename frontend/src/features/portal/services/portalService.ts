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

// In-Memory Cache Store & Promise Deduplication for Client Portal
const portalCache = new Map<string, { data: any; timestamp: number }>();
const portalPromises = new Map<string, Promise<any>>();
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

function setCache(key: string, data: any) {
  portalCache.set(key, { data, timestamp: Date.now() });
}

export const portalService = {
  getProfile: async (forceRefresh = false): Promise<PortalProfile> => {
    const cacheKey = "profile";
    if (!forceRefresh) {
      const cached = getFromCache<PortalProfile>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.AUTH.ME);
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
      const cached = getFromCache<ClientProjectItem[]>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.PROJECTS);
        const result = Array.isArray(data) ? data : (data.results || []);
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
      const cached = getFromCache<ProjectMilestone[]>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.MILESTONES);
        const result = Array.isArray(data) ? data : (data.results || []);
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
      const cached = getFromCache<SprintDeliverable[]>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.DELIVERABLES);
        const result = Array.isArray(data) ? data : (data.results || []);
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
      const cached = getFromCache<ClientRequestItem[]>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.REQUESTS);
        const result = Array.isArray(data) ? data : (data.results || []);
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
    const res = await axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.REQUESTS, requestData);
    clearPortalCache("requests");
    return res;
  },

  getConsultations: async (forceRefresh = false): Promise<ConsultationRequestItem[]> => {
    const cacheKey = "consultations";
    if (!forceRefresh) {
      const cached = getFromCache<ConsultationRequestItem[]>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.CONSULTATIONS);
        const result = Array.isArray(data) ? data : (data.results || []);
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
    const res = await axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.CONSULTATIONS, consultationData);
    clearPortalCache("consultations");
    return res;
  },

  getDocuments: async (forceRefresh = false): Promise<ClientDocumentItem[]> => {
    const cacheKey = "documents";
    if (!forceRefresh) {
      const cached = getFromCache<ClientDocumentItem[]>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.DOCUMENTS);
        const result = Array.isArray(data) ? data : (data.results || []);
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
    return axiosClient.get<any, any>(endpoint);
  },

  getNotifications: async (forceRefresh = false): Promise<ClientNotificationItem[]> => {
    const cacheKey = "notifications";
    if (!forceRefresh) {
      const cached = getFromCache<ClientNotificationItem[]>(cacheKey);
      if (cached) return cached;
      if (portalPromises.has(cacheKey)) return portalPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.PORTAL.NOTIFICATIONS);
        const result = Array.isArray(data) ? data : (data.results || []);
        setCache(cacheKey, result);
        return result;
      } finally {
        portalPromises.delete(cacheKey);
      }
    })();

    portalPromises.set(cacheKey, promise);
    return promise;
  },

  markNotificationRead: async (id: number): Promise<any> => {
    const res = await axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.NOTIFICATION_READ(id));
    clearPortalCache("notifications");
    return res;
  },

  markAllNotificationsRead: async (): Promise<any> => {
    const res = await axiosClient.post<any, any>(API_ENDPOINTS.PORTAL.NOTIFICATION_READ_ALL);
    clearPortalCache("notifications");
    return res;
  },

  getAllTickets: async (): Promise<SupportTicketItem[]> => {
    return supportService.getMyTickets();
  },
};

export default portalService;