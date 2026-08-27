import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";
import { notifySupportDataChanged } from "./supportEvents";
import type {
  AdminTicketUpdateInput,
  AssignableUser,
  ExecutiveTicketUpdateInput,
  SupportTicketCreateInput,
  SupportTicketDetail,
  SupportTicketItem,
  SupportTicketUpdateInput,
} from "../../portal/types/portal.types";

export interface ExecutiveDashboardStats {
  totalAssigned: number;
  openAssigned: number;
  inProgress: number;
  awaitingClient: number;
  resolvedClosed: number;
  criticalPriority: number;
}

// In-Memory Cache Store for Support Desk
const supportCache = new Map<string, { data: unknown; timestamp: number }>();
const supportPromises = new Map<string, Promise<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function clearSupportCache(keyPrefix?: string) {
  if (!keyPrefix) {
    supportCache.clear();
    supportPromises.clear();
    return;
  }
  for (const key of supportCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      supportCache.delete(key);
      supportPromises.delete(key);
    }
  }
}

function getFromCache<T>(key: string): T | null {
  const cached = supportCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  supportCache.set(key, { data, timestamp: Date.now() });
}

export const supportService = {
  // Client APIs
  getMyTickets: async (forceRefresh = false): Promise<SupportTicketItem[]> => {
    const cacheKey = "my_tickets";
    if (!forceRefresh) {
      const cached = getFromCache<SupportTicketItem[]>(cacheKey);
      if (cached) return cached;
    }
    const data = await axiosClient.get<SupportTicketItem[], SupportTicketItem[]>(API_ENDPOINTS.PORTAL.MY_TICKETS);
    const result = Array.isArray(data) ? data : ((data as any)?.results || []);
    setCache(cacheKey, result);
    return result;
  },

  getMyTicketDetails: async (id: number): Promise<SupportTicketDetail> => {
    const data = await axiosClient.get<SupportTicketDetail, SupportTicketDetail>(`${API_ENDPOINTS.PORTAL.MY_TICKETS}${id}/`);
    return data;
  },

  createMyTicket: async (ticket: SupportTicketCreateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.post<SupportTicketDetail, SupportTicketDetail>(API_ENDPOINTS.PORTAL.MY_TICKETS, ticket);
    clearSupportCache();
    notifySupportDataChanged();
    return data;
  },

  updateMyTicket: async (id: number, ticket: SupportTicketUpdateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.patch<SupportTicketDetail, SupportTicketDetail>(`${API_ENDPOINTS.PORTAL.MY_TICKETS}${id}/`, ticket);
    clearSupportCache();
    notifySupportDataChanged();
    return data;
  },

  // Support Executive APIs
  getExecutiveDashboardStats: async (forceRefresh = false): Promise<ExecutiveDashboardStats> => {
    const cacheKey = "exec_stats";
    if (!forceRefresh) {
      const cached = getFromCache<ExecutiveDashboardStats>(cacheKey);
      if (cached) return cached;
    }
    const data = await axiosClient.get<ExecutiveDashboardStats, ExecutiveDashboardStats>(`${API_ENDPOINTS.PORTAL.TICKETS}stats/`);
    let result = data;
    if (data && typeof data === "object" && "data" in data && (data as { data?: ExecutiveDashboardStats }).data) {
      result = (data as { data: ExecutiveDashboardStats }).data;
    }
    setCache(cacheKey, result);
    return result;
  },

  getExecutiveTickets: async (forceRefresh = false): Promise<SupportTicketItem[]> => {
    const cacheKey = "exec_tickets";
    if (!forceRefresh) {
      const cached = getFromCache<SupportTicketItem[]>(cacheKey);
      if (cached) return cached;
    }
    const data = await axiosClient.get<SupportTicketItem[], SupportTicketItem[]>(API_ENDPOINTS.PORTAL.TICKETS);
    const result = Array.isArray(data) ? data : ((data as any)?.results || []);
    setCache(cacheKey, result);
    return result;
  },

  getExecutiveTicketDetails: async (id: number): Promise<SupportTicketDetail> => {
    const data = await axiosClient.get<SupportTicketDetail, SupportTicketDetail>(`${API_ENDPOINTS.PORTAL.TICKETS}${id}/`);
    return data;
  },

  updateExecutiveTicket: async (id: number, ticket: ExecutiveTicketUpdateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.patch<SupportTicketDetail, SupportTicketDetail>(`${API_ENDPOINTS.PORTAL.TICKETS}${id}/`, ticket);
    clearSupportCache();
    notifySupportDataChanged();
    return data;
  },

  // Admin APIs
  getAdminTickets: async (forceRefresh = false): Promise<SupportTicketItem[]> => {
    const cacheKey = "admin_tickets";
    if (!forceRefresh) {
      const cached = getFromCache<SupportTicketItem[]>(cacheKey);
      if (cached) return cached;
    }
    const data = await axiosClient.get<SupportTicketItem[], SupportTicketItem[]>(API_ENDPOINTS.PORTAL.ADMIN_TICKETS);
    const result = Array.isArray(data) ? data : ((data as any)?.results || []);
    setCache(cacheKey, result);
    return result;
  },

  getAdminTicketDetails: async (id: number): Promise<SupportTicketDetail> => {
    const data = await axiosClient.get<SupportTicketDetail, SupportTicketDetail>(`${API_ENDPOINTS.PORTAL.ADMIN_TICKETS}${id}/`);
    return data;
  },

  updateAdminTicket: async (id: number, ticket: AdminTicketUpdateInput): Promise<SupportTicketDetail> => {
    const data = await axiosClient.patch<SupportTicketDetail, SupportTicketDetail>(`${API_ENDPOINTS.PORTAL.ADMIN_TICKETS}${id}/`, ticket);
    clearSupportCache();
    notifySupportDataChanged();
    return data;
  },

  // User list for assigning tickets (support executives only)
  getUsers: async (forceRefresh = false): Promise<AssignableUser[]> => {
    const cacheKey = "assignable_support_users";
    if (!forceRefresh) {
      const cached = getFromCache<AssignableUser[]>(cacheKey);
      if (cached) return cached;
    }
    const data = await axiosClient.get<AssignableUser[], AssignableUser[]>(`${API_ENDPOINTS.ADMIN.USERS}?role=support_executive`);
    const result = Array.isArray(data) ? data : ((data as any)?.results || []);
    setCache(cacheKey, result);
    return result;
  },
};

export default supportService;
