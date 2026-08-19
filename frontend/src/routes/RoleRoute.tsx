import React, { useEffect } from "react";
import { useLocation } from "wouter";
import useAuth from "../hooks/useAuth";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      const userRole = user.role.toUpperCase();
      const isAllowed = allowedRoles.map(r => r.toUpperCase()).includes(userRole);
      
      if (!isAllowed) {
        // Redirect to their default dashboard
        if (userRole === "ADMIN") setLocation("/admin/dashboard");
        else if (userRole === "BDM") setLocation("/bdm/dashboard");
        else if (userRole === "CLIENT") setLocation("/portal/dashboard");
        else if (userRole === "SALES_EXECUTIVE") setLocation("/crm/dashboard");
        else if (userRole === "HR_MANAGER") setLocation("/recruitment/dashboard");
        else if (userRole === "CONTENT_MANAGER") setLocation("/cms/dashboard");
        else if (userRole === "SUPPORT_EXECUTIVE") setLocation("/support/dashboard");
        else setLocation("/");
      }
    }
  }, [isLoading, user, allowedRoles, setLocation]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#050811",
        color: "#63f5e8",
        fontFamily: "IBM Plex Mono, monospace",
      }}>
        VERIFYING ROLE SCOPE...
      </div>
    );
  }

  if (user) {
    const userRole = user.role.toUpperCase();
    const isAllowed = allowedRoles.map(r => r.toUpperCase()).includes(userRole);
    return isAllowed ? <>{children}</> : null;
  }

  return null;
};

export default RoleRoute;
