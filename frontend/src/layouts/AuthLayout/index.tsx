import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#050811",
    }}>
      <Header />
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
      }}>
        {/* Subtle luminous background aura */}
        <div style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          backgroundColor: "rgba(99, 245, 232, 0.03)",
          filter: "blur(60px)",
          pointerEvents: "none",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "440px" }}>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
