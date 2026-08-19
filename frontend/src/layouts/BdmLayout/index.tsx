import React, { useState } from "react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer";

interface BdmLayoutProps {
  children: React.ReactNode;
}

export const BdmLayout: React.FC<BdmLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      maxHeight: "100vh",
      overflow: "hidden",
      backgroundColor: "#050811",
    }}>
      <Header showToggle onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        <Sidebar open={sidebarOpen} />
        <main style={{
          flex: 1,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: 0,
        }}>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default BdmLayout;
