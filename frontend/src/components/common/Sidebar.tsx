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
  const navItems = SIDEBAR_NAV[role] || [];

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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/logo.svg" alt="Aurexion" style={{ width: "24px", height: "24px" }} />
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 600,
                fontSize: "1.05rem",
                letterSpacing: "0.05em",
                color: "#f8fafc",
              }}
            >
              AUREXION
            </span>
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
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: "0.72rem",
          color: "#64748b",
          padding: "0 0.75rem 0.5rem 0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          borderBottom: isMobile ? "none" : "1px solid #1e293b",
          marginBottom: isMobile ? "0.25rem" : "0.75rem",
        }}
      >
        System Scope: {role}
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

