import React, { useState } from "react";
import { useLeads } from "../../hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import type { Lead } from "../../services/bdmService";

const OPPORTUNITY_STATUSES = ["qualified", "proposal_submitted", "negotiation"];

const STATUS_COLORS: Record<string, string> = {
  qualified: "bg-green-500/20 text-green-400 border-green-500/30",
  proposal_submitted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  negotiation: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

export const Opportunities: React.FC = () => {
  const [search, setSearch] = useState("");

  const { leads, totalCount, isLoading, error, refetch, currentPage, pageSize, setPageSize, totalPages, nextPage, prevPage, hasNext, hasPrev } = useLeads({
    status: "qualified,proposal_submitted,negotiation",
    search: search || undefined,
  });

  const opportunities = leads;

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
          <p className="eyebrow">OPPORTUNITY ENGINE</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>Opportunities</h1>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button onClick={refetch} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#a78bfa" }}>
              {opportunities.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In pipeline</p>
          </CardContent>
        </Card>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#34d399" }}>
              {leads.filter((l: Lead) => l.status === "qualified").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for proposal</p>
          </CardContent>
        </Card>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Proposals Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#a78bfa" }}>
              {leads.filter((l: Lead) => l.status === "proposal_submitted").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Negotiation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#f472b6" }}>
              {leads.filter((l: Lead) => l.status === "negotiation").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Closing deals</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle>Opportunity Pipeline ({opportunities.length} active)</CardTitle>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem" }}>
              <Input
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "300px" }}
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#64748b" }}>Loading opportunities...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#ef4444" }}>Error: {error}</p>
              <Button onClick={refetch} className="mt-2">
                Retry
              </Button>
            </div>
          ) : opportunities.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#64748b" }}>No active opportunities</p>
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
                    <TableHead>Stage</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((lead: Lead) => (
                    <TableRow key={lead.id}>
                      <TableCell style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {lead.reference_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p style={{ fontWeight: 500, margin: 0 }}>{lead.name || "—"}</p>
                          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>{lead.company || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {lead.email && <p style={{ fontSize: "0.8rem", margin: 0 }}>{lead.email}</p>}
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
                          <span>{lead.assigned_to_name}</span>
                        ) : (
                          <span style={{ color: "#ef4444" }}>Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.next_follow_up_at ? formatDate(lead.next_follow_up_at) : "—"}
                      </TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Standardized Pagination Controls */}
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderTop: "1px solid rgba(140, 174, 187, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  marginTop: "1.5rem"
                }}
              >
                <div>
                  Showing <strong style={{ color: "#f8fafc" }}>{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
                  <strong style={{ color: "#f8fafc" }}>{Math.min(currentPage * pageSize, totalCount)}</strong> of{" "}
                  <strong style={{ color: "#f8fafc" }}>{totalCount}</strong> entries
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#050811",
                        border: "1px solid rgba(140, 174, 187, 0.25)",
                        color: "#f8fafc",
                        borderRadius: "4px",
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <Button
                      variant="outline"
                      disabled={!hasPrev || isLoading}
                      onClick={prevPage}
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    >
                      Previous
                    </Button>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={!hasNext || isLoading}
                      onClick={nextPage}
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Opportunities;