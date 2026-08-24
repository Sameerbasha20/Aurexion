import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import axiosClient from "../../../api/axiosClient";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await axiosClient.post("auth/reset-password/", {
        uid,
        token,
        new_password: password,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid or expired password reset link. Please request a new link.");
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
        <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600, color: "#f8fafc" }}>Set New Password</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: 1.5, maxWidth: "320px" }}>
          Configure a strong password with letters, numbers, and symbols.
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
            <span>PASSWORD UPDATED // Your credentials have been successfully reset.</span>
          </div>

          <Button onClick={() => setLocation("/login")} glow style={{ width: "100%", height: "46px" }}>
            SIGN IN WITH NEW PASSWORD
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div
              style={{
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontFamily: "IBM Plex Mono, monospace",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              htmlFor="password"
              style={{
                fontSize: "0.75rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#94a3b8",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              New Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "#64748b",
                  pointerEvents: "none",
                }}
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                fontSize: "0.75rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#94a3b8",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Confirm New Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "#64748b",
                  pointerEvents: "none",
                }}
              />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
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

          <Button type="submit" glow style={{ width: "100%", height: "46px", marginTop: "4px" }}>
            Update Password
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

export default ResetPassword;

