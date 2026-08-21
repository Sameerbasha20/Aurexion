import React from "react";
import { Link } from "wouter";
import { LifeBuoy, Clock, ShieldAlert, CheckCircle2, ListChecks, ArrowRight, UserCheck, AlertCircle } from "lucide-react";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { ErrorState, LoadingState, EmptyState } from "../../portal/components/StateViews";
import { TicketCategoryBadge, TicketPriorityBadge, TicketStatusBadge } from "../../portal/components/TicketMeta";
import { formatDateTime } from "../../portal/utils/format";
import type { SupportTicketItem } from "../../portal/types/portal.types";
import useExecutiveTickets from "../hooks/useExecutiveTickets";

interface ExecutiveKpiCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  accentColor: string;
  subtitle: string;
  isLoading: boolean;
}

const ExecutiveKpiCard: React.FC<ExecutiveKpiCardProps> = ({
  label,
  value,
  icon: Icon,
  accentColor,
  subtitle,
  isLoading,
}) => (
  <Card glowOnHover className="h-full min-h-[160px] p-6 flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
      <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", fontWeight: 500 }}>
        {label}
      </span>
      <Icon size={18} style={{ color: accentColor, flexShrink: 0 }} />
    </div>
    <div style={{ margin: "14px 0" }}>
      {isLoading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <p style={{ fontSize: "2rem", fontWeight: 600, color: accentColor, margin: 0, lineHeight: 1.1 }}>{value}</p>
      )}
    </div>
    <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{subtitle}</div>
  </Card>
);

interface KpiStats {
  totalAssigned: number;
  openAssigned: number;
  inProgress: number;
  awaitingClient: number;
  resolvedClosed: number;
  criticalPriority: number;
}

const ExecutiveKpiSection: React.FC<{ stats: KpiStats | null; isLoading: boolean }> = ({ stats, isLoading }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ width: "100%" }}>
    <ExecutiveKpiCard
      label="TOTAL ASSIGNED"
      value={stats?.totalAssigned ?? 0}
      icon={LifeBuoy}
      accentColor="#63f5e8"
      subtitle="Assigned support tickets"
      isLoading={isLoading}
    />
    <ExecutiveKpiCard
      label="OPEN & ASSIGNED"
      value={stats?.openAssigned ?? 0}
      icon={Clock}
      accentColor="#fbbf24"
      subtitle="Awaiting executive action"
      isLoading={isLoading}
    />
    <ExecutiveKpiCard
      label="IN PROGRESS"
      value={stats?.inProgress ?? 0}
      icon={UserCheck}
      accentColor="#60a5fa"
      subtitle="Currently being resolved"
      isLoading={isLoading}
    />
    <ExecutiveKpiCard
      label="AWAITING CLIENT"
      value={stats?.awaitingClient ?? 0}
      icon={AlertCircle}
      accentColor="#c4b5fd"
      subtitle="Client feedback pending"
      isLoading={isLoading}
    />
    <ExecutiveKpiCard
      label="RESOLVED & CLOSED"
      value={stats?.resolvedClosed ?? 0}
      icon={CheckCircle2}
      accentColor="#4ade80"
      subtitle="Resolved & closed tickets"
      isLoading={isLoading}
    />
    <ExecutiveKpiCard
      label="CRITICAL PRIORITY"
      value={stats?.criticalPriority ?? 0}
      icon={ShieldAlert}
      accentColor="#ef4444"
      subtitle="Urgent intervention required"
      isLoading={isLoading}
    />
  </div>
);

const ExecutiveRecentTicketsTable: React.FC<{ tickets: SupportTicketItem[] }> = ({ tickets }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px", fontSize: "0.875rem" }}>
      <thead>
        <tr style={{ textAlign: "left", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>TICKET ID</th>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>SUBJECT</th>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>CLIENT</th>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>ASSIGNED EXECUTIVE</th>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>CATEGORY</th>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>PRIORITY</th>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>STATUS</th>
          <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>UPDATED</th>
        </tr>
      </thead>
      <tbody>
        {tickets.slice(0, 8).map((ticket) => (
          <tr key={ticket.id} style={{ borderBottom: "1px solid rgba(140,174,187,0.12)" }}>
            <td style={{ padding: "0.75rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
              <Link href={`/support/tickets/${ticket.id}`} style={{ color: "#63f5e8" }}>
                {ticket.ticket_id}
              </Link>
            </td>
            <td style={{ padding: "0.75rem", maxWidth: "240px" }}>
              <Link href={`/support/tickets/${ticket.id}`} style={{ color: "#e2e8f0", textDecoration: "none" }}>
                <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                  {ticket.subject}
                </span>
              </Link>
            </td>
            <td style={{ padding: "0.75rem", color: "#cbd5e1" }}>{ticket.client_username}</td>
            <td style={{ padding: "0.75rem", color: "#cbd5e1", fontSize: "0.8rem" }}>
              {ticket.assigned_username || "Unassigned Queue"}
            </td>
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
);

export const SupportDashboard: React.FC = () => {
  const tickets = useExecutiveTickets();

  const calculateKpiStats = (allTickets: SupportTicketItem[]): KpiStats => {
    // The backend already scopes tickets to the current executive's queue
    // (assigned to them + unassigned). Compute stats over the full API response.
    const assignedTickets = allTickets.filter((t) => t.assigned_username !== null);

    return {
      totalAssigned: assignedTickets.length,
      openAssigned: allTickets.filter((t) => t.status === "open" || t.status === "assigned").length,
      inProgress: allTickets.filter((t) => t.status === "in_progress").length,
      awaitingClient: allTickets.filter((t) => t.status === "awaiting_client").length,
      resolvedClosed: allTickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
      criticalPriority: allTickets.filter(
        (t) => t.priority === "critical" && t.status !== "resolved" && t.status !== "closed"
      ).length,
    };
  };

  const stats = tickets.data ? calculateKpiStats(tickets.data) : null;
  const isKpiLoading = tickets.isLoading && !stats;

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
          <ExecutiveKpiSection stats={stats} isLoading={isKpiLoading} />

          {/* Active Ticket Ledger Queue */}
          <Card glowOnHover>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, color: "#63f5e8", fontSize: "1.1rem" }}>Recent Assigned & Queue Tickets</h3>
                <p style={{ margin: "0.25rem 0 0 0", color: "#94a3b8", fontSize: "0.825rem" }}>
                  Tickets in the support queue needing processing, assignment, or status updates.
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
                title="No tickets in queue"
                description="There are currently no support tickets in the database queue."
              />
            ) : (
              <ExecutiveRecentTicketsTable tickets={tickets.data || []} />
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default SupportDashboard;
