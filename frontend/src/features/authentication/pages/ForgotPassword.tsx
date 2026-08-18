import React, { useState } from "react";
import { Link } from "wouter";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <Card borderAccent style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Reset Security Key</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          We will issue a key reset signature link to your system address.
        </p>
      </div>

      {submitted ? (
        <div style={{ textAlign: "center" }}>
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
            TRANSMISSION SECURED // Check your inbox for reset instructions.
          </div>
          <Link href="/login">
            <span style={{ color: "#63f5e8", cursor: "pointer", textDecoration: "underline", fontSize: "0.875rem" }}>
              Return to Access Console
            </span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label htmlFor="email" style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@aurexion.io"
            />
          </div>

          <Button type="submit" glow style={{ width: "100%", marginTop: "1rem" }}>
            TRANSMIT RESET KEY
          </Button>

          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <Link href="/login">
              <span style={{ color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
                Cancel
              </span>
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
};

export default ForgotPassword;

