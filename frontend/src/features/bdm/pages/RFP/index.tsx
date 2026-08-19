import React, { useState } from "react";
import { useLeads } from "../../hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { AlertCircle, CheckCircle, UserCheck, XCircle } from "lucide-react";
import type { Lead } from "../../services/bdmService";
import { bdmService } from "../../services/bdmService";

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

export const RFP: React.FC = () => {
  const [search, setSearch] = useState("");

  const { leads, totalCount, isLoading, error, refetch, currentPage, totalPages, nextPage, prevPage, hasNext, hasPrev } = useLeads({
    search: search || undefined,
  });

  const rfpLeads = leads.filter((lead) => lead.source === "rfp_form");

  // Accept/Decline modals state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<{ id: number; username: string; email: string; name: string; role: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);

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

  // Open Accept modal
  const handleAcceptClick = async (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedAssignee(null);
    setActionError(null);
    setIsAcceptOpen(true);
    setIsLoadingUsers(true);
    try {
      const users = await bdmService.getAssignableUsers();
      setAssignableUsers(users);
    } catch {
      setAssignableUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Open Decline modal
  const handleDeclineClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDeclineReason("");
    setActionError(null);
    setIsDeclineOpen(true);
  };

  // Submit Accept (assign to sales)
  const handleAcceptSubmit = async () => {
    if (!selectedLead || !selectedAssignee) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      await bdmService.assignLead(selectedLead.id, selectedAssignee);
      refetch();
      setSelectedLead(null);
      setSelectedAssignee(null);
    } catch (err: any) {
      setActionError(err.message || "Failed to assign lead");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submit Decline (mark as lost)
  const handleDeclineSubmit = async () => {
    if (!selectedLead || !declineReason.trim()) {
      setActionError("Reason is required to decline");
      return;
    }
    setIsActionLoading(true);
    setActionError(null);
    try {
      await bdmService.markLeadLost(selectedLead.id, declineReason);
      refetch();
      setSelectedLead(null);
      setDeclineReason("");
    } catch (err: any) {
      setActionError(err.message || "Failed to decline lead");
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeModals = () => {
    setSelectedLead(null);
    setSelectedAssignee(null);
    setDeclineReason("");
    setActionError(null);
    setIsAcceptOpen(false);
    setIsDeclineOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow">RFP PIPELINE</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>Requests For Proposal (RFP)</h1>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button onClick={refetch} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        <Card glowOnHover borderAccent>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total RFPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#63f5e8" }}>
              {rfpLeads.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">RFP submissions</p>
          </CardContent>
        </Card>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New RFPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#60a5fa" }}>
              {rfpLeads.filter((l: Lead) => l.status === "new").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#fbbf24" }}>
              {rfpLeads.filter((l: Lead) => ["under_review", "contacted", "qualified"].includes(l.status)).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active proposals</p>
          </CardContent>
        </Card>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Won / Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#fbbf24" }}>
              {rfpLeads.filter((l: Lead) => ["won", "lost"].includes(l.status)).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Closed RFPs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle>RFP Submissions ({rfpLeads.length} total)</CardTitle>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem" }}>
              <Input
                placeholder="Search RFPs..."
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
              <p style={{ color: "#64748b" }}>Loading RFPs...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#ef4444" }}>Error: {error}</p>
              <Button onClick={refetch} className="mt-2">
                Retry
              </Button>
            </div>
          ) : rfpLeads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "#64748b" }}>No RFP submissions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Name / Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfpLeads.map((lead: Lead) => (
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
                      <TableCell>
                        {lead.status === "new" && !lead.assigned_to ? (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptClick(lead)}
                              disabled={isLoadingUsers || isActionLoading}
                              className="text-green-400 border-green-400 hover:bg-green-400/10"
                            >
                              <UserCheck className="h-4 w-4 mr-1" /> Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeclineClick(lead)}
                              disabled={isActionLoading}
                              className="text-red-400 border-red-400 hover:bg-red-400/10"
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Decline
                            </Button>
                          </div>
                        ) : lead.assigned_to ? (
                          <span style={{ color: "#60a5fa", fontSize: "0.8rem" }}>
                            Assigned to {lead.assigned_to_name}
                          </span>
                        ) : lead.status === "lost" ? (
                          <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>Declined</span>
                        ) : (
                          <span style={{ color: "#fbbf24", fontSize: "0.8rem" }}>{lead.status.replace(/_/g, " ")}</span>
                        )}
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

      {/* Accept RFP Modal - Assign to Sales Executive */}
      <Dialog open={isAcceptOpen} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent style={{ maxWidth: "480px" }}>
          <DialogHeader>
            <DialogTitle>Accept RFP</DialogTitle>
            <DialogDescription>
              Assign this RFP to a sales executive to begin proposal development.
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
              <AlertCircle className="h-4 w-4 inline mr-1" /> {actionError}
            </div>
          )}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#cbd5e1" }}>
              Assign to Sales Executive
            </label>
            {isLoadingUsers ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>Loading sales executives...</div>
            ) : assignableUsers.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#ef4444" }}>
                No sales executives available. Please create sales executive users first.
              </div>
            ) : (
              <Select value={selectedAssignee ? String(selectedAssignee) : ""} onValueChange={(val) => setSelectedAssignee(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sales executive" />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModals} disabled={isActionLoading}>
              Cancel
            </Button>
            <Button onClick={handleAcceptSubmit} disabled={isActionLoading || !selectedAssignee}>
              {isActionLoading ? "Assigning..." : "Assign & Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline RFP Modal - Mark as Lost */}
      <Dialog open={isDeclineOpen} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent style={{ maxWidth: "480px" }}>
          <DialogHeader>
            <DialogTitle>Decline RFP</DialogTitle>
            <DialogDescription>
              Mark this RFP as declined. A reason is required.
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
              <AlertCircle className="h-4 w-4 inline mr-1" /> {actionError}
            </div>
          )}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#cbd5e1" }}>
              Decline Reason *
            </label>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining this RFP..."
              rows={4}
              disabled={isActionLoading}
            />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              This reason will be recorded and the lead will be marked as Lost.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModals} disabled={isActionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeclineSubmit} disabled={isActionLoading || !declineReason.trim()}>
              {isActionLoading ? "Declining..." : "Confirm Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RFP;