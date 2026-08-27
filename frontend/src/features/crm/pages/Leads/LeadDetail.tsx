import React, { useState } from "react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import {
  useLeadDetailQuery,
  useAssignableUsersQuery,
  useUpdateLeadMutation,
  useTransitionLeadMutation,
  useQualifyLeadMutation,
  useMarkLeadWonMutation,
  useMarkLeadLostMutation,
  useAssignLeadMutation,
  useCreateNoteMutation,
  useCreateFollowUpMutation,
  useCompleteFollowUpMutation,
} from "../../../../queries/useCrmQueries";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  Send,
  Plus,
  Edit,
  X,
  FileText,
  Activity,
  UserCheck,
  RotateCcw,
  DollarSign,
  ArrowRight,
} from "lucide-react";

interface LeadStatusBadgeProps {
  status: string;
  statusDisplay?: string;
}

const STATUS_COLOR_CONFIG: Record<string, { bg: string; color: string; border: string }> = {
  NEW: { bg: "rgba(99, 245, 232, 0.15)", color: "#63f5e8", border: "rgba(99, 245, 232, 0.4)" },
  UNDER_REVIEW: { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", border: "rgba(251, 191, 36, 0.4)" },
  CONTACTED: { bg: "rgba(96, 165, 250, 0.15)", color: "#60a5fa", border: "rgba(96, 165, 250, 0.4)" },
  QUALIFIED: { bg: "rgba(129, 140, 248, 0.15)", color: "#818cf8", border: "rgba(129, 140, 248, 0.4)" },
  PROPOSAL_SUBMITTED: { bg: "rgba(167, 139, 250, 0.15)", color: "#a78bfa", border: "rgba(167, 139, 250, 0.4)" },
  NEGOTIATION: { bg: "rgba(244, 114, 182, 0.15)", color: "#f472b6", border: "rgba(244, 114, 182, 0.4)" },
  WON: { bg: "rgba(74, 222, 128, 0.15)", color: "#4ade80", border: "rgba(74, 222, 128, 0.4)" },
  LOST: { bg: "rgba(248, 113, 113, 0.15)", color: "#f87171", border: "rgba(248, 113, 113, 0.4)" },
};

const LIFECYCLE_STAGES = [
  { key: "NEW", label: "NEW", code: "new", color: "#63f5e8" },
  { key: "UNDER_REVIEW", label: "UNDER REVIEW", code: "under_review", color: "#fbbf24" },
  { key: "CONTACTED", label: "CONTACTED", code: "contacted", color: "#60a5fa" },
  { key: "QUALIFIED", label: "QUALIFIED", code: "qualified", color: "#818cf8" },
  { key: "PROPOSAL_SUBMITTED", label: "PROPOSAL SUBMITTED", code: "proposal_submitted", color: "#a78bfa" },
  { key: "NEGOTIATION", label: "NEGOTIATION", code: "negotiation", color: "#f472b6" },
  { key: "WON", label: "WON", code: "won", color: "#4ade80" },
];

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, statusDisplay }) => {
  const cleanStatus = status?.toUpperCase() || "NEW";
  const styleConfig = STATUS_COLOR_CONFIG[cleanStatus] || STATUS_COLOR_CONFIG.NEW;

  return (
    <span
      style={{
        padding: "0.2rem 0.6rem",
        borderRadius: "3px",
        fontSize: "0.7rem",
        fontFamily: "IBM Plex Mono, monospace",
        fontWeight: 600,
        backgroundColor: styleConfig.bg,
        color: styleConfig.color,
        border: `1px solid ${styleConfig.border}`,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: styleConfig.color }} />
      {statusDisplay || cleanStatus}
    </span>
  );
};

export const LeadDetail: React.FC = () => {
  const [, crmParams] = useRoute("/crm/leads/:id");
  const [, salesParams] = useRoute("/sales/leads/:id");
  const params = crmParams || salesParams;
  const leadId = Number(params?.id);

  const { lead, followUps, notes, isLoading, error, refetch } = useLeadDetailQuery(leadId);
  const { data: users = [] } = useAssignableUsersQuery();

  const updateLeadMutation = useUpdateLeadMutation(leadId);
  const transitionMutation = useTransitionLeadMutation(leadId);
  const qualifyMutation = useQualifyLeadMutation();
  const wonMutation = useMarkLeadWonMutation();
  const lostMutation = useMarkLeadLostMutation();
  const assignMutation = useAssignLeadMutation(leadId);
  const addNoteMutation = useCreateNoteMutation(leadId);
  const addFollowUpMutation = useCreateFollowUpMutation(leadId);
  const completeFollowUpMutation = useCompleteFollowUpMutation();

  const actionLoading =
    updateLeadMutation.isPending ||
    transitionMutation.isPending ||
    qualifyMutation.isPending ||
    wonMutation.isPending ||
    lostMutation.isPending ||
    assignMutation.isPending ||
    addNoteMutation.isPending ||
    addFollowUpMutation.isPending ||
    completeFollowUpMutation.isPending;

  // Local state for modals & actions
  const [activeTab, setActiveTab] = useState<"overview" | "followups" | "notes" | "timeline">("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isLostOpen, setIsLostOpen] = useState(false);
  const [isWonOpen, setIsWonOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    industry: "",
    source: "",
    priority: "MEDIUM",
    description: "",
  });

  const [lostReason, setLostReason] = useState("");
  const [wonForm, setWonForm] = useState({
    value: 25000,
    notes: "Client agreed to project scope and accepted commercial proposal.",
  });
  const [assignUserId, setAssignUserId] = useState<number | "">("");
  const [noteContent, setNoteContent] = useState("");
  const [followUpForm, setFollowUpForm] = useState({
    follow_up_type: "CALL",
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    notes: "",
    meeting_link: "",
  });


  const handleOpenEdit = () => {
    if (lead) {
      setEditForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        website: lead.website || "",
        industry: lead.industry || "",
        source: lead.source || "",
        priority: lead.priority || "MEDIUM",
        description: lead.description || "",
      });
      setIsEditOpen(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLeadMutation.mutateAsync(editForm);
      setIsEditOpen(false);
      toast.success("Lead specification updated successfully.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update lead.");
    }
  };

  const handleStageTransition = async (targetStatus: string) => {
    try {
      await transitionMutation.mutateAsync(targetStatus);
      toast.success(`Lead stage updated to ${targetStatus.replace(/_/g, " ")}.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to transition lead status.");
    }
  };

  const handleConfirmWon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await wonMutation.mutateAsync(leadId);
      setIsWonOpen(false);
      toast.success(`Lead marked WON!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark lead as won.");
    }
  };

  const handleConfirmLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostReason.trim()) {
      toast.error("Please provide a reason for lost status.");
      return;
    }
    try {
      await lostMutation.mutateAsync({ leadId, reason: lostReason.trim() });
      setIsLostOpen(false);
      setLostReason("");
      toast.success("Lead marked as LOST.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark lead lost.");
    }
  };

  const handleReopen = async () => {
    try {
      await transitionMutation.mutateAsync("NEW");
      toast.success("Lead re-opened and returned to active pipeline!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to re-open lead.");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) return;
    try {
      await assignMutation.mutateAsync(Number(assignUserId));
      setIsAssignOpen(false);
      toast.success("Lead assigned to sales executive.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign lead.");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await addNoteMutation.mutateAsync(noteContent);
      setNoteContent("");
      toast.success("Note appended to communication ledger.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add note.");
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFollowUpMutation.mutateAsync({
        ...followUpForm,
        scheduled_at: new Date(followUpForm.scheduled_at).toISOString(),
      });
      setIsFollowUpOpen(false);
      setFollowUpForm({
        follow_up_type: "CALL",
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        notes: "",
        meeting_link: "",
      });
      toast.success("Follow-up scheduled successfully.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to schedule follow-up.");
    }
  };

  const handleCompleteFollowUpItem = async (followUpId: number) => {
    try {
      await completeFollowUpMutation.mutateAsync({ leadId, followUpId });
      toast.success("Follow-up marked as completed.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to complete follow-up.");
    }
  };

  const handleTransitionContacted = () => {
    transitionMutation.mutate("CONTACTED", {
      onSuccess: () => toast.success("Lead marked as CONTACTED."),
      onError: (err: any) => toast.error(err?.message || "Failed to transition lead."),
    });
  };

  const handleQualify = () => {
    qualifyMutation.mutate(leadId, {
      onSuccess: () => toast.success("Lead qualified to opportunity."),
      onError: (err: any) => toast.error(err?.message || "Failed to qualify lead."),
    });
  };

  const handleMarkWon = () => {
    wonMutation.mutate(leadId, {
      onSuccess: () => toast.success("Lead marked as WON."),
      onError: (err: any) => toast.error(err?.message || "Failed to mark lead as won."),
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "1rem 0" }}>
        <Link href="/crm/leads">
          <Button variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.4rem", width: "fit-content" }}>
            <ArrowLeft size={14} /> Back to Leads Funnel
          </Button>
        </Link>
        <Card style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
          <p style={{ fontFamily: "IBM Plex Mono, monospace" }}>ACCESSING LEAD SPECIFICATION RECORD...</p>
        </Card>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "1rem 0" }}>
        <Link href="/crm/leads">
          <Button variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.4rem", width: "fit-content" }}>
            <ArrowLeft size={14} /> Back to Leads Funnel
          </Button>
        </Link>
        <Card style={{ padding: "2rem", borderColor: "rgba(239, 68, 68, 0.3)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#ef4444", marginBottom: "1rem" }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0 }}>Lead Record Unavailable</h3>
          </div>
          <p style={{ color: "#cbd5e1" }}>{error?.message || "The requested lead was not found or access is restricted."}</p>
          <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const cleanStatus = lead.status?.toUpperCase() || "NEW";
  const currentStageIndex = LIFECYCLE_STAGES.findIndex((s) => s.key === cleanStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", width: "100%" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/crm/leads">
          <Button variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ArrowLeft size={14} /> Leads Funnel
          </Button>
        </Link>

      </div>

      {/* Main Lead Header Card with PRD 4.7 State Machine Flow */}
      <Card borderAccent style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
                LEAD REF // {lead.reference_id || `#LD-${lead.id}`}
              </span>
              <LeadStatusBadge status={cleanStatus} statusDisplay={lead.status_display} />
              <span
                style={{
                  padding: "0.15rem 0.45rem",
                  borderRadius: "2px",
                  fontSize: "0.68rem",
                  fontFamily: "IBM Plex Mono, monospace",
                  backgroundColor: "rgba(148, 163, 184, 0.12)",
                  color: "#94a3b8",
                }}
              >
                PRIORITY: {lead.priority_display || lead.priority || "MEDIUM"}
              </span>
            </div>
            <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0", color: "#f8fafc" }}>
              {lead.company || lead.name}
            </h1>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8" }}>
              Primary Contact: <strong style={{ color: "#e2e8f0" }}>{lead.name}</strong> · Established on{" "}
              {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Top Quick Actions */}
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Button variant="outline" onClick={handleOpenEdit} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Edit size={14} /> Edit Info
            </Button>
            <Button variant="outline" onClick={() => setIsAssignOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <UserCheck size={14} /> Assign
            </Button>
            <Button
              glow
              onClick={() => setIsFollowUpOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Clock size={14} /> Schedule Follow-up
            </Button>
          </div>
        </div>

        {/* Dynamic Status Transition Ribbon */}
        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid rgba(140, 174, 187, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
              UPDATE STAGE:
            </span>
            <select
              value={cleanStatus}
              disabled={actionLoading || cleanStatus === "WON"}
              onChange={(e) => {
                const target = e.target.value;
                if (target === "WON") {
                  setIsWonOpen(true);
                } else if (target === "LOST") {
                  setIsLostOpen(true);
                } else {
                  handleStageTransition(target);
                }
              }}
              style={{
                padding: "0.4rem 0.75rem",
                backgroundColor: "rgba(5, 8, 17, 0.9)",
                border: "1px solid rgba(99, 245, 232, 0.3)",
                color: "#f8fafc",
                borderRadius: "4px",
                fontSize: "0.78rem",
                fontFamily: "IBM Plex Mono, monospace",
                cursor: cleanStatus === "WON" ? "not-allowed" : "pointer",
                opacity: cleanStatus === "WON" ? 0.8 : 1,
                outline: "none",
              }}
              title={cleanStatus === "WON" ? "Won deal is locked (managed by BDM)" : "Update stage"}
            >
              <option value="NEW">NEW</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL_SUBMITTED">PROPOSAL SUBMITTED</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {cleanStatus === "NEW" && (
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={handleTransitionContacted}
                style={{ fontSize: "0.78rem" }}
              >
                Mark Contacted
              </Button>
            )}

            {["NEW", "CONTACTED", "UNDER_REVIEW"].includes(cleanStatus) && (
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={handleQualify}
                style={{ fontSize: "0.78rem", color: "#818cf8", borderColor: "rgba(129, 140, 248, 0.4)" }}
              >
                <Award size={14} style={{ marginRight: "0.35rem" }} /> Qualify to Opportunity
              </Button>
            )}
            {cleanStatus !== "WON" && cleanStatus !== "LOST" && (
              <>
                <Button
                  glow
                  disabled={actionLoading}
                  onClick={handleMarkWon}
                  style={{ fontSize: "0.78rem", color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.4)" }}
                >
                  <CheckCircle2 size={13} style={{ marginRight: "0.3rem" }} /> Mark Won Deal
                </Button>
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => setIsLostOpen(true)}
                  style={{ fontSize: "0.78rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.4)" }}
                >
                  <XCircle size={13} style={{ marginRight: "0.3rem" }} /> Mark Lost
                </Button>
              </>
            )}

            {cleanStatus === "LOST" && (
              <Button
                glow
                disabled={actionLoading}
                onClick={handleReopen}
                style={{ fontSize: "0.78rem", backgroundColor: "#63f5e8", color: "#050811" }}
              >
                <RotateCcw size={13} style={{ marginRight: "0.3rem" }} /> Re-open Lead
              </Button>
            )}

            {cleanStatus === "WON" && (
              <span style={{ fontSize: "0.8rem", color: "#4ade80", fontFamily: "IBM Plex Mono, monospace", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <CheckCircle2 size={15} /> WON DEAL // Awaiting BDM Portal Credentials Dispatch
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Main Details & Tabs Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "1.5rem" }}>
        {/* Left Column: Lead Specification Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <Card style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 1.25rem 0", color: "#f8fafc" }}>
              Lead Specification
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Email:</span>
                <a href={`mailto:${lead.email}`} style={{ color: "#63f5e8", textDecoration: "none" }}>
                  {lead.email}
                </a>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Phone:</span>
                <span style={{ color: "#f8fafc" }}>{lead.phone || "Not provided"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Company:</span>
                <span style={{ color: "#f8fafc", fontWeight: 500 }}>{lead.company || "Direct Individual"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Industry:</span>
                <span style={{ color: "#f8fafc" }}>{lead.industry || "General"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Website:</span>
                {lead.website ? (
                  <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#63f5e8" }}>
                    {lead.website}
                  </a>
                ) : (
                  <span style={{ color: "#64748b" }}>None</span>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Lead Source:</span>
                <span style={{ color: "#f8fafc" }}>{lead.source || "Website Inbound"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Assigned Executive:</span>
                <span style={{ color: "#63f5e8", fontWeight: 500 }}>{lead.assigned_to_name || "Unassigned"}</span>
              </div>

              {lead.value !== undefined && lead.value > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                  <span style={{ color: "#94a3b8" }}>Project Cost / Deal Value:</span>
                  <span style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.95rem" }}>${lead.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {lead.lost_reason && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", padding: "0.75rem", backgroundColor: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.2)", borderRadius: "4px" }}>
                  <span style={{ color: "#f87171", fontWeight: 600, fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace" }}>
                    LOST REASON
                  </span>
                  <span style={{ color: "#f8fafc", fontSize: "0.82rem" }}>{lead.lost_reason}</span>
                </div>
              )}
            </div>

            {lead.description && (
              <div style={{ marginTop: "1.25rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                  REQUIREMENT BRIEF
                </span>
                <p style={{ margin: "0.4rem 0 0 0", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5, backgroundColor: "rgba(5, 8, 17, 0.6)", padding: "0.75rem", borderRadius: "4px" }}>
                  {lead.description}
                </p>
              </div>
            )}

            {lead.rfp_enquiry_details && (
              <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(140, 174, 187, 0.15)", paddingTop: "1.25rem" }}>
                <h4 style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  RFP Submission details
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.4rem", borderBottom: "1px solid rgba(140, 174, 187, 0.05)" }}>
                    <span style={{ color: "#94a3b8" }}>RFP Reference ID:</span>
                    <span style={{ color: "#cbd5e1", fontFamily: "IBM Plex Mono, monospace" }}>{lead.rfp_enquiry_details?.reference_id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.4rem", borderBottom: "1px solid rgba(140, 174, 187, 0.05)" }}>
                    <span style={{ color: "#94a3b8" }}>Designation:</span>
                    <span style={{ color: "#f8fafc" }}>{lead.rfp_enquiry_details?.designation}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.4rem", borderBottom: "1px solid rgba(140, 174, 187, 0.05)" }}>
                    <span style={{ color: "#94a3b8" }}>Country:</span>
                    <span style={{ color: "#f8fafc" }}>{lead.rfp_enquiry_details?.country}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.4rem", borderBottom: "1px solid rgba(140, 174, 187, 0.05)" }}>
                    <span style={{ color: "#94a3b8" }}>Budget Range:</span>
                    <span style={{ color: "#f8fafc" }}>{lead.rfp_enquiry_details?.budget_range}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.4rem", borderBottom: "1px solid rgba(140, 174, 187, 0.05)" }}>
                    <span style={{ color: "#94a3b8" }}>NDA Status:</span>
                    <span style={{
                      color: lead.rfp_enquiry_details?.nda_required ? "#f87171" : "#4ade80",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      fontFamily: "IBM Plex Mono, monospace"
                    }}>
                      {lead.rfp_enquiry_details?.nda_required ? "NDA REQUIRED" : "NO NDA REQUIRED"}
                    </span>
                  </div>
                  
                  {lead.rfp_enquiry_details?.document_attachment && (
                    <div style={{
                      marginTop: "0.5rem",
                      padding: "0.75rem",
                      backgroundColor: "rgba(99, 245, 232, 0.05)",
                      border: "1px dashed rgba(99, 245, 232, 0.25)",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem"
                    }}>
                      <FileText size={18} style={{ color: "#63f5e8", flexShrink: 0 }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#cbd5e1", fontWeight: 500 }}>Uploaded RFP Document</span>
                        <a
                          href={lead.rfp_enquiry_details.document_attachment.startsWith("http")
                            ? lead.rfp_enquiry_details.document_attachment
                            : `http://localhost:8000${lead.rfp_enquiry_details.document_attachment}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "0.75rem", color: "#63f5e8", textDecoration: "underline", wordBreak: "break-all" }}
                        >
                          Download Attachment
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Append Communication Note Box */}
          <Card style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem 0", color: "#f8fafc" }}>
              Append Communication Note
            </h3>
            <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <textarea
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#050811",
                  border: "1px solid rgba(140, 174, 187, 0.25)",
                  color: "#f8fafc",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" glow disabled={actionLoading || !noteContent.trim()}>
                  <Send size={14} style={{ marginRight: "0.4rem" }} /> Post Note
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Interactive Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Tab Navigation */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(140, 174, 187, 0.2)", gap: "0.5rem" }}>
            {(["overview", "followups", "notes", "timeline"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.6rem 1rem",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid #63f5e8" : "2px solid transparent",
                  color: activeTab === tab ? "#63f5e8" : "#94a3b8",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {tab === "overview" && "Summary"}
                {tab === "followups" && `Follow-ups (${followUps.length})`}
                {tab === "notes" && `Notes (${notes.length})`}
                {tab === "timeline" && "Timeline"}
              </button>
            ))}
          </div>

          {/* Tab Content Panes */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <Card style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem 0", color: "#f8fafc" }}>
                  Upcoming Touchpoints
                </h3>
                {followUps.filter((f) => f.status === "PENDING").length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8" }}>
                    <p style={{ margin: 0 }}>No pending follow-ups scheduled.</p>
                    <Button variant="outline" onClick={() => setIsFollowUpOpen(true)} style={{ marginTop: "0.75rem" }}>
                      <Plus size={14} style={{ marginRight: "0.3rem" }} /> Schedule Follow-up
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {followUps
                      .filter((f) => f.status === "PENDING")
                      .slice(0, 3)
                      .map((fu) => (
                        <div
                          key={fu.id}
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "rgba(14, 24, 38, 0.6)",
                            border: "1px solid rgba(140, 174, 187, 0.15)",
                            borderRadius: "4px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc" }}>
                              {fu.follow_up_type_display || fu.follow_up_type}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#63f5e8", fontFamily: "IBM Plex Mono, monospace" }}>
                              {new Date(fu.scheduled_at).toLocaleString()}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleCompleteFollowUpItem(fu.id)}
                            style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                          >
                            Mark Done
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              <Card style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem 0", color: "#f8fafc" }}>
                  Recent Communication Trail
                </h3>
                {notes.length === 0 ? (
                  <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.85rem" }}>No notes logged yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {notes.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "rgba(14, 24, 38, 0.6)",
                          border: "1px solid rgba(140, 174, 187, 0.15)",
                          borderRadius: "4px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "0.3rem" }}>
                          <span style={{ color: "#63f5e8" }}>{n.created_by_name || "Executive"}</span>
                          <span>{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1" }}>{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === "followups" && (
            <LeadFollowUpsTab
              followUps={followUps}
              actionLoading={actionLoading}
              onOpenSchedule={() => setIsFollowUpOpen(true)}
              onCompleteItem={handleCompleteFollowUpItem}
            />
          )}

          {activeTab === "notes" && <LeadNotesTab notes={notes} />}

          {activeTab === "timeline" && (
            <LeadTimelineTab lead={lead} notes={notes} followUps={followUps} />
          )}
        </div>
      </div>

      {/* MODALS */}
      <LeadEditModal
        isOpen={isEditOpen}
        editForm={editForm}
        actionLoading={actionLoading}
        onClose={() => setIsEditOpen(false)}
        onFormChange={setEditForm}
        onSubmit={handleSaveEdit}
      />

      <LeadAssignModal
        isOpen={isAssignOpen}
        assignUserId={assignUserId}
        users={users}
        actionLoading={actionLoading}
        onClose={() => setIsAssignOpen(false)}
        onUserChange={setAssignUserId}
        onAssign={handleAssign}
      />

      <LeadLostModal
        isOpen={isLostOpen}
        lostReason={lostReason}
        actionLoading={actionLoading}
        onClose={() => setIsLostOpen(false)}
        onReasonChange={setLostReason}
        onConfirm={handleConfirmLost}
      />

      <LeadWonModal
        isOpen={isWonOpen}
        wonForm={wonForm}
        actionLoading={actionLoading}
        onClose={() => setIsWonOpen(false)}
        onFormChange={setWonForm}
        onConfirm={handleConfirmWon}
      />

      <LeadScheduleFollowUpModal
        isOpen={isFollowUpOpen}
        followUpForm={followUpForm}
        actionLoading={actionLoading}
        onClose={() => setIsFollowUpOpen(false)}
        onFormChange={setFollowUpForm}
        onSubmit={handleScheduleFollowUp}
      />
    </div>
  );
};

/* --- Sub-Components & Modals --- */

interface LeadEditModalProps {
  isOpen: boolean;
  editForm: any;
  actionLoading: boolean;
  onClose: () => void;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LeadEditModal: React.FC<LeadEditModalProps> = ({
  isOpen,
  editForm,
  actionLoading,
  onClose,
  onFormChange,
  onSubmit,
}) => {
  if (!isOpen) return null;
  return (
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
        padding: "clamp(1.25rem, 3vw, 2rem)",
        maxHeight: "calc(100vh - 2rem)",
        overflowY: "auto",
        margin: "auto",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Edit Lead Specification</h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>FULL NAME *</label>
              <input
                required
                value={editForm.name}
                onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
                style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EMAIL ADDRESS *</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => onFormChange({ ...editForm, email: e.target.value })}
                style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PHONE NUMBER</label>
              <input
                value={editForm.phone}
                onChange={(e) => onFormChange({ ...editForm, phone: e.target.value })}
                style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>COMPANY NAME</label>
              <input
                value={editForm.company}
                onChange={(e) => onFormChange({ ...editForm, company: e.target.value })}
                style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>INDUSTRY</label>
              <input
                value={editForm.industry}
                onChange={(e) => onFormChange({ ...editForm, industry: e.target.value })}
                style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PRIORITY</label>
              <select
                value={editForm.priority}
                onChange={(e) => onFormChange({ ...editForm, priority: e.target.value })}
                style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>REQUIREMENTS / DESCRIPTION</label>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => onFormChange({ ...editForm, description: e.target.value })}
              style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" glow disabled={actionLoading}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface LeadLostModalProps {
  isOpen: boolean;
  lostReason: string;
  actionLoading: boolean;
  onClose: () => void;
  onReasonChange: (reason: string) => void;
  onConfirm: (e: React.FormEvent) => void;
}

const LeadLostModal: React.FC<LeadLostModalProps> = ({
  isOpen,
  lostReason,
  actionLoading,
  onClose,
  onReasonChange,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return (
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
        maxWidth: "480px",
        maxHeight: "calc(100vh - 2rem)",
        overflowY: "auto",
        padding: "clamp(1.25rem, 3vw, 2rem)",
        margin: "auto",
        boxSizing: "border-box",
      }}>
        <h2 style={{ fontSize: "1.3rem", color: "#f87171", margin: "0 0 0.5rem 0" }}>Mark Lead as Lost</h2>
        <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 1rem 0" }}>
          Please enter the specific reason why this opportunity was lost (minimum 10 characters):
        </p>
        <form onSubmit={onConfirm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <textarea
            rows={3}
            required
            value={lostReason}
            onChange={(e) => onReasonChange(e.target.value)}
            style={{ padding: "0.75rem", backgroundColor: "#050811", border: "1px solid rgba(248, 113, 113, 0.4)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="outline" disabled={actionLoading || lostReason.trim().length < 10} style={{ borderColor: "rgba(248, 113, 113, 0.4)", color: "#f87171" }}>
              Confirm Lost
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface LeadWonModalProps {
  isOpen: boolean;
  wonForm: { value: number; notes: string };
  actionLoading: boolean;
  onClose: () => void;
  onFormChange: (form: { value: number; notes: string }) => void;
  onConfirm: (e: React.FormEvent) => void;
}

const LeadWonModal: React.FC<LeadWonModalProps> = ({
  isOpen,
  wonForm,
  actionLoading,
  onClose,
  onFormChange,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return (
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
        maxWidth: "500px",
        maxHeight: "calc(100vh - 2rem)",
        overflowY: "auto",
        padding: "clamp(1.25rem, 3vw, 2rem)",
        margin: "auto",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <CheckCircle2 size={22} color="#4ade80" />
          <h2 style={{ fontSize: "1.3rem", color: "#4ade80", margin: 0 }}>Mark Deal as WON</h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 1.25rem 0" }}>
          Record the final agreed project cost and closing notes. The deal will be registered as WON and forwarded to the BDM Dashboard for client portal credential dispatch.
        </p>
        <form onSubmit={onConfirm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
              AGREED PROJECT COST / DEAL VALUE ($) *
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#63f5e8", fontWeight: 700 }}>
                $
              </span>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={wonForm.value}
                onChange={(e) => onFormChange({ ...wonForm, value: parseFloat(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.75rem 0.65rem 1.8rem",
                  backgroundColor: "#050811",
                  border: "1px solid rgba(74, 222, 128, 0.4)",
                  color: "#4ade80",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
              CLOSING SCOPE NOTES & CLIENT BRIEF
            </label>
            <textarea
              rows={3}
              required
              value={wonForm.notes}
              onChange={(e) => onFormChange({ ...wonForm, notes: e.target.value })}
              style={{
                padding: "0.75rem",
                backgroundColor: "#050811",
                border: "1px solid rgba(140, 174, 187, 0.25)",
                color: "#f8fafc",
                borderRadius: "4px",
                fontSize: "0.85rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" glow disabled={actionLoading} style={{ backgroundColor: "#22c55e", color: "#ffffff" }}>
              Confirm Won & Forward to BDM
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface LeadAssignModalProps {
  isOpen: boolean;
  assignUserId: number | "";
  users: any[];
  actionLoading: boolean;
  onClose: () => void;
  onUserChange: (id: number) => void;
  onAssign: (e: React.FormEvent) => void;
}

const LeadAssignModal: React.FC<LeadAssignModalProps> = ({
  isOpen,
  assignUserId,
  users,
  actionLoading,
  onClose,
  onUserChange,
  onAssign,
}) => {
  if (!isOpen) return null;
  return (
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
        maxWidth: "480px",
        maxHeight: "calc(100vh - 2rem)",
        overflowY: "auto",
        padding: "clamp(1.25rem, 3vw, 2rem)",
        margin: "auto",
        boxSizing: "border-box",
      }}>
        <h2 style={{ fontSize: "1.3rem", margin: "0 0 1rem 0" }}>Assign Lead to Executive</h2>
        <form onSubmit={onAssign} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <select
            required
            value={assignUserId}
            onChange={(e) => onUserChange(Number(e.target.value))}
            style={{ padding: "0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
          >
            <option value="">Select Team Member...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.username} ({u.role || "Executive"})
              </option>
            ))}
          </select>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" glow disabled={actionLoading || !assignUserId}>Assign Lead</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface LeadScheduleFollowUpModalProps {
  isOpen: boolean;
  followUpForm: any;
  actionLoading: boolean;
  onClose: () => void;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LeadScheduleFollowUpModal: React.FC<LeadScheduleFollowUpModalProps> = ({
  isOpen,
  followUpForm,
  actionLoading,
  onClose,
  onFormChange,
  onSubmit,
}) => {
  if (!isOpen) return null;
  return (
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
        maxWidth: "500px",
        maxHeight: "calc(100vh - 2rem)",
        overflowY: "auto",
        padding: "clamp(1.25rem, 3vw, 2rem)",
        margin: "auto",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Schedule Client Follow-up</h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>FOLLOW-UP TYPE</label>
            <select
              value={followUpForm.follow_up_type}
              onChange={(e) => onFormChange({ ...followUpForm, follow_up_type: e.target.value })}
              style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", width: "100%", boxSizing: "border-box" }}
            >
              <option value="CALL">Phone Call</option>
              <option value="MEETING">Video / In-person Meeting</option>
              <option value="EMAIL">Email Outreach</option>
              <option value="DEMO">Product Demo</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DATE & TIME</label>
            <input
              type="datetime-local"
              required
              value={followUpForm.scheduled_at}
              onChange={(e) => onFormChange({ ...followUpForm, scheduled_at: e.target.value })}
              style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
            />
          </div>

          {followUpForm.follow_up_type === "MEETING" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING LINK (Google Meet / Zoom / Teams) *</label>
              <input
                type="url"
                required
                value={followUpForm.meeting_link || ""}
                onChange={(e) => onFormChange({ ...followUpForm, meeting_link: e.target.value })}
                style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>AGENDA / PRE-MEETING NOTES</label>
            <textarea
              rows={3}
              value={followUpForm.notes}
              onChange={(e) => onFormChange({ ...followUpForm, notes: e.target.value })}
              style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" glow disabled={actionLoading}>Schedule Follow-up</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface LeadFollowUpsTabProps {
  followUps: any[];
  actionLoading: boolean;
  onOpenSchedule: () => void;
  onCompleteItem: (id: number) => void;
}

const LeadFollowUpsTab: React.FC<LeadFollowUpsTabProps> = ({
  followUps,
  actionLoading,
  onOpenSchedule,
  onCompleteItem,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0, color: "#f8fafc" }}>Scheduled Client Follow-ups</h3>
      <Button variant="outline" onClick={onOpenSchedule} style={{ fontSize: "0.75rem" }}>
        <Plus size={14} style={{ marginRight: "0.3rem" }} /> Schedule
      </Button>
    </div>

    {followUps.length === 0 ? (
      <Card style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
        <Clock size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
        <p style={{ margin: 0 }}>No follow-ups recorded for this lead.</p>
        <Button variant="outline" onClick={onOpenSchedule} style={{ marginTop: "1rem" }}>
          Schedule Initial Call
        </Button>
      </Card>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {followUps.map((fu) => {
          const isCompleted = fu.status === "COMPLETED";
          const isOverdue = !isCompleted && new Date(fu.scheduled_at).getTime() < Date.now();
          return (
            <Card
              key={fu.id}
              style={{
                padding: "1rem 1.25rem",
                borderLeft: isCompleted ? "3px solid #4ade80" : isOverdue ? "3px solid #f87171" : "3px solid #63f5e8",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600, color: "#63f5e8" }}>
                      {fu.follow_up_type_display || fu.follow_up_type}
                    </span>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "2px",
                        backgroundColor: isCompleted ? "rgba(74, 222, 128, 0.15)" : "rgba(56, 189, 248, 0.15)",
                        color: isCompleted ? "#4ade80" : "#38bdf8",
                      }}
                    >
                      {fu.status_display || fu.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#cbd5e1", margin: "0.3rem 0" }}>
                    Scheduled: <strong>{new Date(fu.scheduled_at).toLocaleString()}</strong>
                  </div>
                  {fu.notes && (
                    <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "0.3rem 0 0 0" }}>
                      {fu.notes}
                    </p>
                  )}
                </div>

                {!isCompleted && (
                  <Button
                    glow
                    disabled={actionLoading}
                    onClick={() => onCompleteItem(fu.id)}
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
                  >
                    Mark Done
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    )}
  </div>
);

interface LeadNotesTabProps {
  notes: any[];
}

const LeadNotesTab: React.FC<LeadNotesTabProps> = ({ notes }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    {notes.length === 0 ? (
      <Card style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
        <FileText size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
        <p style={{ margin: 0 }}>No notes recorded for this lead yet.</p>
      </Card>
    ) : (
      notes.map((note) => (
        <Card key={note.id} style={{ padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#63f5e8" }}>
              {note.created_by_name || "Sales Executive"}
            </span>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
              {new Date(note.created_at).toLocaleString()}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.5 }}>
            {note.content}
          </p>
        </Card>
      ))
    )}
  </div>
);

interface LeadTimelineTabProps {
  lead: any;
  notes: any[];
  followUps: any[];
}

const LeadTimelineTab: React.FC<LeadTimelineTabProps> = ({ lead, notes, followUps }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    <Card style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#63f5e8", marginTop: "0.4rem" }} />
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc" }}>Lead Established</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
            {new Date(lead.created_at).toLocaleString()}
          </div>
          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
            Initial entry recorded via source: {lead.source || "Website"}
          </p>
        </div>
      </div>
    </Card>

    {notes.map((n) => (
      <Card key={`tl-note-${n.id}`} style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#38bdf8", marginTop: "0.4rem" }} />
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc" }}>Note Appended</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
              {new Date(n.created_at).toLocaleString()} by {n.created_by_name || "Sales Executive"}
            </div>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>{n.content}</p>
          </div>
        </div>
      </Card>
    ))}

    {followUps.map((f) => (
      <Card key={`tl-fu-${f.id}`} style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: f.status === "COMPLETED" ? "#4ade80" : "#818cf8", marginTop: "0.4rem" }} />
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc" }}>
              {f.status === "COMPLETED" ? "Follow-up Completed" : "Follow-up Scheduled"} ({f.follow_up_type})
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
              {new Date(f.scheduled_at).toLocaleString()}
            </div>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>{f.notes}</p>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export default LeadDetail;
