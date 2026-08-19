import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import Card, { CardContent } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Shield, Key, Users, ArrowRight } from "lucide-react";
import administrationService from "../../services/administrationService";

interface RoleItem {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: any[];
}

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const data = await administrationService.getRoles();
        if (data && data.length > 0) {
          setRoles(data);
        } else {
          throw new Error("No roles found");
        }
      } catch (err) {
        // Fallback comprehensive roles list based on project specifications
        setRoles([
          { id: "1", code: "SUPER_ADMIN", name: "Super Admin", description: "Global systems operator. Complete read/write/delete permissions map bypass.", permissions: ["*"] },
          { id: "2", code: "ADMINISTRATOR", name: "Administrator", description: "System operator with user and role management access capabilities.", permissions: ["read:users", "write:users", "read:roles", "write:roles", "read:audit"] },
          { id: "3", code: "BDM", name: "Business Development Manager", description: "Business development manager overseeing leads, RFP, estimator and contract valuations.", permissions: ["read:leads", "write:leads", "read:opportunities", "write:opportunities", "read:rfp", "write:rfp", "read:estimator", "write:estimator"] },
          { id: "4", code: "SALES_EXECUTIVE", name: "Sales Executive", description: "Sales representative managing contacts, company pipelines, activities, and follow-ups.", permissions: ["read:leads", "write:leads", "read:contacts", "write:contacts", "read:companies", "write:companies"] },
          { id: "5", code: "HR_MANAGER", name: "HR / Recruitment Manager", description: "Human Resource manager controlling careers board, job vacancies, and applicant stages.", permissions: ["read:jobs", "write:jobs", "read:candidates", "write:candidates", "read:applications", "write:applications"] },
          { id: "6", code: "CONTENT_MANAGER", name: "Content Manager", description: "CMS content publisher publishing services catalog, blog articles, and case studies.", permissions: ["read:services", "write:services", "read:case-studies", "write:case-studies", "read:blog", "write:blog"] },
          { id: "7", code: "SUPPORT_EXECUTIVE", name: "Support Executive", description: "Support desk engineer responding to client tickets and updating resolutions.", permissions: ["read:tickets", "write:tickets", "assign:tickets"] },
          { id: "8", code: "CLIENT", name: "Client User", description: "External company partner reviewing project timelines, document vaults, and ticket status.", permissions: ["read:projects", "write:requests", "read:documents"] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title & Description */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow"><Shield size={12} /> RBAC MATRIX CONTROL</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>System Roles</h1>
        </div>
        <Link href="/admin/permissions">
          <Button glow style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Key size={16} /> PERMISSIONS MATRIX
          </Button>
        </Link>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
          RESOLVING ROLE CONFIG MATRIX...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="grid-responsive">
          {roles.map((r) => (
            <Card key={r.code} glowOnHover>
              <CardContent style={{ padding: "1.5rem", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--color-cyan)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                      {r.name}
                    </h3>
                    <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                      CODE: {r.code}
                    </span>
                  </div>
                  
                  <p style={{ margin: "0.5rem 0 1.25rem 0", color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {r.description}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                      GRANTED SCOPES ({r.permissions.length === 1 && r.permissions[0] === "*" ? "ALL ACCESS" : r.permissions.length}):
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {r.permissions.map((ruleItem: any, idx) => {
                        const label = typeof ruleItem === "string" ? ruleItem : (ruleItem && typeof ruleItem === "object" ? (ruleItem.module ? `${ruleItem.module}` : JSON.stringify(ruleItem)) : String(ruleItem || ""));
                        return (
                          <code key={typeof ruleItem === "string" ? ruleItem : idx} style={{
                            backgroundColor: "var(--color-bg-primary)",
                            border: "1px solid var(--color-border)",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            color: "var(--color-text-primary)",
                            fontSize: "0.75rem",
                            fontFamily: "var(--font-mono)"
                          }}>{label}</code>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-text-muted)" }}>
                    <Users size={12} /> Access Control Scope
                  </span>
                  <Link href="/admin/permissions">
                    <span style={{ fontSize: "0.8rem", color: "var(--color-cyan)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      Configure Map <ArrowRight size={14} />
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Roles;
