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
    const handleScrollOrHash = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
          return;
        }
      }
      window.scrollTo(0, 0);
    };

    handleScrollOrHash();

    window.addEventListener("popstate", handleScrollOrHash);
    window.addEventListener("hashchange", handleScrollOrHash);

    return () => {
      window.removeEventListener("popstate", handleScrollOrHash);
      window.removeEventListener("hashchange", handleScrollOrHash);
    };
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
