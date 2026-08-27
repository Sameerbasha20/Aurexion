/**
 * Aurexion Centralized Query Key Factory
 *
 * Provides parameter-aware, deterministic, and type-safe query keys
 * across all server-state modules: CRM, CMS, Recruitment, Portal, Support, Admin.
 */

export const queryKeys = {
  // CRM domain query keys
  leads: {
    all: () => ["leads"] as const,
    lists: () => ["leads", "list"] as const,
    list: (filters?: Record<string, unknown> | object) => ["leads", "list", filters || {}] as const,
    details: () => ["leads", "detail"] as const,
    detail: (id: number | string) => ["leads", "detail", String(id)] as const,
    followUps: (id: number | string) => ["leads", "detail", String(id), "follow-ups"] as const,
    notes: (id: number | string) => ["leads", "detail", String(id), "notes"] as const,
    metrics: () => ["leads", "metrics"] as const,
  },

  // BDM domain query keys
  bdm: {
    all: () => ["bdm"] as const,
    dashboard: () => ["bdm", "dashboard"] as const,
    opportunities: (filters?: Record<string, unknown> | object) => ["bdm", "opportunities", filters || {}] as const,
  },

  // CMS domain query keys
  cms: {
    all: () => ["cms"] as const,
    services: (filters?: Record<string, unknown> | object) => ["cms", "services", filters || {}] as const,
    serviceDetail: (idOrSlug: number | string) => ["cms", "services", String(idOrSlug)] as const,
    caseStudies: (filters?: Record<string, unknown> | object) => ["cms", "case-studies", filters || {}] as const,
    caseStudyDetail: (id: number | string) => ["cms", "case-studies", String(id)] as const,
    industries: (filters?: Record<string, unknown> | object) => ["cms", "industries", filters || {}] as const,
    categories: () => ["cms", "categories"] as const,
    blog: (filters?: Record<string, unknown> | object) => ["cms", "blog", filters || {}] as const,
    blogDetail: (id: number | string) => ["cms", "blog", String(id)] as const,
  },

  // Recruitment ATS domain query keys
  recruitment: {
    all: () => ["recruitment"] as const,
    jobs: (filters?: Record<string, unknown> | object) => ["recruitment", "jobs", filters || {}] as const,
    jobDetail: (id: string) => ["recruitment", "jobs", id] as const,
    applications: (filters?: Record<string, unknown> | object) => ["recruitment", "applications", filters || {}] as const,
    applicationDetail: (id: string) => ["recruitment", "applications", id] as const,
  },

  // Support & Client Portal query keys
  portal: {
    all: () => ["portal"] as const,
    myTickets: (filters?: Record<string, unknown> | object) => ["portal", "my-tickets", filters || {}] as const,
    ticketDetail: (id: string | number) => ["portal", "tickets", String(id)] as const,
    projects: (filters?: Record<string, unknown> | object) => ["portal", "projects", filters || {}] as const,
    documents: (filters?: Record<string, unknown> | object) => ["portal", "documents", filters || {}] as const,
    requests: (filters?: Record<string, unknown> | object) => ["portal", "requests", filters || {}] as const,
  },

  support: {
    all: () => ["support"] as const,
    adminTickets: (filters?: Record<string, unknown> | object) => ["support", "admin-tickets", filters || {}] as const,
    ticketDetail: (id: string | number) => ["support", "ticket-detail", String(id)] as const,
  },

  // Administration domain query keys
  administration: {
    all: () => ["administration"] as const,
    users: (filters?: Record<string, unknown> | object) => ["administration", "users", filters || {}] as const,
    roles: () => ["administration", "roles"] as const,
    roleChoices: () => ["administration", "roles", "choices"] as const,
    auditLogs: (filters?: Record<string, unknown> | object) => ["administration", "audit-logs", filters || {}] as const,
  },

  // System health query keys
  system: {
    health: () => ["system", "health"] as const,
  },
};

export default queryKeys;
