import React, { useState, useEffect } from "react";
import AuthContext, { User } from "../../context/AuthContext";
import authService from "../../features/authentication/services/authService";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem("aurexion_user");
    const storedToken = localStorage.getItem("aurexion_auth_token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Clear broken session
        localStorage.removeItem("aurexion_user");
        localStorage.removeItem("aurexion_auth_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(username, password);
      
      // Map Django roles to frontend uppercase layout routes
      const dbRole = response.user.role.toLowerCase();
      let mappedRole = "CLIENT";
      if (dbRole === "super_admin" || dbRole === "administrator") {
        mappedRole = "ADMIN";
      } else if (dbRole === "bdm") {
        mappedRole = "BDM";
      } else if (dbRole === "client_user") {
        mappedRole = "CLIENT";
      } else if (dbRole === "sales_executive" || dbRole === "sales" || dbRole === "sales_rep") {
        mappedRole = "SALES_EXECUTIVE";
      } else if (dbRole === "hr_manager" || dbRole === "hr") {
        mappedRole = "HR_MANAGER";
      } else if (dbRole === "content_manager" || dbRole === "content") {
        mappedRole = "CONTENT_MANAGER";
      } else if (dbRole === "support_executive" || dbRole === "support") {
        mappedRole = "SUPPORT_EXECUTIVE";
      } else {
        // Fallback
        mappedRole = "ADMIN";
      }

      const activeUser: User = {
        id: String(response.user.id),
        name: response.user.username.toUpperCase(),
        email: response.user.email,
        role: mappedRole,
        permissions: getPermissionsForRole(mappedRole),
      };

      setUser(activeUser);
      localStorage.setItem("aurexion_user", JSON.stringify(activeUser));
      localStorage.setItem("aurexion_auth_token", response.access);
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aurexion_user");
    localStorage.removeItem("aurexion_auth_token");
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true; // Admin override
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.role.toUpperCase() === role.toUpperCase();
  };

  const getPermissionsForRole = (role: string): string[] => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return ["*"];
      case "BDM":
        return ["read:leads", "write:leads", "read:opportunities", "write:opportunities", "read:rfp", "write:rfp"];
      case "SALES_EXECUTIVE":
        return [
          "read:leads",
          "write:leads",
          "read:followups",
          "write:followups",
          "read:notes",
          "write:notes",
          "read:activities",
          "write:activities",
          "read:opportunities",
          "write:opportunities"
        ];
      case "CLIENT":
        return ["read:projects", "write:requests", "read:documents"];
      default:
        return ["read:profile"];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
