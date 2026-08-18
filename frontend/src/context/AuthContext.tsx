import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
