import React from "react";
import { Link, useLocation } from "wouter";
import useAuth from "../../hooks/useAuth";
import { Menu, LogOut, Shield, User } from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
  showToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, showToggle = false }) => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const getHomePath = () => {
    if (!user) return "/";
    const r = (user.role || "").toUpperCase();
    if (r.includes("ADMIN")) return "/admin/dashboard";
    if (r === "BDM" || r.includes("BUSINESS")) return "/bdm/dashboard";
    if (r.includes("SALES") || r.includes("CRM")) return "/crm/dashboard";
    if (r.includes("CLIENT") || r.includes("PORTAL")) return "/portal/dashboard";
    if (r.includes("HR") || r.includes("RECRUIT")) return "/recruitment/dashboard";
    if (r.includes("CONTENT") || r.includes("CMS")) return "/cms/dashboard";
    if (r.includes("SUPPORT")) return "/support/dashboard";
    return "/";
  };

  const getScopeLabel = (role: string) => {
    const r = (role || "").toUpperCase();
    if (r.includes("SALES")) return "SALES";
    if (r === "BDM" || r.includes("BUSINESS")) return "BDM";
    if (r.includes("ADMIN")) return "ADMIN";
    if (r.includes("CLIENT")) return "CLIENT";
    if (r.includes("HR") || r.includes("RECRUIT")) return "HR_MANAGER";
    if (r.includes("CONTENT") || r.includes("CMS")) return "CONTENT_MANAGER";
    if (r.includes("SUPPORT")) return "SUPPORT_EXECUTIVE";
    return role;
  };

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "#050811",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(0.75rem, 2vw, 1.5rem)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Left: Hamburger & Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {showToggle && onToggleSidebar && (
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid #334155",
              color: "#63f5e8",
              cursor: "pointer",
              padding: "0.4rem",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "36px",
              minHeight: "36px",
              transition: "all 150ms ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.12)";
              e.currentTarget.style.borderColor = "#63f5e8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
              e.currentTarget.style.borderColor = "#334155";
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <Link href={getHomePath()}>
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <img src="/images/aurexion-logo.webp" alt="Aurexion" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
          </div>
        </Link>
      </div>

      {/* Right: Scope Badge, User Profile & Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "nowrap" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.4rem, 1vw, 0.75rem)", flexWrap: "nowrap" }}>
            {/* Scope Badge */}
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.72rem",
                backgroundColor: "rgba(99, 245, 232, 0.1)",
                border: "1px solid rgba(99, 245, 232, 0.25)",
                color: "#63f5e8",
                padding: "0.25rem 0.55rem",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                whiteSpace: "nowrap",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <Shield size={12} style={{ flexShrink: 0 }} />
              <span className="hide-mobile">SCOPE: </span>
              <span>{getScopeLabel(user.role)}</span>
            </span>

            {/* Username display */}
            <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "#cbd5e1", whiteSpace: "nowrap" }}>
              <User size={13} style={{ color: "#64748b" }} />
              <span style={{ fontWeight: 500 }}>{user.name || user.email}</span>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              style={{
                background: "none",
                border: "1px solid rgba(140, 174, 187, 0.15)",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "0.35rem 0.6rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.8rem",
                transition: "all 150ms",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.borderColor = "rgba(140, 174, 187, 0.15)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <LogOut size={14} />
              <span className="hide-mobile">Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/">
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  transition: "color 150ms ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#63f5e8")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                ← Back to Home
              </span>
            </Link>
            
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;