import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import axiosClient from "../../../api/axiosClient";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosClient.post<{ detail?: string; reset_link?: string; data?: { reset_link?: string } }, { detail?: string; reset_link?: string; data?: { reset_link?: string } }>("auth/forgot-password/", { email });
      const resetUrl = res?.reset_link || res?.data?.reset_link || null;
      setResetLink(resetUrl);
      setSubmitted(true);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.detail || err?.response?.data?.error || err?.message || "No registered account found with this email address. Please check and try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
        <img src="/images/logo.svg" alt="Aurexion" style={{ width: "44px", height: "44px" }} />
        <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600, color: "#f8fafc" }}>Reset Password</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: 1.5, maxWidth: "320px" }}>
          Enter your registered email address and we'll send you a password reset link.
        </p>
      </div>

      {submitted ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "center" }}>
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
            <span>RESET LINK DISPATCHED // Registered user verified ({email}). Password reset link has been sent.</span>
          </div>

          {resetLink && (
            <a
              href={resetLink}
              style={{ textDecoration: "none" }}
            >
              <Button glow style={{ width: "100%", height: "46px", backgroundColor: "#22c55e", color: "#ffffff" }}>
                <ExternalLink size={16} style={{ marginRight: "0.5rem" }} /> SET NEW PASSWORD NOW
              </Button>
            </a>
          )}

          <Link href="/login">
            <Button variant="outline" style={{ width: "100%", height: "46px" }}>
              RETURN TO LOGIN
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div
              style={{
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              htmlFor="email"
              style={{
                fontSize: "0.75rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#94a3b8",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "#64748b",
                  pointerEvents: "none",
                }}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px 0 38px",
                  borderRadius: "6px",
                  backgroundColor: "#050811",
                  border: "1px solid #1e293b",
                  color: "#eef4f3",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 150ms, box-shadow 150ms",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#63f5e8";
                  e.target.style.boxShadow = "0 0 0 1px rgba(99, 245, 232, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1e293b";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <Button type="submit" glow style={{ width: "100%", height: "46px", marginTop: "4px" }} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
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
        </form>
      )}
    </Card>
  );
};

export default ForgotPassword;

