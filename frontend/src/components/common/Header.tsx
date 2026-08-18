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
    <header style={{
      height: "70px",
      backgroundColor: "#050811",
      borderBottom: "1px solid #1e293b",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {showToggle && onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <Link href="/">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <img src="/logo.svg" alt="Aurexion" style={{ width: "30px", height: "30px" }} />
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

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.85rem",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              border: "1px solid rgba(99, 245, 232, 0.2)",
              color: "#63f5e8",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}>
              <Shield size={12} />
              {user.role}
            </span>
            <span style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>{user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                transition: "all 150ms",
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
            >
              <LogOut size={16} />
              <span className="hide-mobile">Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/login">
              <span style={{ fontSize: "0.9rem", color: "#cbd5e1", cursor: "pointer" }}>Login</span>
            </Link>
            <Link href="/login?role=client">
              <span style={{
                fontSize: "0.85rem",
                color: "#050811",
                backgroundColor: "#63f5e8",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                fontWeight: 500,
                cursor: "pointer",
              }}>Client Portal</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
