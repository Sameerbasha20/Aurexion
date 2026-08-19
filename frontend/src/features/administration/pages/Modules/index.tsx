import React, { useState } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { FolderLock, Power, Edit2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";

interface SystemModule {
  key: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  assignedRoles: string[];
  lastUpdated: string;
}

export const Modules: React.FC = () => {
  const [modules, setModules] = useState<SystemModule[]>([
    { key: "auth", name: "Authentication", description: "User session verification, OTP validations and role-based redirects.", status: "ACTIVE", assignedRoles: ["ADMIN", "BDM", "CLIENT", "SALES_EXECUTIVE", "HR_MANAGER", "CONTENT_MANAGER", "SUPPORT_EXECUTIVE"], lastUpdated: "Aug 14, 2026" },
    { key: "cms", name: "CMS Console", description: "Public marketing pages content engine, services catalog, and case study files.", status: "ACTIVE", assignedRoles: ["ADMIN", "CONTENT_MANAGER"], lastUpdated: "Aug 12, 2026" },
    { key: "crm", name: "CRM Leads Core", description: "Central lead registration, qualification pipelines, opportunity matrix, and audits.", status: "ACTIVE", assignedRoles: ["ADMIN", "SALES_EXECUTIVE", "BDM"], lastUpdated: "Aug 15, 2026" },
    { key: "bdm", name: "BDM Portal", description: "Deals pipeline analytics, conversion indicators, and management operations dashboard.", status: "ACTIVE", assignedRoles: ["ADMIN", "BDM"], lastUpdated: "Aug 15, 2026" },
    { key: "sales", name: "Sales Executive Desk", description: "Assigned customer leads, activity logs, follow-up calls, and registration files.", status: "ACTIVE", assignedRoles: ["ADMIN", "SALES_EXECUTIVE"], lastUpdated: "Aug 11, 2026" },
    { key: "portal", name: "Client Portal", description: "Secure external workspace client vault, project tracking, and request channels.", status: "ACTIVE", assignedRoles: ["ADMIN", "CLIENT"], lastUpdated: "Aug 10, 2026" },
    { key: "support", name: "Support ticketing", description: "Internal client issue ticketing, ticket assignment, priorities, and resolutions ledger.", status: "ACTIVE", assignedRoles: ["ADMIN", "SUPPORT_EXECUTIVE"], lastUpdated: "Aug 13, 2026" },
    { key: "recruitment", name: "Recruitment (HR)", description: "Careers vacancies registry, candidate directory, and application stage transitioner.", status: "ACTIVE", assignedRoles: ["ADMIN", "HR_MANAGER"], lastUpdated: "Aug 14, 2026" },
    { key: "administration", name: "Platform Administration", description: "Global configuration parameters, user directories, and system-wide settings.", status: "ACTIVE", assignedRoles: ["ADMIN"], lastUpdated: "Aug 15, 2026" },
    { key: "estimator", name: "Estimator engine", description: "Cost estimation calculator models, spreadsheet exports, and budget valuations.", status: "ACTIVE", assignedRoles: ["ADMIN", "BDM"], lastUpdated: "Aug 15, 2026" },
    { key: "rfp", name: "RFP Submissions", description: "Secure proposal storage, review processes, validation mechanisms, and submissions.", status: "ACTIVE", assignedRoles: ["ADMIN", "BDM"], lastUpdated: "Aug 09, 2026" },
    { key: "reports", name: "Reports & Analytics", desc: "Interactive performance reporting, traffic analytics, logs and charts.", status: "ACTIVE", assignedRoles: ["ADMIN"], lastUpdated: "Aug 15, 2026" },
  ] as any[]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<SystemModule | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);

  const handleToggleModule = (key: string) => {
    setModules(modules.map(mod => {
      if (mod.key === key) {
        const nextStatus = mod.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        return {
          ...mod,
          status: nextStatus,
          lastUpdated: new Date().toLocaleDateString()
        };
      }
      return mod;
    }));
  };

  const handleOpenEditDialog = (mod: SystemModule) => {
    setSelectedModule(mod);
    setTempRoles([...mod.assignedRoles]);
    setEditDialogOpen(true);
  };

  const handleToggleRole = (role: string) => {
    if (tempRoles.includes(role)) {
      setTempRoles(tempRoles.filter(r => r !== role));
    } else {
      setTempRoles([...tempRoles, role]);
    }
  };

  const handleSaveRoles = () => {
    if (selectedModule) {
      setModules(modules.map(mod => {
        if (mod.key === selectedModule.key) {
          return {
            ...mod,
            assignedRoles: tempRoles,
            lastUpdated: new Date().toLocaleDateString()
          };
        }
        return mod;
      }));
    }
    setEditDialogOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
      <div>
        <p className="eyebrow"><FolderLock size={12} /> SYSTEM INSTANCE SERVICES</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>Module Management</h1>
      </div>

      {/* Modules Table Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: "1.1rem" }}>Aurexion Platform Modules Registry</CardTitle>
        </CardHeader>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", width: "30%" }}>MODULE NAME</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STATUS</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>ASSIGNED ACCESS ROLES</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>LAST UPDATED</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod.key} style={{ borderBottom: "1px solid var(--color-border)", opacity: mod.status === "INACTIVE" ? 0.65 : 1, transition: "opacity 150ms" }} className="hover:bg-muted/10">
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9rem" }}>{mod.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.2rem", lineHeight: 1.4 }}>{mod.description}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: mod.status === "ACTIVE" ? "#10b981" : "#ef4444"
                    }}>{mod.status}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", maxWidth: "300px" }}>
                      {mod.assignedRoles.map(role => (
                        <span key={role} style={{
                          fontSize: "0.65rem",
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-primary)",
                          backgroundColor: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--color-border)",
                          padding: "0.1rem 0.3rem",
                          borderRadius: "3px"
                        }}>{role}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                    {mod.lastUpdated}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        aria-label={mod.status === "ACTIVE" ? "Disable Module" : "Enable Module"}
                        onClick={() => handleToggleModule(mod.key)}
                        title={mod.status === "ACTIVE" ? "Disable Module" : "Enable Module"}
                        style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0.25rem" }}
                        onMouseOver={(e) => e.currentTarget.style.color = mod.status === "ACTIVE" ? "#ef4444" : "#10b981"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                        onFocus={(e) => e.currentTarget.style.color = mod.status === "ACTIVE" ? "#ef4444" : "#10b981"}
                        onBlur={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label="Edit Roles"
                        onClick={() => handleOpenEditDialog(mod)}
                        title="Edit Roles"
                        style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0.25rem" }}
                        onMouseOver={(e) => e.currentTarget.style.color = "var(--color-cyan)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                        onFocus={(e) => e.currentTarget.style.color = "var(--color-cyan)"}
                        onBlur={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Roles Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", maxWidth: "400px" }}>
          <DialogHeader style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
            <DialogTitle style={{ fontSize: "1.25rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Edit Allowed Roles
            </DialogTitle>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              Define which roles possess validation scopes for {selectedModule?.name}.
            </span>
          </DialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "1rem 0" }}>
            {["ADMIN", "BDM", "CLIENT", "SALES_EXECUTIVE", "HR_MANAGER", "CONTENT_MANAGER", "SUPPORT_EXECUTIVE"].map((role) => {
              const isChecked = tempRoles.includes(role);
              return (
                <div key={role} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="checkbox"
                    id={`role-check-${role}`}
                    checked={isChecked}
                    onChange={() => handleToggleRole(role)}
                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--color-cyan)" }}
                  />
                  <label htmlFor={`role-check-${role}`} style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", cursor: "pointer" }}>
                    {role}
                  </label>
                </div>
              );
            })}
          </div>

          <DialogFooter style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>CANCEL</Button>
            <Button glow onClick={handleSaveRoles}>SAVE ROLES</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Modules;
