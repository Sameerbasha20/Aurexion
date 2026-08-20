import { useState, useEffect, useCallback } from "react";
import crmService, {
  LeadItem,
  LeadFollowUp,
  LeadNote,
  LeadQueryParams,
  PaginatedLeads,
  SalesDashboardStats,
  OpportunityItem,
  ActivityItem,
  ContactItem,
  CompanyItem,
  UserOption,
} from "../services/crmService";

/**
 * Hook for fetching and managing Sales Dashboard Stats (Cached)
 */
export function useSalesDashboard() {
  const [data, setData] = useState<SalesDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await crmService.getDashboardStats(force);
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(false);
  }, [fetchStats]);

  return { data, isLoading, error, refetch: () => fetchStats(true) };
}

/**
 * Hook for fetching and managing paginated Leads list (Cached)
 */
export function useLeads(initialParams?: LeadQueryParams) {
  const [params, setParams] = useState<LeadQueryParams>(initialParams || {});
  const [data, setData] = useState<PaginatedLeads>({ count: 0, next: null, previous: null, results: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await crmService.getPaginatedLeads(params, force);
      setData(response);
    } catch (err: any) {
      setError(err?.message || "Failed to load leads.");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLeads(false);
  }, [fetchLeads]);

  const updateFilters = (newParams: Partial<LeadQueryParams>) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  };

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    leads: data.results,
    totalCount: data.count,
    params,
    isLoading,
    error,
    refetch: () => fetchLeads(true),
    updateFilters,
    setPage,
  };
}

/**
 * Hook for a single Lead, its Notes, and its Follow-ups (Cached)
 */
export function useLeadDetail(leadId: number) {
  const [lead, setLead] = useState<LeadItem | null>(null);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchLeadDetails = useCallback(async (force = false) => {
    if (!leadId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [leadData, followUpsData, notesData] = await Promise.all([
        crmService.getLead(leadId, force),
        crmService.getFollowUps(leadId, force),
        crmService.getNotes(leadId, force),
      ]);
      setLead(leadData);
      setFollowUps(followUpsData);
      setNotes(notesData);
    } catch (err: any) {
      setError(err?.message || "Failed to load lead details.");
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLeadDetails(false);
  }, [fetchLeadDetails]);

  const updateLead = async (data: Partial<LeadItem>) => {
    setActionLoading(true);
    try {
      const updated = await crmService.updateLead(leadId, data);
      setLead(updated);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const transitionStatus = async (status: string) => {
    setActionLoading(true);
    try {
      const updated = await crmService.transitionLead(leadId, status);
      setLead(updated);
      await fetchLeadDetails(true);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const qualify = async () => {
    setActionLoading(true);
    try {
      const updated = await crmService.qualifyLead(leadId);
      setLead(updated);
      await fetchLeadDetails(true);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const markWon = async (payload?: { value?: number; notes?: string }) => {
    setActionLoading(true);
    try {
      const updated = await crmService.markLeadWon(leadId, payload);
      setLead(updated);
      await fetchLeadDetails(true);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const markLost = async (reason: string) => {
    setActionLoading(true);
    try {
      const updated = await crmService.markLeadLost(leadId, reason);
      setLead(updated);
      await fetchLeadDetails(true);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const reopen = async () => {
    setActionLoading(true);
    try {
      const updated = await crmService.reopenLead(leadId);
      setLead(updated);
      await fetchLeadDetails(true);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const assign = async (userId: number) => {
    setActionLoading(true);
    try {
      const updated = await crmService.assignLead(leadId, userId);
      setLead(updated);
      await fetchLeadDetails(true);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const addNote = async (content: string) => {
    setActionLoading(true);
    try {
      const newNote = await crmService.createNote(leadId, content);
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } finally {
      setActionLoading(false);
    }
  };

  const addFollowUp = async (followUpData: Partial<LeadFollowUp>) => {
    setActionLoading(true);
    try {
      const newFollowUp = await crmService.createFollowUp(leadId, followUpData);
      setFollowUps((prev) => [...prev, newFollowUp]);
      return newFollowUp;
    } finally {
      setActionLoading(false);
    }
  };

  const completeFollowUp = async (followUpId: number) => {
    setActionLoading(true);
    try {
      const updated = await crmService.completeFollowUp(leadId, followUpId);
      setFollowUps((prev) => prev.map((f) => (f.id === followUpId ? updated : f)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    lead,
    followUps,
    notes,
    isLoading,
    actionLoading,
    error,
    refetch: () => fetchLeadDetails(true),
    updateLead,
    transitionStatus,
    qualify,
    markWon,
    markLost,
    reopen,
    assign,
    addNote,
    addFollowUp,
    completeFollowUp,
  };
}

/**
 * Hook for Global Follow-ups management (Cached)
 */
export function useFollowUps() {
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowUps = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await crmService.getAllFollowUps(undefined, force);
      setFollowUps(items);
    } catch (err: any) {
      setError(err?.message || "Failed to load follow-ups.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowUps(false);
  }, [fetchFollowUps]);

  const markComplete = async (leadId: number, followUpId: number) => {
    try {
      const updated = await crmService.completeFollowUp(leadId, followUpId);
      setFollowUps((prev) => prev.map((f) => (f.id === followUpId ? { ...f, ...updated, status: "COMPLETED" } : f)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return { followUps, isLoading, error, refetch: () => fetchFollowUps(true), markComplete };
}

/**
 * Hook for Sales Activities & Feed (Cached)
 */
export function useActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await crmService.getRecentActivities(undefined, force);
      setActivities(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load activity ledger.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(false);
  }, [fetchActivities]);

  return { activities, isLoading, error, refetch: () => fetchActivities(true) };
}

/**
 * Hook for Opportunities pipeline (Cached)
 */
export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const opps = await crmService.getOpportunities(force);
      setOpportunities(opps);
    } catch (err: any) {
      setError(err?.message || "Failed to load opportunities.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities(false);
  }, [fetchOpportunities]);

  return { opportunities, isLoading, error, refetch: () => fetchOpportunities(true) };
}

/**
 * Hook for Contacts Directory (Cached)
 */
export function useContacts() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await crmService.getContacts(force);
      setContacts(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load contacts directory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(false);
  }, [fetchContacts]);

  return { contacts, isLoading, error, refetch: () => fetchContacts(true) };
}

/**
 * Hook for Company Registry (Cached)
 */
export function useCompanies() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await crmService.getCompanies(force);
      setCompanies(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load company registry.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(false);
  }, [fetchCompanies]);

  return { companies, isLoading, error, refetch: () => fetchCompanies(true) };
}

/**
 * Hook for Assignable Users (Cached)
 */
export function useAssignableUsers() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    crmService.getAssignableUsers(false).then(setUsers);
  }, []);

  return { users, isLoading };
}
