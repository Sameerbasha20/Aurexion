import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { 
  Sliders, 
  ShieldCheck, 
  Key, 
  Bell, 
  Globe, 
  Save 
} from "lucide-react";

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"GENERAL" | "SECURITY" | "RBAC" | "NOTIF" | "PREFS">("GENERAL");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [appName, setAppName] = useState("Aurexion Platform Admin Engine");
  const [defaultTheme, setDefaultTheme] = useState("CYAN_DARK");
  const [mfaRequired, setMfaRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30 mins");
  const [defaultSignupRole, setDefaultSignupRole] = useState("CLIENT");
  const [enableRecaptcha, setEnableRecaptcha] = useState(true);
  const [smtpHost, setSmtpHost] = useState("smtp.sendgrid.net");
  const [smtpPort, setSmtpPort] = useState("587");
  const [rateLimit, setRateLimit] = useState("100 requests / minute");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const tabs = [
    { key: "GENERAL", name: "General Instance", icon: Sliders },
    { key: "SECURITY", name: "Security & Auth", icon: ShieldCheck },
    { key: "RBAC", name: "Access Management", icon: Key },
    { key: "NOTIF", name: "Dispatch & SMTP", icon: Bell },
    { key: "PREFS", name: "System Constants", icon: Globe },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <p className="eyebrow" style={{ margin: 0 }}>PLATFORM GOVERNANCE</p>
        <h1 style={{ fontSize: "2rem", margin: "0.25rem 0 0 0", letterSpacing: "-0.03em" }}>
          System Parameters &amp; Configurations
        </h1>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          Configure enterprise operational variables, access rules, security parameters, and communication bridges.
        </span>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.5rem", alignItems: "start" }}>
        
        {/* Left Side: Tabs Navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  textAlign: "left",
                  border: "1px solid " + (isActive ? "var(--color-cyan)" : "transparent"),
                  backgroundColor: isActive ? "rgba(99, 245, 232, 0.05)" : "transparent",
                  color: isActive ? "var(--color-cyan)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 150ms"
                }}
              >
                <TabIcon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Form Content */}
        <Card borderAccent>
          <form onSubmit={handleSave}>
            <CardHeader style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle style={{ fontSize: "1.1rem" }}>
                {tabs.find(t => t.key === activeTab)?.name}
              </CardTitle>
              <Button glow type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Save size={14} /> {saving ? "SAVING..." : "SAVE CONFIG"}
              </Button>
            </CardHeader>

            {saveSuccess && (
              <div style={{
                margin: "1rem 1.5rem 0 1.5rem",
                padding: "0.75rem",
                backgroundColor: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontFamily: "var(--font-mono)"
              }}>
                SUCCESS: Central system parameters successfully updated.
              </div>
            )}

            <CardContent style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {activeTab === "GENERAL" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="app-instance-title" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>APPLICATION INSTANCE TITLE</label>
                    <input
                      id="app-instance-title"
                      type="text"
                      required
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      style={{
                        backgroundColor: "var(--color-bg-primary)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        outline: "none",
                        maxWidth: "400px"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="default-portal-theme" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>DEFAULT PORTAL THEME</label>
                    <select
                      id="default-portal-theme"
                      value={defaultTheme}
                      onChange={(e) => setDefaultTheme(e.target.value)}
                      style={{
                        backgroundColor: "var(--color-bg-primary)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        outline: "none",
                        maxWidth: "400px"
                      }}
                    >
                      <option value="CYAN_DARK">Cyan &amp; Dark Slate (Default)</option>
                      <option value="MIDNIGHT_BLUE">Midnight Enterprise Blue</option>
                      <option value="HIGH_CONTRAST">High Contrast Monochrome</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === "SECURITY" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <input
                      type="checkbox"
                      id="mfa"
                      checked={mfaRequired}
                      onChange={(e) => setMfaRequired(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--color-cyan)" }}
                    />
                    <label htmlFor="mfa" style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", cursor: "pointer" }}>
                      Enforce Multi-Factor Authentication (MFA) for Administrative roles
                    </label>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="session-timeout" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>SESSION TIMEOUT CAPABILITY</label>
                    <select
                      id="session-timeout"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      style={{
                        backgroundColor: "var(--color-bg-primary)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        outline: "none",
                        maxWidth: "400px"
                      }}
                    >
                      <option value="15 mins">15 minutes</option>
                      <option value="30 mins">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="8 hours">8 hours</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === "RBAC" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="default-signup-role" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>DEFAULT USER SIGNUP ROLE</label>
                    <select
                      id="default-signup-role"
                      value={defaultSignupRole}
                      onChange={(e) => setDefaultSignupRole(e.target.value)}
                      style={{
                        backgroundColor: "var(--color-bg-primary)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        outline: "none",
                        maxWidth: "400px"
                      }}
                    >
                      <option value="CLIENT">Client User</option>
                      <option value="SALES_EXECUTIVE">Sales Executive</option>
                      <option value="USER">Public User</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <input
                      type="checkbox"
                      id="recaptcha"
                      checked={enableRecaptcha}
                      onChange={(e) => setEnableRecaptcha(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--color-cyan)" }}
                    />
                    <label htmlFor="recaptcha" style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", cursor: "pointer" }}>
                      Activate Google reCAPTCHA v3 verification during platform registers
                    </label>
                  </div>
                </>
              )}

              {activeTab === "NOTIF" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", maxWidth: "400px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label htmlFor="smtp-gateway-host" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>SMTP GATEWAY HOST</label>
                      <input
                        id="smtp-gateway-host"
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        style={{
                          backgroundColor: "var(--color-bg-primary)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-primary)",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "6px",
                          outline: "none"
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label htmlFor="smtp-gateway-port" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>PORT</label>
                      <input
                        id="smtp-gateway-port"
                        type="text"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        style={{
                          backgroundColor: "var(--color-bg-primary)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-primary)",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "6px",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "PREFS" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="api-gateway-rate-limit" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>API GATEWAY RATE LIMIT</label>
                    <input
                      id="api-gateway-rate-limit"
                      type="text"
                      value={rateLimit}
                      onChange={(e) => setRateLimit(e.target.value)}
                      style={{
                        backgroundColor: "var(--color-bg-primary)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        outline: "none",
                        maxWidth: "400px"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="audit-log-retention" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>AUDIT LOG RETENTION SCHEDULE</label>
                    <select
                      id="audit-log-retention"
                      defaultValue="365"
                      style={{
                        backgroundColor: "var(--color-bg-primary)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        outline: "none",
                        maxWidth: "400px"
                      }}
                    >
                      <option value="90">90 Days</option>
                      <option value="180">180 Days</option>
                      <option value="365">1 Year (365 Days)</option>
                      <option value="730">2 Years (Statutory)</option>
                    </select>
                  </div>
                </>
              )}

            </CardContent>
          </form>
        </Card>

      </div>
    </div>
  );
};

export default Settings;
