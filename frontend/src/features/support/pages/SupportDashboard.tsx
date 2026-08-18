import React from "react";
import { Link } from "wouter";
import { LifeBuoy, Clock, ShieldAlert, CheckCircle2, ListChecks, ArrowRight, UserCheck, AlertCircle } from "lucide-react";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { ErrorState, LoadingState, EmptyState } from "../../portal/components/StateViews";
import { TicketCategoryBadge, TicketPriorityBadge, TicketStatusBadge } from "../../portal/components/TicketMeta";
import { formatDateTime } from "../../portal/utils/format";
import { buildTicketStats } from "../../portal/types/portal.types";
import useExecutiveTickets from "../hooks/useExecutiveTickets";

export const SupportDashboard: React.FC = () => {
  const tickets = useExecutiveTickets();
  const stats = tickets.data ? buildTicketStats(tickets.data) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "100%" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4" style={{ width: "100%" }}>
        <div>
          <p className="eyebrow" style={{ color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
            <LifeBuoy size={14} /> SUPPORT EXECUTIVE DESK
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600, lineHeight: 1.2 }}>
            Support Operations Dashboard
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.5rem 0 0 0", lineHeight: 1.4 }}>
            Real-time control center for client inquiries, ticket assignments, and issue resolutions.
          </p>
        </div>
        <Link href="/support/tickets" style={{ flexShrink: 0 }}>
          <Button glow size="sm" style={{ height: "40px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ListChecks size={14} />
            View All Tickets
          </Button>
        </Link>
      </div>

      {tickets.isError && !tickets.data ? (
        <ErrorState error={tickets.error} onRetry={tickets.refetch} title="Unable to load support tickets queue" />
      ) : (
        <>
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ width: "100%" }}>
            <Card glowOnHover className="h-full min-h-[160px] p-6 flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", fontWeight: 500 }}>TOTAL ASSIGNED</span>
                <LifeBuoy size={18} style={{ color: "#63f5e8", flexShrink: 0 }} />
              </div>
              <div style={{ margin: "14px 0" }}>
                {tickets.isLoading && !stats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: 0, lineHeight: 1.1 }}>{stats?.total ?? 0}</p>
                )}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Assigned support tickets</div>
            </Card>

            <Card glowOnHover className="h-full min-h-[160px] p-6 flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", fontWeight: 500 }}>OPEN & ASSIGNED</span>
                <Clock size={18} style={{ color: "#fbbf24", flexShrink: 0 }} />
              </div>
              <div style={{ margin: "14px 0" }}>
                {tickets.isLoading && !stats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p style={{ fontSize: "2rem", fontWeight: 600, color: "#fbbf24", margin: 0, lineHeight: 1.1 }}>{(stats?.open ?? 0) + (stats?.assigned ?? 0)}</p>
                )}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Awaiting executive action</div>
            </Card>

            <Card glowOnHover className="h-full min-h-[160px] p-6 flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", fontWeight: 500 }}>IN PROGRESS</span>
                <UserCheck size={18} style={{ color: "#60a5fa", flexShrink: 0 }} />
              </div>
              <div style={{ margin: "14px 0" }}>
                {tickets.isLoading && !stats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p style={{ fontSize: "2rem", fontWeight: 600, color: "#60a5fa", margin: 0, lineHeight: 1.1 }}>{stats?.inProgress ?? 0}</p>
                )}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Currently being resolved</div>
            </Card>

            <Card glowOnHover className="h-full min-h-[160px] p-6 flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", fontWeight: 500 }}>AWAITING CLIENT</span>
                <AlertCircle size={18} style={{ color: "#c4b5fd", flexShrink: 0 }} />
              </div>
              <div style={{ margin: "14px 0" }}>
                {tickets.isLoading && !stats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p style={{ fontSize: "2rem", fontWeight: 600, color: "#c4b5fd", margin: 0, lineHeight: 1.1 }}>{stats?.awaitingClient ?? 0}</p>
                )}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Client feedback pending</div>
            </Card>

            <Card glowOnHover className="h-full min-h-[160px] p-6 flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", fontWeight: 500 }}>RESOLVED & CLOSED</span>
                <CheckCircle2 size={18} style={{ color: "#4ade80", flexShrink: 0 }} />
              </div>
              <div style={{ margin: "14px 0" }}>
                {tickets.isLoading && !stats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p style={{ fontSize: "2rem", fontWeight: 600, color: "#4ade80", margin: 0, lineHeight: 1.1 }}>{(stats?.resolved ?? 0) + (stats?.closed ?? 0)}</p>
                )}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Resolved & closed tickets</div>
            </Card>

            <Card glowOnHover className="h-full min-h-[160px] p-6 flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#ef4444", fontWeight: 500 }}>CRITICAL PRIORITY</span>
                <ShieldAlert size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
              </div>
              <div style={{ margin: "14px 0" }}>
                {tickets.isLoading && !stats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p style={{ fontSize: "2rem", fontWeight: 600, color: "#ef4444", margin: 0, lineHeight: 1.1 }}>{stats?.critical ?? 0}</p>
                )}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Urgent intervention required</div>
            </Card>
          </div>

          {/* Active Ticket Ledger Queue */}
          <Card glowOnHover>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, color: "#63f5e8", fontSize: "1.1rem" }}>Recent Assigned Tickets</h3>
                <p style={{ margin: "0.25rem 0 0 0", color: "#94a3b8", fontSize: "0.825rem" }}>
                  Tickets assigned to your executive account needing immediate processing or status updates.
                </p>
              </div>
              <Link href="/support/tickets">
                <Button variant="outline" size="sm">
                  View full queue <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            {tickets.isLoading && !tickets.data ? (
              <LoadingState rows={4} label="Loading recent tickets" />
            ) : tickets.data && tickets.data.length === 0 ? (
              <EmptyState
                title="No assigned tickets"
                description="You currently have no support tickets assigned to your account."
              />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                      <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>TICKET ID</th>
                      <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>SUBJECT</th>
                      <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>CLIENT</th>
                      <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>CATEGORY</th>
                      <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>PRIORITY</th>
                      <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>STATUS</th>
                      <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>UPDATED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tickets.data || []).slice(0, 8).map((ticket) => (
                      <tr key={ticket.id} style={{ borderBottom: "1px solid rgba(140,174,187,0.12)" }}>
                        <td style={{ padding: "0.75rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                          <Link href={`/support/tickets/${ticket.id}`} style={{ color: "#63f5e8" }}>
                            {ticket.ticket_id}
                          </Link>
                        </td>
                        <td style={{ padding: "0.75rem", maxWidth: "280px" }}>
                          <Link href={`/support/tickets/${ticket.id}`} style={{ color: "#e2e8f0", textDecoration: "none" }}>
                            <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                              {ticket.subject}
                            </span>
                          </Link>
                        </td>
                        <td style={{ padding: "0.75rem", color: "#cbd5e1" }}>{ticket.client_username}</td>
                        <td style={{ padding: "0.75rem" }}>
                          <TicketCategoryBadge category={ticket.category} />
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          <TicketPriorityBadge priority={ticket.priority} />
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          <TicketStatusBadge status={ticket.status} />
                        </td>
                        <td style={{ padding: "0.75rem", color: "#94a3b8", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {formatDateTime(ticket.updated_at)}
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

export default SupportDashboard;
