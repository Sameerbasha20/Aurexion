import React from "react";
import { Link, useLocation } from "wouter";
import useAuth from "../../hooks/useAuth";
import { SIDEBAR_NAV } from "../../app/config/navigation.config";
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Key, 
  History, 
  Settings, 
  Contact2, 
  TrendingUp, 
  FileText, 
  Calculator, 
  Briefcase, 
  MessageSquareCode, 
  FolderLock, 
  UserCircle 
} from "lucide-react";

interface SidebarProps {
  open: boolean;
}

// Icon mapping helper
const IconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Key,
  History,
  Settings,
  Contact2,
  TrendingUp,
  FileText,
  Calculator,
  Briefcase,
  MessageSquareCode,
  FolderLock,
  UserCircle,
};

export const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!open || !user) return null;

  const role = user.role.toUpperCase();
  const navItems = SIDEBAR_NAV[role] || [];

  return (
    <aside className="max-md:absolute max-md:left-0 max-md:top-[70px] max-md:z-50" style={{
      width: "260px",
      backgroundColor: "#0c1222",
      borderRight: "1px solid #1e293b",
      height: "calc(100vh - 70px)",
      position: "sticky",
      top: "70px",
      padding: "1.5rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      overflowY: "auto",
    }}>
      <div style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.75rem",
        color: "#64748b",
        padding: "0 1rem 0.75rem 1rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        borderBottom: "1px solid #1e293b",
        marginBottom: "1rem",
      }}>
        System Scope: {role}
      </div>

      {navItems.map((item) => {
        const IconComponent = IconMap[item.icon || ""] || LayoutDashboard;
        const isActive = location === item.path;

        return (
          <Link key={item.path} href={item.path}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "4px",
              fontSize: "0.9rem",
              color: isActive ? "#63f5e8" : "#cbd5e1",
              backgroundColor: isActive ? "rgba(99, 245, 232, 0.05)" : "transparent",
              borderLeft: isActive ? "2px solid #63f5e8" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 150ms",
            }}
            onMouseOver={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "#63f5e8";
                e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)";
              }
            }}
            onMouseOut={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "#cbd5e1";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            >
              <IconComponent size={18} />
              <span>{item.title}</span>
            </div>
          </Link>
        );
      })}
    </aside>
  );
};

export default Sidebar;
