import axiosClient from "../../../api/axiosClient";
import { API_ENDPOINTS } from "../../../api/endpoints";

export interface DashboardData {
  total_leads: number;
  unassigned_leads: number;
  assigned_leads: number;
  new_leads: number;
  qualified_leads: number;
  active_opportunities: number;
  overdue_follow_ups: number;
  conversion_rate: number;
  won_leads: number;
  lost_leads: number;
  pipeline_summary: Array<{
    status: string;
    total: number;
    count?: number;
    value?: number;
  }>;
  team_workload: Array<{
    id: number;
    name: string;
    username: string;
    role?: string;
    active_leads_count: number;
  }>;
  recent_activities: Array<{
    id: number;
    action: string;
    repr: string;
    actor: string | null;
    timestamp: string;
  }>;
  summary?: {
    total_leads: number;
    new_inquiries: number;
    qualified_leads: number;
    proposals_in_progress: number;
    deals_won: number;
    deals_lost: number;
  };
  conversion_metrics?: {
    inquiry_to_qualified_pct: number;
    qualified_to_proposal_pct: number;
    proposal_to_won_pct: number;
    overall_win_rate_pct: number;
  };
  leads_by_source?: Record<string, number>;
  leads_by_stage?: Record<string, number>;
  sales_rep_performance?: Array<{
    assigned_to__username: string;
    total_leads: number;
    qualified_leads: number;
    deals_won: number;
  }>;
  recent_form_submissions: FormSubmission[];
  won_clients: WonClient[];
  pending_rfp_count: number;
  pending_client_onboardings?: number;
}

export interface FormSubmission {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  source_display?: string;
  industry?: string;
  status: string;
  created_at: string;
  description?: string;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
}

export interface WonClient {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  value?: number;
  description?: string;
  updated_at: string;
  client_onboarded?: boolean;
}

export interface Lead {
  id: number;
  reference_id: string;
  name: string;
  company: string;
  website?: string;
  industry?: string;
  email: string;
  phone: string;
  source: string;
  source_display: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  description: string;
  estimated_value?: string | null;
  value?: number;
  lost_reason?: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
  assigned_to_email?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  follow_up_count?: number;
  note_count?: number;
  created_at: string;
  updated_at: string;
  client_onboarded?: boolean;
  rfp_enquiry_details?: any;
  designation?: string;
  country?: string;
  project_type?: string;
  budget_range?: string;
  nda_required?: boolean;
  document_attachment?: string | null;
}

export interface LeadsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lead[];
}

export interface LeadFollowUp {
  id: number;
  lead: number;
  assigned_to: number | null;
  assigned_to_name: string | null;
  created_by: number | null;
  created_by_name: string | null;
  follow_up_type: string;
  follow_up_type_display: string;
  scheduled_at: string;
  status: string;
  status_display: string;
  notes: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Global In-Memory Caches for BDM Service
let cachedDashboard: DashboardData | null = null;
let dashboardPromise: Promise<DashboardData> | null = null;

const leadsCache = new Map<string, LeadsResponse>();
const leadsPromises = new Map<string, Promise<LeadsResponse>>();

let cachedAssignableUsers: { id: number; username: string; email: string; name: string; role: string; active_leads_count?: number }[] | null = null;
let assignableUsersPromise: Promise<{ id: number; username: string; email: string; name: string; role: string; active_leads_count?: number }[]> | null = null;

/**
 * Clear all in-memory caches across BDM
 */
export function clearBdmCache() {
  cachedDashboard = null;
  dashboardPromise = null;
  leadsCache.clear();
  leadsPromises.clear();
  cachedAssignableUsers = null;
  assignableUsersPromise = null;
}

export const bdmService = {
  getCachedDashboard: (): DashboardData | null => cachedDashboard,
  getCachedLeads: (params?: { page?: number; page_size?: number; status?: string; search?: string; source?: string }): LeadsResponse | null => {
    const key = JSON.stringify({
      page: params?.page || 1,
      page_size: params?.page_size || 10,
      status: params?.status || "",
      search: params?.search || "",
      source: params?.source || "",
    });
    return leadsCache.get(key) || null;
  },
  getCachedAssignableUsers: () => cachedAssignableUsers,
  clearCache: clearBdmCache,

  getDashboardData: async (force = false): Promise<DashboardData> => {
    if (cachedDashboard && !force) {
      return cachedDashboard;
    }
    if (!dashboardPromise || force) {
      dashboardPromise = axiosClient.get<any, DashboardData>(API_ENDPOINTS.BDM.DASHBOARD).then((res: DashboardData) => {
        cachedDashboard = res;
        return res;
      }).finally(() => {
        dashboardPromise = null;
      });
    }
    return (dashboardPromise || cachedDashboard)!;
  },

  getLeads: async (params?: { page?: number; page_size?: number; status?: string; search?: string; source?: string }, force = false): Promise<LeadsResponse> => {
    const key = JSON.stringify({
      page: params?.page || 1,
      page_size: params?.page_size || 10,
      status: params?.status || "",
      search: params?.search || "",
      source: params?.source || "",
    });

    if (leadsCache.has(key) && !force) {
      return leadsCache.get(key)!;
    }

    if (!leadsPromises.has(key) || force) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.source) queryParams.append("source", params.source);
      const url = `${API_ENDPOINTS.CRM.LEADS}?${queryParams.toString()}`;

      const promise = axiosClient.get<any, LeadsResponse>(url).then((res: LeadsResponse) => {
        leadsCache.set(key, res);
        return res;
      }).finally(() => {
        leadsPromises.delete(key);
      });
      leadsPromises.set(key, promise);
    }
    return leadsPromises.get(key)!;
  },

  getLead: async (id: number): Promise<Lead> => {
    return axiosClient.get<any, any>(`${API_ENDPOINTS.CRM.LEADS}${id}/`);
  },

  getLeadFollowUps: async (leadId: number): Promise<LeadFollowUp[]> => {
    return axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEAD_FOLLOW_UPS(leadId));
  },

  /**
   * Assign lead to a sales executive (Accept RFP) - invalidates caches
   */
  assignLead: async (leadId: number, assignedTo: number): Promise<Lead> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_ASSIGN(leadId), { assigned_to: assignedTo });
    clearBdmCache();
    return data;
  },

  /**
   * Mark lead as Lost (Decline RFP) - invalidates caches
   */
  markLeadLost: async (leadId: number, reason: string): Promise<Lead> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_LOST(leadId), { reason });
    clearBdmCache();
    return data;
  },

  /**
   * Get assignable sales executives with active workload counts (cached)
   */
  getAssignableUsers: async (force = false): Promise<{ id: number; username: string; email: string; name: string; role: string; active_leads_count?: number }[]> => {
    if (cachedAssignableUsers && cachedAssignableUsers.length > 0 && !force) {
      return cachedAssignableUsers;
    }
    if (!assignableUsersPromise || force) {
      assignableUsersPromise = (async () => {
        try {
          const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.USERS, { params: { role: 'sales_executive' } });
          const list = Array.isArray(data) ? data : (data.results || data.data?.results || data.data || []);
          const result = list
            .filter((u: any) => {
              const r = String(u.profile?.role || u.role || '').toLowerCase();
              return r === 'sales_executive' || r === 'sales' || r === 'sales_rep';
            })
            .map((u: any) => ({
              id: u.id,
              username: u.username,
              email: u.email,
              name: u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : u.username,
              role: u.profile?.role || u.role || 'sales_executive',
              active_leads_count: u.active_leads_count ?? 0,
            }));
          if (result.length > 0) {
            cachedAssignableUsers = result;
          }
          return result;
        } catch {
          return [];
        } finally {
          assignableUsersPromise = null;
        }
      })();
    }
    return assignableUsersPromise;
  },

  // Mock data for features not yet implemented in backend
  getOpportunities: async () => {
    return [
      { id: "opp_1", title: "Enterprise AI Orchestration Platform", lead: "Zeta Prime Corp" },
    ];
  },
  getRfpList: async () => {
    return [
      { id: "rfp_101", title: "Government Security Core proposal", dueDate: "Sep 01" },
    ];
  },
  getEstimates: async () => {
    return [
      { id: "est_101", project: "Ion Cloud Migration Plan", estimate: 540000 },
    ];
  },
};

export default bdmService;