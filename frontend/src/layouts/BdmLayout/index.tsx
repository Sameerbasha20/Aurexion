import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer";
import { useIsMobile } from "../../hooks/useMobile";
import { PrivatePageSEO } from "../../components/seo/PrivatePageSEO";

interface BdmLayoutProps {
  children: React.ReactNode;
}

export const BdmLayout: React.FC<BdmLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      maxHeight: "100vh",
      overflow: "hidden",
      backgroundColor: "#050811",
    }}>
      <PrivatePageSEO title="Business Development Management" />
      <Header showToggle onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main style={{
          flex: 1,
          padding: isMobile ? "1rem 0.75rem" : "clamp(1rem, 2.5vw, 2rem)",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "1rem" : "clamp(1rem, 2vw, 2rem)",
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: 0,
          width: "100%",
        }}>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default BdmLayout;

