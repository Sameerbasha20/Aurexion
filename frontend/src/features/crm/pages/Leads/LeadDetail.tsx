import React, { useState } from "react";
import { Link, useRoute } from "wouter";
import { useLeadDetail, useAssignableUsers } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Globe,
  User,
  Calendar,
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
} from "lucide-react";

export const LeadDetail: React.FC = () => {
  const [, crmParams] = useRoute("/crm/leads/:id");
  const [, salesParams] = useRoute("/sales/leads/:id");
  const params = crmParams || salesParams;
  const leadId = Number(params?.id);

  const {
    lead,
    followUps,
    notes,
    isLoading,
    actionLoading,
    error,
    refetch,
    updateLead,
    transitionStatus,
    qualify,
    markWon,
    markLost,
    assign,
    addNote,
    addFollowUp,
    completeFollowUp,
  } = useLeadDetail(leadId);

  const { users } = useAssignableUsers();

  // Local state for modals & actions
  const [activeTab, setActiveTab] = useState<"overview" | "followups" | "notes" | "timeline">("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isLostOpen, setIsLostOpen] = useState(false);
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
  const [assignUserId, setAssignUserId] = useState<number | "">("");
  const [noteContent, setNoteContent] = useState("");
  const [followUpForm, setFollowUpForm] = useState({
    follow_up_type: "CALL",
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    notes: "",
  });

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

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
      await updateLead(editForm);
      setIsEditOpen(false);
      showFeedback("success", "Lead specification updated successfully.");
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to update lead.");
    }
  };

  const handleMarkLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostReason.trim()) {
      alert("Please provide a reason for lost status.");
      return;
    }
    try {
      await markLost(lostReason);
      setIsLostOpen(false);
      setLostReason("");
      showFeedback("success", "Lead marked as LOST.");
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to mark lead lost.");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) return;
    try {
      await assign(Number(assignUserId));
      setIsAssignOpen(false);
      showFeedback("success", "Lead assigned to sales executive.");
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to assign lead.");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await addNote(noteContent);
      setNoteContent("");
      showFeedback("success", "Note appended to communication ledger.");
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to add note.");
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFollowUp({
        ...followUpForm,
        scheduled_at: new Date(followUpForm.scheduled_at).toISOString(),
      });
      setIsFollowUpOpen(false);
      setFollowUpForm({
        follow_up_type: "CALL",
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        notes: "",
      });
      showFeedback("success", "Follow-up scheduled successfully.");
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to schedule follow-up.");
    }
  };

  const handleCompleteFollowUpItem = async (followUpId: number) => {
    try {
      await completeFollowUp(followUpId);
      showFeedback("success", "Follow-up marked as completed.");
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to complete follow-up.");
    }
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
          <p style={{ color: "#cbd5e1" }}>{error || "The requested lead was not found or access is restricted."}</p>
          <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const cleanStatus = lead.status?.toUpperCase() || "NEW";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/crm/leads">
          <Button variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ArrowLeft size={14} /> Leads Funnel
          </Button>
        </Link>

        {feedbackMessage && (
          <div
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              fontSize: "0.82rem",
              fontFamily: "IBM Plex Mono, monospace",
              backgroundColor: feedbackMessage.type === "success" ? "rgba(74, 222, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: feedbackMessage.type === "success" ? "#4ade80" : "#ef4444",
              border: feedbackMessage.type === "success" ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {feedbackMessage.text}
          </div>
        )}
      </div>

      {/* Main Lead Header Card */}
      <Card borderAccent style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                LEAD REF // {lead.reference_id || `#LD-${lead.id}`}
              </span>
              <span
                style={{
                  padding: "0.15rem 0.55rem",
                  borderRadius: "2px",
                  fontSize: "0.68rem",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontWeight: 600,
                  backgroundColor:
                    cleanStatus === "WON"
                      ? "rgba(74, 222, 128, 0.15)"
                      : cleanStatus === "LOST"
                      ? "rgba(248, 113, 113, 0.15)"
                      : cleanStatus === "QUALIFIED"
                      ? "rgba(129, 140, 248, 0.15)"
                      : "rgba(99, 245, 232, 0.15)",
                  color:
                    cleanStatus === "WON"
                      ? "#4ade80"
                      : cleanStatus === "LOST"
                      ? "#f87171"
                      : cleanStatus === "QUALIFIED"
                      ? "#818cf8"
                      : "#63f5e8",
                  border: "1px solid currentColor",
                }}
              >
                {lead.status_display || cleanStatus}
              </span>
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
              Primary Contact: <strong style={{ color: "#e2e8f0" }}>{lead.name}</strong> &bull; Established on{" "}
              {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Workflow Action Buttons */}
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

        {/* Status Transition Ribbon */}
        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid rgba(140, 174, 187, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div style={{ fontSize: "0.78rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
            WORKFLOW ACTIONS:
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {cleanStatus === "NEW" && (
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() => transitionStatus("CONTACTED")}
                style={{ fontSize: "0.78rem" }}
              >
                Mark Contacted
              </Button>
            )}

            {["NEW", "CONTACTED", "UNDER_REVIEW"].includes(cleanStatus) && (
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() => qualify()}
                style={{ fontSize: "0.78rem", color: "#818cf8", borderColor: "rgba(129, 140, 248, 0.4)" }}
              >
                <Award size={14} style={{ marginRight: "0.35rem" }} /> Qualify to Opportunity
              </Button>
            )}

            {cleanStatus !== "WON" && cleanStatus !== "LOST" && (
              <>
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => markWon()}
                  style={{ fontSize: "0.78rem", color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.4)" }}
                >
                  <CheckCircle2 size={14} style={{ marginRight: "0.35rem" }} /> Mark Won Deal
                </Button>
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => setIsLostOpen(true)}
                  style={{ fontSize: "0.78rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.4)" }}
                >
                  <XCircle size={14} style={{ marginRight: "0.35rem" }} /> Mark Lost
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Main Details & Tabs Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
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
                  <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" style={{ color: "#63f5e8" }}>
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

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(140, 174, 187, 0.1)" }}>
                <span style={{ color: "#94a3b8" }}>Created By:</span>
                <span style={{ color: "#cbd5e1" }}>{lead.created_by_name || "System"}</span>
              </div>

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
          </Card>

          {/* Quick Add Note Box */}
          <Card style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem 0", color: "#f8fafc" }}>
              Append Communication Note
            </h3>
            <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <textarea
                rows={3}
                placeholder="Log notes, call outcome, requirement updates..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "rgba(5, 8, 17, 0.7)",
                  border: "1px solid rgba(140, 174, 187, 0.2)",
                  color: "#f8fafc",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  resize: "vertical",
                }}
              />
              <Button type="submit" glow disabled={actionLoading || !noteContent.trim()} style={{ alignSelf: "flex-end" }}>
                <Send size={14} style={{ marginRight: "0.4rem" }} /> Save Note
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Follow-ups, Notes & Timeline Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Tab Selection */}
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(140, 174, 187, 0.2)", paddingBottom: "0.5rem" }}>
            {[
              { key: "followups", label: `Follow-ups (${followUps.length})`, icon: Clock },
              { key: "notes", label: `Notes (${notes.length})`, icon: FileText },
              { key: "timeline", label: "Audit Timeline", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    background: isSelected ? "rgba(99, 245, 232, 0.1)" : "transparent",
                    border: isSelected ? "1px solid #63f5e8" : "1px solid transparent",
                    color: isSelected ? "#63f5e8" : "#94a3b8",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Follow-ups Section */}
          {activeTab === "followups" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.05rem", margin: 0, color: "#f8fafc" }}>Scheduled Client Follow-ups</h3>
                <Button variant="outline" onClick={() => setIsFollowUpOpen(true)} style={{ fontSize: "0.75rem" }}>
                  <Plus size={14} style={{ marginRight: "0.3rem" }} /> Schedule
                </Button>
              </div>

              {followUps.length === 0 ? (
                <Card style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                  <Clock size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
                  <p style={{ margin: 0 }}>No follow-ups recorded for this lead.</p>
                  <Button variant="outline" onClick={() => setIsFollowUpOpen(true)} style={{ marginTop: "1rem" }}>
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
                              onClick={() => handleCompleteFollowUpItem(fu.id)}
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
          )}

          {/* Tab 2: Notes History */}
          {activeTab === "notes" && (
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
          )}

          {/* Tab 3: Timeline Audit */}
          {activeTab === "timeline" && (
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
          )}
        </div>
      </div>

      {/* Edit Lead Modal */}
      {isEditOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Edit Lead Information</h2>
              <button onClick={() => setIsEditOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>NAME</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EMAIL</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>COMPANY</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PHONE</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PRIORITY</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>INDUSTRY</label>
                  <input
                    type="text"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Mark Lost Modal */}
      {isLostOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "480px", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.3rem", color: "#f87171", margin: "0 0 1rem 0" }}>Mark Lead as Lost</h2>
            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 1rem 0" }}>
              Please state why this lead was lost (e.g. Budget constraints, Competitor chosen, Project cancelled).
            </p>
            <form onSubmit={handleMarkLost} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <textarea
                rows={3}
                required
                placeholder="Enter specific lost rationale..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                style={{ padding: "0.75rem", backgroundColor: "#050811", border: "1px solid rgba(248, 113, 113, 0.4)", color: "#f8fafc", borderRadius: "4px" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsLostOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading} style={{ backgroundColor: "#f87171", color: "#000" }}>
                  Confirm Lost
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "480px", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.3rem", margin: "0 0 1rem 0" }}>Assign Lead to Executive</h2>
            <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <select
                required
                value={assignUserId}
                onChange={(e) => setAssignUserId(Number(e.target.value))}
                style={{ padding: "0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
              >
                <option value="">Select Team Member...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.username} ({u.role || "Executive"})
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading || !assignUserId}>Assign Lead</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {isFollowUpOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Schedule Client Follow-up</h2>
              <button onClick={() => setIsFollowUpOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>FOLLOW-UP TYPE</label>
                <select
                  value={followUpForm.follow_up_type}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_type: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
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
                  onChange={(e) => setFollowUpForm({ ...followUpForm, scheduled_at: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>AGENDA / NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Outline meeting objective or agenda..."
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsFollowUpOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>Schedule Follow-up</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
