export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    REFRESH: "/auth/token/refresh/",
    ME: "/auth/me/",
  },
  ADMIN: {
    USERS: "/users/",
    ROLES: "/roles/",
    AUDIT_LOGS: "/audit-logs/",
  },
  CRM: {
    LEADS: "/leads/",
    PUBLIC_LEADS: "/public/leads/",
    LEAD_FOLLOW_UPS: (leadId: number) => `/leads/${leadId}/follow-ups/`,
    LEAD_NOTES: (leadId: number) => `/leads/${leadId}/notes/`,
    LEAD_ASSIGN: (leadId: number) => `/leads/${leadId}/assign/`,
    LEAD_TRANSITION: (leadId: number) => `/leads/${leadId}/transition/`,
    LEAD_QUALIFY: (leadId: number) => `/leads/${leadId}/qualify/`,
    LEAD_WON: (leadId: number) => `/leads/${leadId}/won/`,
    LEAD_LOST: (leadId: number) => `/leads/${leadId}/lost/`,
    LEAD_EXPORT: "/leads/export/",
  },
  PORTAL: {
    MY_TICKETS: "/support/my-tickets/",
    TICKETS: "/support/tickets/",
    ADMIN_TICKETS: "/support/admin/tickets/",
  },
  RECRUITMENT: {
    PUBLIC_JOBS: "/careers/jobs/",
    PUBLIC_JOB_DETAIL: (jobId: string) => `/careers/jobs/${jobId}/`,
    PUBLIC_APPLY: "/careers/apply/",
    ADMIN_JOBS: "/careers/admin/jobs/",
    ADMIN_JOB_DETAIL: (jobId: string) => `/careers/admin/jobs/${jobId}/`,
    ADMIN_APPLICATIONS: "/careers/admin/applications/",
    ADMIN_APPLICATION_DETAIL: (id: number) => `/careers/admin/applications/${id}/`,
  },
  CMS: {
    ADMIN_SERVICES: "/cms/admin/services/",
    ADMIN_SERVICE_DETAIL: (id: number) => `/cms/admin/services/${id}/`,
    ADMIN_CASE_STUDIES: "/cms/admin/case-studies/",
    ADMIN_CASE_STUDY_DETAIL: (id: number) => `/cms/admin/case-studies/${id}/`,
    ADMIN_INDUSTRIES: "/cms/admin/industries/",
    ADMIN_INDUSTRY_DETAIL: (id: number) => `/cms/admin/industries/${id}/`,
    ADMIN_CATEGORIES: "/cms/admin/categories/",
    ADMIN_CATEGORY_DETAIL: (id: number) => `/cms/admin/categories/${id}/`,
    ADMIN_BLOG: "/cms/admin/blog/",
    ADMIN_BLOG_DETAIL: (id: number) => `/cms/admin/blog/${id}/`,
    PUBLIC_SERVICE_DETAIL: (slug: string) => `/cms/public/services/${slug}/`,
    PUBLIC_INDUSTRY_DETAIL: (slug: string) => `/cms/public/industries/${slug}/`,
    PUBLIC_CASE_STUDIES: "/cms/public/case-studies/",
    PUBLIC_BLOG: "/cms/public/blog/",
  },
  BDM: {
    DASHBOARD: "/bdm/dashboard/",
  },
};

export default API_ENDPOINTS;
