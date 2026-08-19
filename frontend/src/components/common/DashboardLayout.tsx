import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useIsMobile } from "../../hooks/useMobile";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#050811",
      }}
    >
      <Header showToggle onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          style={{
            flex: 1,
            padding: isMobile ? "1rem 0.75rem" : "2rem",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "1.25rem" : "2rem",
            overflowX: "hidden",
            minWidth: 0,
            width: "100%",
          }}
        >
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

