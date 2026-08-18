export interface NavItem {
  title: string;
  path: string;
  icon?: string;
  roles?: string[];
  permissions?: string[];
  children?: NavItem[];
}

export const SIDEBAR_NAV: Record<string, NavItem[]> = {
  ADMIN: [
    { title: "Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard" },
    { title: "Users", path: "/admin/users", icon: "Users" },
    { title: "Roles & Permissions", path: "/admin/roles", icon: "ShieldAlert" },
    { title: "Modules", path: "/admin/modules", icon: "FolderLock" },
    { title: "CRM", path: "/admin/crm", icon: "Contact2" },
    { title: "BDM / Sales", path: "/admin/bdm-sales", icon: "TrendingUp" },
    { title: "RFP", path: "/admin/rfp", icon: "FileText" },
    { title: "Estimator", path: "/admin/estimator", icon: "Calculator" },
    { title: "Clients", path: "/admin/clients", icon: "UserCircle" },
    { title: "Support", path: "/admin/support", icon: "MessageSquareCode" },
    { title: "Recruitment", path: "/admin/recruitment", icon: "Briefcase" },
    { title: "CMS", path: "/admin/cms", icon: "FileText" },
    { title: "Reports & Analytics", path: "/admin/reports", icon: "TrendingUp" },
    { title: "Audit Logs", path: "/admin/audit-logs", icon: "History" },
    { title: "Settings", path: "/admin/settings", icon: "Settings" },
  ],
  BDM: [
    { title: "Dashboard", path: "/bdm/dashboard", icon: "LayoutDashboard" },
    { title: "Leads Funnel", path: "/bdm/leads", icon: "Contact2" },
    { title: "Opportunities", path: "/bdm/opportunities", icon: "TrendingUp" },
    { title: "RFP Engine", path: "/bdm/rfp", icon: "FileText" },
    { title: "Cost Estimator", path: "/bdm/estimator", icon: "Calculator" },
  ],
  CLIENT: [
    { title: "Dashboard", path: "/portal/dashboard", icon: "LayoutDashboard" },
    { title: "Support Tickets", path: "/portal/support", icon: "MessageSquareCode" },
    { title: "User Profile", path: "/portal/profile", icon: "UserCircle" },
  ],
  SALES_EXECUTIVE: [
    { title: "CRM Dashboard", path: "/crm/dashboard", icon: "LayoutDashboard" },
    { title: "Leads Funnel", path: "/crm/leads", icon: "Contact2" },
    { title: "Opportunities", path: "/crm/opportunities", icon: "TrendingUp" },
    { title: "Follow-ups", path: "/crm/follow-ups", icon: "Calculator" },
    { title: "Activity Feed", path: "/crm/activities", icon: "History" },
    { title: "Contacts Directory", path: "/crm/contacts", icon: "Users" },
    { title: "Company Registry", path: "/crm/companies", icon: "Briefcase" },
    { title: "Quotations", path: "/crm/quotations", icon: "FileText" },
  ],
  HR_MANAGER: [
    { title: "Recruitment Desk", path: "/recruitment/dashboard", icon: "LayoutDashboard" },
    { title: "Jobs Board", path: "/recruitment/jobs", icon: "Briefcase" },
    { title: "Candidates Pool", path: "/recruitment/candidates", icon: "Users" },
    { title: "Applications Map", path: "/recruitment/applications", icon: "FileText" },
  ],
  CONTENT_MANAGER: [
    { title: "CMS Control", path: "/cms/dashboard", icon: "LayoutDashboard" },
    { title: "Services Catalog", path: "/cms/services", icon: "Briefcase" },
    { title: "Case Studies", path: "/cms/case-studies", icon: "FileText" },
    { title: "Industries", path: "/cms/industries", icon: "Building" },
    { title: "Blog Engine", path: "/cms/blog", icon: "MessageSquareCode" },
    { title: "Categories", path: "/cms/categories", icon: "Tag" },
  ],
  SUPPORT_EXECUTIVE: [
    { title: "Support Desk", path: "/support/dashboard", icon: "LayoutDashboard" },
    { title: "Tickets Queue", path: "/support/tickets", icon: "History" },
  ],
};

export const PUBLIC_NAV = [
  { title: "ABOUT", path: "/#about" },
  { title: "CAPABILITIES", path: "/#capabilities" },
  { title: "INDUSTRIES", path: "/#industries" },
  { title: "WORK", path: "/#work" },
  { title: "INSIGHTS", path: "/#insights" },
];
export default SIDEBAR_NAV;
