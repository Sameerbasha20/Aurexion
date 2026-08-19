import React from "react";
import { Link } from "wouter";
import { useLeads } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const Quotations: React.FC = () => {
  const { leads, isLoading, error, refetch } = useLeads();

  // Filter real leads that are in proposal/negotiation stage
  const proposalLeads = leads.filter((l) =>
    ["PROPOSAL", "NEGOTIATION", "QUALIFIED"].includes(l.status?.toUpperCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>COMMERCIAL PROPOSALS & QUOTATIONS</p>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Quotations & Proposals Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/crm/leads">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <TrendingUp size={14} /> Leads Funnel
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend API Status Alert */}
      <Card
        style={{
          padding: "1.5rem",
          borderColor: "rgba(99, 245, 232, 0.3)",
          backgroundColor: "rgba(99, 245, 232, 0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <AlertCircle size={24} color="#63f5e8" style={{ marginTop: "0.2rem" }} />
          <div>
            <h3 style={{ fontSize: "1.05rem", margin: "0 0 0.4rem 0", color: "#f8fafc" }}>
              Quotation API Status Report
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.6 }}>
              Direct Quotation CRUD endpoints are not currently exposed in the backend CRM API. In accordance with the system specification, proposal and deal negotiation states are synchronized via the Lead Lifecycle Pipeline (<code style={{ color: "#63f5e8" }}>PROPOSAL</code> &amp; <code style={{ color: "#63f5e8" }}>NEGOTIATION</code> stages).
            </p>
          </div>
        </div>
      </Card>

      {/* Active Proposal Stage Leads */}
      <div>
        <h2 style={{ fontSize: "1.3rem", margin: "0 0 1rem 0", color: "#f8fafc" }}>
          Active Proposal &amp; Negotiation Deals
        </h2>

        {isLoading ? (
          <Card style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              SYNCING PROPOSAL PIPELINE...
            </p>
          </Card>
        ) : proposalLeads.length === 0 ? (
          <Card style={{ padding: "3rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <FileText size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No leads in Proposal stage</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Move qualified leads to Proposal/Negotiation stage in the Leads Funnel.
            </p>
            <Link href="/crm/leads">
              <Button glow>Open Leads Funnel</Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
            {proposalLeads.map((lead) => (
              <Card key={lead.id} glowOnHover style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                      {lead.reference_id || `#LD-${lead.id}`}
                    </span>
                    <h3 style={{ fontSize: "1.15rem", margin: "0.2rem 0 0 0", color: "#f8fafc" }}>
                      {lead.company || lead.name}
                    </h3>
                  </div>
                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "2px",
                      fontSize: "0.68rem",
                      fontFamily: "IBM Plex Mono, monospace",
                      backgroundColor: "rgba(129, 140, 248, 0.15)",
                      color: "#818cf8",
                    }}
                  >
                    {lead.status_display || lead.status}
                  </span>
                </div>

                <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: "1rem" }}>
                  Contact: <strong style={{ color: "#f8fafc" }}>{lead.name}</strong> ({lead.email})
                </div>

                {lead.description && (
                  <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 1rem 0", lineHeight: 1.4 }}>
                    {lead.description}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid rgba(140, 174, 187, 0.15)" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                    Assigned: {lead.assigned_to_name || "Unassigned"}
                  </span>
                  <Link href={`/crm/leads/${lead.id}`}>
                    <Button variant="outline" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>
                      Manage Proposal <ArrowUpRight size={12} style={{ marginLeft: "0.25rem" }} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotations;
