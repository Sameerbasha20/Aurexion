import React, { useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "../../features/public/components/Navbar";
import Footer from "../../features/public/components/Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", background: "#050811" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
