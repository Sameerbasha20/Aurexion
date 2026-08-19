import React, { useState } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { MessageSquareCode, Clock, CheckCircle, ShieldAlert, UserCheck, RefreshCw } from "lucide-react";
import { ErrorState, LoadingState, EmptyState } from "../../../portal/components/StateViews";
import { TicketCategoryBadge, TicketPriorityBadge, TicketStatusBadge } from "../../../portal/components/TicketMeta";
import { formatDateTime } from "../../../portal/utils/format";
import type { TicketStatus, TicketPriority } from "../../../portal/types/portal.types";
import useAdminTickets from "../../../support/hooks/useAdminTickets";
import useUpdateAdminTicket from "../../../support/hooks/useUpdateAdminTicket";
import useAssignableUsers from "../../../support/hooks/useAssignableUsers";

export const Support: React.FC = () => {
  const adminTickets = useAdminTickets();
  const updateAdminTicket = useUpdateAdminTicket();
  const assignableUsers = useAssignableUsers();

  const [savingId, setSavingId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, nextStatus: TicketStatus) => {
    setSavingId(id);
    try {
      await updateAdminTicket.update(id, { status: nextStatus });
      adminTickets.refetch();
    } catch {
      // Error in updateAdminTicket.error
    } finally {
      setSavingId(null);
    }
  };

  const handleAssigneeChange = async (id: number, userIdStr: string) => {
    setSavingId(id);
    const assigned_to = userIdStr === "unassigned" ? null : Number(userIdStr);
    const nextStatus: TicketStatus = assigned_to ? "assigned" : "open";
    try {
      await updateAdminTicket.update(id, { assigned_to, status: nextStatus });
      adminTickets.refetch();
    } catch {
      // Handled
    } finally {
      setSavingId(null);
    }
  };

  const handlePriorityChange = async (id: number, nextPriority: TicketPriority) => {
    setSavingId(id);
    try {
      await updateAdminTicket.update(id, { priority: nextPriority });
      adminTickets.refetch();
    } catch {
      // Handled
    } finally {
      setSavingId(null);
    }
  };

  // Compute Metrics from real backend data
  const tickets = adminTickets.data || [];
  const openCount = tickets.filter(t => ["open", "assigned"].includes(t.status)).length;
  const criticalCount = tickets.filter(t => t.priority === "critical").length;
  const resolvedCount = tickets.filter(t => ["resolved", "closed"].includes(t.status)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <MessageSquareCode size={14} /> ENTERPRISE HELPDESK
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>
            Support Management Console
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
            Global ticket administration, executive assignments, and SLA oversight across all client accounts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => adminTickets.refetch()}>
          <RefreshCw size={14} /> Refresh Data
        </Button>
      </div>

      {adminTickets.isLoading ? (
        <LoadingState rows={4} label="Loading helpdesk tickets..." />
      ) : adminTickets.isError ? (
        <ErrorState error={adminTickets.error} onRetry={adminTickets.refetch} title="Unable to load administrative support tickets" />
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            <Card glowOnHover>
              <CardContent style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <Clock size={28} style={{ color: "#63f5e8" }} />
                <div>
                  <div style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>ACTIVE TICKETS</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 600, fontFamily: "var(--font-display)", color: "#63f5e8" }}>{openCount}</div>
                </div>
              </CardContent>
            </Card>

            <Card glowOnHover>
              <CardContent style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <ShieldAlert size={28} style={{ color: "#ef4444" }} />
                <div>
                  <div style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CRITICAL PRIORITIES</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 600, fontFamily: "var(--font-display)", color: "#ef4444" }}>{criticalCount}</div>
                </div>
              </CardContent>
            </Card>

            <Card glowOnHover>
              <CardContent style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <CheckCircle size={28} style={{ color: "#4ade80" }} />
                <div>
                  <div style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RESOLVED & CLOSED</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 600, fontFamily: "var(--font-display)", color: "#4ade80" }}>{resolvedCount}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tickets List */}
          <Card glowOnHover>
            <CardHeader>
              <CardTitle style={{ fontSize: "1.1rem", color: "#63f5e8" }}>Enterprise Support Ledger</CardTitle>
            </CardHeader>
            {tickets.length === 0 ? (
              <EmptyState
                title="No support tickets"
                description="There are currently no support tickets logged in the system."
              />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem", minWidth: "900px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e293b", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                      <th style={{ padding: "1rem" }}>TICKET ID</th>
                      <th style={{ padding: "1rem", width: "25%" }}>SUBJECT</th>
                      <th style={{ padding: "1rem" }}>CLIENT</th>
                      <th style={{ padding: "1rem" }}>CATEGORY</th>
                      <th style={{ padding: "1rem" }}>PRIORITY</th>
                      <th style={{ padding: "1rem" }}>ASSIGNED EXEC</th>
                      <th style={{ padding: "1rem" }}>STATUS</th>
                      <th style={{ padding: "1rem", textAlign: "right" }}>ADMIN ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid rgba(140,174,187,0.12)" }}>
                        <td style={{ padding: "1rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                          {t.ticket_id}
                        </td>
                        <td style={{ padding: "1rem", fontWeight: 600, color: "#f8fafc" }}>
                          {t.subject}
                        </td>
                        <td style={{ padding: "1rem", color: "#cbd5e1" }}>{t.client_username}</td>
                        <td style={{ padding: "1rem" }}>
                          <TicketCategoryBadge category={t.category} />
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <select
                            value={t.priority}
                            onChange={(e) => handlePriorityChange(t.id, e.target.value as TicketPriority)}
                            disabled={savingId === t.id}
                            style={{
                              backgroundColor: "#0c1222",
                              border: "1px solid #1e293b",
                              color: t.priority === "critical" ? "#ef4444" : t.priority === "high" ? "#fbbf24" : "#94a3b8",
                              fontSize: "0.75rem",
                              fontFamily: "IBM Plex Mono, monospace",
                              padding: "0.25rem 0.4rem",
                              borderRadius: "4px",
                              outline: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="low">LOW</option>
                            <option value="medium">MEDIUM</option>
                            <option value="high">HIGH</option>
                            <option value="critical">CRITICAL</option>
                          </select>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <select
                            value={t.assigned_username ? (assignableUsers.data?.find(u => u.username === t.assigned_username)?.id || "assigned") : "unassigned"}
                            onChange={(e) => handleAssigneeChange(t.id, e.target.value)}
                            disabled={savingId === t.id}
                            style={{
                              backgroundColor: "#0c1222",
                              border: "1px solid #1e293b",
                              color: "#cbd5e1",
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.4rem",
                              borderRadius: "4px",
                              outline: "none",
                              maxWidth: "160px",
                              cursor: "pointer",
                            }}
                          >
                            <option value="unassigned">Unassigned</option>
                            {assignableUsers.data?.map((u) => (
                              <option key={u.id} value={String(u.id)}>
                                {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <TicketStatusBadge status={t.status} />
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value as TicketStatus)}
                            disabled={savingId === t.id}
                            style={{
                              backgroundColor: "#0c1222",
                              border: "1px solid #1e293b",
                              color: "#63f5e8",
                              fontSize: "0.75rem",
                              fontFamily: "IBM Plex Mono, monospace",
                              padding: "0.25rem 0.4rem",
                              borderRadius: "4px",
                              outline: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="awaiting_client">Awaiting Client</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Support;
