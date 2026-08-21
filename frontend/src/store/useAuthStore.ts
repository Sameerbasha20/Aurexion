import { create } from "zustand";
import { queryClient } from "../app/providers/QueryProvider";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
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

  setUser: (user, token) => {
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
    if (user.role === "ADMIN") return true;
    return user.permissions.includes(permission) || user.permissions.includes("*");
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return user.role.toUpperCase() === role.toUpperCase();
  },
}));

export default useAuthStore;
