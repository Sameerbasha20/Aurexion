import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface AuditLogItem {
  timestamp: string;
  operator: string;
  action: string;
  scope: string;
  integrity: string;
}

export const administrationService = {
  getUsers: async (): Promise<UserItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.ADMIN.USERS);
    const users = Array.isArray(data) ? data : (data.results || []);
    return users.map((u: any) => ({
      id: String(u.id),
      name: u.username,
      email: u.email,
      role: u.profile?.role?.toUpperCase() || "CLIENT",
      status: "ACTIVE",
    }));
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

  // Mock data for features not yet implemented in backend
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
