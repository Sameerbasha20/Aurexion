import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  is_active?: boolean;
  date_joined?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuditLogItem {
  timestamp: string;
  operator: string;
  action: string;
  scope: string;
  integrity: string;
}

export interface AdminDashboardOverviewData {
  users: {
    total: number;
    active: number;
    clients: number;
    sales_executives: number;
    bdms: number;
    administrators: number;
  };
  leads: {
    total: number;
    active: number;
    won: number;
    lost: number;
    pending: number;
  };
  support: {
    open: number;
    critical: number;
  };
  activity_chart?: Array<{
    date: string;
    activityCount: number;
  }>;
  pipeline_chart?: Array<{
    status: string;
    count: number;
  }>;
  recent_activities: Array<{
    id: number;
    timestamp: string;
    operator: string;
    action: string;
    module: string;
    details: string;
  }>;
  recent_leads: Array<{
    id: number;
    reference_id: string;
    name: string;
    company: string;
    email: string;
    status: string;
    status_display: string;
    priority: string;
    assigned_to: string | null;
    created_at: string;
  }>;
}

export interface RoleChoiceItem {
  code: string;
  name: string;
}

export const administrationService = {
  getDashboardOverview: async (): Promise<AdminDashboardOverviewData> => {
    const res = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.DASHBOARD);
    if (res && typeof res === "object") {
      if ("users" in res && "leads" in res && "support" in res) {
        return res;
      }
      if (res.data && typeof res.data === "object" && "users" in res.data) {
        return res.data;
      }
    }
    return res;
  },

  getUsers: async (params?: { role?: string; search?: string; page?: number }): Promise<UserItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.USERS, { params });
    const users = Array.isArray(data) ? data : (data.results || []);
    return users.map((u: any) => ({
      id: String(u.id),
      name: u.username,
      email: u.email,
      role: (u.role || u.profile?.role || "CLIENT").toUpperCase(),
      status: u.is_active !== false ? "ACTIVE" : "SUSPENDED",
      is_active: u.is_active !== false,
      date_joined: u.date_joined,
      first_name: u.first_name || "",
      last_name: u.last_name || "",
    }));
  },

  getRoleChoices: async (): Promise<RoleChoiceItem[]> => {
    try {
      const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.ROLE_CHOICES);
      return Array.isArray(data) ? data : (data.results || []);
    } catch (err) {
      return [
        { code: "super_admin", name: "Super Admin" },
        { code: "administrator", name: "Administrator" },
        { code: "bdm", name: "Business Development Manager" },
        { code: "sales_executive", name: "Sales Executive" },
        { code: "hr_manager", name: "HR Manager" },
        { code: "content_manager", name: "Content Manager" },
        { code: "support_executive", name: "Support Executive" },
        { code: "client_user", name: "Client User" },
      ];
    }
  },

  createUser: async (userData: { username: string; email: string; role: string; password?: string }) => {
    return await axiosClient.post(API_ENDPOINTS.ADMIN.USERS, {
      username: userData.username,
      email: userData.email,
      role: userData.role.toLowerCase(),
      ...(userData.password ? { password: userData.password } : {}),
    });
  },

  updateUser: async (userId: string, userData: { username?: string; email?: string; role?: string; is_active?: boolean }) => {
    const payload: any = {};
    if (userData.username) payload.username = userData.username;
    if (userData.email) payload.email = userData.email;
    if (userData.role) payload.role = userData.role.toLowerCase();
    if (userData.is_active !== undefined) payload.is_active = userData.is_active;
    return await axiosClient.patch(`${API_ENDPOINTS.ADMIN.USERS}${userId}/`, payload);
  },

  deleteUser: async (userId: string) => {
    return await axiosClient.delete(`${API_ENDPOINTS.ADMIN.USERS}${userId}/`);
  },

  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.AUDIT_LOGS);
    const logs = Array.isArray(data) ? data : (data.results || []);
    return logs.map((log: any) => ({
      timestamp: new Date(log.timestamp).toLocaleString(),
      operator: log.user_username || "system",
      action: log.action,
      scope: log.module.toUpperCase(),
      integrity: "SECURE",
    }));
  },

  getRoles: async () => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.ROLES);
    const roles = Array.isArray(data) ? data : (data.results || []);
    return roles.map((r: any) => ({
      id: String(r.id),
      code: r.code || r.name,
      name: r.name,
      description: r.description,
      permissions: (r.permissions || r.module_permissions || []).map((rule: any) => {
        if (typeof rule === "string") return rule;
        if (rule && typeof rule === "object") {
          if (rule.module) {
            const actions = [
              rule.can_read && "read",
              rule.can_create && "create",
              rule.can_update && "update",
              rule.can_delete && "delete",
            ].filter(Boolean).join(",");
            return actions ? `${rule.module}: ${actions}` : rule.module;
          }
          return JSON.stringify(rule);
        }
        return String(rule || "");
      }),
    }));
  },

  getSettings: async () => {
    return {
      appName: "Aurexion Enterprise Portal",
      mfaRequired: true,
      rateLimit: "100 requests / minute",
    };
  },

  saveSettings: async (settings: any) => {
    return { success: true, settings };
  },
};

export default administrationService;

