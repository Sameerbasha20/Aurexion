import React from "react";
import { Link, useLocation } from "wouter";
import useAuth from "../../hooks/useAuth";
import { useIsMobile } from "../../hooks/useMobile";
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
  UserCircle,
  X
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile && open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobile, open]);

  if (!open || !user) return null;

  const role = user.role.toUpperCase();
  let navItems = SIDEBAR_NAV[role] || [];
  if (role === "ADMIN" && user.rawRole === "administrator") {
    navItems = navItems.filter(item => item.path !== "/admin/audit-logs");
  }

  const asideContent = (
    <aside
      style={{
        width: isMobile ? "280px" : "260px",
        minWidth: isMobile ? "280px" : "260px",
        maxWidth: isMobile ? "85vw" : "260px",
        backgroundColor: "#0c1222",
        borderRight: "1px solid #1e293b",
        height: isMobile ? "100vh" : "100%",
        maxHeight: isMobile ? "100vh" : "calc(100vh - 70px)",
        position: isMobile ? "fixed" : "relative",
        top: 0,
        left: 0,
        bottom: 0,
        flexShrink: 0,
        padding: "1.25rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        overflowY: "auto",
        zIndex: isMobile ? 1000 : 40,
        boxShadow: isMobile ? "4px 0 24px rgba(0, 0, 0, 0.8)" : "none",
      }}
    >
      {/* Mobile Header with Aurexion branding and Close Button */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.25rem 0.5rem 0.75rem 0.5rem",
            borderBottom: "1px solid #1e293b",
            marginBottom: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/images/aurexion-logo.webp" alt="Aurexion" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.35rem",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div
        style={{
          padding: "0 0.75rem 0.75rem 0.75rem",
          borderBottom: isMobile ? "none" : "1px solid #1e293b",
          marginBottom: isMobile ? "0.25rem" : "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem"
        }}
      >
        <span style={{
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: "0.65rem",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>System Scope</span>
        {user.role === "ADMIN" && user.rawRole === "super_admin" ? (
          <span style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            color: "#c084fc",
            backgroundColor: "rgba(192, 132, 252, 0.1)",
            border: "1px solid rgba(192, 132, 252, 0.25)",
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            width: "fit-content",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            <ShieldAlert size={12} /> SUPER ADMIN
          </span>
        ) : user.role === "ADMIN" && user.rawRole === "administrator" ? (
          <span style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            color: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            width: "fit-content",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            <Key size={12} /> ADMINISTRATOR
          </span>
        ) : (
          <span style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            color: "var(--color-cyan)",
            backgroundColor: "rgba(99, 245, 232, 0.1)",
            border: "1px solid rgba(99, 245, 232, 0.25)",
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            width: "fit-content",
          }}>
            {role}
          </span>
        )}
      </div>

      {navItems.map((item) => {
        const IconComponent = IconMap[item.icon || ""] || LayoutDashboard;
        const isActive = location === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => {
              if (isMobile && onClose) {
                onClose();
              }
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "4px",
                fontSize: "0.9rem",
                color: isActive ? "#63f5e8" : "#cbd5e1",
                backgroundColor: isActive ? "rgba(99, 245, 232, 0.08)" : "transparent",
                borderLeft: isActive ? "2px solid #63f5e8" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 150ms",
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#63f5e8";
                  e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.04)";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
              onFocus={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#63f5e8";
                  e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.04)";
                }
              }}
              onBlur={(e) => {
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

  if (isMobile) {
    return (
      <>
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
          }}
          aria-hidden="true"
        />
        {asideContent}
      </>
    );
  }

  return asideContent;
};

export default Sidebar;

