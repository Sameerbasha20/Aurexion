import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../../../../hooks/useAuth";
import { toast } from "sonner";
import {
  useSalesDashboardQuery,
  useLeadsQuery,
  useMarkLeadWonMutation,
  useMarkLeadLostMutation,
  useCompleteFollowUpMutation,
} from "../../../../queries/useCrmQueries";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import LoadingState from "../../../../components/feedback/LoadingState";
import ErrorState from "../../../../components/feedback/ErrorState";
import LeadDetailDrawer from "../../components/LeadDetailDrawer";
import {
  Users,
  Clock,
  CheckCircle2,
  Flame,
  ArrowUpRight,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
  Plus,
  ChevronRight,
  Activity,
  Inbox,
  XCircle,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useSalesDashboardQuery();
  const { data: leadsData } = useLeadsQuery({ page_size: 100 });
  const assignedLeads = leadsData?.results || [];
  const approvedAssignedLeads = assignedLeads.filter((lead) => {
    if (lead.status === "lost" || lead.status === "LOST") return false;
    if (user && user.role === "SALES_EXECUTIVE") {
      const isAssignedToMe =
        lead.assigned_to === Number(user.id) ||
        (lead.assigned_to_name && (
          String(lead.assigned_to_name).toLowerCase() === String(user.name || "").toLowerCase() ||
          String(lead.assigned_to_name).toLowerCase() === String(user.email || "").toLowerCase()
        ));
      return isAssignedToMe;
    }
    return !!lead.assigned_to;
  });
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Lead Detail Modal State
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<any | null>(null);

  // Meeting Schedule Modal State
  const [selectedMeetingLead, setSelectedMeetingLead] = useState<any | null>(null);

  const wonMutation = useMarkLeadWonMutation();
  const lostMutation = useMarkLeadLostMutation();
  const completeFollowUpMutation = useCompleteFollowUpMutation();

  const handleMarkWon = (leadId: number, leadName: string) => {
    if (!window.confirm(`Mark ${leadName} as WON? This will generate client credentials (default password: client@2026) and email the client.`)) return;
    wonMutation.mutate(leadId, {
      onSuccess: () => toast.success(`Lead marked WON! Client User account created (password: client@2026) & credentials email sent.`),
      onError: (err: any) => toast.error(err?.message || "Failed to mark lead as won."),
    });
  };

  const handleMarkLost = (leadId: number) => {
    const reason = window.prompt("Reason for declining/marking lost:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("A reason is required to mark as lost.");
      return;
    }
    lostMutation.mutate(
      { leadId, reason: reason.trim() },
      {
        onSuccess: () => toast.success("Lead marked as lost/declined."),
        onError: (err: any) => toast.error(err?.message || "Failed to mark lead as lost."),
      }
    );
  };

  const handleCompleteFollowUp = (leadId: number, followUpId: number) => {
    setCompletingId(followUpId);
    completeFollowUpMutation.mutate(
      { leadId, followUpId },
      {
        onSuccess: () => toast.success("Follow-up successfully marked as completed."),
        onError: (err: any) => toast.error(err?.message || "Failed to complete follow-up."),
        onSettled: () => setCompletingId(null),
      }
    );
  };

  const handleOpenLeadDetail = (lead: any) => {
    setSelectedLeadDetail(lead);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow">SALES EXECUTIVE DESK</p>
            <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>CRM Performance Console</h1>
          </div>
        </div>
        <LoadingState message="Loading sales dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">SALES EXECUTIVE DESK</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>CRM Performance Console</h1>
        </div>
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  const stats = data || {
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    under_review_leads: 0,
    qualified_leads: 0,
    active_opportunities: 0,
    pending_follow_ups: 0,
    overdue_follow_ups: 0,
    today_follow_ups: 0,
    won_leads: 0,
    lost_leads: 0,
    win_rate: 0,
    pipeline_summary: [],
    recent_activities: [],
    urgent_follow_ups: [],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Header & Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>SALES EXECUTIVE CONSOLE</p>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.15rem 0.5rem",
              borderRadius: "2px",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              border: "1px solid rgba(99, 245, 232, 0.3)",
              color: "#63f5e8",
              fontSize: "0.68rem",
              fontFamily: "IBM Plex Mono, monospace",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#63f5e8" }} />
              API LIVE
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Sales Performance Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/crm/follow-ups">
            <Button variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={14} /> Follow-ups ({stats.pending_follow_ups})
            </Button>
          </Link>
          <Link href="/crm/leads">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Plus size={14} /> Manage Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        {/* Total Pipeline Leads */}
        <Card glowOnHover style={{ padding: "1.4rem", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Total Leads
            </span>
            <Users size={18} color="#63f5e8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#f8fafc", margin: "0.4rem 0" }}>
            {stats.total_leads}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span style={{ color: "#63f5e8", fontWeight: 500 }}>{stats.new_leads} new</span>
            <span>in current funnel</span>
          </div>
        </Card>

        {/* Qualified Deals */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Qualified Leads
            </span>
            <Flame size={18} color="#818cf8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#818cf8", margin: "0.4rem 0" }}>
            {stats.qualified_leads}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span>Active opportunities: </span>
            <span style={{ color: "#f8fafc", fontWeight: 600 }}>{stats.active_opportunities}</span>
          </div>
        </Card>

        {/* Pending & Urgent Follow-ups */}
        <Card glowOnHover style={{
          padding: "1.4rem",
          borderColor: stats.overdue_follow_ups > 0 ? "rgba(248, 113, 113, 0.4)" : undefined,
          backgroundColor: stats.overdue_follow_ups > 0 ? "rgba(248, 113, 113, 0.03)" : undefined,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Pending Follow-ups
            </span>
            <Clock size={18} color={stats.overdue_follow_ups > 0 ? "#f87171" : "#38bdf8"} />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: stats.overdue_follow_ups > 0 ? "#f87171" : "#38bdf8", margin: "0.4rem 0" }}>
            {stats.pending_follow_ups}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem" }}>
            {stats.overdue_follow_ups > 0 ? (
              <span style={{ color: "#f87171", fontWeight: 600 }}>⚠️ {stats.overdue_follow_ups} overdue action(s)</span>
            ) : (
              <span style={{ color: "#4ade80" }}>✓ {stats.today_follow_ups} due today</span>
            )}
          </div>
        </Card>

        {/* Closed Won Deals */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Won Deals
            </span>
            <CheckCircle2 size={18} color="#4ade80" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#4ade80", margin: "0.4rem 0" }}>
            {stats.won_leads}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span>Win Rate: </span>
            <span style={{ color: "#63f5e8", fontWeight: 600 }}>{stats.win_rate}%</span>
          </div>
        </Card>
      </div>

      {/* Pipeline Stage Distribution & Urgent Action Desk */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* Pipeline Stage Distribution Card */}
        <Card style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Lead Pipeline Funnel</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
                Real status distribution across {stats.total_leads} database records
              </p>
            </div>
            <Link href="/crm/leads">
              <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
                View Funnel <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {stats.pipeline_summary.map((stage) => {
              const percentage = stats.total_leads > 0 ? Math.round((stage.count / stats.total_leads) * 100) : 0;
              return (
                <div key={stage.status} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                    <span style={{ color: "#cbd5e1" }}>{stage.label}</span>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", color: stage.color, fontWeight: 500 }}>
                      {stage.count} ({percentage}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(140, 174, 187, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: stage.color,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Urgent Action Desk - Today's & Overdue Follow-ups */}
        <Card style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Immediate Follow-up Actions</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
                Scheduled client touchpoints requiring attention
              </p>
            </div>
            <Link href="/crm/follow-ups">
              <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
                All ({stats.pending_follow_ups}) <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          {stats.urgent_follow_ups.length === 0 ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#94a3b8" }}>
              <CheckCircle2 size={32} color="#4ade80" style={{ margin: "0 auto 0.5rem" }} />
              <p style={{ margin: 0, fontSize: "0.9rem" }}>No pending follow-ups scheduled.</p>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>All client communication trails are current.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.urgent_follow_ups.slice(0, 4).map((fu) => {
                const isOverdue = new Date(fu.scheduled_at).getTime() < Date.now();
                return (
                  <div
                    key={fu.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 1rem",
                      backgroundColor: "rgba(14, 24, 38, 0.6)",
                      border: isOverdue ? "1px solid rgba(248, 113, 113, 0.3)" : "1px solid rgba(140, 174, 187, 0.15)",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "4px",
                          backgroundColor: isOverdue ? "rgba(248, 113, 113, 0.15)" : "rgba(99, 245, 232, 0.1)",
                          display: "grid",
                          placeItems: "center",
                          color: isOverdue ? "#f87171" : "#63f5e8",
                        }}
                      >
                        {fu.follow_up_type === "CALL" ? (
                          <Phone size={16} />
                        ) : fu.follow_up_type === "EMAIL" ? (
                          <Mail size={16} />
                        ) : (
                          <Calendar size={16} />
                        )}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "#f8fafc" }}>
                            {fu.lead_name || `Lead #${fu.lead}`}
                          </span>
                          {fu.lead_company && (
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>({fu.lead_company})</span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: isOverdue ? "#f87171" : "#94a3b8", fontFamily: "IBM Plex Mono, monospace" }}>
                          {isOverdue ? "OVERDUE: " : "DUE: "} {new Date(fu.scheduled_at).toLocaleDateString()} at{" "}
                          {new Date(fu.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Link href={`/crm/leads/${fu.lead}`}>
                        <Button variant="outline" style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem" }}>
                          Open
                        </Button>
                      </Link>
                      <Button
                        glow
                        disabled={completingId === fu.id}
                        onClick={() => handleCompleteFollowUp(fu.lead, fu.id)}
                        style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        {completingId === fu.id ? "..." : "Done"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* DEDICATED SECTION: Assigned Contact Forms & Inbound Leads */}
      <Card style={{ padding: "1.5rem" }} borderAccent>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <p className="eyebrow" style={{ margin: 0 }}>ASSIGNED DESK</p>
              <span style={{
                fontSize: "0.7rem",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#63f5e8",
                backgroundColor: "rgba(99, 245, 232, 0.1)",
                padding: "0.15rem 0.5rem",
                borderRadius: "2px",
              }}>
                {approvedAssignedLeads.length} Approved & Assigned Leads
              </span>
            </div>
            <h3 style={{ fontSize: "1.2rem", margin: "0.25rem 0 0 0", color: "#f8fafc" }}>
              Assigned Contact Forms & Inbound Leads
            </h3>
          </div>
          <Link href="/crm/leads">
            <Button variant="outline" style={{ fontSize: "0.78rem" }}>
              View Pipeline Desk &rarr;
            </Button>
          </Link>
        </div>

        {approvedAssignedLeads.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
            <Inbox size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ margin: 0 }}>No approved contact forms or inbound leads assigned to you yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {approvedAssignedLeads.slice(0, 6).map((lead) => (
              <div
                key={lead.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: "rgba(10, 17, 28, 0.6)",
                  border: "1px solid rgba(140, 174, 187, 0.15)",
                  borderRadius: "6px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
                      {lead.reference_id || `#LD-${lead.id}`}
                    </span>
                    <span
                      style={{
                        padding: "0.15rem 0.45rem",
                        borderRadius: "2px",
                        fontSize: "0.68rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        backgroundColor: "rgba(99, 245, 232, 0.12)",
                        color: "#63f5e8",
                        textTransform: "uppercase",
                      }}
                    >
                      {lead.source ? lead.source.replace("_", " ") : "Contact Form"}
                    </span>
                    <span
                      style={{
                        padding: "0.15rem 0.45rem",
                        borderRadius: "2px",
                        fontSize: "0.68rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        backgroundColor: "rgba(56, 189, 248, 0.12)",
                        color: "#38bdf8",
                      }}
                    >
                      {lead.status_display || lead.status}
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.98rem", color: "#f8fafc" }}>
                    {lead.company ? `${lead.company} (${lead.name})` : lead.name}
                  </h4>

                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#94a3b8", flexWrap: "wrap" }}>
                    <a href={`mailto:${lead.email}`} style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Mail size={12} color="#63f5e8" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Phone size={12} color="#64748b" /> {lead.phone}
                      </a>
                    )}
                  </div>

                  {lead.description && (
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8", backgroundColor: "rgba(5, 8, 17, 0.5)", padding: "0.5rem 0.6rem", borderRadius: "4px", lineHeight: 1.4 }}>
                      {lead.description.length > 150 ? `${lead.description.slice(0, 150)}...` : lead.description}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenLeadDetail(lead)}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                    >
                      <ArrowUpRight size={13} style={{ marginRight: "0.3rem" }} /> Details
                    </Button>
                    <Button
                      glow
                      size="sm"
                      onClick={() => setSelectedMeetingLead(lead)}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                    >
                      <Calendar size={13} style={{ marginRight: "0.3rem" }} /> Meeting
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkWon(lead.id, lead.name)}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", borderColor: "rgba(74, 222, 128, 0.4)", color: "#4ade80" }}
                    >
                      <CheckCircle2 size={13} style={{ marginRight: "0.3rem" }} /> Won
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkLost(lead.id)}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", borderColor: "rgba(248, 113, 113, 0.4)", color: "#f87171" }}
                    >
                      Decline
                    </Button>
                    <Link href={`/crm/leads/${lead.id}`}>
                      <Button variant="outline" style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                        Desk &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Activity Timeline & Audit Feed */}
      <Card style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Sales Activity Ledger</h3>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
              Live chronological communication trail, status changes, and notes
            </p>
          </div>
          <Link href="/crm/activities">
            <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
              Full Activity Feed <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>

        {stats.recent_activities.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
            <Activity size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ margin: 0 }}>No recent activities recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {stats.recent_activities.slice(0, 6).map((act) => (
              <div
                key={act.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(10, 17, 28, 0.4)",
                  border: "1px solid rgba(140, 174, 187, 0.12)",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    padding: "0.4rem",
                    borderRadius: "4px",
                    backgroundColor:
                      act.type === "WON"
                        ? "rgba(74, 222, 128, 0.1)"
                        : act.type === "LOST"
                        ? "rgba(248, 113, 113, 0.1)"
                        : act.type === "QUALIFIED"
                        ? "rgba(129, 140, 248, 0.1)"
                        : "rgba(99, 245, 232, 0.08)",
                    color:
                      act.type === "WON"
                        ? "#4ade80"
                        : act.type === "LOST"
                        ? "#f87171"
                        : act.type === "QUALIFIED"
                        ? "#818cf8"
                        : "#63f5e8",
                  }}
                >
                  <Activity size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "#f8fafc" }}>
                      {act.title}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                      {new Date(act.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                    {act.description}
                  </p>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem", fontSize: "0.72rem", color: "#64748b" }}>
                    <span>Actor: <strong style={{ color: "#cbd5e1" }}>{act.actor}</strong></span>
                    {act.lead_id && (
                      <Link href={`/crm/leads/${act.lead_id}`}>
                        <span style={{ color: "#63f5e8", cursor: "pointer" }}>View Lead &rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {/* Lead Detail Drawer (replaces Modals) */}
      <LeadDetailDrawer
        leadId={selectedLeadDetail?.id || selectedMeetingLead?.id || null}
        open={!!selectedLeadDetail || !!selectedMeetingLead}
        onClose={() => {
          setSelectedLeadDetail(null);
          setSelectedMeetingLead(null);
        }}
        onLeadUpdated={refetch}
      />

    </div>
  );
};

export default Dashboard;
