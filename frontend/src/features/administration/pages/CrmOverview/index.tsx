import React, { useState, useEffect } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Contact2, TrendingUp, AlertCircle, Eye, Filter, Search, Calendar, UserCheck } from "lucide-react";
import crmService, { LeadItem } from "../../../crm/services/crmService";
import LeadDetailDrawer from "../../../crm/components/LeadDetailDrawer";

const formatTimestamp = (isoString?: string) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "N/A";
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
};

export const CrmOverview: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await crmService.getLeads();
      setLeads(data || []);
    } catch (err) {
      console.error("Failed to fetch leads", err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Compute Metrics dynamically from real backend lead records
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => ["NEW", "LEAD"].includes(l.status.toUpperCase())).length;
  const qualifiedLeads = leads.filter(l => ["QUALIFIED", "CONTACT"].includes(l.status.toUpperCase())).length;
  const opportunities = leads.filter(l => ["OPPORTUNITY", "PROPOSAL", "NEGOTIATION"].includes(l.status.toUpperCase())).length;
  const won = leads.filter(l => l.status.toUpperCase() === "WON").length;
  const lost = leads.filter(l => l.status.toUpperCase() === "LOST").length;

  const filteredLeads = leads.filter(l => {
    const matchesStatus = filterStatus === "ALL" || l.status.toUpperCase() === filterStatus.toUpperCase();
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || (
      (l.name && l.name.toLowerCase().includes(query)) ||
      (l.company && l.company.toLowerCase().includes(query)) ||
      (l.email && l.email.toLowerCase().includes(query)) ||
      (l.reference_id && l.reference_id.toLowerCase().includes(query)) ||
      (l.industry && l.industry.toLowerCase().includes(query))
    );
    return matchesStatus && matchesSearch;
  });

  const handleOpenLeadDrawer = (leadId: number) => {
    setSelectedLeadId(leadId);
    setDrawerOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority || "").toUpperCase()) {
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
        <p className="eyebrow"><Contact2 size={12} /> ADMIN LEADS & CRM MANAGEMENT</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>Leads Directory</h1>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.5rem" }}>
        {[
          { title: "Total Leads", count: totalLeads, desc: "Cumulative pipeline records" },
          { title: "New Leads", count: newLeads, desc: "Awaiting outreach validation" },
          { title: "Qualified Leads", count: qualifiedLeads, desc: "Contacts established" },
          { title: "Opportunities", count: opportunities, desc: "Active negotiations" },
          { title: "Closed Won", count: won, desc: "Converted client deals", color: "#10b981" },
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
              }}>{loading ? "..." : stat.count}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>{stat.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Leads List */}
      <Card>
        <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap", gap: "1rem" }}>
          <CardTitle style={{ fontSize: "1.1rem" }}>Lead Funnel Directory</CardTitle>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search size={14} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <Input
                placeholder="Search leads by name, company, email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "2rem", fontSize: "0.8rem", height: "34px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Filter size={14} style={{ color: "var(--color-text-muted)" }} />
              <select
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "4px",
                  outline: "none",
                  fontSize: "0.8rem",
                  height: "34px"
                }}
              >
                <option value="ALL">All Pipeline Stages</option>
                <option value="NEW">New Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Closed Won</option>
                <option value="LOST">Closed Lost</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
            RETRIEVING LEADS RECORDS...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>REF ID</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>LEAD & COMPANY</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>INDUSTRY & SOURCE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>CREATED DATE/TIME</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>PRIORITY</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>ASSIGNED TO</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STAGE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No lead records found matching current query and filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-muted/10">
                      <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)" }}>
                        {l.reference_id || `LD-${l.id}`}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{l.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{l.company || l.email}</div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ color: "var(--color-text-secondary)" }}>{l.industry || "General"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{l.source || "Inbound"}</div>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.8rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {formatTimestamp(l.created_at)}
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <UserCheck size={12} style={{ color: "var(--color-cyan)" }} />
                            {l.assigned_to_name}
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          fontSize: "0.7rem",
                          fontFamily: "var(--font-mono)",
                          color: l.status?.toUpperCase() === "WON" ? "#10b981" : l.status?.toUpperCase() === "LOST" ? "#ef4444" : "var(--color-cyan)",
                          backgroundColor: "rgba(0,0,0,0.15)",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(255,255,255,0.05)"
                        }}>{l.status_display || l.status}</span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenLeadDrawer(l.id)}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", borderColor: "var(--color-border)" }}
                        >
                          <Eye size={12} /> Inspect / Manage
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

      {/* Lead Details Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={fetchLeads}
      />
    </div>
  );
};

export default CrmOverview;
