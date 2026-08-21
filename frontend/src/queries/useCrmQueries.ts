import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import crmService, {
  LeadItem,
  LeadQueryParams,
  PaginatedLeads,
  SalesDashboardStats,
  LeadFollowUp,
  LeadNote,
} from "../features/crm/services/crmService";
import { queryKeys } from "./queryKeys";

/**
 * Fetch Paginated Leads list
 */
export function useLeadsQuery(params?: LeadQueryParams) {
  return useQuery<PaginatedLeads>({
    queryKey: queryKeys.leads.list(params),
    queryFn: async () => {
      const response = await crmService.getPaginatedLeads(params);
      // Ensure structure matches PaginatedLeads format
      if (Array.isArray(response)) {
        return {
          count: (response as any).count || response.length,
          next: (response as any).next || null,
          previous: (response as any).previous || null,
          results: response,
        };
      }
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch Sales Dashboard Stats
 */
export function useSalesDashboardQuery() {
  return useQuery<SalesDashboardStats>({
    queryKey: queryKeys.leads.metrics(),
    queryFn: () => crmService.getDashboardStats(),
  });
}

/**
 * Fetch Single Lead Details + Notes + Follow-ups
 */
export function useLeadDetailQuery(leadId: number | null, enabled: boolean = true) {
  const leadQuery = useQuery<LeadItem>({
    queryKey: queryKeys.leads.detail(leadId || 0),
    queryFn: () => crmService.getLead(leadId!),
    enabled: !!leadId && enabled,
  });

  const followUpsQuery = useQuery<LeadFollowUp[]>({
    queryKey: queryKeys.leads.followUps(leadId || 0),
    queryFn: () => crmService.getFollowUps(leadId!),
    enabled: !!leadId && enabled,
  });

  const notesQuery = useQuery<LeadNote[]>({
    queryKey: queryKeys.leads.notes(leadId || 0),
    queryFn: () => crmService.getNotes(leadId!),
    enabled: !!leadId && enabled,
  });

  return {
    lead: leadQuery.data || null,
    followUps: followUpsQuery.data || [],
    notes: notesQuery.data || [],
    isLoading: leadQuery.isLoading || followUpsQuery.isLoading || notesQuery.isLoading,
    error: leadQuery.error || followUpsQuery.error || notesQuery.error,
    refetch: () => {
      leadQuery.refetch();
      followUpsQuery.refetch();
      notesQuery.refetch();
    },
  };
}

/**
 * Mutation: Create Lead with targeted cache invalidation
 */
export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LeadItem>) => crmService.createLead(data),
    onSuccess: () => {
      // Invalidate lead lists, metrics, and BDM dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bdm.dashboard() });
    },
  });
}

/**
 * Mutation: Update Lead with targeted cache invalidation
 */
export function useUpdateLeadMutation(leadId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LeadItem>) => crmService.updateLead(leadId, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bdm.dashboard() });
      queryClient.setQueryData(queryKeys.leads.detail(leadId), updated);
    },
  });
}

/**
 * Mutation: Transition Lead Status with targeted cache invalidation
 */
export function useTransitionLeadMutation(leadId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) => crmService.transitionLead(leadId!, status),
    onSuccess: (updated) => {
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bdm.dashboard() });
    },
  });
}

export function useLeadActivitiesQuery(leadId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.leads.detail(leadId || 0), "activities"],
    queryFn: () => crmService.getActivities(leadId!),
    enabled: !!leadId && enabled,
  });
}

export function useAssignableUsersQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.administration.users({ assignable: true }),
    queryFn: () => crmService.getAssignableUsers(),
    enabled,
  });
}

export function useAssignLeadMutation(leadId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => crmService.assignLead(leadId!, userId),
    onSuccess: () => {
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
  });
}

export function useCreateNoteMutation(leadId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => crmService.createNote(leadId!, content),
    onSuccess: () => {
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.notes(leadId) });
      }
    },
  });
}

export function useCreateFollowUpMutation(leadId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => crmService.createFollowUp(leadId!, data),
    onSuccess: () => {
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps(leadId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
    },
  });
}

export function useCompleteFollowUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, followUpId }: { leadId: number, followUpId: number }) => crmService.completeFollowUp(leadId, followUpId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps(variables.leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
    },
  });
}

export function useMarkLeadLostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, reason }: { leadId: number, reason: string }) => crmService.markLeadLost(leadId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
    },
  });
}

export function useMarkLeadWonMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: number) => crmService.markLeadWon(leadId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bdm.dashboard() });
    },
  });
}

export function useOpportunitiesQuery() {
  return useQuery({
    queryKey: queryKeys.bdm.opportunities(),
    queryFn: () => crmService.getOpportunities(),
  });
}

export function useActivitiesQuery() {
  return useQuery({
    queryKey: ["crm", "activities"],
    queryFn: () => crmService.getRecentActivities(),
  });
}

export function useCompaniesQuery() {
  return useQuery({
    queryKey: ["crm", "companies"],
    queryFn: () => crmService.getCompanies(),
  });
}

export function useContactsQuery() {
  return useQuery({
    queryKey: ["crm", "contacts"],
    queryFn: () => crmService.getContacts(),
  });
}

export function useAllFollowUpsQuery() {
  return useQuery({
    queryKey: ["crm", "all-follow-ups"],
    queryFn: () => crmService.getAllFollowUps(),
  });
}

export function useQualifyLeadMutation(leadId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (overrideId?: number) => crmService.qualifyLead((overrideId ?? leadId)!),
    onSuccess: (data: any, variables: any) => {
      const targetId = variables ?? leadId;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(targetId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bdm.dashboard() });
    },
  });
}
