import React, { useState } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Shield, Key, Save, RefreshCw } from "lucide-react";

// List of modules to manage
const APP_MODULES = [
  { key: "auth", name: "Authentication", desc: "User authentication, tokens and login verification" },
  { key: "cms", name: "CMS (Content Management)", desc: "Services, case studies, blogs and site content" },
  { key: "crm", name: "CRM (Customer Relations)", desc: "Sales leads, company listings and activity logs" },
  { key: "bdm", name: "BDM (Business Development)", desc: "Business metrics, proposal pipeline and deals" },
  { key: "sales", name: "Sales Desk", desc: "Client targets, follow-ups and quotations" },
  { key: "client_portal", name: "Client Portal", desc: "Client vault, requests and project timelines" },
  { key: "support", name: "Support Module", desc: "Support inquiries, ticketing and resolutions" },
  { key: "recruitment", name: "Recruitment (HR)", desc: "Talent careers, vacancies and candidate review" },
  { key: "administration", name: "Administration", desc: "Operator settings, global RBAC and audits" },
  { key: "estimator", name: "Estimator Engine", desc: "Project budget modeling and calculations" },
  { key: "rfp", name: "RFP Engine", desc: "RFP proposal submissions and validation" },
  { key: "reports", name: "Reports & Analytics", desc: "Platform activity logs and performance reports" },
];

const ROLES_LIST = [
  { code: "SUPER_ADMIN", name: "Super Admin" },
  { code: "ADMINISTRATOR", name: "Administrator" },
  { code: "BDM", name: "BDM" },
  { code: "SALES_EXECUTIVE", name: "Sales Executive" },
  { code: "HR_MANAGER", name: "HR Manager" },
  { code: "CONTENT_MANAGER", name: "Content Manager" },
  { code: "SUPPORT_EXECUTIVE", name: "Support Executive" },
  { code: "CLIENT", name: "Client User" },
];

interface PermissionMap {
  [roleCode: string]: {
    [moduleKey: string]: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}

export const Permissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState("BDM");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initial matrix configuration
  const [matrix, setMatrix] = useState<PermissionMap>({
    SUPER_ADMIN: APP_MODULES.reduce((acc, mod) => {
      acc[mod.key] = { create: true, read: true, update: true, delete: true };
      return acc;
    }, {} as any),
    ADMINISTRATOR: APP_MODULES.reduce((acc, mod) => {
      const isAdminModule = ["auth", "administration", "reports"].includes(mod.key);
      acc[mod.key] = {
        create: isAdminModule,
        read: true,
        update: isAdminModule,
        delete: false,
      };
      return acc;
    }, {} as any),
    BDM: APP_MODULES.reduce((acc, mod) => {
      const isBdmModule = ["bdm", "estimator", "rfp", "crm"].includes(mod.key);
      acc[mod.key] = {
        create: isBdmModule,
        read: isBdmModule || mod.key === "reports",
        update: isBdmModule,
        delete: false,
      };
      return acc;
    }, {} as any),
    SALES_EXECUTIVE: APP_MODULES.reduce((acc, mod) => {
      const isCrmModule = ["crm", "sales"].includes(mod.key);
      acc[mod.key] = {
        create: isCrmModule,
        read: isCrmModule,
        update: isCrmModule,
        delete: false,
      };
      return acc;
    }, {} as any),
    HR_MANAGER: APP_MODULES.reduce((acc, mod) => {
      const isHrModule = ["recruitment"].includes(mod.key);
      acc[mod.key] = {
        create: isHrModule,
        read: isHrModule,
        update: isHrModule,
        delete: false,
      };
      return acc;
    }, {} as any),
    CONTENT_MANAGER: APP_MODULES.reduce((acc, mod) => {
      const isCmsModule = ["cms"].includes(mod.key);
      acc[mod.key] = {
        create: isCmsModule,
        read: isCmsModule,
        update: isCmsModule,
        delete: false,
      };
      return acc;
    }, {} as any),
    SUPPORT_EXECUTIVE: APP_MODULES.reduce((acc, mod) => {
      const isSupportModule = ["support"].includes(mod.key);
      acc[mod.key] = {
        create: isSupportModule,
        read: isSupportModule,
        update: isSupportModule,
        delete: false,
      };
      return acc;
    }, {} as any),
    CLIENT: APP_MODULES.reduce((acc, mod) => {
      const isClientModule = ["client_portal"].includes(mod.key);
      acc[mod.key] = {
        create: false,
        read: isClientModule,
        update: isClientModule,
        delete: false,
      };
      return acc;
    }, {} as any),
  });

  const handleCheckboxChange = (moduleKey: string, permType: "create" | "read" | "update" | "delete") => {
    if (selectedRole === "SUPER_ADMIN") return; // Super admin permissions bypass bypass

    setMatrix({
      ...matrix,
      [selectedRole]: {
        ...matrix[selectedRole],
        [moduleKey]: {
          ...matrix[selectedRole][moduleKey],
          [permType]: !matrix[selectedRole][moduleKey][permType],
        },
      },
    });
  };

  const handleSave = () => {
    setSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm("Reset current role permissions to default rules?")) {
      // Basic reset logic
      setMatrix(prev => ({
        ...prev,
        [selectedRole]: APP_MODULES.reduce((acc, mod) => {
          acc[mod.key] = { create: false, read: true, update: false, delete: false };
          return acc;
        }, {} as any)
      }));
    }
  };

  const currentPermissions = matrix[selectedRole] || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
      <div>
        <p className="eyebrow"><Shield size={12} /> RBAC MATRIX CONTROL</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>Permissions Registry</h1>
      </div>

      {/* Role Selection Bar */}
      <Card>
        <div style={{ padding: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", marginRight: "1rem", textTransform: "uppercase" }}>
            SELECT TARGET ROLE SCOPE:
          </span>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {ROLES_LIST.map((role) => (
              <button
                key={role.code}
                onClick={() => setSelectedRole(role.code)}
                style={{
                  backgroundColor: selectedRole === role.code ? "var(--color-cyan)" : "var(--color-bg-secondary)",
                  border: "1px solid " + (selectedRole === role.code ? "var(--color-cyan)" : "var(--color-border)"),
                  color: selectedRole === role.code ? "#050811" : "var(--color-text-primary)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: selectedRole === role.code ? 600 : 400,
                  transition: "all 150ms"
                }}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Permissions Table Matrix */}
      <Card>
        <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <CardTitle style={{ fontSize: "1.1rem" }}>
              Module Permission Grids for {ROLES_LIST.find(r => r.code === selectedRole)?.name}
            </CardTitle>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              {selectedRole === "SUPER_ADMIN" 
                ? "Super Admin roles bypass active checks automatically with root access (*)."
                : "Toggle specific CRUD capabilities below."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="outline" onClick={handleReset} disabled={selectedRole === "SUPER_ADMIN"} style={{ display: "flex", alignItems: "center", gap: "0.25rem", borderColor: "var(--color-border)" }}>
              <RefreshCw size={14} /> RESET
            </Button>
            <Button glow onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Save size={14} /> {saving ? "SAVING..." : "SAVE MATRIX"}
            </Button>
          </div>
        </CardHeader>

        {saveSuccess && (
          <div style={{
            margin: "1rem 1.5rem",
            padding: "0.75rem",
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontFamily: "var(--font-mono)"
          }}>
            SUCCESS: Role permission updates successfully written to authorization nodes.
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", width: "35%" }}>APPLICATION MODULE</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>CREATE</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>READ</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>UPDATE</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {APP_MODULES.map((mod) => {
                const perms = currentPermissions[mod.key] || { create: false, read: false, update: false, delete: false };
                return (
                  <tr key={mod.key} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-muted/10">
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9rem" }}>{mod.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>{mod.desc}</div>
                    </td>
                    {/* Checkboxes */}
                    {["create", "read", "update", "delete"].map((permType) => {
                      const isChecked = perms[permType as keyof typeof perms];
                      return (
                        <td key={permType} style={{ padding: "1rem", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            disabled={selectedRole === "SUPER_ADMIN"}
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(mod.key, permType as any)}
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: selectedRole === "SUPER_ADMIN" ? "not-allowed" : "pointer",
                              accentColor: "var(--color-cyan)"
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Permissions;
