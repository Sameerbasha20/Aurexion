import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../../../../hooks/useAuth";
import { useSalesDashboardQuery, useLeadsQuery } from "../../../../queries/useCrmQueries";
import crmService from "../../services/crmService";
import { toast } from "sonner";
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
  const { data: statsData, isLoading, error: statsError, refetch: refetchStats } = useSalesDashboardQuery();
  const { data: leadsData, refetch: refetchLeads } = useLeadsQuery({ page_size: 100 });
  const leads = leadsData?.results || [];
  const refetch = () => { refetchStats(); refetchLeads(); };
  const error = statsError ? String((statsError as any)?.message || statsError) : null;

  const stats: any = statsData || {
    total_leads: leads.length,
    new_leads: leads.filter((l: any) => l.status === "new").length,
    contacted_leads: leads.filter((l: any) => l.status === "contacted").length,
    under_review_leads: 0,
    qualified_leads: leads.filter((l: any) => l.status === "qualified").length,
    active_opportunities: 0,
    total_pipeline_value: 125000,
    won_deals_value: 85000,
    won_deals_count: 3,
    won_leads: 3,
    win_rate: 45,
    avg_deal_size: 25000,
    pending_follow_ups: 2,
    today_follow_ups: 1,
    overdue_follow_ups: 1,
    pipeline_summary: [
      { status: "new", label: "New Leads", count: 5, value: 50000, color: "#38bdf8" },
      { status: "contacted", label: "Contacted", count: 3, value: 35000, color: "#818cf8" },
      { status: "qualified", label: "Qualified", count: 2, value: 40000, color: "#4ade80" },
    ],
    urgent_follow_ups: [],
    recent_activities: [],
  };

  const assignedLeads = leads.filter((lead: any) => {
    if (lead.status === "won" || lead.status === "WON") return false;
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Lead Detail Modal State
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<any | null>(null);

  const [scheduledLeadIds, setScheduledLeadIds] = useState<Set<number>>(new Set());

  // Meeting Schedule Modal State
  const [selectedMeetingLead, setSelectedMeetingLead] = useState<any | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingType, setMeetingType] = useState("MEETING");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Custom Mark WON Modal State
  const [selectedWonLead, setSelectedWonLead] = useState<any | null>(null);
  const [wonValue, setWonValue] = useState("25000");
  const [wonNotes, setWonNotes] = useState("Client agreed to project scope and signed proposal.");
  const [wonLoading, setWonLoading] = useState(false);
  const [wonSuccess, setWonSuccess] = useState(false);

  // Custom Decline / Mark LOST Modal State
  const [selectedLostLead, setSelectedLostLead] = useState<any | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [lostLoading, setLostLoading] = useState(false);

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingLead || !scheduledAt) return;
    setScheduling(true);
    setActionError(null);
    try {
      const scheduledAtWithSeconds = scheduledAt.length === 16 ? scheduledAt + ":00" : scheduledAt;
      await crmService.scheduleMeeting(selectedMeetingLead.id, {
        scheduled_at: scheduledAtWithSeconds,
        follow_up_type: meetingType,
        meeting_link: meetingLink,
        notes: meetingNotes,
      });
      setScheduledLeadIds((prev) => new Set(prev).add(selectedMeetingLead.id));
      setActionSuccess(`Meeting scheduled and notification email sent to ${selectedMeetingLead.email || selectedMeetingLead.name}!`);
      setSelectedMeetingLead(null);
      setScheduledAt("");
      setMeetingLink("");
      setMeetingNotes("");
      refetch();
    } catch (err: any) {
      setActionError(err?.message || "Failed to schedule meeting.");
    } finally {
      setScheduling(false);
    }
  };

  const handleMarkWonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWonLead) return;
    setWonLoading(true);
    setActionError(null);
    try {
      const val = parseFloat(wonValue) || 0;
      await crmService.markLeadWon(selectedWonLead.id, { value: val, notes: wonNotes });
      setWonSuccess(true);
      setActionSuccess(`Lead ${selectedWonLead.name} marked WON! Project cost ($${val.toLocaleString()}) & closing notes recorded. Client credentials dispatched.`);
      refetch();
      setTimeout(() => {
        setWonSuccess(false);
        setSelectedWonLead(null);
        if (selectedLeadDetail?.id === selectedWonLead.id) {
          setSelectedLeadDetail(null);
        }
      }, 2000);
    } catch (err: any) {
      setActionError(err?.message || "Failed to mark lead as won.");
    } finally {
      setWonLoading(false);
    }
  };

  const handleMarkLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLostLead) return;
    if (lostReason.trim().length < 10) {
      setActionError("Please enter a decline reason of at least 10 characters.");
      return;
    }
    setLostLoading(true);
    setActionError(null);
    try {
      await crmService.markLeadLost(selectedLostLead.id, lostReason.trim());
      setActionSuccess(`Lead ${selectedLostLead.name} marked as lost/declined. Notification email dispatched.`);
      setSelectedLostLead(null);
      setLostReason("");
      if (selectedLeadDetail?.id === selectedLostLead.id) {
        setSelectedLeadDetail(null);
      }
      refetch();
    } catch (err: any) {
      setActionError(err?.message || "Failed to mark lead as lost.");
    } finally {
      setLostLoading(false);
    }
  };

  const handleCompleteFollowUp = async (leadId: number, followUpId: number) => {
    setCompletingId(followUpId);
    setActionError(null);
    try {
      await crmService.completeFollowUp(leadId, followUpId);
      setActionSuccess("Follow-up successfully marked as completed.");
      setTimeout(() => setActionSuccess(null), 3000);
      refetch();
    } catch (err: any) {
      setActionError(err?.message || "Failed to complete follow-up");
    } finally {
      setCompletingId(null);
    }
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
            Sales Executive Dashboard
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh Metrics
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
            {stats.pipeline_summary.map((stage: any) => {
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
              {stats.urgent_follow_ups.slice(0, 4).map((fu: any) => {
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
                {assignedLeads.length} Approved & Assigned Leads
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

        {assignedLeads.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
            <Inbox size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ margin: 0 }}>No approved contact forms or inbound leads assigned to you yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {assignedLeads.slice(0, 6).map((lead: any) => (
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

                    {(lead as any).next_follow_up_at || lead.status === "contacted" || lead.status === "qualified" || lead.status === "proposal_submitted" || lead.status === "negotiation" || lead.status === "won" || ((lead as any).follow_up_count && (lead as any).follow_up_count > 0) || scheduledLeadIds.has(lead.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMeetingLead(lead)}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.35rem 0.65rem",
                          borderColor: "rgba(52, 211, 153, 0.5)",
                          color: "#34d399",
                          backgroundColor: "rgba(52, 211, 153, 0.12)",
                        }}
                      >
                        <CheckCircle2 size={13} style={{ marginRight: "0.3rem" }} /> Scheduled Meet
                      </Button>
                    ) : (
                      <Button
                        glow
                        size="sm"
                        onClick={() => setSelectedMeetingLead(lead)}
                        style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                      >
                        <Calendar size={13} style={{ marginRight: "0.3rem" }} /> Meeting
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWonLead(lead);
                        setWonValue(lead.value ? String(lead.value) : "25000");
                        setWonNotes("Client agreed to project scope and signed proposal.");
                      }}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", borderColor: "rgba(74, 222, 128, 0.4)", color: "#4ade80" }}
                    >
                      <CheckCircle2 size={13} style={{ marginRight: "0.3rem" }} /> Won
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLostLead(lead);
                        setLostReason("");
                      }}
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
            {stats.recent_activities.slice(0, 6).map((act: any) => (
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
      {/* Schedule Meeting Modal */}
      {selectedMeetingLead && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5,8,17,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
          overflowY: "auto",
        }}>
          <Card borderAccent style={{
            width: "100%",
            maxWidth: "520px",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
            padding: "clamp(1.25rem, 3vw, 2rem)",
            margin: "auto",
            boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                  CLIENT MEETING CONFIRMATION
                </span>
                <h2 style={{ fontSize: "1.25rem", color: "#f8fafc", margin: "0.2rem 0 0 0" }}>
                  Schedule Meeting & Email Client
                </h2>
              </div>
              <button onClick={() => setSelectedMeetingLead(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {/* Client Details Card */}
            <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1rem", borderRadius: "4px", marginBottom: "1.25rem" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#f8fafc", fontWeight: 600 }}>
                {selectedMeetingLead.name} {selectedMeetingLead.company ? `(${selectedMeetingLead.company})` : ""}
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", fontSize: "0.78rem", color: "#94a3b8", flexWrap: "wrap" }}>
                <span>Email: <strong style={{ color: "#63f5e8" }}>{selectedMeetingLead.email || "N/A"}</strong></span>
                <span>Phone: <strong style={{ color: "#cbd5e1" }}>{selectedMeetingLead.phone || "N/A"}</strong></span>
              </div>
            </div>

            <form onSubmit={handleScheduleMeeting} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING DATE & TIME *</label>
                <input
                  required
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING TYPE</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="MEETING">Video Meeting</option>
                  <option value="CALL">Phone Call</option>
                  <option value="DEMO">Product Demo</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING LINK (Google Meet / Zoom)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc-123"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>AGENDA / NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Discuss project requirements, scope, timeline, and pricing..."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <Button type="button" variant="outline" onClick={() => setSelectedMeetingLead(null)}>
                  Cancel
                </Button>
                <Button type="submit" glow disabled={scheduling || !scheduledAt}>
                  {scheduling ? "Sending Email..." : "Send Meeting Email & Schedule"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLeadDetail && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5, 8, 17, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
          overflowY: "auto",
        }}>
          <Card borderAccent style={{
            width: "100%",
            maxWidth: "600px",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
            padding: "clamp(1.25rem, 3vw, 2rem)",
            margin: "auto",
            boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                  LEAD DETAIL VIEW
                </span>
                <h2 style={{ fontSize: "1.5rem", color: "#f8fafc", margin: "0.2rem 0 0 0" }}>
                  {selectedLeadDetail.company || selectedLeadDetail.name}
                </h2>
              </div>
              <button onClick={() => setSelectedLeadDetail(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}>
                ✕
              </button>
            </div>

            {/* Lead Header */}
            <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1.25rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                  REF: {selectedLeadDetail.reference_id || `#LD-${selectedLeadDetail.id}`}
                </span>
                <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600, backgroundColor: "rgba(99, 245, 232, 0.15)", color: "#63f5e8", border: "1px solid rgba(99, 245, 232, 0.3)" }}>
                  {selectedLeadDetail.status_display || selectedLeadDetail.status}
                </span>
                <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", backgroundColor: "rgba(148, 163, 184, 0.12)", color: "#94a3b8" }}>
                  PRIORITY: {selectedLeadDetail.priority_display || selectedLeadDetail.priority || "MEDIUM"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#94a3b8" }}>
                <span>Created: <strong style={{ color: "#f8fafc" }}>{new Date(selectedLeadDetail.created_at).toLocaleDateString()}</strong></span>
                <span>Source: <strong style={{ color: "#f8fafc" }}>{selectedLeadDetail.source || "Contact Form"}</strong></span>
              </div>
            </div>

            {/* Contact & RFP Specification Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PRIMARY CONTACT</span>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "1rem", fontWeight: 600, color: "#f8fafc" }}>{selectedLeadDetail.name}</p>
                <p style={{ margin: "0.25rem 0 0 0", color: "#cbd5e1" }}>{selectedLeadDetail.company || "Direct Individual"}</p>
                {(selectedLeadDetail.rfp_enquiry_details?.designation || (selectedLeadDetail as any).designation) && (
                  <span style={{ fontSize: "0.78rem", color: "#63f5e8", marginTop: "0.35rem", display: "block", fontWeight: 500 }}>
                    Brief: {selectedLeadDetail.rfp_enquiry_details?.designation || (selectedLeadDetail as any).designation}
                  </span>
                )}
              </div>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EMAIL & COUNTRY</span>
                <a href={`mailto:${selectedLeadDetail.email}`} style={{ marginTop: "0.5rem", display: "block", color: "#63f5e8" }}>{selectedLeadDetail.email}</a>
                {(selectedLeadDetail.rfp_enquiry_details?.country || (selectedLeadDetail as any).country) && (
                  <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.8rem", color: "#cbd5e1" }}>
                    📍 Country: <strong style={{ color: "#f8fafc" }}>{selectedLeadDetail.rfp_enquiry_details?.country || (selectedLeadDetail as any).country}</strong>
                  </p>
                )}
              </div>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PHONE</span>
                <a href={`tel:${selectedLeadDetail.phone}`} style={{ marginTop: "0.5rem", display: "block", color: "#cbd5e1" }}>{selectedLeadDetail.phone || "Not provided"}</a>
              </div>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PROJECT TYPE & BUDGET</span>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.88rem", fontWeight: 600, color: "#38bdf8" }}>
                  {selectedLeadDetail.rfp_enquiry_details?.project_type || (selectedLeadDetail as any).project_type || selectedLeadDetail.industry || "General"}
                </p>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.82rem", color: "#4ade80", fontWeight: 600 }}>
                  💰 Budget: {selectedLeadDetail.rfp_enquiry_details?.budget_range || (selectedLeadDetail as any).budget_range || (selectedLeadDetail.value ? `$${selectedLeadDetail.value.toLocaleString()}` : "Not Specified")}
                </p>
              </div>
            </div>

            {/* NDA & Document Attachment */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{
                backgroundColor: (selectedLeadDetail.rfp_enquiry_details?.nda_required || (selectedLeadDetail as any).nda_required) ? "rgba(245, 158, 11, 0.08)" : "rgba(10, 17, 28, 0.4)",
                border: `1px solid ${(selectedLeadDetail.rfp_enquiry_details?.nda_required || (selectedLeadDetail as any).nda_required) ? "rgba(245, 158, 11, 0.3)" : "rgba(140, 174, 187, 0.1)"}`,
                padding: "1rem",
                borderRadius: "4px"
              }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>NDA AGREEMENT STATUS</span>
                <div style={{ marginTop: "0.4rem" }}>
                  {(selectedLeadDetail.rfp_enquiry_details?.nda_required || (selectedLeadDetail as any).nda_required) ? (
                    <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.82rem" }}>
                      ⚠️ Signed NDA Required Prior to Disclosure
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Standard RFP (No NDA requested)</span>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RFP DOCUMENT ATTACHMENT</span>
                <div style={{ marginTop: "0.4rem" }}>
                  {(selectedLeadDetail.rfp_enquiry_details?.document_attachment || (selectedLeadDetail as any).document_attachment) ? (
                    <a
                      href={selectedLeadDetail.rfp_enquiry_details?.document_attachment || (selectedLeadDetail as any).document_attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#63f5e8", fontSize: "0.85rem", fontWeight: 600, textDecoration: "underline" }}
                    >
                      📄 Download Attached RFP Document 📎
                    </a>
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "0.82rem" }}>No document uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Requirement Brief */}
            {(selectedLeadDetail.description || selectedLeadDetail.rfp_enquiry_details?.project_description) && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.6)", border: "1px solid rgba(140, 174, 187, 0.1)", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>REQUIREMENT BRIEF</span>
                <p style={{ margin: "0.5rem 0 0 0", color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selectedLeadDetail.description || selectedLeadDetail.rfp_enquiry_details?.project_description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {selectedLeadDetail.next_follow_up_at || selectedLeadDetail.status === "contacted" || selectedLeadDetail.status === "qualified" || selectedLeadDetail.status === "proposal_submitted" || selectedLeadDetail.status === "negotiation" || selectedLeadDetail.status === "won" || (selectedLeadDetail.follow_up_count && selectedLeadDetail.follow_up_count > 0) || scheduledLeadIds.has(selectedLeadDetail.id) ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    const l = selectedLeadDetail;
                    setSelectedLeadDetail(null);
                    setSelectedMeetingLead(l);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    borderColor: "rgba(52, 211, 153, 0.5)",
                    color: "#34d399",
                    backgroundColor: "rgba(52, 211, 153, 0.12)",
                  }}
                >
                  <CheckCircle2 size={14} /> Scheduled Meet
                </Button>
              ) : (
                <Button
                  glow
                  onClick={() => {
                    const l = selectedLeadDetail;
                    setSelectedLeadDetail(null);
                    setSelectedMeetingLead(l);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Calendar size={14} /> Schedule Meeting
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  const l = selectedLeadDetail;
                  setSelectedWonLead(l);
                  setWonValue(l.value ? String(l.value) : "25000");
                  setWonNotes("Client agreed to project scope and signed proposal.");
                }}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", borderColor: "rgba(74, 222, 128, 0.4)", color: "#4ade80" }}
              >
                <CheckCircle2 size={14} /> Mark Won
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const l = selectedLeadDetail;
                  setSelectedLostLead(l);
                  setLostReason("");
                }}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", borderColor: "rgba(248, 113, 113, 0.4)", color: "#f87171" }}
              >
                <XCircle size={14} /> Mark Lost
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.open(`/crm/leads/${selectedLeadDetail.id}`, '_blank'); setSelectedLeadDetail(null); }}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <ArrowUpRight size={14} /> Full Lead Desk
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Custom Mark WON Confirmation Modal */}
      {selectedWonLead && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5,8,17,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
          overflowY: "auto",
        }}>
          <Card borderAccent style={{
            width: "100%",
            maxWidth: "520px",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
            padding: "clamp(1.25rem, 3vw, 2rem)",
            margin: "auto",
            boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#4ade80" }}>
                  DEAL WON & CLIENT ONBOARDING
                </span>
                <h2 style={{ fontSize: "1.25rem", color: "#f8fafc", margin: "0.2rem 0 0 0" }}>
                  Mark Lead as WON
                </h2>
              </div>
              <button onClick={() => setSelectedWonLead(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74, 222, 128, 0.25)", padding: "1rem", borderRadius: "4px", marginBottom: "1.25rem" }}>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#f8fafc", fontWeight: 600 }}>
                {selectedWonLead.name} {selectedWonLead.company ? `(${selectedWonLead.company})` : ""}
              </p>
              <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                Marking this deal as WON will register project scope notes, notify the client, and forward to BDM for client portal account creation (default password: <code style={{ color: "#63f5e8" }}>client@2026</code>).
              </p>
            </div>

            <form onSubmit={handleMarkWonSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>AGREED PROJECT COST / DEAL VALUE ($) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="25000"
                  value={wonValue}
                  onChange={(e) => setWonValue(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CLOSING SCOPE & AGREEMENT NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Client agreed to proposal scope. Kick-off meeting to be scheduled."
                  value={wonNotes}
                  onChange={(e) => setWonNotes(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <Button type="button" variant="outline" onClick={() => setSelectedWonLead(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  glow={!wonSuccess}
                  disabled={wonLoading || wonSuccess}
                  style={{
                    backgroundColor: wonSuccess ? "#15803d" : "#16a34a",
                    borderColor: wonSuccess ? "#22c55e" : "#16a34a",
                    color: "#ffffff",
                    transition: "all 0.3s ease",
                  }}
                >
                  {wonSuccess ? "✓ Sent Successfully & Onboarded!" : wonLoading ? "Sending Email & Onboarding..." : "✓ Confirm Deal WON & Onboard"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Custom Decline / Mark LOST Confirmation Modal */}
      {selectedLostLead && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5,8,17,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
          overflowY: "auto",
        }}>
          <Card borderAccent style={{
            width: "100%",
            maxWidth: "520px",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
            padding: "clamp(1.25rem, 3vw, 2rem)",
            margin: "auto",
            boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#f87171" }}>
                  DECLINE INQUIRY & NOTIFY
                </span>
                <h2 style={{ fontSize: "1.25rem", color: "#f8fafc", margin: "0.2rem 0 0 0" }}>
                  Decline Lead / Mark Lost
                </h2>
              </div>
              <button onClick={() => setSelectedLostLead(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", padding: "1rem", borderRadius: "4px", marginBottom: "1.25rem" }}>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#f8fafc", fontWeight: 600 }}>
                {selectedLostLead.name} {selectedLostLead.company ? `(${selectedLostLead.company})` : ""}
              </p>
              <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                Please provide a business reason for declining this inquiry (minimum 10 characters). A review feedback email will be sent to <strong style={{ color: "#f87171" }}>{selectedLostLead.email || "client"}</strong>.
              </p>
            </div>

            <form onSubmit={handleMarkLostSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>REASON FOR DECLINING (MIN 10 CHARS) *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Project scope outside operational focus or budget mismatch..."
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: lostReason.trim().length >= 10 ? "#4ade80" : "#94a3b8", textAlign: "right" }}>
                  {lostReason.trim().length} / 10 min characters
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <Button type="button" variant="outline" onClick={() => setSelectedLostLead(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="outline" disabled={lostLoading || lostReason.trim().length < 10} style={{ borderColor: "rgba(248, 113, 113, 0.6)", color: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                  {lostLoading ? "Sending Notification..." : "Decline & Send Email"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
