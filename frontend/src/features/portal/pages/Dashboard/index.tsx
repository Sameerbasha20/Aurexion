import React from "react";
import { Link } from "wouter";
import { Briefcase, CheckCircle2, Clock, FolderLock, LifeBuoy, MessageSquareCode, Plus, UserCircle, RefreshCw, Bell, Flag, Calendar } from "lucide-react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import PageHeader from "../../components/PageHeader";
import { ErrorState, LoadingState, EmptyState } from "../../components/StateViews";
import { TicketStatusBadge } from "../../components/TicketMeta";
import { buildTicketStats } from "../../types/portal.types";
import type { ClientProjectItem, ProjectMilestone, ClientNotificationItem, SupportTicketItem } from "../../types/portal.types";
import { formatDateTime } from "../../utils/format";
import useProfile from "../../hooks/useProfile";
import useMyTickets from "../../hooks/useMyTickets";
import usePortalQuery from "../../hooks/usePortalQuery";
import portalService from "../../services/portalService";

interface KpiCardProps {
  label: string;
  value: number;
  accent?: string;
  hint?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, accent = "#63f5e8", hint }) => (
  <Card glowOnHover style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.35rem", boxSizing: "border-box" }}>
    <h3 style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500, lineHeight: 1.2 }}>{label}</h3>
    <p style={{ fontSize: "2.25rem", fontWeight: 600, color: accent, margin: "0.25rem 0", lineHeight: 1.1 }}>{value}</p>
    {hint && <span style={{ color: "#64748b", fontSize: "0.78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hint}</span>}
  </Card>
);

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  under_review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delayed: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const Dashboard: React.FC = () => {
  const profile = useProfile();
  const ticketsQuery = useMyTickets();

  const projectsQuery = usePortalQuery<ClientProjectItem[]>(
    ["portal", "projects"],
    () => portalService.getProjects()
  );

  const milestonesQuery = usePortalQuery<ProjectMilestone[]>(
    ["portal", "milestones"],
    () => portalService.getMilestones()
  );

  const notificationsQuery = usePortalQuery<ClientNotificationItem[]>(
    ["portal", "notifications"],
    () => portalService.getNotifications()
  );

  const displayName =
    profile.data?.first_name || profile.data?.username || profile.data?.email || "Client";

  const tickets = ticketsQuery.data || [];
  const projects = projectsQuery.data || [];
  const milestones = milestonesQuery.data || [];
  const notifications = notificationsQuery.data || [];

  const stats = buildTicketStats(tickets);
  const recentTickets = [...tickets].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5);
  const activeProjects = projects.filter((p) => p.status !== "completed");
  const upcomingMilestones = milestones.filter((m) => m.status === "upcoming" || m.status === "in_progress" || m.is_current).slice(0, 5);
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const isLoading = profile.isLoading || ticketsQuery.isLoading || projectsQuery.isLoading || milestonesQuery.isLoading;

  const handleRefresh = () => {
    profile.refetch();
    ticketsQuery.refetch();
    projectsQuery.refetch();
    milestonesQuery.refetch();
    notificationsQuery.refetch();
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await portalService.markNotificationRead(id);
      notificationsQuery.refetch();
    } catch {
      // Ignore
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="ENTERPRISE PORTAL"
        title="Client Dashboard"
        description={`Welcome back, ${displayName}. Real-time engagement status, project milestones, and ticket tracking.`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} style={{ marginRight: "0.35rem" }} />
              Refresh
            </Button>
            <Link href="/portal/requests">
              <Button variant="outline" size="sm">
                <Calendar size={14} style={{ marginRight: "0.35rem" }} />
                Request Consultation
              </Button>
            </Link>
            <Link href="/portal/support/tickets/create">
              <Button glow size="sm">
                <Plus size={14} style={{ marginRight: "0.35rem" }} />
                New Ticket
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <LoadingState rows={4} label="LOADING CLIENT DASHBOARD DATA..." />
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", width: "100%" }}>
            <KpiCard label="Active Engagements" value={activeProjects.length} hint="Ongoing projects" accent="#63f5e8" />
            <KpiCard label="Upcoming Milestones" value={upcomingMilestones.length} hint="Pending deliverable dates" accent="#c4b5fd" />
            <KpiCard label="Open Support Tickets" value={stats.open + stats.assigned + stats.inProgress} hint="Active technical queries" accent="#38bdf8" />
            <KpiCard label="Unread Notifications" value={unreadNotifications.length} hint="Account security & updates" accent="#f43f5e" />
          </div>

          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
            {/* SECTION 1: Active Engagements */}
            <Card glowOnHover style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Briefcase size={18} color="#63f5e8" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc", fontWeight: 600 }}>Active Engagements</h3>
                </div>
                <Link href="/portal/projects">
                  <span style={{ fontSize: "0.8rem", color: "#63f5e8", cursor: "pointer" }}>View Project Tracker</span>
                </Link>
              </div>

              {projects.length === 0 ? (
                <EmptyState title="No active engagements" description="Your active client engagements and project progress will be displayed here." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      style={{
                        padding: "1rem",
                        border: "1px solid rgba(140,174,187,0.18)",
                        borderRadius: "6px",
                        backgroundColor: "rgba(10, 17, 28, 0.4)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#f8fafc", fontWeight: 600 }}>{proj.title}</h4>
                          {proj.delivery_lead_name && (
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                              Lead: <strong style={{ color: "#cbd5e1" }}>{proj.delivery_lead_name}</strong>
                            </span>
                          )}
                        </div>
                        <Badge className={STATUS_COLORS[proj.status] || "bg-gray-500/20 text-gray-400"}>
                          {proj.status_display || proj.status}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ margin: "0.75rem 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
                          <span>Progress</span>
                          <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>{proj.progress_percentage}%</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(140, 174, 187, 0.15)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${proj.progress_percentage}%`, height: "100%", backgroundColor: "#63f5e8" }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                        <span>Start: {proj.start_date || "N/A"}</span>
                        <span>Target: {proj.target_completion_date || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* SECTION 2: Project Milestones */}
            <Card glowOnHover style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Flag size={18} color="#c4b5fd" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc", fontWeight: 600 }}>Project Milestones</h3>
                </div>
                <Link href="/portal/projects">
                  <span style={{ fontSize: "0.8rem", color: "#c4b5fd", cursor: "pointer" }}>View Timeline</span>
                </Link>
              </div>

              {milestones.length === 0 ? (
                <EmptyState title="No upcoming milestones" description="Scheduled project milestones will appear here as deliverables advance." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {milestones.slice(0, 5).map((ms) => (
                    <div
                      key={ms.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem 1rem",
                        border: "1px solid rgba(140,174,187,0.18)",
                        borderRadius: "6px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "#f8fafc" }}>
                          {ms.name} {ms.is_current && <span style={{ color: "#63f5e8", fontSize: "0.72rem", marginLeft: "0.35rem" }}>(Current Phase)</span>}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                          {ms.project_title} · Planned: {ms.planned_date || "TBD"}
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[ms.status] || "bg-gray-500/20 text-gray-400"}>
                        {ms.status_display || ms.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* SECTION 3: Recent Support & Technical Tickets */}
            <Card glowOnHover style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <LifeBuoy size={18} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc", fontWeight: 600 }}>Recent Technical Tickets</h3>
                </div>
                <Link href="/portal/support/tickets">
                  <span style={{ fontSize: "0.8rem", color: "#38bdf8", cursor: "pointer" }}>View all</span>
                </Link>
              </div>

              {recentTickets.length === 0 ? (
                <EmptyState title="No technical tickets" description="Submit support tickets or operational incidents to track live engineering responses." />
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
                          padding: "0.75rem 1rem",
                          border: "1px solid rgba(140,174,187,0.18)",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 150ms",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)";
                          e.currentTarget.style.backgroundColor = "rgba(56,189,248,0.03)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor = "rgba(140,174,187,0.18)";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

            {/* SECTION 4: Unread Notifications */}
            <Card glowOnHover style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Bell size={18} color="#f43f5e" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc", fontWeight: 600 }}>Notifications</h3>
                </div>
                {unreadNotifications.length > 0 && (
                  <span
                    onClick={() => portalService.markAllNotificationsRead().then(() => notificationsQuery.refetch())}
                    style={{ fontSize: "0.75rem", color: "#f43f5e", cursor: "pointer", fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    Mark all read
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <EmptyState title="No unread notifications" description="Account notifications and project updates will be delivered here." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "0.75rem 1rem",
                        border: "1px solid rgba(140,174,187,0.18)",
                        borderRadius: "6px",
                        backgroundColor: n.is_read ? "transparent" : "rgba(244, 63, 94, 0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: n.is_read ? 400 : 600, color: "#f8fafc" }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.35rem", fontFamily: "IBM Plex Mono, monospace" }}>
                          {formatDateTime(n.created_at)}
                        </div>
                      </div>

                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkNotificationRead(n.id)}
                          style={{
                            background: "none",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            color: "#f43f5e",
                            borderRadius: "4px",
                            fontSize: "0.68rem",
                            padding: "0.2rem 0.4rem",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
