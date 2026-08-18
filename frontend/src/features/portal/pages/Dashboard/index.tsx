import React from "react";
import { Link } from "wouter";
import { Briefcase, CheckCircle2, Clock, FolderLock, LifeBuoy, MessageSquareCode, Plus, UserCircle } from "lucide-react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import PageHeader from "../../components/PageHeader";
import { ErrorState, LoadingState, EmptyState } from "../../components/StateViews";
import { TicketStatusBadge } from "../../components/TicketMeta";
import { buildTicketStats } from "../../types/portal.types";
import { formatDateTime } from "../../utils/format";
import useProfile from "../../hooks/useProfile";
import useMyTickets from "../../hooks/useMyTickets";

interface KpiCardProps {
  label: string;
  value: number;
  accent?: string;
  hint?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, accent = "#63f5e8", hint }) => (
  <Card glowOnHover>
    <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>{label}</h3>
    <p style={{ fontSize: "2.25rem", fontWeight: 600, color: accent, margin: "0.5rem 0 0 0" }}>{value}</p>
    {hint && <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{hint}</span>}
  </Card>
);

const MODULES = [
  { name: "Projects", path: "/portal/projects", icon: Briefcase, available: false },
  { name: "Requests", path: "/portal/requests", icon: MessageSquareCode, available: false },
  { name: "Documents", path: "/portal/documents", icon: FolderLock, available: false },
  { name: "Support", path: "/portal/support", icon: LifeBuoy, available: true },
  { name: "Profile", path: "/portal/profile", icon: UserCircle, available: true },
];

export const Dashboard: React.FC = () => {
  const profile = useProfile();
  const tickets = useMyTickets();

  const displayName =
    profile.data?.first_name || profile.data?.username || profile.data?.email || "Client";

  const stats = tickets.data ? buildTicketStats(tickets.data) : null;
  const recentTickets = tickets.data ? [...tickets.data].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5) : [];

  const ticketsLoading = tickets.isLoading;
  const ticketsError = tickets.isError;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="CLIENT CENTER"
        title="Client Dashboard"
        description={`Welcome, ${displayName}. Live operational overview scoped to your account.`}
        actions={
          <Link href="/portal/support/tickets/create">
            <Button glow size="sm">
              <Plus size={14} />
              New Support Ticket
            </Button>
          </Link>
        }
      />

      {ticketsLoading ? (
        <LoadingState rows={4} label="Loading dashboard statistics" />
      ) : ticketsError ? (
        <ErrorState error={tickets.error} onRetry={tickets.refetch} title="Unable to load dashboard statistics" />
      ) : stats && tickets.data ? (
        <>
          <div style={{ display: "grid", gap: "1.5rem" }} className="grid-responsive">
            <KpiCard label="Open Tickets" value={stats.open} hint="Open or assigned" />
            <KpiCard label="In Progress" value={stats.inProgress} accent="#63f5e8" hint="Currently being worked on" />
            <KpiCard label="Awaiting Client" value={stats.awaitingClient} accent="#c4b5fd" hint="Waiting on your input" />
            <KpiCard label="Resolved" value={stats.resolved} accent="#4ade80" hint="Resolution delivered" />
          </div>

          {stats.total === 0 ? (
            <EmptyState
              title="No support tickets yet"
              description="When you submit a support ticket it will appear here with its live status."
              action={
                <Link href="/portal/support/tickets/create">
                  <Button glow size="sm">
                    <Plus size={14} />
                    Create your first ticket
                  </Button>
                </Link>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#63f5e8" }}>Recent Tickets</h3>
                  <Link href="/portal/support/tickets">
                    <span style={{ fontSize: "0.8rem", color: "#63f5e8", cursor: "pointer" }}>View all</span>
                  </Link>
                </div>
                {recentTickets.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>No tickets to display.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {recentTickets.map((ticket) => (
                      <Link key={ticket.id} href={`/portal/support/tickets/${ticket.id}`}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            border: "1px solid rgba(140,174,187,0.18)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 150ms",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = "rgba(99,245,232,0.4)";
                            e.currentTarget.style.backgroundColor = "rgba(99,245,232,0.03)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "rgba(140,174,187,0.18)";
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {ticket.subject}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                              {ticket.ticket_id} · {formatDateTime(ticket.updated_at)}
                            </div>
                          </div>
                          <TicketStatusBadge status={ticket.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#63f5e8" }}>Module Availability</h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                    LIVE STATUS
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <Link key={mod.name} href={mod.path}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.6rem 0.75rem",
                            border: "1px solid rgba(140,174,187,0.18)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 150ms",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = "rgba(99,245,232,0.4)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "rgba(140,174,187,0.18)";
                          }}
                        >
                          <Icon size={16} style={{ color: mod.available ? "#63f5e8" : "#64748b" }} />
                          <span style={{ fontSize: "0.85rem", flex: 1 }}>{mod.name}</span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontFamily: "IBM Plex Mono, monospace",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: mod.available ? "#4ade80" : "#64748b",
                            }}
                          >
                            {mod.available ? "Enabled" : "Pending API"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "1rem 0 0 0", lineHeight: 1.6 }}>
                  Modules marked Pending API are not yet exposed by the backend for client users. No simulated data is
                  displayed.
                </p>
              </Card>
            </div>
          )}
        </>
      ) : (
        <EmptyState title="No dashboard data" />
      )}

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8", marginBottom: "0.5rem" }}>
          <Clock size={16} />
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem", letterSpacing: "0.1em" }}>
            ACCOUNT SUMMARY
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", color: "#cbd5e1", fontSize: "0.9rem" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>USERNAME</div>
            <div style={{ marginTop: "0.25rem" }}>{profile.data?.username || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>EMAIL</div>
            <div style={{ marginTop: "0.25rem" }}>{profile.data?.email || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>ROLE</div>
            <div style={{ marginTop: "0.25rem" }}>{profile.data?.role || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>MEMBER SINCE</div>
            <div style={{ marginTop: "0.25rem" }}>{formatDateTime(profile.data?.date_joined)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;