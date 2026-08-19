import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";

export const VerifyEmail: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [, setLocation] = useLocation();

  const handleVerify = () => {
    setVerified(true);
  };

  return (
    <Card
      borderAccent
      style={{
        width: "100%",
        padding: "36px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        boxSizing: "border-box",
        backgroundColor: "#080e1a",
        borderRadius: "12px",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
        <img src="/logo.svg" alt="Aurexion" style={{ width: "44px", height: "44px" }} />
        <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600, color: "#f8fafc" }}>Verify Email Address</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: 1.5, maxWidth: "320px" }}>
          Establish identity and domain verification for your account.
        </p>
      </div>

      {verified ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.06)",
              border: "1px solid rgba(99, 245, 232, 0.25)",
              padding: "1.25rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontFamily: "IBM Plex Mono, monospace",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              lineHeight: 1.5,
            }}
          >
            <CheckCircle2 size={24} style={{ color: "#63f5e8" }} />
            <span>EMAIL VERIFIED // Your account security trust is now active.</span>
          </div>

          <Button onClick={() => setLocation("/login")} glow style={{ width: "100%", height: "46px" }}>
            GO TO LOGIN
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              backgroundColor: "rgba(99, 245, 232, 0.03)",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textAlign: "left",
            }}
          >
            <ShieldCheck size={20} style={{ color: "#63f5e8", flexShrink: 0 }} />
            <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
              Click below to complete email verification and activate your session.
            </span>
          </div>

          <Button onClick={handleVerify} glow style={{ width: "100%", height: "46px" }}>
            VERIFY EMAIL
          </Button>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
            <Link href="/login">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "color 150ms",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#63f5e8")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                <ArrowLeft size={15} />
                Back to Login
              </span>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VerifyEmail;

