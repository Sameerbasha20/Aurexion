import React, { useState } from "react";
import { useLocation } from "wouter";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";

export const VerifyEmail: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [, setLocation] = useLocation();

  const handleVerify = () => {
    setVerified(true);
  };

  return (
    <Card borderAccent style={{ width: "100%", textAlign: "center" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Verify Security Domain</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Establish domain trust for this account address.
        </p>
      </div>

      {verified ? (
        <div>
          <div style={{
            color: "#63f5e8",
            backgroundColor: "rgba(99, 245, 232, 0.05)",
            border: "1px solid rgba(99, 245, 232, 0.15)",
            padding: "1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontFamily: "IBM Plex Mono, monospace",
            marginBottom: "1.5rem",
          }}>
            VERIFICATION COMPLETED // Domain scope is now active.
          </div>
          <Button onClick={() => setLocation("/login")} glow style={{ width: "100%" }}>
            ENTER SCOPE CONSOLE
          </Button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "1.5rem" }}>
            Click below to transmit confirmation payload to the verification server.
          </p>
          <Button onClick={handleVerify} glow style={{ width: "100%" }}>
            TRANSMIT VERIFICATION SIGNATURE
          </Button>
        </div>
      )}
    </Card>
  );
};

export default VerifyEmail;

