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

export const crmService = {
  /**
   * Fetch leads with optional query parameters (search, status, priority, ordering, pagination)
   */
  getLeads: async (params?: LeadQueryParams): Promise<LeadItem[]> => {
    const response = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEADS, { params });
    if (Array.isArray(response)) {
      return response;
    }
    if (response && Array.isArray(response.results)) {
      return response.results;
    }
    return [];
  },

  /**
   * Fetch paginated leads response
   */
  getPaginatedLeads: async (params?: LeadQueryParams): Promise<PaginatedLeads> => {
    const response = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEADS, { params });
    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      };
    }
    return {
      count: response?.count || response?.results?.length || 0,
      next: response?.next || null,
      previous: response?.previous || null,
      results: response?.results || [],
    };
  },

  /**
   * Fetch a single lead by ID
   */
  getLead: async (leadId: number): Promise<LeadItem> => {
    const data = await axiosClient.get<any, any>(`${API_ENDPOINTS.CRM.LEADS}${leadId}/`);
    return data;
  },

  /**
   * Create a new lead
   */
  createLead: async (leadData: Partial<LeadItem>): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEADS, leadData);
    return data;
  },

  /**
   * Update lead info
   */
  updateLead: async (leadId: number, leadData: Partial<LeadItem>): Promise<LeadItem> => {
    const data = await axiosClient.patch<any, any>(`${API_ENDPOINTS.CRM.LEADS}${leadId}/`, leadData);
    return data;
  },

  /**
   * Assign lead to an executive
   */
  assignLead: async (leadId: number, assignedTo: number): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_ASSIGN(leadId), { assigned_to: assignedTo });
    return data;
  },

  /**
   * Status transition for lead
   */
  transitionLead: async (leadId: number, status: string): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_TRANSITION(leadId), { status });
    return data;
  },

  /**
   * Qualify a lead
   */
  qualifyLead: async (leadId: number): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_QUALIFY(leadId), {});
    return data;
  },

  /**
   * Mark lead as Won
   */
  markLeadWon: async (leadId: number): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_WON(leadId), {});
    return data;
  },

  /**
   * Mark lead as Lost with mandatory reason
   */
  markLeadLost: async (leadId: number, reason: string): Promise<LeadItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_LOST(leadId), { reason });
    return data;
  },

  /**
   * Fetch follow-ups for a specific lead
   */
  getFollowUps: async (leadId: number): Promise<LeadFollowUp[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEAD_FOLLOW_UPS(leadId));
    return Array.isArray(data) ? data : (data.results || []);
  },

  /**
   * Schedule a new follow-up for a lead
   */
  createFollowUp: async (leadId: number, followUpData: Partial<LeadFollowUp>): Promise<LeadFollowUp> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_FOLLOW_UPS(leadId), followUpData);
    return data;
  },

  /**
   * Complete a follow-up
   */
  completeFollowUp: async (leadId: number, followUpId: number): Promise<LeadFollowUp> => {
    const data = await axiosClient.post<any, any>(`${API_ENDPOINTS.CRM.LEAD_FOLLOW_UPS(leadId)}${followUpId}/complete/`, {});
    return data;
  },

  /**
   * Fetch notes for a specific lead
   */
  getNotes: async (leadId: number): Promise<LeadNote[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CRM.LEAD_NOTES(leadId));
    return Array.isArray(data) ? data : (data.results || []);
  },

  /**
   * Add a new note to a lead
   */
  createNote: async (leadId: number, content: string): Promise<LeadNote> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CRM.LEAD_NOTES(leadId), { content });
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
   * Fetch available users (sales executives / admins) for assignment
   */
  getAssignableUsers: async (): Promise<UserOption[]> => {
    try {
      const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.USERS);
      const list = Array.isArray(data) ? data : (data.results || []);
      return list.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : u.username,
        role: u.profile?.role || u.role,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Aggregate all follow-ups across leads from real API data
   */
  getAllFollowUps: async (leads?: LeadItem[]): Promise<LeadFollowUp[]> => {
    const leadList = leads || await crmService.getLeads();
    const followUpsPromises = leadList.slice(0, 30).map(async (lead) => {
      try {
        const items = await crmService.getFollowUps(lead.id);
        return items.map((f) => ({
          ...f,
          lead_name: lead.name,
          lead_company: lead.company,
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(followUpsPromises);
    return results.flat().sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  },

  /**
   * Aggregate activities (notes, follow-ups, lead creations) from real API data
   */
  getRecentActivities: async (leads?: LeadItem[]): Promise<ActivityItem[]> => {
    const leadList = leads || await crmService.getLeads();
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

    // Fetch notes & follow-ups for active leads to build rich activity feed
    const detailPromises = leadList.slice(0, 15).map(async (lead) => {
      try {
        const [notes, followUps] = await Promise.all([
          crmService.getNotes(lead.id),
          crmService.getFollowUps(lead.id),
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

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  /**
   * Derive Opportunities pipeline directly from real backend leads
   */
  getOpportunities: async (): Promise<OpportunityItem[]> => {
    const leads = await crmService.getLeads();
    const opportunityStatuses = ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "IN_PROGRESS", "UNDER_REVIEW"];
    
    return leads
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
  },

  /**
   * Derive Contacts directory directly from real backend leads
   */
  getContacts: async (): Promise<ContactItem[]> => {
    const leads = await crmService.getLeads();
    return leads.map((lead) => ({
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
  },

  /**
   * Derive Company registry directly from real backend leads
   */
  getCompanies: async (): Promise<CompanyItem[]> => {
    const leads = await crmService.getLeads();
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

    return Array.from(companyMap.values());
  },

  /**
   * Compute Real Dashboard Statistics strictly from backend leads and follow-ups
   */
  getDashboardStats: async (): Promise<SalesDashboardStats> => {
    const leads = await crmService.getLeads();
    const followUps = await crmService.getAllFollowUps(leads);
    const activities = await crmService.getRecentActivities(leads);

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

    return {
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
  },
};

export default crmService;
