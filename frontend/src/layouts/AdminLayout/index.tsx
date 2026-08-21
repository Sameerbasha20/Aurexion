import React, { useEffect } from "react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer";
import { useIsMobile } from "../../hooks/useMobile";
import { useUIStore } from "../../store/useUIStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const sidebarOpen = useUIStore((state: any) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state: any) => state.setSidebarOpen);
  const toggleSidebar = useUIStore((state: any) => state.toggleSidebar);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile, setSidebarOpen]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      maxHeight: "100vh",
      overflow: "hidden",
      backgroundColor: "#050811",
    }}>
      <Header showToggle onToggleSidebar={toggleSidebar} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main style={{
          flex: 1,
          padding: isMobile ? "1rem 0.75rem" : "2rem",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "1.25rem" : "2rem",
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

export default AdminLayout;

