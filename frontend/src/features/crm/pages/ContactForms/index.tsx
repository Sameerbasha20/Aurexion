import React, { useState } from "react";
import { Link } from "wouter";
import { useLeads } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Mail,
  Phone,
  Search,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Building,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import crmService from "../../services/crmService";

export const ContactForms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { leads, isLoading, error, refetch } = useLeads({ page_size: 50 });
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Meeting Schedule Modal State
  const [selectedMeetingLead, setSelectedMeetingLead] = useState<any | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingType, setMeetingType] = useState("MEETING");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingLead || !scheduledAt) return;
    setScheduling(true);
    try {
      // datetime-local sends YYYY-MM-DDTHH:mm - add seconds for Django parse_datetime
      const scheduledAtWithSeconds = scheduledAt.length === 16 ? scheduledAt + ":00" : scheduledAt;
      await crmService.scheduleMeeting(selectedMeetingLead.id, {
        scheduled_at: scheduledAtWithSeconds,
        follow_up_type: meetingType,
        meeting_link: meetingLink,
        notes: meetingNotes,
      });
      setActionSuccess(`Meeting scheduled and notification email sent to ${selectedMeetingLead.email || selectedMeetingLead.name}!`);
      setSelectedMeetingLead(null);
      setScheduledAt("");
      setMeetingLink("");
      setMeetingNotes("");
      refetch();
    } catch (err: any) {
      alert(err?.message || "Failed to schedule meeting.");
    } finally {
      setScheduling(false);
    }
  };

  const handleMarkWon = async (leadId: number, leadName: string) => {
    if (!window.confirm(`Mark ${leadName} as WON? This will generate client credentials (default password: client@2026) and email the client.`)) return;
    try {
      await crmService.markLeadWon(leadId);
      setActionSuccess(`Lead marked WON! Client User account created (password: client@2026) & credentials email sent.`);
      refetch();
    } catch (err: any) {
      alert(err?.message || "Failed to mark lead as won.");
    }
  };

  const handleMarkLost = async (leadId: number) => {
    const reason = window.prompt("Reason for declining/marking lost:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("A reason is required to mark as lost.");
      return;
    }
    try {
      await crmService.markLeadLost(leadId, reason.trim());
      setActionSuccess("Lead marked as lost/declined.");
      refetch();
    } catch (err: any) {
      alert(err?.message || "Failed to mark lead as lost.");
    }
  };

  const contactLeads = leads.filter((lead) => {
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

        <Button variant="outline" onClick={refetch} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <RefreshCw size={14} /> Refresh Leads
        </Button>
      </div>

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
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              LOADING ASSIGNED CONTACT FORMS...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p style={{ margin: 0 }}>{error}</p>
            <Button onClick={refetch} style={{ marginTop: "1rem" }}>
              Retry
            </Button>
          </div>
        ) : contactLeads.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
            <MessageSquare size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No assigned contact forms found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 0 0" }}>
              When BDM assigns an inbound contact form submission to you, it will appear here.
            </p>
          </div>
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

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                    Received on {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button
                      glow
                      size="sm"
                      onClick={() => setSelectedMeetingLead(lead)}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                    >
                      <Calendar size={13} style={{ marginRight: "0.3rem" }} /> Schedule Meeting
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

      {/* Schedule Meeting Modal */}
      {selectedMeetingLead && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5,8,17,0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "520px", padding: "2rem" }}>
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
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
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
    </div>
  );
};

export default ContactForms;
