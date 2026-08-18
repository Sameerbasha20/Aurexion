import React, { useState } from "react";
import { Link } from "wouter";
import { useLeads } from "../../hooks/useCrm";
import crmService, { LeadItem } from "../../services/crmService";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Search,
  Filter,
  Plus,
  Download,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
} from "lucide-react";

export const Leads: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Lead creation form state
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    industry: "",
    source: "website",
    priority: "medium",
    description: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const { leads, totalCount, params, isLoading, error, refetch, updateFilters, setPage } = useLeads({
    page_size: 10,
    page: 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    updateFilters({ status: status || undefined });
  };

  const handlePriorityChange = (priority: string) => {
    setPriorityFilter(priority);
    updateFilters({ priority: priority || undefined });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await crmService.exportLeads();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `aurexion-leads-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setActionSuccess("Leads exported successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to export leads.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.name || !createForm.email) {
      setCreateError("Name and Email are required.");
      return;
    }

    setCreateLoading(true);
    try {
      await crmService.createLead(createForm);
      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        website: "",
        industry: "",
        source: "WEBSITE",
        priority: "MEDIUM",
        description: "",
      });
      setActionSuccess("New lead established successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
      refetch();
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err?.message || "Failed to create lead.");
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = status?.toUpperCase() || "";
    switch (s) {
      case "NEW":
        return { bg: "rgba(99, 245, 232, 0.12)", color: "#63f5e8", border: "rgba(99, 245, 232, 0.3)" };
      case "CONTACTED":
      case "UNDER_REVIEW":
        return { bg: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" };
      case "QUALIFIED":
      case "PROPOSAL":
      case "NEGOTIATION":
        return { bg: "rgba(129, 140, 248, 0.12)", color: "#818cf8", border: "rgba(129, 140, 248, 0.3)" };
      case "WON":
        return { bg: "rgba(74, 222, 128, 0.12)", color: "#4ade80", border: "rgba(74, 222, 128, 0.3)" };
      case "LOST":
        return { bg: "rgba(248, 113, 113, 0.12)", color: "#f87171", border: "rgba(248, 113, 113, 0.3)" };
      default:
        return { bg: "rgba(140, 174, 187, 0.12)", color: "#cbd5e1", border: "rgba(140, 174, 187, 0.3)" };
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    const p = priority?.toUpperCase() || "";
    switch (p) {
      case "URGENT":
        return { color: "#f87171", bg: "rgba(248, 113, 113, 0.15)" };
      case "HIGH":
        return { color: "#fb923c", bg: "rgba(251, 146, 60, 0.15)" };
      case "MEDIUM":
        return { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" };
      case "LOW":
      default:
        return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" };
    }
  };

  const currentPage = params.page || 1;
  const pageSize = params.page_size || 10;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>CRM SALES FUNNEL</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {totalCount} Total Leads
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Leads Pipeline Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Download size={14} /> {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button
            glow
            onClick={() => setIsCreateOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={14} /> Create Lead
          </Button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div style={{
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          border: "1px solid rgba(74, 222, 128, 0.3)",
          color: "#4ade80",
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem",
          fontFamily: "IBM Plex Mono, monospace",
        }}>
          <CheckCircle2 size={16} />
          {actionSuccess}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search form */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search leads by name, email, company, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem 0.6rem 2.2rem",
                  backgroundColor: "rgba(5, 8, 17, 0.7)",
                  border: "1px solid rgba(140, 174, 187, 0.2)",
                  borderRadius: "4px",
                  color: "#f8fafc",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
            </div>
            <Button type="submit" variant="outline" style={{ padding: "0.6rem 1rem" }}>
              Filter
            </Button>
          </form>

          {/* Quick Dropdown Filters */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                padding: "0.6rem 0.85rem",
                backgroundColor: "rgba(5, 8, 17, 0.7)",
                border: "1px solid rgba(140, 174, 187, 0.2)",
                borderRadius: "4px",
                color: "#f8fafc",
                fontSize: "0.82rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityChange(e.target.value)}
              style={{
                padding: "0.6rem 0.85rem",
                backgroundColor: "rgba(5, 8, 17, 0.7)",
                border: "1px solid rgba(140, 174, 187, 0.2)",
                borderRadius: "4px",
                color: "#f8fafc",
                fontSize: "0.82rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {(searchTerm || statusFilter || priorityFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setPriorityFilter("");
                  updateFilters({ search: undefined, status: undefined, priority: undefined });
                }}
                style={{ fontSize: "0.75rem" }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Leads Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              SYNCING LEADS DATABASE...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p style={{ margin: 0 }}>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>
              Retry
            </Button>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Building size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No leads match the current criteria</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Try adjusting your search query or status filter.
            </p>
            <Button glow onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} style={{ marginRight: "0.4rem" }} /> Create First Lead
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    REF ID / DATE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    LEAD & COMPANY
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CONTACT INFO
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    SOURCE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    PRIORITY
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    STATUS
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ASSIGNED
                  </th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const statusStyle = getStatusBadgeStyle(lead.status);
                  const priorityStyle = getPriorityBadgeStyle(lead.priority);
                  return (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: "1px solid rgba(140, 174, 187, 0.1)",
                        transition: "background-color 150ms",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                        <div>{lead.reference_id || `#LD-${lead.id}`}</div>
                        <div style={{ color: "#64748b", fontSize: "0.68rem" }}>
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <Link href={`/crm/leads/${lead.id}`}>
                          <div style={{ fontWeight: 600, color: "#f8fafc", cursor: "pointer" }}>
                            {lead.company || lead.name}
                          </div>
                        </Link>
                        {lead.company && (
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            Contact: {lead.name}
                          </div>
                        )}
                        {lead.industry && (
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {lead.industry}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <a
                            href={`mailto:${lead.email}`}
                            style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#cbd5e1", textDecoration: "none", fontSize: "0.78rem" }}
                          >
                            <Mail size={12} color="#63f5e8" /> {lead.email}
                          </a>
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#94a3b8", textDecoration: "none", fontSize: "0.75rem" }}
                            >
                              <Phone size={12} color="#64748b" /> {lead.phone}
                            </a>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "1rem", fontSize: "0.78rem", color: "#cbd5e1" }}>
                        {lead.source || "Website"}
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "3px",
                            fontSize: "0.68rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            fontWeight: 600,
                            backgroundColor: priorityStyle.bg,
                            color: priorityStyle.color,
                          }}
                        >
                          {lead.priority_display || lead.priority || "MEDIUM"}
                        </span>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "3px",
                            fontSize: "0.72rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                          }}
                        >
                          {lead.status_display || lead.status || "NEW"}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#cbd5e1" }}>
                        {lead.assigned_to_name ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <User size={13} color="#63f5e8" />
                            {lead.assigned_to_name}
                          </div>
                        ) : (
                          <span style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.75rem" }}>Unassigned</span>
                        )}
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <Link href={`/crm/leads/${lead.id}`}>
                          <Button variant="outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                            Open Desk &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Bar */}
        {totalCount > pageSize && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderTop: "1px solid rgba(140, 174, 187, 0.15)",
            backgroundColor: "rgba(10, 17, 28, 0.4)",
          }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace" }}>
              Page {currentPage} of {totalPages} ({totalCount} total entries)
            </span>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                style={{ padding: "0.35rem 0.6rem" }}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                style={{ padding: "0.35rem 0.6rem" }}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Lead Modal */}
      {isCreateOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5, 8, 17, 0.8)",
          backdropFilter: "blur(8px)",
          display: "grid",
          placeItems: "center",
          zIndex: 50,
          padding: "1.5rem",
        }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>NEW CRM ENTRY</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Create Sales Lead</h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div style={{
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "0.75rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
                fontFamily: "IBM Plex Mono, monospace",
              }}>
                ERROR // {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    CONTACT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    style={{
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    style={{
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    COMPANY NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Innovations"
                    value={createForm.company}
                    onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                    style={{
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    style={{
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    SOURCE
                  </label>
                  <select
                    value={createForm.source}
                    onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                    style={{
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    PRIORITY
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    style={{
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    INDUSTRY
                  </label>
                  <input
                    type="text"
                    placeholder="Fintech, AI, etc."
                    value={createForm.industry}
                    onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                    style={{
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                  INITIAL NOTES / DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter initial client scope or requirements..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{
                    padding: "0.6rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140, 174, 187, 0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" glow disabled={createLoading}>
                  {createLoading ? "Creating Lead..." : "Establish Lead"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Leads;
