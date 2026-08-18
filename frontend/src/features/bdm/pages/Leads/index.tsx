import React, { useState } from "react";
import { useLeads } from "../../hooks/useLeads";
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

  const { leads, totalCount, isLoading, error, refetch, currentPage, totalPages, nextPage, prevPage, hasNext, hasPrev, goToPage } = useLeads({
    search: search || undefined,
    status: statusFilter || undefined,
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
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "250px" }}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger style={{ width: "180px" }}>
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
          ) : leads.length === 0 ? (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: Lead) => (
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
                        {lead.last_contacted_at ? formatDate(lead.last_contacted_at) : "—"}
                      </TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
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
    </div>
  );
};

export default Leads;