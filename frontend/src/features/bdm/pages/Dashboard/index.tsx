import React, { useState, useEffect } from "react";
import { useBdmDashboard } from "../../hooks/useBdmDashboard";
import bdmService, { FormSubmission } from "../../services/bdmService";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "../../../../components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Mail, Phone, UserCheck, XCircle, CheckCircle2, User, MessageSquare, AlertTriangle, X, Eye, ArrowUpRight } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_submitted: "Proposal Submitted",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Declined / Lost",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#63f5e8",
  under_review: "#fbbf24",
  contacted: "#60a5fa",
  qualified: "#34d399",
  proposal_submitted: "#a78bfa",
  negotiation: "#f472b6",
  won: "#22c55e",
  lost: "#ef4444",
};

const SOURCE_LABELS: Record<string, string> = {
  rfp_form: "RFP Form",
  contact_form: "Contact Form",
  request_quote: "Request Quote",
  estimator: "Estimator",
  website_form: "Website Form",
};

const SOURCE_COLORS: Record<string, string> = {
  rfp_form: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  contact_form: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  request_quote: "bg-green-500/20 text-green-400 border-green-500/30",
  estimator: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  website_form: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  color = "#63f5e8",
  icon,
  trend,
}) => (
  <Card glowOnHover style={{ position: "relative", overflow: "hidden" }}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend && (
        <p className="text-xs mt-1" style={{ color: trend.value >= 0 ? "#22c55e" : "#ef4444" }}>
          {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </CardContent>
  </Card>
);

interface PipelineDataItem {
  status: string;
  total: number;
  color: string;
}

interface ActivityItem {
  id: number;
  action: string;
  repr: string;
  actor: string | null;
  timestamp: string;
}

export const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useBdmDashboard();

  // Lead Detail modal state
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<FormSubmission | null>(null);

  // Assign & Decline modal state
  const [salesExecs, setSalesExecs] = useState<Array<{ id: number; username: string; name: string; active_leads_count?: number }>>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [modalMode, setModalMode] = useState<"assign" | "decline" | null>(null);
  const [targetExecId, setTargetExecId] = useState<number | "">("");
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    bdmService.getAssignableUsers().then(setSalesExecs).catch((err) => {
      console.error("Failed to fetch assignable sales executives:", err);
    });
  }, []);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenAssign = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setTargetExecId(submission.assigned_to || "");
    setModalMode("assign");
  };

  const handleOpenDecline = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setDeclineReason("");
    setModalMode("decline");
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !targetExecId) return;
    setActionLoading(true);
    try {
      await bdmService.assignLead(selectedSubmission.id, Number(targetExecId));
      showFeedback("success", `Contact form lead (${selectedSubmission.reference_id}) assigned to Sales Executive successfully.`);
      setModalMode(null);
      refetch();
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to assign lead.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    const reason = declineReason.trim() || "Declined by BDM";
    setActionLoading(true);
    try {
      await bdmService.markLeadLost(selectedSubmission.id, reason);
      showFeedback("success", `Contact form lead (${selectedSubmission.reference_id}) marked as Declined.`);
      setModalMode(null);
      refetch();
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to decline lead.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>BDM Dashboard</h1>
        </div>
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} glowOnHover>
              <CardContent>
                <div style={{ height: "1.5rem", background: "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "0.5rem" }} />
                <div style={{ height: "3rem", background: "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "0.5rem", marginTop: "1rem" }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>BDM Dashboard</h1>
        </div>
        <Card borderAccent>
          <CardContent className="text-center py-8">
            <p style={{ color: "#ef4444" }}>Failed to load dashboard: {error}</p>
            <button type="button" onClick={refetch} className="mt-4 px-4 py-2 bg-[#63f5e8] text-[#050811] rounded font-medium">
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pipelineData: PipelineDataItem[] = data?.pipeline_summary?.map((item: { status: string; total: number }) => ({
    status: STATUS_LABELS[item.status] || item.status,
    total: item.total,
    color: STATUS_COLORS[item.status] || "#64748b",
  })) || [];

  const recentActivities: ActivityItem[] = data?.recent_activities || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>BDM Dashboard</h1>
        </div>
        <button type="button"
          onClick={refetch}
          className="px-4 py-2 bg-transparent border border-[#63f5e8] text-[#63f5e8] rounded font-medium hover:bg-[#63f5e8] hover:text-[#050811] transition-colors cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* Action Notification Banner */}
      {feedback && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            fontSize: "0.85rem",
            fontFamily: "IBM Plex Mono, monospace",
            backgroundColor: feedback.type === "success" ? "rgba(74, 222, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: feedback.type === "success" ? "#4ade80" : "#ef4444",
            border: feedback.type === "success" ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.text}
        </div>
      )}

      {/* Unassigned Triage Alert Banner */}
      {data && data.unassigned_leads > 0 && (
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: "rgba(99, 245, 232, 0.08)",
            border: "1px solid rgba(99, 245, 232, 0.25)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(99, 245, 232, 0.2)", display: "grid", placeItems: "center", color: "#63f5e8" }}>
              <UserCheck size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#f8fafc" }}>
                {data.unassigned_leads} Unassigned {data.unassigned_leads === 1 ? "Lead" : "Leads"} Awaiting Triage & Assignment
              </h4>
              <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                Business Development Manager review required. Assign inbound website submissions to Sales Executives.
              </p>
            </div>
          </div>
          <Button
            glow
            onClick={() => {
              const el = document.getElementById("inbound-submissions-table");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
          >
            Review Inbound Queue
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
        <MetricCard
          title="Total Leads"
          value={data?.total_leads || 0}
          subtitle={`${data?.assigned_leads || 0} assigned, ${data?.unassigned_leads || 0} unassigned`}
          color="#63f5e8"
        />
        <MetricCard
          title="New Leads"
          value={data?.new_leads || 0}
          subtitle="Awaiting initial contact"
          color="#60a5fa"
        />
        <MetricCard
          title="Qualified Leads"
          value={data?.qualified_leads || 0}
          subtitle="Ready for proposal"
          color="#34d399"
        />
        <MetricCard
          title="Active Opportunities"
          value={data?.active_opportunities || 0}
          subtitle="In negotiation pipeline"
          color="#a78bfa"
        />
        <MetricCard
          title="Overdue Follow-ups"
          value={data?.overdue_follow_ups || 0}
          subtitle="Requires immediate action"
          color="#ef4444"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(data?.conversion_rate || 0).toFixed(1)}%`}
          subtitle={`${data?.won_leads || 0} won / ${data?.lost_leads || 0} lost`}
          color="#fbbf24"
        />
      </div>

      {/* Lead Lifecycle State Machine Flow (PRD Section 4.7) */}
      <Card borderAccent style={{ backgroundColor: "rgba(10, 17, 28, 0.6)" }}>
        <CardHeader className="pb-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <p className="eyebrow" style={{ margin: 0, color: "#63f5e8" }}>ENTERPRISE CRM PIPELINE</p>
              <CardTitle className="text-lg mt-1" style={{ color: "#f8fafc" }}>Lead Lifecycle State Machine</CardTitle>
            </div>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
              PRD SEC 4.7 SPECIFICATION
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem 0", overflowX: "auto" }}>
            {[
              { status: "NEW", label: "NEW", color: "#63f5e8", bg: "rgba(99, 245, 232, 0.15)", border: "rgba(99, 245, 232, 0.3)" },
              { status: "UNDER_REVIEW", label: "UNDER REVIEW", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)", border: "rgba(251, 191, 36, 0.3)" },
              { status: "CONTACTED", label: "CONTACTED", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.15)", border: "rgba(96, 165, 250, 0.3)" },
              { status: "QUALIFIED", label: "QUALIFIED", color: "#34d399", bg: "rgba(52, 211, 153, 0.15)", border: "rgba(52, 211, 153, 0.3)" },
              { status: "PROPOSAL_SUBMITTED", label: "PROPOSAL SUBMITTED", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.15)", border: "rgba(167, 139, 250, 0.3)" },
              { status: "NEGOTIATION", label: "NEGOTIATION", color: "#f472b6", bg: "rgba(244, 114, 182, 0.15)", border: "rgba(244, 114, 182, 0.3)" },
              { status: "WON", label: "WON / LOST", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)" },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.status}>
                <div
                  style={{
                    padding: "0.5rem 0.85rem",
                    borderRadius: "4px",
                    backgroundColor: step.bg,
                    border: `1px solid ${step.border}`,
                    color: step.color,
                    fontSize: "0.72rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: step.color }} />
                  {step.label}
                </div>
                {idx < arr.length - 1 && (
                  <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 700 }}>➔</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts & Activity */}
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300, minWidth: 0, width: "100%" }}>
              <ChartContainer
                config={{
                  total: { label: "Leads", color: "#63f5e8" },
                }}
              >
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [value.toLocaleString(), "Leads"]}
                        labelFormatter={(label) => label}
                      />
                    }
                  />
                  <ChartLegend />
                  <Bar
                    dataKey="total"
                    name="Leads"
                    radius={[0, 4, 4, 0]}
                    fill="#63f5e8"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {recentActivities.length > 0 ? (
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {recentActivities.map((activity: ActivityItem) => (
                    <li
                      key={activity.id}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        background: "rgba(99, 245, 232, 0.05)",
                        border: "1px solid rgba(99, 245, 232, 0.1)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 500, color: "#63f5e8", margin: 0 }}>
                          {activity.action}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>
                          {activity.repr}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                          {activity.actor || "System"}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DEDICATED SECTION: Contact Form & Public Inbound Submissions */}
      <Card borderAccent>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>INBOUND PUBLIC FORM DESK</p>
            <CardTitle className="text-xl mt-1">Contact Form & Inbound Submissions</CardTitle>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {data?.recent_form_submissions?.length || 0} Submissions
          </Badge>
        </CardHeader>

        <CardContent>
          {data?.recent_form_submissions?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data?.recent_form_submissions?.map((submission) => {
                const isLost = submission.status === "lost";
                const isAssigned = !!submission.assigned_to;

                return (
                  <div
                    key={submission.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      padding: "1.25rem",
                      background: isLost
                        ? "rgba(239, 68, 68, 0.04)"
                        : isAssigned
                        ? "rgba(56, 189, 248, 0.04)"
                        : "rgba(99, 245, 232, 0.03)",
                      border: isLost
                        ? "1px solid rgba(239, 68, 68, 0.2)"
                        : isAssigned
                        ? "1px solid rgba(56, 189, 248, 0.2)"
                        : "1px solid rgba(99, 245, 232, 0.2)",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {/* Header Row: Ref ID, Source Badge, Status, Date */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.82rem", color: "#63f5e8", fontWeight: 600 }}>
                          {submission.reference_id}
                        </span>
                        <Badge className={SOURCE_COLORS[submission.source] || "bg-gray-500/20 text-gray-400"}>
                          {SOURCE_LABELS[submission.source] || submission.source_display}
                        </Badge>
                        <Badge className={STATUS_COLORS[submission.status] || "bg-gray-500/20 text-gray-400"}>
                          {STATUS_LABELS[submission.status] || submission.status}
                        </Badge>
                      </div>

                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                        Submitted on {new Date(submission.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Contact Details & Message Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                      {/* Left: Contact Info */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
                        <p style={{ fontWeight: 600, color: "#f8fafc", margin: 0, fontSize: "1rem" }}>
                          {submission.name}
                        </p>
                        {submission.company && (
                          <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.82rem" }}>
                            Company: <strong style={{ color: "#f8fafc" }}>{submission.company}</strong>
                          </p>
                        )}
                        <a href={`mailto:${submission.email}`} style={{ color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", fontSize: "0.82rem" }}>
                          <Mail size={13} /> {submission.email}
                        </a>
                        {submission.phone && (
                          <a href={`tel:${submission.phone}`} style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", fontSize: "0.82rem" }}>
                            <Phone size={13} color="#64748b" /> {submission.phone}
                          </a>
                        )}

                        {isAssigned && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.4rem", color: "#38bdf8", fontSize: "0.8rem", fontWeight: 500 }}>
                            <User size={13} /> Assigned to: {submission.assigned_to_name}
                          </div>
                        )}
                      </div>

                      {/* Right: Message / Description */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                          <MessageSquare size={12} style={{ display: "inline", marginRight: "0.3rem" }} /> INQUIRY / MESSAGE BRIEF
                        </span>
                        <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5, backgroundColor: "rgba(5, 8, 17, 0.6)", padding: "0.6rem 0.75rem", borderRadius: "4px", whiteSpace: "pre-wrap" }}>
                          {submission.description || "No message body provided."}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar: BDM Assign / Decline Buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", borderTop: "1px solid rgba(140, 174, 187, 0.1)", paddingTop: "0.75rem" }}>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedLeadDetail(submission)}
                        style={{ fontSize: "0.78rem", color: "#63f5e8", borderColor: "rgba(99, 245, 232, 0.3)" }}
                      >
                        <Eye size={14} style={{ marginRight: "0.35rem" }} /> View Lead Detail
                      </Button>

                      {!isLost ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleOpenDecline(submission)}
                            style={{ fontSize: "0.78rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.3)" }}
                          >
                            <XCircle size={14} style={{ marginRight: "0.35rem" }} /> Decline / Reject
                          </Button>
                          <Button
                            glow
                            onClick={() => handleOpenAssign(submission)}
                            style={{ fontSize: "0.78rem" }}
                          >
                            <UserCheck size={14} style={{ marginRight: "0.35rem" }} />
                            {isAssigned ? "Reassign Executive" : "Assign to Sales Executive"}
                          </Button>
                        </>
                      ) : (
                        <span style={{ fontSize: "0.78rem", color: "#f87171", fontFamily: "IBM Plex Mono, monospace" }}>
                          DECLINED / REJECTED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>
              No contact form or public submissions recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Won Clients & Closed Deals Section */}
      <Card>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <CardTitle style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} /> Won Clients & Revenue Breakdown
              </CardTitle>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                Deals successfully converted and closed by Sales Executives.
              </p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {data?.won_clients?.length || 0} Closed Deals
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {data?.won_clients && data.won_clients.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.2)", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    <th style={{ padding: "0.75rem 1rem", minWidth: "160px" }}>CLIENT NAME / COMPANY</th>
                    <th style={{ padding: "0.75rem 1rem", minWidth: "180px" }}>CONTACT EMAIL</th>
                    <th style={{ padding: "0.75rem 1rem", minWidth: "130px" }}>PROJECT COST ($)</th>
                    <th style={{ padding: "0.75rem 1rem", minWidth: "150px" }}>CLOSED BY (SALES EXEC)</th>
                    <th style={{ padding: "0.75rem 1rem", minWidth: "190px" }}>STATUS</th>
                    <th style={{ padding: "0.75rem 1rem", minWidth: "180px", textAlign: "right" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.won_clients.map((client) => (
                    <tr key={client.id} style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", backgroundColor: "rgba(10, 17, 28, 0.4)" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#f8fafc" }}>
                        <div>{client.name}</div>
                        <span style={{ fontSize: "0.75rem", color: "#cbd5e1", fontWeight: 400 }}>{client.company}</span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#63f5e8", fontFamily: "IBM Plex Mono, monospace" }}>
                        {client.email}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#22c55e", fontSize: "0.95rem" }}>
                        ${client.value ? client.value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#38bdf8", fontWeight: 500 }}>
                        {client.assigned_to_name || "Unassigned"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: "0.78rem" }}>
                        {new Date(client.updated_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>
              No deals marked as WON yet. Won deals will display here with project cost and Sales Executive attribution.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal: Assign Submission */}
      {modalMode === "assign" && selectedSubmission && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5, 8, 17, 0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
          overflowY: "auto",
        }}>
          <Card borderAccent style={{
            width: "100%",
            maxWidth: "500px",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
            padding: "clamp(1.25rem, 3vw, 2rem)",
            margin: "auto",
            boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>ASSIGN LEAD TO SALES EXECUTIVE</p>
                <h3 style={{ fontSize: "1.25rem", color: "#f8fafc", margin: "0.25rem 0 0 0" }}>
                  {selectedSubmission.name} ({selectedSubmission.company || "Individual"})
                </h3>
              </div>
              <button onClick={() => setModalMode(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", background: "rgba(99, 245, 232, 0.05)", padding: "0.75rem", borderRadius: "4px" }}>
                <p style={{ margin: 0 }}>Reference ID: <strong style={{ color: "#63f5e8" }}>{selectedSubmission.reference_id}</strong></p>
                <p style={{ margin: "0.25rem 0 0 0" }}>Source: <strong>{SOURCE_LABELS[selectedSubmission.source] || selectedSubmission.source_display}</strong></p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", marginBottom: "0.4rem" }}>
                  SELECT SALES EXECUTIVE *
                </label>
                <select
                  value={targetExecId}
                  onChange={(e) => setTargetExecId(Number(e.target.value) || "")}
                  required
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    backgroundColor: "#0a111c",
                    border: "1px solid rgba(99, 245, 232, 0.3)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">-- Choose Sales Executive --</option>
                  {salesExecs.map((exec) => (
                    <option key={exec.id} value={exec.id}>
                      {exec.name} ({exec.username}) — {exec.active_leads_count ?? 0} active leads
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>
                  {actionLoading ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Decline Submission */}
      {modalMode === "decline" && selectedSubmission && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5, 8, 17, 0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
          overflowY: "auto",
        }}>
          <Card style={{
            width: "100%",
            maxWidth: "500px",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
            padding: "clamp(1.25rem, 3vw, 2rem)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            margin: "auto",
            boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0, color: "#f87171" }}>DECLINE / REJECT INBOUND SUBMISSION</p>
                <h3 style={{ fontSize: "1.25rem", color: "#f8fafc", margin: "0.25rem 0 0 0" }}>
                  {selectedSubmission.name}
                </h3>
              </div>
              <button onClick={() => setModalMode(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            <form onSubmit={handleDeclineSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.8rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                    REASON FOR DECLINING *
                  </label>
                  <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: declineReason.trim().length >= 10 ? "#22c55e" : "#f87171" }}>
                    {declineReason.trim().length} / 10 min chars
                  </span>
                </div>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  placeholder="Provide a detailed reason for rejecting (minimum 10 characters)..."
                  required
                  minLength={10}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    backgroundColor: "#0a111c",
                    border: declineReason.trim().length > 0 && declineReason.trim().length < 10 ? "1px solid #ef4444" : "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {declineReason.trim().length > 0 && declineReason.trim().length < 10 && (
                  <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: "0.35rem 0 0 0" }}>
                    Please enter at least 10 characters explaining the reason for declining.
                  </p>
                )}
                <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0.35rem 0 0 0" }}>
                  📧 An automated decline notification email will be sent to <strong>{selectedSubmission.email}</strong>.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Cancel</Button>
                <Button 
                  type="submit" 
                  style={{ backgroundColor: "#ef4444", color: "#ffffff", opacity: declineReason.trim().length < 10 ? 0.5 : 1 }} 
                  disabled={actionLoading || declineReason.trim().length < 10}
                >
                  {actionLoading ? "Declining & Emailing..." : "Decline Submission"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: BDM Lead Detail View */}
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
                  BDM LEAD DETAIL VIEW
                </span>
                <h2 style={{ fontSize: "1.5rem", color: "#f8fafc", margin: "0.2rem 0 0 0" }}>
                  {selectedLeadDetail.company || selectedLeadDetail.name}
                </h2>
              </div>
              <button onClick={() => setSelectedLeadDetail(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}>
                ✕
              </button>
            </div>

            {/* Lead Header Info */}
            <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1.25rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
                  REF: {selectedLeadDetail.reference_id || `#LD-${selectedLeadDetail.id}`}
                </span>
                <Badge className={SOURCE_COLORS[selectedLeadDetail.source] || "bg-gray-500/20 text-gray-400"}>
                  {SOURCE_LABELS[selectedLeadDetail.source] || selectedLeadDetail.source_display}
                </Badge>
                <Badge className={STATUS_COLORS[selectedLeadDetail.status] || "bg-gray-500/20 text-gray-400"}>
                  {STATUS_LABELS[selectedLeadDetail.status] || selectedLeadDetail.status}
                </Badge>
              </div>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#94a3b8" }}>
                <span>Submitted: <strong style={{ color: "#f8fafc" }}>{new Date(selectedLeadDetail.created_at).toLocaleString()}</strong></span>
                <span>Assigned To: <strong style={{ color: selectedLeadDetail.assigned_to ? "#38bdf8" : "#fbbf24" }}>{selectedLeadDetail.assigned_to_name || "Unassigned"}</strong></span>
              </div>
            </div>

            {/* Contact Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PRIMARY CONTACT</span>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "1rem", fontWeight: 600, color: "#f8fafc" }}>{selectedLeadDetail.name}</p>
                <p style={{ margin: "0.25rem 0 0 0", color: "#cbd5e1" }}>{selectedLeadDetail.company || "Direct Individual"}</p>
              </div>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EMAIL</span>
                <a href={`mailto:${selectedLeadDetail.email}`} style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem", color: "#63f5e8", textDecoration: "none" }}>
                  <Mail size={13} /> {selectedLeadDetail.email}
                </a>
              </div>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.4)", border: "1px solid rgba(140, 174, 187, 0.1)", padding: "1rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PHONE</span>
                <a href={`tel:${selectedLeadDetail.phone}`} style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem", color: "#cbd5e1", textDecoration: "none" }}>
                  <Phone size={13} /> {selectedLeadDetail.phone || "Not provided"}
                </a>
              </div>
            </div>

            {/* Requirement Brief */}
            {selectedLeadDetail.description && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.6)", border: "1px solid rgba(140, 174, 187, 0.1)", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>INQUIRY / REQUIREMENT BRIEF</span>
                <p style={{ margin: "0.5rem 0 0 0", color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selectedLeadDetail.description}</p>
              </div>
            )}

            {/* BDM Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "flex-end" }}>
              {selectedLeadDetail.status !== "lost" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const item = selectedLeadDetail;
                      setSelectedLeadDetail(null);
                      handleOpenDecline(item);
                    }}
                    style={{ fontSize: "0.82rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.3)" }}
                  >
                    <XCircle size={14} style={{ marginRight: "0.35rem" }} /> Decline / Reject
                  </Button>
                  <Button
                    glow
                    onClick={() => {
                      const item = selectedLeadDetail;
                      setSelectedLeadDetail(null);
                      handleOpenAssign(item);
                    }}
                    style={{ fontSize: "0.82rem" }}
                  >
                    <UserCheck size={14} style={{ marginRight: "0.35rem" }} />
                    {selectedLeadDetail.assigned_to ? "Reassign Executive" : "Assign to Sales Executive"}
                  </Button>
                </>
              )}
              {/* <Button
                variant="outline"
                onClick={() => {
                  window.open(`/crm/leads/${selectedLeadDetail.id}`, '_blank');
                  setSelectedLeadDetail(null);
                }}
                style={{ fontSize: "0.82rem" }}
              >
                <ArrowUpRight size={14} style={{ marginRight: "0.35rem" }} /> Open Full Workspace
              </Button> */}
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;