import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";

export interface LeadItem {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  industry: string;
  source: string;
  description: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  lost_reason?: string;
  assigned_to?: number | null;
  assigned_to_name: string | null;
  created_by?: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  value?: number;
  estimated_value?: number;
}

export interface LeadFollowUp {
  id: number;
  lead: number;
  lead_name?: string;
  lead_company?: string;
  assigned_to: number | null;
  assigned_to_name: string;
  created_by: number | null;
  created_by_name: string;
  follow_up_type: string; // CALL, MEETING, EMAIL, DEMO, OTHER
  follow_up_type_display: string;
  scheduled_at: string;
  status: string; // PENDING, COMPLETED, CANCELLED, OVERDUE
  status_display: string;
  notes: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: number;
  lead?: number;
  lead_name?: string;
  lead_company?: string;
  content: string;
  created_by: number | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface LeadQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  assigned_to?: number | string;
  is_opportunity?: boolean | string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface PaginatedLeads {
  count: number;
  next: string | null;
  previous: string | null;
  results: LeadItem[];
}

export interface SalesDashboardStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  under_review_leads: number;
  qualified_leads: number;
  active_opportunities: number;
  pending_follow_ups: number;
  overdue_follow_ups: number;
  today_follow_ups: number;
  won_leads: number;
  lost_leads: number;
  win_rate: number;
  pipeline_summary: Array<{
    status: string;
    label: string;
    count: number;
    color: string;
  }>;
  recent_activities: ActivityItem[];
  urgent_follow_ups: LeadFollowUp[];
}

export interface ActivityItem {
  id: string | number;
  action: string;
  type: "CALL" | "MEETING" | "EMAIL" | "NOTE" | "STATUS_CHANGE" | "QUALIFIED" | "WON" | "LOST" | "FOLLOW_UP" | "CREATED";
  title: string;
  description: string;
  lead_id?: number;
  lead_name?: string;
  lead_company?: string;
  actor: string;
  timestamp: string;
}

export interface OpportunityItem {
  id: number;
  lead_id: number;
  title: string;
  company: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  stage: string; // QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST
  stage_display: string;
  value: number;
  probability: number;
  expected_close_date?: string;
  assigned_to_name: string;
  created_at: string;
  updated_at: string;
}

export interface ContactItem {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry?: string;
  source?: string;
  lead_id: number;
  lead_status: string;
  lead_priority: string;
  created_at: string;
}

export interface CompanyItem {
  id: string | number;
  name: string;
  industry: string;
  website: string;
  total_leads: number;
  primary_contact: string;
  email: string;
  phone: string;
  status: string;
  latest_lead_date: string;
}

export interface UserOption {
  id: number;
  username: string;
  email: string;
  name?: string;
  role?: string;
}

// ==========================================
// In-Memory Caches & In-Flight Promises for CRM
// ==========================================
const leadsCache = new Map<string, LeadItem[]>();
const leadsPromises = new Map<string, Promise<LeadItem[]>>();

const paginatedLeadsCache = new Map<string, PaginatedLeads>();
const paginatedLeadsPromises = new Map<string, Promise<PaginatedLeads>>();

const leadDetailCache = new Map<number, LeadItem>();
const leadDetailPromises = new Map<number, Promise<LeadItem>>();

const followUpsCache = new Map<number, LeadFollowUp[]>();
const followUpsPromises = new Map<number, Promise<LeadFollowUp[]>>();

const notesCache = new Map<number, LeadNote[]>();
const notesPromises = new Map<number, Promise<LeadNote[]>>();

let allFollowUpsCache: LeadFollowUp[] | null = null;
let allFollowUpsPromise: Promise<LeadFollowUp[]> | null = null;

let activitiesCache: ActivityItem[] | null = null;
let activitiesPromise: Promise<ActivityItem[]> | null = null;

let opportunitiesCache: OpportunityItem[] | null = null;
let opportunitiesPromise: Promise<OpportunityItem[]> | null = null;

let contactsCache: ContactItem[] | null = null;
let contactsPromise: Promise<ContactItem[]> | null = null;

let companiesCache: CompanyItem[] | null = null;
let companiesPromise: Promise<CompanyItem[]> | null = null;

let assignableUsersCache: UserOption[] | null = null;
let assignableUsersPromise: Promise<UserOption[]> | null = null;

let dashboardStatsCache: SalesDashboardStats | null = null;
let dashboardStatsPromise: Promise<SalesDashboardStats> | null = null;

/**
 * Clear all in-memory caches across CRM
 */
export function clearCrmCache() {
  leadsCache.clear();
  leadsPromises.clear();

  paginatedLeadsCache.clear();
  paginatedLeadsPromises.clear();

  leadDetailCache.clear();
  leadDetailPromises.clear();

  followUpsCache.clear();
  followUpsPromises.clear();

  notesCache.clear();
  notesPromises.clear();

  allFollowUpsCache = null;
  allFollowUpsPromise = null;

  activitiesCache = null;
  activitiesPromise = null;

  opportunitiesCache = null;
  opportunitiesPromise = null;

  contactsCache = null;
  contactsPromise = null;

  companiesCache = null;
  companiesPromise = null;

  assignableUsersCache = null;
  assignableUsersPromise = null;

  dashboardStatsCache = null;
  dashboardStatsPromise = null;
}

export const crmService = {
  clearCache: clearCrmCache,

  /**
   * Fetch leads with optional query parameters (cached in memory)
   */
  getLeads: async (params?: LeadQueryParams, force = false): Promise<LeadItem[]> => {
    const queryParams = { page_size: 500, ...params };
    const cacheKey = JSON.stringify(queryParams);

    if (!force && leadsCache.has(cacheKey)) {
      return leadsCache.get(cacheKey)!;
    }

    if (!force && leadsPromises.has(cacheKey)) {
      return leadsPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const response = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEADS, { params: queryParams });
        let result: LeadItem[] = [];
        if (Array.isArray(response)) {
          result = response;
        } else if (response?.data && Array.isArray(response.data)) {
          result = response.data;
        } else if (response?.data && Array.isArray(response.data.results)) {
          result = response.data.results;
        } else if (response && Array.isArray(response.results)) {
          result = response.results;
        }
        leadsCache.set(cacheKey, result);
        return result;
      } finally {
        leadsPromises.delete(cacheKey);
      }
    })();

    leadsPromises.set(cacheKey, promise);
    return promise;
  },

  /**
   * Fetch paginated leads response (cached in memory)
   */
  getPaginatedLeads: async (params?: LeadQueryParams, force = false): Promise<PaginatedLeads> => {
    const cacheKey = JSON.stringify(params || {});

    if (!force && paginatedLeadsCache.has(cacheKey)) {
      return paginatedLeadsCache.get(cacheKey)!;
    }

    if (!force && paginatedLeadsPromises.has(cacheKey)) {
      return paginatedLeadsPromises.get(cacheKey)!;
    }

    const promise = (async () => {
      try {
        const response = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEADS, { params });
        if (Array.isArray(response)) {
          const res: PaginatedLeads = {
            count: response.length,
            next: null,
            previous: null,
            results: response,
          };
          paginatedLeadsCache.set(cacheKey, res);
          return res;
        }
        const results = response?.data?.results || response?.data || response?.results || [];
        const count = response?.data?.count || response?.count || (Array.isArray(results) ? results.length : 0);
        const res: PaginatedLeads = {
          count,
          next: response?.data?.next || response?.next || null,
          previous: response?.data?.previous || response?.previous || null,
          results: Array.isArray(results) ? results : [],
        };
        paginatedLeadsCache.set(cacheKey, res);
        return res;
      } finally {
        paginatedLeadsPromises.delete(cacheKey);
      }
    })();

    paginatedLeadsPromises.set(cacheKey, promise);
    return promise;
  },

  /**
   * Fetch a single lead by ID (cached in memory)
   */
  getLead: async (leadId: number, force = false): Promise<LeadItem> => {
    if (!force && leadDetailCache.has(leadId)) {
      return leadDetailCache.get(leadId)!;
    }

    if (!force && leadDetailPromises.has(leadId)) {
      return leadDetailPromises.get(leadId)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(`${API_ENDPOINTS.CRM.LEADS}${leadId}/`);
        leadDetailCache.set(leadId, data);
        return data;
      } finally {
        leadDetailPromises.delete(leadId);
      }
    })();

    leadDetailPromises.set(leadId, promise);
    return promise;
  },

  /**
   * Create a new lead
   */
  createLead: async (leadData: Partial<LeadItem>): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEADS, leadData);
    clearCrmCache();
    return data;
  },

  /**
   * Update lead info
   */
  updateLead: async (leadId: number, leadData: Partial<LeadItem>): Promise<LeadItem> => {
    const data = await axiosClient.patch<any, any>(`${API_ENDPOINTS.CRM.LEADS}${leadId}/`, leadData);
    clearCrmCache();
    return data;
  },

  /**
   * Assign lead to an executive
   */
  assignLead: async (leadId: number, assignedTo: number): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_ASSIGN(leadId), { assigned_to: assignedTo });
    clearCrmCache();
    return data;
  },

  /**
   * Status transition for lead
   */
  transitionLead: async (leadId: number, status: string): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_TRANSITION(leadId), { status });
    clearCrmCache();
    return data;
  },

  /**
   * Qualify a lead
   */
  qualifyLead: async (leadId: number): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_QUALIFY(leadId), {});
    clearCrmCache();
    return data;
  },

  /**
   * Mark lead as Won with optional project cost value and notes
   */
  markLeadWon: async (leadId: number, payload?: { value?: number; notes?: string }): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_WON(leadId), payload || {});
    clearCrmCache();
    return data;
  },

  /**
   * Mark lead as Lost with mandatory reason
   */
  markLeadLost: async (leadId: number, reason: string): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_LOST(leadId), { reason });
    clearCrmCache();
    return data;
  },

  /**
   * Re-open a declined/lost lead back into the active pipeline
   */
  reopenLead: async (leadId: number): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(`${API_ENDPOINTS.CRM.LEADS}${leadId}/reopen/`, {});
    clearCrmCache();
    return data;
  },

  /**
   * BDM Action: Onboard won lead as client and dispatch welcome email with credentials
   */
  onboardClient: async (leadId: number, password?: string): Promise<{ message: string; lead: LeadItem; user_id: number; username: string }> => {
    const data = await axiosClient.post<any, any>(`${API_ENDPOINTS.CRM.LEADS}${leadId}/onboard-client/`, { password });
    clearCrmCache();
    return data;
  },

  /**
   * Schedule a meeting with client and send automated email notification
   */
  scheduleMeeting: async (
    leadId: number,
    payload: { scheduled_at: string; follow_up_type?: string; meeting_link?: string; notes?: string }
  ): Promise<any> => {
    const data = await axiosClient.post<any, any>(`/leads/${leadId}/schedule-meeting/`, payload);
    clearCrmCache();
    return data;
  },

  /**
   * Fetch follow-ups for a specific lead (cached in memory)
   */
  getFollowUps: async (leadId: number, force = false): Promise<LeadFollowUp[]> => {
    if (!force && followUpsCache.has(leadId)) {
      return followUpsCache.get(leadId)!;
    }

    if (!force && followUpsPromises.has(leadId)) {
      return followUpsPromises.get(leadId)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEAD_FOLLOW_UPS(leadId));
        const res = Array.isArray(data) ? data : (data.results || []);
        followUpsCache.set(leadId, res);
        return res;
      } finally {
        followUpsPromises.delete(leadId);
      }
    })();

    followUpsPromises.set(leadId, promise);
    return promise;
  },

  /**
   * Schedule a new follow-up for a lead
   */
  createFollowUp: async (leadId: number, followUpData: Partial<LeadFollowUp>): Promise<LeadFollowUp> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_FOLLOW_UPS(leadId), followUpData);
    followUpsCache.delete(leadId);
    allFollowUpsCache = null;
    dashboardStatsCache = null;
    activitiesCache = null;
    return data;
  },

  /**
   * Complete a follow-up
   */
  completeFollowUp: async (leadId: number, followUpId: number): Promise<LeadFollowUp> => {
    const data = await axiosClient.post<any, any>(`${API_ENDPOINTS.CRM.LEAD_FOLLOW_UPS(leadId)}${followUpId}/complete/`, {});
    followUpsCache.delete(leadId);
    allFollowUpsCache = null;
    dashboardStatsCache = null;
    activitiesCache = null;
    return data;
  },

  /**
   * Fetch notes for a specific lead (cached in memory)
   */
  getNotes: async (leadId: number, force = false): Promise<LeadNote[]> => {
    if (!force && notesCache.has(leadId)) {
      return notesCache.get(leadId)!;
    }

    if (!force && notesPromises.has(leadId)) {
      return notesPromises.get(leadId)!;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEAD_NOTES(leadId));
        const res = Array.isArray(data) ? data : (data.results || []);
        notesCache.set(leadId, res);
        return res;
      } finally {
        notesPromises.delete(leadId);
      }
    })();

    notesPromises.set(leadId, promise);
    return promise;
  },

  /**
   * Add a new note to a lead
   */
  createNote: async (leadId: number, content: string): Promise<LeadNote> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_NOTES(leadId), { content });
    notesCache.delete(leadId);
    activitiesCache = null;
    return data;
  },

  /**
   * Export all leads to CSV/Blob
   */
  exportLeads: async (): Promise<Blob> => {
    const response = await axiosClient.get(API_ENDPOINTS.CRM.LEAD_EXPORT, {
      responseType: "blob",
    });
    return response as unknown as Blob;
  },

  /**
   * Fetch available users (sales executives / admins) for assignment (cached in memory)
   */
  getAssignableUsers: async (force = false): Promise<UserOption[]> => {
    if (!force && assignableUsersCache) {
      return assignableUsersCache;
    }

    if (!force && assignableUsersPromise) {
      return assignableUsersPromise;
    }

    const promise = (async () => {
      try {
        const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.USERS);
        const list = Array.isArray(data) ? data : (data.results || []);
        const res = list.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : u.username,
          role: u.profile?.role || u.role,
        }));
        assignableUsersCache = res;
        return res;
      } catch {
        return [];
      } finally {
        assignableUsersPromise = null;
      }
    })();

    assignableUsersPromise = promise;
    return promise;
  },

  /**
   * Aggregate all follow-ups across leads (cached in memory)
   */
  getAllFollowUps: async (leads?: LeadItem[], force = false): Promise<LeadFollowUp[]> => {
    if (!force && allFollowUpsCache) {
      return allFollowUpsCache;
    }

    if (!force && allFollowUpsPromise) {
      return allFollowUpsPromise;
    }

    const promise = (async () => {
      try {
        const leadList = leads || await crmService.getLeads(undefined, force);
        const followUpsPromisesList = leadList.slice(0, 5).map(async (lead) => {
          try {
            const items = await crmService.getFollowUps(lead.id, force);
            return items.map((f) => ({
              ...f,
              lead_name: lead.name,
              lead_company: lead.company,
            }));
          } catch {
            return [];
          }
        });

        const results = await Promise.all(followUpsPromisesList);
        const sorted = results.flat().sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
        allFollowUpsCache = sorted;
        return sorted;
      } finally {
        allFollowUpsPromise = null;
      }
    })();

    allFollowUpsPromise = promise;
    return promise;
  },

  /**
   * Aggregate activities (cached in memory)
   */
  getRecentActivities: async (leads?: LeadItem[], force = false): Promise<ActivityItem[]> => {
    if (!force && activitiesCache) {
      return activitiesCache;
    }

    if (!force && activitiesPromise) {
      return activitiesPromise;
    }

    const promise = (async () => {
      try {
        const leadList = leads || await crmService.getLeads(undefined, force);
        const activities: ActivityItem[] = [];

        // Add lead creation activities
        leadList.forEach((lead) => {
          activities.push({
            id: `lead-create-${lead.id}`,
            type: "CREATED",
            action: "New Lead Created",
            title: `Lead established for ${lead.company || lead.name}`,
            description: `Source: ${lead.source || "Direct"} | Priority: ${lead.priority_display || lead.priority}`,
            lead_id: lead.id,
            lead_name: lead.name,
            lead_company: lead.company,
            actor: lead.created_by_name || "Sales Executive",
            timestamp: lead.created_at,
          });

          if (lead.status === "QUALIFIED" || lead.status === "WON" || lead.status === "LOST") {
            activities.push({
              id: `lead-status-${lead.id}`,
              type: lead.status === "WON" ? "WON" : lead.status === "LOST" ? "LOST" : "QUALIFIED",
              action: `Lead ${lead.status_display || lead.status}`,
              title: `${lead.company || lead.name} moved to ${lead.status_display || lead.status}`,
              description: lead.lost_reason ? `Reason: ${lead.lost_reason}` : `Assigned: ${lead.assigned_to_name || "Unassigned"}`,
              lead_id: lead.id,
              lead_name: lead.name,
              lead_company: lead.company,
              actor: lead.assigned_to_name || "System",
              timestamp: lead.updated_at || lead.created_at,
            });
          }
        });

        // Fetch notes & follow-ups for top 3 leads to build rich activity feed
        const detailPromises = leadList.slice(0, 3).map(async (lead) => {
          try {
            const [notes, followUps] = await Promise.all([
              crmService.getNotes(lead.id, force),
              crmService.getFollowUps(lead.id, force),
            ]);

            notes.forEach((n) => {
              activities.push({
                id: `note-${n.id}`,
                type: "NOTE",
                action: "Lead Note Added",
                title: `Note recorded on ${lead.company || lead.name}`,
                description: n.content,
                lead_id: lead.id,
                lead_name: lead.name,
                lead_company: lead.company,
                actor: n.created_by_name || "Sales Executive",
                timestamp: n.created_at,
              });
            });

            followUps.forEach((f) => {
              activities.push({
                id: `fu-${f.id}`,
                type: f.status === "COMPLETED" ? "FOLLOW_UP" : (f.follow_up_type === "CALL" ? "CALL" : f.follow_up_type === "MEETING" ? "MEETING" : "EMAIL"),
                action: f.status === "COMPLETED" ? "Follow-up Completed" : `Scheduled ${f.follow_up_type_display || f.follow_up_type}`,
                title: `${f.follow_up_type_display || f.follow_up_type} with ${lead.name} (${lead.company})`,
                description: f.notes || `Status: ${f.status_display || f.status}`,
                lead_id: lead.id,
                lead_name: lead.name,
                lead_company: lead.company,
                actor: f.assigned_to_name || "Sales Executive",
                timestamp: f.completed_at || f.created_at || f.scheduled_at,
              });
            });
          } catch {
            // Continue if single lead sub-fetch fails
          }
        });

        await Promise.all(detailPromises);

        const sorted = activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        activitiesCache = sorted;
        return sorted;
      } finally {
        activitiesPromise = null;
      }
    })();

    activitiesPromise = promise;
    return promise;
  },

  /**
   * Derive Opportunities pipeline directly from real backend leads (cached in memory)
   */
  getOpportunities: async (force = false): Promise<OpportunityItem[]> => {
    if (!force && opportunitiesCache) {
      return opportunitiesCache;
    }

    if (!force && opportunitiesPromise) {
      return opportunitiesPromise;
    }

    const promise = (async () => {
      try {
        const leads = await crmService.getLeads({ is_opportunity: "true" }, force);
        const opportunityStatuses = ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "IN_PROGRESS", "UNDER_REVIEW"];
        
        const result = leads
          .filter((lead) => opportunityStatuses.includes(lead.status?.toUpperCase()))
          .map((lead) => {
            const probMap: Record<string, number> = {
              QUALIFIED: 40,
              PROPOSAL: 60,
              NEGOTIATION: 80,
              WON: 100,
              LOST: 0,
              UNDER_REVIEW: 25,
            };

            const cleanStatus = lead.status?.toUpperCase() || "QUALIFIED";
            const probability = probMap[cleanStatus] ?? 50;
            const val = lead.value || lead.estimated_value || 10000;

            return {
              id: lead.id,
              lead_id: lead.id,
              title: `${lead.company || lead.name} Solution Deal`,
              company: lead.company || "Direct Client",
              contact_name: lead.name,
              contact_email: lead.email,
              contact_phone: lead.phone,
              stage: cleanStatus,
              stage_display: lead.status_display || cleanStatus,
              value: val,
              probability,
              expected_close_date: lead.updated_at,
              assigned_to_name: lead.assigned_to_name || "Unassigned",
              created_at: lead.created_at,
              updated_at: lead.updated_at,
            };
          });

        opportunitiesCache = result;
        return result;
      } finally {
        opportunitiesPromise = null;
      }
    })();

    opportunitiesPromise = promise;
    return promise;
  },

  /**
   * Derive Contacts directory directly from real backend leads (cached in memory)
   */
  getContacts: async (force = false): Promise<ContactItem[]> => {
    if (!force && contactsCache) {
      return contactsCache;
    }

    if (!force && contactsPromise) {
      return contactsPromise;
    }

    const promise = (async () => {
      try {
        const leads = await crmService.getLeads(undefined, force);
        const result = leads.map((lead) => ({
          id: `contact-${lead.id}`,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          industry: lead.industry,
          source: lead.source,
          lead_id: lead.id,
          lead_status: lead.status_display || lead.status,
          lead_priority: lead.priority_display || lead.priority,
          created_at: lead.created_at,
        }));
        contactsCache = result;
        return result;
      } finally {
        contactsPromise = null;
      }
    })();

    contactsPromise = promise;
    return promise;
  },

  /**
   * Derive Company registry directly from real backend leads (cached in memory)
   */
  getCompanies: async (force = false): Promise<CompanyItem[]> => {
    if (!force && companiesCache) {
      return companiesCache;
    }

    if (!force && companiesPromise) {
      return companiesPromise;
    }

    const promise = (async () => {
      try {
        const leads = await crmService.getLeads(undefined, force);
        const companyMap = new Map<string, CompanyItem>();

        leads.forEach((lead) => {
          const compName = (lead.company || lead.name).trim();
          if (!companyMap.has(compName)) {
            companyMap.set(compName, {
              id: `company-${lead.id}`,
              name: compName,
              industry: lead.industry || "Enterprise Services",
              website: lead.website || "",
              total_leads: 1,
              primary_contact: lead.name,
              email: lead.email,
              phone: lead.phone,
              status: lead.status_display || lead.status,
              latest_lead_date: lead.created_at,
            });
          } else {
            const existing = companyMap.get(compName)!;
            existing.total_leads += 1;
            if (new Date(lead.created_at) > new Date(existing.latest_lead_date)) {
              existing.latest_lead_date = lead.created_at;
              existing.status = lead.status_display || lead.status;
            }
          }
        });

        const result = Array.from(companyMap.values());
        companiesCache = result;
        return result;
      } finally {
        companiesPromise = null;
      }
    })();

    companiesPromise = promise;
    return promise;
  },

  /**
   * Compute Real Dashboard Statistics strictly from backend leads and follow-ups (cached in memory)
   */
  getDashboardStats: async (force = false): Promise<SalesDashboardStats> => {
    if (!force && dashboardStatsCache) {
      return dashboardStatsCache;
    }

    if (!force && dashboardStatsPromise) {
      return dashboardStatsPromise;
    }

    const promise = (async () => {
      try {
        const leads = await crmService.getLeads(undefined, force);
        const followUps = await crmService.getAllFollowUps(leads, force);
        const activities = await crmService.getRecentActivities(leads, force);

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

        const total_leads = leads.length;
        const new_leads = leads.filter((l) => l.status?.toUpperCase() === "NEW").length;
        const contacted_leads = leads.filter((l) => l.status?.toUpperCase() === "CONTACTED").length;
        const under_review_leads = leads.filter((l) => l.status?.toUpperCase() === "UNDER_REVIEW").length;
        const qualified_leads = leads.filter((l) => l.status?.toUpperCase() === "QUALIFIED").length;
        const won_leads = leads.filter((l) => l.status?.toUpperCase() === "WON").length;
        const lost_leads = leads.filter((l) => l.status?.toUpperCase() === "LOST").length;

        const active_opportunities = leads.filter((l) =>
          ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "IN_PROGRESS"].includes(l.status?.toUpperCase())
        ).length;

        const pending_follow_ups = followUps.filter((f) => f.status?.toUpperCase() === "PENDING").length;
        
        const overdue_follow_ups = followUps.filter((f) => {
          if (f.status?.toUpperCase() !== "PENDING") return false;
          const scheduledTime = new Date(f.scheduled_at).getTime();
          return scheduledTime < startOfToday;
        }).length;

        const today_follow_ups = followUps.filter((f) => {
          if (f.status?.toUpperCase() !== "PENDING") return false;
          const scheduledTime = new Date(f.scheduled_at).getTime();
          return scheduledTime >= startOfToday && scheduledTime < endOfToday;
        }).length;

        const closed_deals = won_leads + lost_leads;
        const win_rate = closed_deals > 0 ? Math.round((won_leads / closed_deals) * 100) : (won_leads > 0 ? 100 : 0);

        const pipeline_summary = [
          { status: "NEW", label: "New Leads", count: new_leads, color: "#63f5e8" },
          { status: "CONTACTED", label: "Contacted / Review", count: contacted_leads + under_review_leads, color: "#38bdf8" },
          { status: "QUALIFIED", label: "Qualified", count: qualified_leads, color: "#818cf8" },
          { status: "WON", label: "Won Deals", count: won_leads, color: "#4ade80" },
          { status: "LOST", label: "Lost Deals", count: lost_leads, color: "#f87171" },
        ];

        const urgent_follow_ups = followUps
          .filter((f) => f.status?.toUpperCase() === "PENDING")
          .slice(0, 10);

        const stats: SalesDashboardStats = {
          total_leads,
          new_leads,
          contacted_leads,
          under_review_leads,
          qualified_leads,
          active_opportunities,
          pending_follow_ups,
          overdue_follow_ups,
          today_follow_ups,
          won_leads,
          lost_leads,
          win_rate,
          pipeline_summary,
          recent_activities: activities.slice(0, 15),
          urgent_follow_ups,
        };

        dashboardStatsCache = stats;
        return stats;
      } finally {
        dashboardStatsPromise = null;
      }
    })();

    dashboardStatsPromise = promise;
    return promise;
  },
};

export default crmService;
