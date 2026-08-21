import React, { useState } from "react";
import { useLeads } from "../../hooks/useLeads";
import crmService from "../../../crm/services/crmService";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Eye, ArrowUpRight, Mail, Phone, UserCheck, XCircle, RefreshCw } from "lucide-react";
import type { Lead } from "../../services/bdmService";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  contacted: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  qualified: "bg-green-500/20 text-green-400 border-green-500/30",
  proposal_submitted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  negotiation: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  won: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

export const Leads: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(null);

  const { leads, totalCount, isLoading, error, refetch, currentPage, totalPages, nextPage, prevPage, hasNext, hasPrev } = useLeads({
    search: search || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => (
    <Badge className={STATUS_COLORS[status] || "bg-gray-500/20 text-gray-400"}>
      {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </Badge>
  );

  const getPriorityBadge = (priority: string) => (
    <Badge className={PRIORITY_COLORS[priority] || "bg-gray-500/20 text-gray-400"}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow">LEAD FUNNEL</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>Business Leads</h1>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button onClick={refetch} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle>Lead Pipeline ({totalCount} total)</CardTitle>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ minWidth: "160px", flex: "1 1 auto" }}
              />
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger style={{ minWidth: "150px", flex: "1 1 auto" }}>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sources</SelectItem>
                  <SelectItem value="website">Source: Website</SelectItem>
                  <SelectItem value="rfp_form">Source: RFP Form</SelectItem>
                  <SelectItem value="contact_form">Source: Contact Form</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger style={{ minWidth: "150px", flex: "1 1 auto" }}>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal_submitted">Proposal Submitted</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Filter</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#64748b" }}>Loading leads...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#ef4444" }}>Error: {error}</p>
              <Button onClick={refetch} className="mt-2">
                Retry
              </Button>
            </div>
          ) : !leads || leads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#64748b" }}>No leads found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Name / Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead style={{ textAlign: "right" }}>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: Lead) => (
                    <TableRow key={lead.id}>
                      <TableCell style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#63f5e8", fontWeight: 600 }}>
                        {lead.reference_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p style={{ fontWeight: 500, margin: 0, color: "#f8fafc" }}>{lead.name || "—"}</p>
                          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>{lead.company || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {lead.email && <p style={{ fontSize: "0.8rem", margin: 0, color: "#cbd5e1" }}>{lead.email}</p>}
                          {lead.phone && <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>{lead.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.source || "—"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                      <TableCell>
                        {lead.assigned_to_name ? (
                          <span style={{ color: "#38bdf8", fontWeight: 500 }}>{lead.assigned_to_name}</span>
                        ) : (
                          <span style={{ color: "#ef4444" }}>Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.last_contacted_at ? formatDate(lead.last_contacted_at) : "—"}
                      </TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedLeadDetail(lead)}
                          style={{ fontSize: "0.78rem", color: "#63f5e8", borderColor: "rgba(99, 245, 232, 0.3)" }}
                        >
                          Open Desk →
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.5rem" }}>
                  <Button onClick={prevPage} disabled={!hasPrev} variant="outline">
                    Previous
                  </Button>
                  <span style={{ color: "#94a3b8" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button onClick={nextPage} disabled={!hasNext} variant="outline">
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Popup Modal */}
      {selectedLeadDetail && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                  BDM LEAD DETAIL VIEW
                </span>
                <h2 style={{ fontSize: "1.5rem", color: "#f8fafc", margin: "0.2rem 0 0 0" }}>
                  {selectedLeadDetail.company || selectedLeadDetail.name}
                </h2>
              </div>
              <button onClick={() => setSelectedLeadDetail(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}>
                ✕
              </button>
            </div>

            {/* Lead Header Info */}
            <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1.25rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
                  REF: {selectedLeadDetail.reference_id || `#LD-${selectedLeadDetail.id}`}
                </span>
                {getStatusBadge(selectedLeadDetail.status)}
                {getPriorityBadge(selectedLeadDetail.priority)}
              </div>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#94a3b8" }}>
                <span>Submitted: <strong style={{ color: "#f8fafc" }}>{formatDate(selectedLeadDetail.created_at)}</strong></span>
                <span>Assigned To: <strong style={{ color: selectedLeadDetail.assigned_to_name ? "#38bdf8" : "#fbbf24" }}>{selectedLeadDetail.assigned_to_name || "Unassigned"}</strong></span>
              </div>
            </div>

            {/* Contact Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PRIMARY CONTACT</span>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "1rem", fontWeight: 600, color: "#f8fafc" }}>{selectedLeadDetail.name}</p>
                <p style={{ margin: "0.25rem 0 0 0", color: "#cbd5e1" }}>{selectedLeadDetail.company || "Direct Individual"}</p>
              </div>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EMAIL</span>
                <a href={`mailto:${selectedLeadDetail.email}`} style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem", color: "#63f5e8", textDecoration: "none" }}>
                  <Mail size={13} /> {selectedLeadDetail.email}
                </a>
              </div>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PHONE</span>
                <a href={`tel:${selectedLeadDetail.phone}`} style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem", color: "#cbd5e1", textDecoration: "none" }}>
                  <Phone size={13} /> {selectedLeadDetail.phone || "Not provided"}
                </a>
              </div>
            </div>

            {/* Requirement Brief */}
            {selectedLeadDetail.description && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.6)", border: "1px solid rgba(140, 174, 187, 0.1)", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>INQUIRY / REQUIREMENT BRIEF</span>
                <p style={{ margin: "0.5rem 0 0 0", color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selectedLeadDetail.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "flex-end" }}>
              {(selectedLeadDetail.status === "lost" || selectedLeadDetail.status === "LOST") && (
                <Button
                  glow
                  onClick={async () => {
                    if (window.confirm(`Re-open declined lead ${selectedLeadDetail.reference_id} back into active pipeline?`)) {
                      try {
                        await crmService.reopenLead(selectedLeadDetail.id);
                        alert("Lead successfully re-opened into active pipeline!");
                        setSelectedLeadDetail(null);
                        refetch();
                      } catch (err: any) {
                        alert(err?.message || "Failed to re-open lead.");
                      }
                    }
                  }}
                  style={{ fontSize: "0.82rem", backgroundColor: "#22c55e", color: "#ffffff" }}
                >
                  <RefreshCw size={14} style={{ marginRight: "0.35rem" }} /> Re-open / Re-engage Lead
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedLeadDetail(null)}
                style={{ fontSize: "0.82rem" }}
              >
                Close Desk
              </Button>
              {selectedLeadDetail.email && (
                <a href={`mailto:${selectedLeadDetail.email}`} style={{ textDecoration: "none" }}>
                  <Button
                    glow
                    style={{ fontSize: "0.82rem", backgroundColor: "#0284c7", color: "#ffffff" }}
                  >
                    <Mail size={14} style={{ marginRight: "0.35rem" }} /> Direct Email Lead
                  </Button>
                </a>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Leads;