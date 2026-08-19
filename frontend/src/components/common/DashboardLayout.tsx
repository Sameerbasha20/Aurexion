import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar open={sidebarOpen} />
        <main
          style={{
            flex: 1,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            overflowX: "hidden",
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
