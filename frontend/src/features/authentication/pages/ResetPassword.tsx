import React, { useState } from "react";
import { useLocation } from "wouter";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirmPassword) {
      setSubmitted(true);
    }
  };

  return (
    <Card borderAccent style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Establish New Key</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Configure a secure password containing symbols, numbers, and capital letters.
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
            KEY CHANGE COMPLETED // Your access password is now updated.
          </div>
          <Button onClick={() => setLocation("/login")} glow style={{ width: "100%" }}>
            SIGN IN WITH NEW KEY
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label htmlFor="password" style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
              NEW ACCESS KEY
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label htmlFor="confirmPassword" style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
              CONFIRM NEW KEY
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" glow style={{ width: "100%", marginTop: "1rem" }}>
            REPLACE KEY
          </Button>
        </form>
      )}
    </Card>
  );
};

export default ResetPassword;

