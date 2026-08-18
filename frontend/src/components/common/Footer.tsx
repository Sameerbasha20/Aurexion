import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: "1px solid #1e293b",
      padding: "2rem 1.5rem",
      backgroundColor: "#050811",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      marginTop: "auto",
      width: "100%",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        fontSize: "0.875rem",
        color: "#94a3b8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/logo.svg" alt="Aurexion" style={{ width: "20px", height: "20px" }} />
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, color: "#f8fafc" }}>AUREXION</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Support</span>
        </div>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
        fontSize: "0.75rem",
        color: "#64748b",
        fontFamily: "IBM Plex Mono, monospace",
      }}>
        <span>© {new Date().getFullYear()} AUREXION. All rights reserved.</span>
        <span>Secure Session Scope / MD-SIG-01</span>
      </div>
    </footer>
  );
};

export default Footer;
