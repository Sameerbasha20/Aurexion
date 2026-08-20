import React from "react";
import { Link, useLocation } from "wouter";
import useAuth from "../../hooks/useAuth";
import { Menu, LogOut, Shield } from "lucide-react";

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

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "#050811",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}
    >
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
        <Link href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : user.role === "BDM" ? "/bdm/dashboard" : "/portal/dashboard") : "/"}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <img src="/manus-storage/aurexion-mark_e8f9e729.png" alt="Aurexion" style={{ width: "30px", height: "30px" }} />
            <span style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              fontSize: "1.15rem",
              letterSpacing: "0.05em",
              color: "#f8fafc",
            }}>AUREXION</span>
          </div>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.75rem",
                backgroundColor: "rgba(99, 245, 232, 0.1)",
                border: "1px solid rgba(99, 245, 232, 0.2)",
                color: "#63f5e8",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                maxWidth: "160px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <Shield size={12} style={{ flexShrink: 0 }} />
              <span className="hide-mobile">SCOPE: </span>
              <span>{user.role}</span>
            </span>
            {user.name && !user.name.toUpperCase().includes(user.role.toUpperCase()) && (
              <span className="hide-mobile" style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{user.name}</span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "0.35rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.85rem",
                transition: "all 150ms",
                borderRadius: "4px",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
              onFocus={(e) => (e.currentTarget.style.color = "#ef4444")}
              onBlur={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              <LogOut size={16} />
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
            <Link href="/login?role=client">
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#050811",
                  backgroundColor: "#63f5e8",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "4px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Client Portal
              </span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

