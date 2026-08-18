import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LifeBuoy, UserCircle } from "lucide-react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer";
import { useIsMobile } from "../../hooks/useMobile";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const MOBILE_NAV = [
  { title: "Dashboard", path: "/portal/dashboard", icon: LayoutDashboard },
  { title: "Support", path: "/portal/support", icon: LifeBuoy },
  { title: "Profile", path: "/portal/profile", icon: UserCircle },
];

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const [location] = useLocation();

  const showSidebar = !isMobile && sidebarOpen;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#050811",
      }}
    >
      <Header showToggle onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {isMobile && (
        <nav
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid #1e293b",
            backgroundColor: "#0a111c",
            overflowX: "auto",
          }}
          aria-label="Client navigation"
        >
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    whiteSpace: "nowrap",
                    color: isActive ? "#63f5e8" : "#cbd5e1",
                    backgroundColor: isActive ? "rgba(99,245,232,0.08)" : "transparent",
                    border: isActive ? "1px solid rgba(99,245,232,0.3)" : "1px solid transparent",
                  }}
                >
                  <Icon size={14} />
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar open={showSidebar} />
        <main
          style={{
            flex: 1,
            padding: isMobile ? "1.25rem" : "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            overflowX: "hidden",
            minWidth: 0,
          }}
        >
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;