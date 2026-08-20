import React, { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  UserCheck, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Plus, 
  FileText,
  Send,
  AlertCircle
} from "lucide-react";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import crmService, { LeadItem, LeadFollowUp, LeadNote, UserOption } from "../services/crmService";

interface LeadDetailDrawerProps {
  leadId: number | null;
  open: boolean;
  onClose: () => void;
  onLeadUpdated?: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  leadId,
  open,
  onClose,
  onLeadUpdated,
}) => {
  const [lead, setLead] = useState<LeadItem | null>(null);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "followups" | "notes" | "timeline">("overview");

  // Form states
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<number | string>("");
  const [assigning, setAssigning] = useState(false);
  
  // Follow-up form
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpType, setFollowUpType] = useState("meeting");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // Lost modal state
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState("");

  useEffect(() => {
    if (open && leadId) {
      loadLeadDetails(leadId);
    } else {
      setLead(null);
      setFollowUps([]);
      setNotes([]);
      setActivities([]);
    }
  }, [open, leadId]);

  const loadLeadDetails = async (id: number) => {
    setLoading(true);
    try {
      const [leadData, followUpsData, notesData, activitiesData, usersData] = await Promise.all([
        crmService.getLead(id),
        crmService.getFollowUps(id).catch(() => []),
        crmService.getNotes(id).catch(() => []),
        crmService.getActivities(id).catch(() => []),
        crmService.getAssignableUsers().catch(() => []),
      ]);

      setLead(leadData);
      setFollowUps(followUpsData);
      setNotes(notesData);
      setActivities(activitiesData);
      setAssignableUsers(usersData);
      setSelectedAssignee(leadData.assigned_to || "");
    } catch (err) {
      console.error("Failed to load lead details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLead = async (userId: number) => {
    if (!leadId) return;
    setAssigning(true);
    try {
      const updated = await crmService.assignLead(leadId, userId);
      setLead(updated);
      setSelectedAssignee(userId);
      if (onLeadUpdated) onLeadUpdated();
      const updatedActivities = await crmService.getActivities(leadId).catch(() => []);
      setActivities(updatedActivities);
    } catch (err) {
      console.error("Failed to assign lead", err);
    } finally {
      setAssigning(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !newNoteContent.trim()) return;
    setAddingNote(true);
    try {
      await crmService.createNote(leadId, newNoteContent.trim());
      setNewNoteContent("");
      const updatedNotes = await crmService.getNotes(leadId);
      setNotes(updatedNotes);
      const updatedActivities = await crmService.getActivities(leadId).catch(() => []);
      setActivities(updatedActivities);
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !followUpDate) return;
    setSavingFollowUp(true);
    try {
      await crmService.createFollowUp(leadId, {
        scheduled_at: new Date(followUpDate).toISOString(),
        follow_up_type: followUpType,
        notes: followUpNotes,
      });
      setShowFollowUpForm(false);
      setFollowUpDate("");
      setFollowUpNotes("");
      const updatedFollowUps = await crmService.getFollowUps(leadId);
      setFollowUps(updatedFollowUps);
    } catch (err) {
      console.error("Failed to schedule follow up", err);
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId: number) => {
    if (!leadId) return;
    try {
      await crmService.completeFollowUp(leadId, followUpId);
      const updatedFollowUps = await crmService.getFollowUps(leadId);
      setFollowUps(updatedFollowUps);
      const updatedLead = await crmService.getLead(leadId);
      setLead(updatedLead);
    } catch (err) {
      console.error("Failed to complete follow up", err);
    }
  };

  const handleTransitionStatus = async (newStatus: string) => {
    if (!leadId) return;
    if (newStatus === "lost") {
      setShowLostDialog(true);
      return;
    }
    try {
      const updated = await crmService.transitionLead(leadId, newStatus);
      setLead(updated);
      if (onLeadUpdated) onLeadUpdated();
      const updatedActivities = await crmService.getActivities(leadId).catch(() => []);
      setActivities(updatedActivities);
    } catch (err) {
      console.error("Failed to transition status", err);
    }
  };

  const handleConfirmLost = async () => {
    if (!leadId || !lostReason.trim()) return;
    try {
      const updated = await crmService.markLeadLost(leadId, lostReason.trim());
      setLead(updated);
      setShowLostDialog(false);
      setLostReason("");
      if (onLeadUpdated) onLeadUpdated();
      const updatedActivities = await crmService.getActivities(leadId).catch(() => []);
      setActivities(updatedActivities);
    } catch (err) {
      console.error("Failed to mark lead lost", err);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(5, 8, 17, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          height: "100vh",
          backgroundColor: "#0b0f19",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#0d1322",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="eyebrow" style={{ fontSize: "0.7rem", color: "var(--color-cyan)" }}>
                {lead?.reference_id || "LEAD DETAILS"}
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  backgroundColor: lead?.status === "won" ? "rgba(34, 197, 94, 0.2)" : lead?.status === "lost" ? "rgba(239, 68, 68, 0.2)" : "rgba(99, 245, 232, 0.15)",
                  color: lead?.status === "won" ? "#4ade80" : lead?.status === "lost" ? "#f87171" : "#63f5e8",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {lead?.status_display || lead?.status || "NEW"}
              </span>
            </div>
            <h2 style={{ fontSize: "1.25rem", margin: "0.25rem 0 0 0", color: "#fff", fontFamily: "var(--font-display)" }}>
              {lead?.name || "Loading..."}
            </h2>
            {lead?.company && (
              <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                {lead.company}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "#080c14",
            padding: "0 1.5rem",
          }}
        >
          {(["overview", "followups", "notes", "timeline"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem 1rem",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--color-cyan)" : "2px solid transparent",
                color: activeTab === tab ? "var(--color-cyan)" : "var(--color-text-secondary)",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === "overview" && "Overview"}
              {tab === "followups" && `Follow-Ups (${followUps.length})`}
              {tab === "notes" && `Notes (${notes.length})`}
              {tab === "timeline" && "Timeline"}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
              LOADING LEAD DOSSIER...
            </div>
          ) : !lead ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
              Lead record not found.
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Status & Actions Bar */}
                  <Card style={{ padding: "1rem", backgroundColor: "#0e1424" }}>
                    <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                      LIFECYCLE STAGE TRANSITION
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      {["new", "contacted", "qualified", "proposal_submitted", "negotiation", "won", "lost"].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleTransitionStatus(st)}
                          disabled={lead.status === st}
                          style={{
                            padding: "0.35rem 0.65rem",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            border: lead.status === st ? "1px solid var(--color-cyan)" : "1px solid var(--color-border)",
                            backgroundColor: lead.status === st ? "rgba(99, 245, 232, 0.15)" : "#070a12",
                            color: lead.status === st ? "var(--color-cyan)" : "var(--color-text-secondary)",
                            cursor: lead.status === st ? "default" : "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {st.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Assignment Card */}
                  <Card style={{ padding: "1rem", backgroundColor: "#0e1424" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                          ASSIGNED SALES EXECUTIVE
                        </span>
                        <div style={{ marginTop: "0.25rem", color: "#fff", fontWeight: 500, fontSize: "0.9rem" }}>
                          {lead.assigned_to_name || "Unassigned"}
                        </div>
                      </div>
                      <div style={{ minWidth: "180px" }}>
                        <select
                          value={selectedAssignee}
                          onChange={(e) => handleAssignLead(Number(e.target.value))}
                          disabled={assigning}
                          style={{
                            width: "100%",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "4px",
                            backgroundColor: "#070a12",
                            color: "var(--color-text-primary)",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.8rem",
                            outline: "none",
                          }}
                        >
                          <option value="">Reassign Lead...</option>
                          {assignableUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role || "Executive"})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Card>

                  {/* Lead Information Grid */}
                  <Card style={{ padding: "1.25rem", backgroundColor: "#0e1424" }}>
                    <h3 style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)", margin: "0 0 1rem 0" }}>
                      CONTACT & COMPANY METADATA
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Contact Name</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem" }}>{lead.name}</div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Email Address</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem", wordBreak: "break-all" }}>
                          {lead.email || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Phone Number</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem" }}>{lead.phone || "N/A"}</div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Company</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem" }}>{lead.company || "N/A"}</div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Industry</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem" }}>{lead.industry || "General"}</div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Lead Source</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem" }}>{lead.source || "Website Intake"}</div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Priority</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem", textTransform: "capitalize" }}>
                          {lead.priority_display || lead.priority}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Created Date</label>
                        <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "0.15rem" }}>
                          {new Date(lead.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {lead.description && (
                      <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Description & Notes</label>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "0.25rem", whiteSpace: "pre-wrap" }}>
                          {lead.description}
                        </div>
                      </div>
                    )}

                    {lead.lost_reason && (
                      <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "4px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                        <label style={{ fontSize: "0.7rem", color: "#f87171", fontWeight: 600 }}>LOST REASON</label>
                        <div style={{ fontSize: "0.85rem", color: "#fca5a5", marginTop: "0.2rem" }}>
                          {lead.lost_reason}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* TAB 2: FOLLOW-UPS */}
              {activeTab === "followups" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                      SCHEDULED TASKS & MEETINGS
                    </span>
                    <Button
                      size="sm"
                      glow
                      onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                    >
                      <Plus size={14} /> Schedule Follow-Up
                    </Button>
                  </div>

                  {showFollowUpForm && (
                    <Card style={{ padding: "1rem", backgroundColor: "#0e1424" }}>
                      <form onSubmit={handleCreateFollowUp} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Date & Time</label>
                          <input
                            type="datetime-local"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            required
                            style={{
                              width: "100%",
                              padding: "0.4rem",
                              borderRadius: "4px",
                              backgroundColor: "#070a12",
                              color: "#fff",
                              border: "1px solid var(--color-border)",
                              outline: "none",
                              marginTop: "0.2rem",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Type</label>
                          <select
                            value={followUpType}
                            onChange={(e) => setFollowUpType(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "0.4rem",
                              borderRadius: "4px",
                              backgroundColor: "#070a12",
                              color: "#fff",
                              border: "1px solid var(--color-border)",
                              outline: "none",
                              marginTop: "0.2rem",
                            }}
                          >
                            <option value="meeting">Meeting / Call</option>
                            <option value="email">Email Follow-Up</option>
                            <option value="phone">Phone Call</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Notes / Agenda</label>
                          <textarea
                            value={followUpNotes}
                            onChange={(e) => setFollowUpNotes(e.target.value)}
                            placeholder="Add meeting agenda or notes..."
                            rows={2}
                            style={{
                              width: "100%",
                              padding: "0.4rem",
                              borderRadius: "4px",
                              backgroundColor: "#070a12",
                              color: "#fff",
                              border: "1px solid var(--color-border)",
                              outline: "none",
                              marginTop: "0.2rem",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <Button size="sm" variant="outline" onClick={() => setShowFollowUpForm(false)}>
                            Cancel
                          </Button>
                          <Button size="sm" type="submit" disabled={savingFollowUp}>
                            {savingFollowUp ? "Saving..." : "Save Schedule"}
                          </Button>
                        </div>
                      </form>
                    </Card>
                  )}

                  {followUps.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                      No follow-ups or meetings scheduled.
                    </div>
                  ) : (
                    followUps.map((fu) => (
                      <Card key={fu.id} style={{ padding: "1rem", backgroundColor: "#0e1424" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Calendar size={14} style={{ color: "var(--color-cyan)" }} />
                              <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 500 }}>
                                {new Date(fu.scheduled_at).toLocaleString()}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  padding: "0.1rem 0.4rem",
                                  borderRadius: "3px",
                                  backgroundColor: fu.status === "completed" ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)",
                                  color: fu.status === "completed" ? "#4ade80" : "#facc15",
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                {fu.status_display || fu.status}
                              </span>
                            </div>
                            <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                              {fu.notes || "No additional notes"}
                            </p>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", display: "block", marginTop: "0.4rem" }}>
                              Assigned: {fu.assigned_to_name || "Unassigned"}
                            </span>
                          </div>

                          {fu.status !== "completed" && (
                            <Button size="sm" variant="outline" onClick={() => handleCompleteFollowUp(fu.id)}>
                              Mark Done
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: NOTES */}
              {activeTab === "notes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <form onSubmit={handleAddNote} style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      placeholder="Add an internal lead note..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        backgroundColor: "#070a12",
                        color: "#fff",
                        border: "1px solid var(--color-border)",
                        outline: "none",
                        fontSize: "0.85rem",
                      }}
                    />
                    <Button type="submit" disabled={addingNote || !newNoteContent.trim()}>
                      <Send size={14} /> Add Note
                    </Button>
                  </form>

                  {notes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                      No internal notes recorded yet.
                    </div>
                  ) : (
                    notes.map((note) => (
                      <Card key={note.id} style={{ padding: "0.85rem 1rem", backgroundColor: "#0e1424" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                          <span>{note.created_by_name || "Operator"}</span>
                          <span>{new Date(note.created_at).toLocaleString()}</span>
                        </div>
                        <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.85rem", color: "var(--color-text-primary)", whiteSpace: "pre-wrap" }}>
                          {note.content}
                        </p>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: TIMELINE */}
              {activeTab === "timeline" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {activities.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                      No activity history recorded.
                    </div>
                  ) : (
                    activities.map((act, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          paddingBottom: "0.75rem",
                          borderBottom: index < activities.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-cyan)",
                            marginTop: "0.35rem",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                            <span style={{ color: "#fff", fontWeight: 500 }}>{act.repr || act.action || "Lead Event"}</span>
                            <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                              {new Date(act.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            By: {act.user_username || act.user || "System"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal dialog for Lost Reason */}
        {showLostDialog && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              zIndex: 1100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "90%",
                maxWidth: "400px",
                backgroundColor: "#0b0f19",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "1.25rem",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#f87171", fontSize: "1rem" }}>Mark Lead as Lost</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
                Please provide the business reason for marking this lead lost:
              </p>
              <textarea
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="e.g. Budget constraints, Competitor chosen..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  backgroundColor: "#070a12",
                  color: "#fff",
                  border: "1px solid var(--color-border)",
                  outline: "none",
                  marginBottom: "1rem",
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <Button size="sm" variant="outline" onClick={() => setShowLostDialog(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmLost} disabled={!lostReason.trim()}>
                  Confirm Lost
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailDrawer;
