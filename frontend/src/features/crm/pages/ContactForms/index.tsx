import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../../../hooks/useAuth";
import { useLeadsQuery, useMarkLeadWonMutation, useMarkLeadLostMutation } from "../../../../queries/useCrmQueries";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import LoadingState from "../../../../components/feedback/LoadingState";
import ErrorState from "../../../../components/feedback/ErrorState";
import EmptyState from "../../../../components/feedback/EmptyState";
import LeadDetailDrawer from "../../components/LeadDetailDrawer";
import { toast } from "sonner";
import { Mail, Phone, Search, RefreshCw, MessageSquare, CheckCircle2, Calendar } from "lucide-react";

export const ContactForms: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
<<<<<<< HEAD
  const { leads, isLoading, error, refetch } = useLeads({ page_size: 50 });
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [scheduledLeadIds, setScheduledLeadIds] = useState<Set<number>>(new Set());
=======
  const { data, isLoading, error, refetch } = useLeadsQuery({ page_size: 50 });
  const leads = data?.results || [];

  const wonMutation = useMarkLeadWonMutation();
  const lostMutation = useMarkLeadLostMutation();
>>>>>>> 915bc3df0a7fa4e8eb523f34790d0b36596ff108

  // Meeting Schedule Modal State
  const [selectedMeetingLead, setSelectedMeetingLead] = useState<any | null>(null);

<<<<<<< HEAD
  // Custom Mark WON Modal State
  const [selectedWonLead, setSelectedWonLead] = useState<any | null>(null);
  const [wonValue, setWonValue] = useState("25000");
  const [wonNotes, setWonNotes] = useState("Client agreed to project scope and signed proposal.");
  const [wonLoading, setWonLoading] = useState(false);

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
      // datetime-local sends YYYY-MM-DDTHH:mm - add seconds for Django parse_datetime
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
      setActionSuccess(`Lead ${selectedWonLead.name} marked WON! Project cost ($${val.toLocaleString()}) & closing notes recorded. Client credentials dispatched.`);
      setSelectedWonLead(null);
      refetch();
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
      refetch();
    } catch (err: any) {
      setActionError(err?.message || "Failed to mark lead as lost.");
    } finally {
      setLostLoading(false);
    }
=======
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
>>>>>>> 915bc3df0a7fa4e8eb523f34790d0b36596ff108
  };

  const { user } = useAuth();

  const contactLeads = leads.filter((lead) => {
    // Sales Executive role scope: only display leads assigned to current executive
    if (user && user.role === "SALES_EXECUTIVE") {
      const isAssignedToMe =
        lead.assigned_to === Number(user.id) ||
        (lead.assigned_to_name && (
          String(lead.assigned_to_name).toLowerCase() === String(user.name || "").toLowerCase() ||
          String(lead.assigned_to_name).toLowerCase() === String(user.email || "").toLowerCase()
        ));
      if (!isAssignedToMe) {
        return false;
      }
    }

    const isContactSource =
      !lead.source ||
      lead.source === "contact_form" ||
      lead.source === "website_form" ||
      lead.source === "website" ||
      lead.source === "rfp_form" ||
      lead.source === "request_quote" ||
      lead.source === "estimator";

    const matchesSearch =
      !searchTerm ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.reference_id && lead.reference_id.toLowerCase().includes(searchTerm.toLowerCase()));

    return isContactSource && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>ASSIGNED DESK</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {contactLeads.length} Assigned Entries
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Contact Forms Desk
          </h1>
        </div>

        <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <RefreshCw size={14} /> Refresh Leads
        </Button>
      </div>

      {actionError && (
        <div style={{ padding: "0.85rem 1.25rem", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "6px", color: "#f87171", fontSize: "0.88rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError(null)} style={{ background: "none", border: 0, color: "#f87171", cursor: "pointer", fontSize: "1rem" }}>✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search assigned contact forms by name, email, company, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem 0.6rem 2.2rem",
              backgroundColor: "rgba(5, 8, 17, 0.7)",
              border: "1px solid rgba(140, 174, 187, 0.2)",
              borderRadius: "4px",
              color: "#f8fafc",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
        </div>
      </Card>

      {/* Assigned Contact Leads List */}
      <Card style={{ padding: "1.5rem" }} borderAccent>
        {isLoading ? (
          <LoadingState message="Loading assigned contact forms..." />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : contactLeads.length === 0 ? (
          <EmptyState
            title="No assigned contact forms found"
            message="When BDM assigns an inbound contact form submission to you, it will appear here."
            action={{ label: "Go to Leads Funnel", onClick: () => navigate("/crm/leads") }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {contactLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1.25rem",
                  backgroundColor: "rgba(10, 17, 28, 0.6)",
                  border: "1px solid rgba(140, 174, 187, 0.15)",
                  borderRadius: "6px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.78rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
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

                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", color: "#f8fafc" }}>
                    {lead.company ? `${lead.company} (${lead.name})` : lead.name}
                  </h3>

                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.82rem", color: "#94a3b8", flexWrap: "wrap" }}>
                    <a href={`mailto:${lead.email}`} style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Mail size={13} color="#63f5e8" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Phone size={13} color="#64748b" /> {lead.phone}
                      </a>
                    )}
                  </div>

                  {lead.description && (
                    <div style={{ marginTop: "0.6rem" }}>
                      <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                        <MessageSquare size={12} style={{ display: "inline", marginRight: "0.3rem" }} /> INQUIRY / MESSAGE BRIEF
                      </span>
                      <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#cbd5e1", backgroundColor: "rgba(5, 8, 17, 0.6)", padding: "0.6rem 0.75rem", borderRadius: "4px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {lead.description}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  flexShrink: 0,
                  width: "100%",
                  maxWidth: "400px",
                }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                    Received on {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-start", width: "100%" }}>
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
                        <Calendar size={13} style={{ marginRight: "0.3rem" }} /> Schedule Meeting
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

<<<<<<< HEAD
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

            {/* Client Details */}
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

              {meetingType === "MEETING" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING LINK (Google Meet / Zoom) *</label>
                <input
                  type="url"
                  required
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
            )}
            {meetingType !== "MEETING" && (
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
            )}

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
                <Button type="submit" glow disabled={scheduling || !scheduledAt || (meetingType === "MEETING" && !meetingLink)}>
                  {scheduling ? "Sending Email..." : "Send Meeting Email & Schedule"}
                </Button>
              </div>
            </form>
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
                <Button type="submit" glow disabled={wonLoading} style={{ backgroundColor: "#16a34a", borderColor: "#22c55e", color: "#ffffff" }}>
                  {wonLoading ? "Processing..." : "✓ Confirm Deal WON & Onboard"}
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
=======
      {/* Lead Detail Drawer (replaces Schedule Meeting Modal) */}
      <LeadDetailDrawer
        leadId={selectedMeetingLead?.id || null}
        open={!!selectedMeetingLead}
        onClose={() => setSelectedMeetingLead(null)}
        onLeadUpdated={refetch}
      />
>>>>>>> 915bc3df0a7fa4e8eb523f34790d0b36596ff108
    </div>
  );
};

export default ContactForms;
