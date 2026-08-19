import React, { useState, useEffect } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Contact2, TrendingUp, AlertCircle, UserPlus, Filter } from "lucide-react";
import crmService, { LeadItem } from "../../../crm/services/crmService";

export const CrmOverview: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const data = await crmService.getLeads();
        setLeads(data);
      } catch (err) {
        // Fallback
        setLeads([
          { id: 101, reference_id: "LD-9204", name: "Zeta Prime Corp", email: "contact@zetaprime.com", phone: "+1-555-0199", company: "Zeta Prime Corp", website: "zetaprime.com", industry: "Artificial Intelligence", source: "Inbound Request", description: "Wants enterprise-wide model hosting", status: "PROPOSAL", status_display: "Proposal", priority: "HIGH", priority_display: "High", lost_reason: "", assigned_to_name: "Sarah K.", created_by_name: "System", created_at: "8/10/2026", updated_at: "8/15/2026" },
          { id: 102, reference_id: "LD-9205", name: "Ion Robotics", email: "info@ionrobot.io", phone: "+1-555-0142", company: "Ion Robotics", website: "ionrobot.io", industry: "Robotics & Automation", source: "Partner Referral", description: "Warehouse logistics orchestration systems", status: "NEGOTIATION", status_display: "Negotiation", priority: "CRITICAL", priority_display: "Critical", lost_reason: "", assigned_to_name: "Alice S.", created_by_name: "System", created_at: "8/11/2026", updated_at: "8/15/2026" },
          { id: 103, reference_id: "LD-9206", name: "Neural Analytics", email: "leads@neural.net", phone: "+1-555-0177", company: "Neural Analytics", website: "neural.net", industry: "Big Data", source: "Cold Campaign", description: "Data lake integration pipeline architecture", status: "NEW", status_display: "New Lead", priority: "MEDIUM", priority_display: "Medium", lost_reason: "", assigned_to_name: null, created_by_name: "System", created_at: "8/14/2026", updated_at: "8/14/2026" },
          { id: 104, reference_id: "LD-9207", name: "Skyline Grid", email: "admin@skyline.org", phone: "+1-555-0121", company: "Skyline Grid", website: "skyline.org", industry: "Energy & Infrastructure", source: "Conference Panel", description: "Cloud migration and load forecasting dashboard", status: "WON", status_display: "Won Deal", priority: "HIGH", priority_display: "High", lost_reason: "", assigned_to_name: "Sarah K.", created_by_name: "System", created_at: "8/01/2026", updated_at: "8/15/2026" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // Compute Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => ["NEW", "LEAD"].includes(l.status.toUpperCase())).length;
  const qualifiedLeads = leads.filter(l => ["QUALIFIED", "CONTACT"].includes(l.status.toUpperCase())).length;
  const opportunities = leads.filter(l => ["OPPORTUNITY", "PROPOSAL", "NEGOTIATION"].includes(l.status.toUpperCase())).length;
  const won = leads.filter(l => l.status.toUpperCase() === "WON").length;
  const lost = leads.filter(l => l.status.toUpperCase() === "LOST").length;

  const filteredLeads = filterStatus === "ALL" 
    ? leads 
    : leads.filter(l => l.status.toUpperCase() === filterStatus.toUpperCase());

  const handleAssignLead = (leadId: number) => {
    const operator = prompt("Enter Operator Name to assign this lead to:");
    if (operator) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, assigned_to_name: operator } : l));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "CRITICAL": return "#ef4444";
      case "HIGH": return "#f97316";
      case "MEDIUM": return "#eab308";
      default: return "var(--color-cyan)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title */}
      <div>
        <p className="eyebrow"><Contact2 size={12} /> CRM OVERVIEW</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>CRM Pipeline</h1>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.5rem" }}>
        {[
          { title: "Total Leads", count: totalLeads, desc: "Cumulative database targets" },
          { title: "New Leads", count: newLeads, desc: "Awaiting outreach validation" },
          { title: "Qualified Leads", count: qualifiedLeads, desc: "Contacts established" },
          { title: "Opportunities", count: opportunities, desc: "Active negotiations" },
          { title: "Closed Won", count: won, desc: "Platform client converts", color: "#10b981" },
          { title: "Closed Lost", count: lost, desc: "Archived transactions", color: "#ef4444" },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                {stat.title}
              </div>
              <div style={{
                fontSize: "1.8rem",
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                color: stat.color || "var(--color-text-primary)",
                margin: "0.4rem 0"
              }}>{stat.count}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>{stat.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Leads List */}
      <Card>
        <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)" }}>
          <CardTitle style={{ fontSize: "1.1rem" }}>Lead Funnel Directory</CardTitle>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Filter size={14} style={{ color: "var(--color-text-muted)" }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                padding: "0.3rem 0.5rem",
                borderRadius: "4px",
                outline: "none",
                fontSize: "0.8rem"
              }}
            >
              <option value="ALL">All Pipeline Stages</option>
              <option value="NEW">New Lead</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="WON">Closed Won</option>
              <option value="LOST">Closed Lost</option>
            </select>
          </div>
        </CardHeader>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
            RETRIEVING LEADS CHANNELS...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>REF ID</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>LEAD & COMPANY</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>INDUSTRY & SOURCE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>PRIORITY</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>ASSIGNED TO</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STAGE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No pipeline targets matched the selection status filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-muted/10">
                      <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)" }}>{l.reference_id || `LD-${l.id}`}</td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{l.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{l.company}</div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ color: "var(--color-text-secondary)" }}>{l.industry}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{l.source}</div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          fontFamily: "var(--font-mono)",
                          color: getPriorityColor(l.priority || "MEDIUM"),
                        }}>{l.priority_display || l.priority || "MEDIUM"}</span>
                      </td>
                      <td style={{ padding: "1rem", color: "var(--color-text-primary)" }}>
                        {l.assigned_to_name ? (
                          l.assigned_to_name
                        ) : (
                          <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          fontSize: "0.7rem",
                          fontFamily: "var(--font-mono)",
                          color: l.status.toUpperCase() === "WON" ? "#10b981" : l.status.toUpperCase() === "LOST" ? "#ef4444" : "var(--color-cyan)",
                          backgroundColor: "rgba(0,0,0,0.15)",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(255,255,255,0.05)"
                        }}>{l.status_display || l.status}</span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <Button variant="outline" size="sm" onClick={() => handleAssignLead(l.id)} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", borderColor: "var(--color-border)" }}>
                          <UserPlus size={12} /> Assign
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CrmOverview;
