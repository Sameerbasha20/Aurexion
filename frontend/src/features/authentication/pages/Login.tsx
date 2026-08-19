import React, { useState } from "react";
import { useLocation } from "wouter";
import useAuth from "../../../hooks/useAuth";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("administrator");
  const [password, setPassword] = useState("Admin@2026");
  const [role, setRole] = useState("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = "Please enter your username or email address.";
    }
    if (!password) {
      errors.password = "Please enter your password.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      await login(username, password);
      
      // Redirect based on role
      const upperRole = role.toUpperCase();
      if (upperRole === "ADMIN") {
        setLocation("/admin/dashboard");
      } else if (upperRole === "BDM") {
        setLocation("/bdm/dashboard");
      } else if (upperRole === "CLIENT") {
        setLocation("/portal/dashboard");
      } else if (upperRole === "SALES") {
        setLocation("/crm/dashboard");
      } else if (upperRole === "HR") {
        setLocation("/recruitment/dashboard");
      } else if (upperRole === "CONTENT") {
        setLocation("/cms/dashboard");
      } else if (upperRole === "SUPPORT") {
        setLocation("/support/dashboard");
      } else {
        setLocation("/");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const resData = err?.response?.data;
      
      let errorMsg = "Invalid username or password. Please verify your credentials and selected role.";

      if (resData?.detail) {
        errorMsg = resData.detail;
      } else if (resData?.non_field_errors) {
        errorMsg = Array.isArray(resData.non_field_errors)
          ? resData.non_field_errors.join(", ")
          : String(resData.non_field_errors);
      } else if (resData?.error) {
        errorMsg = resData.error;
      } else if (resData?.message) {
        errorMsg = resData.message;
      } else if (typeof resData === "string") {
        errorMsg = resData;
      } else if (status === 400 || status === 401) {
        errorMsg = "Invalid username or password. Please verify your credentials and selected role.";
      } else if (err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
        errorMsg = "Unable to connect to the authentication server. Please ensure the backend is running.";
      }

      setError(errorMsg);
    }
  };

  const handleRoleSelect = (selectedRole: string, defaultUser: string, defaultPass: string) => {
    setRole(selectedRole);
    setUsername(defaultUser);
    setPassword(defaultPass);
    setError("");
    setFieldErrors({});
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (fieldErrors.username) {
      setFieldErrors((prev) => ({ ...prev, username: undefined }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <Card borderAccent style={{ width: "100%", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
        <img src="/logo.svg" alt="Aurexion" style={{ width: "48px", height: "48px" }} />
        <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600 }}>Access Scope Console</h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
          Authorize credentials to establish a secure session.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {error && (
          <div style={{
            color: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "0.85rem 1rem",
            borderRadius: "4px",
            fontSize: "0.85rem",
            fontFamily: "IBM Plex Mono, monospace",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            lineHeight: 1.4,
          }}>
            <AlertCircle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
            <span>ERROR // {error}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
            SELECT SYSTEM ROLE SCOPE
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {[
              ["ADMIN", "administrator", "Admin@2026"],
              ["BDM", "business_dev_manager", "Bdm@2026"],
              ["CLIENT", "client_user", "Client@2026"],
              ["SALES", "sales_executive", "Sales@2026"],
              ["HR", "hr_manager", "Hr@2026"],
              ["CONTENT", "content_manager", "Content@2026"],
              ["SUPPORT", "support_executive", "Support@2026"]
            ].map(([r, defaultUser, defaultPass]) => {
              const isSelected = role === r;
              const isSupport = r === "SUPPORT";
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r, defaultUser, defaultPass)}
                  style={{
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.68rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    borderRadius: "4px",
                    backgroundColor: isSelected ? "rgba(99, 245, 232, 0.1)" : "#050811",
                    border: isSelected ? "1px solid #63f5e8" : "1px solid #1e293b",
                    color: isSelected ? "#63f5e8" : "#cbd5e1",
                    cursor: "pointer",
                    transition: "all 150ms",
                    textAlign: "center",
                    gridColumn: isSupport ? "span 3" : undefined,
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label htmlFor="username" style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
            USERNAME OR EMAIL
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="e.g. administrator or user@aurexion.io"
            style={{
              width: "100%",
              height: "44px",
              padding: "0 0.75rem",
              borderRadius: "4px",
              backgroundColor: "#050811",
              border: fieldErrors.username ? "1px solid #ef4444" : "1px solid #1e293b",
              color: "#eef4f3",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 150ms",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              if (!fieldErrors.username) e.target.style.borderColor = "#63f5e8";
            }}
            onBlur={(e) => {
              if (!fieldErrors.username) e.target.style.borderColor = "#1e293b";
            }}
          />
          {fieldErrors.username && (
            <span style={{ fontSize: "0.75rem", color: "#ef4444", fontFamily: "IBM Plex Mono, monospace" }}>
              {fieldErrors.username}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="password" style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
              PASSWORD
            </label>
            <button
              type="button"
              onClick={() => setLocation("/forgot-password")}
              style={{ background: "none", border: "none", padding: 0, fontSize: "0.75rem", color: "#63f5e8", cursor: "pointer", textDecoration: "underline" }}
            >
              Forgot?
            </button>
          </div>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                height: "44px",
                padding: "0 2.5rem 0 0.75rem",
                borderRadius: "4px",
                backgroundColor: "#050811",
                border: fieldErrors.password ? "1px solid #ef4444" : "1px solid #1e293b",
                color: "#eef4f3",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 150ms",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!fieldErrors.password) e.target.style.borderColor = "#63f5e8";
              }}
              onBlur={(e) => {
                if (!fieldErrors.password) e.target.style.borderColor = "#1e293b";
              }}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <span style={{ fontSize: "0.75rem", color: "#ef4444", fontFamily: "IBM Plex Mono, monospace" }}>
              {fieldErrors.password}
            </span>
          )}
        </div>

        <Button type="submit" glow style={{ width: "100%", height: "46px", marginTop: "8px" }} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Card>
  );
};

export default Login;
