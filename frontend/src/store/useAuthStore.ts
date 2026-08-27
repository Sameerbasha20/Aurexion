import { create } from "zustand";
import { queryClient } from "../app/providers/QueryProvider";

export interface User {
  id: string | number;
  name?: string;
  username?: string;
  email: string;
  role: string;
  permissions?: string[];
  rawRole?: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const storedUser = localStorage.getItem("aurexion_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("aurexion_token") || localStorage.getItem("access_token"),
  isAuthenticated: !!(localStorage.getItem("aurexion_token") || localStorage.getItem("access_token")),

  setUser: (user: User | null, token?: string) => {
    if (user) {
      localStorage.setItem("aurexion_user", JSON.stringify(user));
      if (token) {
        localStorage.setItem("aurexion_token", token);
      }
      set({ user, token: token || get().token, isAuthenticated: true });
    } else {
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem("aurexion_user");
    localStorage.removeItem("aurexion_token");
    localStorage.removeItem("access_token");
    queryClient.clear(); // Clear all server query cache on logout!
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === "ADMIN" || user.role === "administrator" || user.role === "super_admin") return true;
    const perms = user.permissions || [];
    return perms.includes(permission) || perms.includes("*");
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return user.role.toUpperCase() === role.toUpperCase();
  },
}));

export default useAuthStore;
