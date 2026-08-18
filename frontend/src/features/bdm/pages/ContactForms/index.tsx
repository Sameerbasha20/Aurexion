import React, { useState, useEffect } from "react";
import { useBdmDashboard } from "../../hooks/useBdmDashboard";
import bdmService, { FormSubmission } from "../../services/bdmService";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import Button from "../../../../components/ui/button";
import {
  Mail,
  Phone,
  UserCheck,
  XCircle,
  CheckCircle2,
  User,
  MessageSquare,
  AlertTriangle,
  X,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react";

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

export const ContactForms: React.FC = () => {
  const { data, isLoading, error, refetch } = useBdmDashboard();

  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [salesExecs, setSalesExecs] = useState<Array<{ id: number; username: string; name: string }>>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [modalMode, setModalMode] = useState<"assign" | "decline" | null>(null);
  const [targetExecId, setTargetExecId] = useState<number | "">("");
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    bdmService.getAssignableUsers().then(setSalesExecs);
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
      showFeedback("success", `Submission (${selectedSubmission.reference_id}) assigned to Sales Executive.`);
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
      showFeedback("success", `Submission (${selectedSubmission.reference_id}) marked as Declined.`);
      setModalMode(null);
      refetch();
    } catch (err: any) {
      showFeedback("error", err?.message || "Failed to decline lead.");
    } finally {
      setActionLoading(false);
    }
  };

  const allSubmissions = data?.recent_form_submissions || [];

  const filteredSubmissions = allSubmissions.filter((sub) => {
    const isContactSource = sourceFilter
      ? sub.source === sourceFilter
      : sub.source === "contact_form" || sub.source === "website_form" || sub.source === "website";

    const matchesSearch =
      !searchTerm ||
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.company && sub.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || sub.status === statusFilter;

    return isContactSource && matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>INBOUND PIPELINE</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {allSubmissions.length} Total Submissions
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Contact Form Submissions
          </h1>
        </div>

        <Button variant="outline" onClick={refetch} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <RefreshCw size={14} /> Refresh Submissions
        </Button>
      </div>

      {/* Action Notification */}
      {feedback && (
        <div style={{
          backgroundColor: feedback.type === "success" ? "rgba(74, 222, 128, 0.1)" : "rgba(239, 68, 68, 0.1)",
          border: feedback.type === "success" ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
          color: feedback.type === "success" ? "#4ade80" : "#ef4444",
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem",
          fontFamily: "IBM Plex Mono, monospace",
        }}>
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search submissions by name, email, company, or ID..."
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

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{
                padding: "0.6rem 0.85rem",
                backgroundColor: "rgba(5, 8, 17, 0.7)",
                border: "1px solid rgba(140, 174, 187, 0.2)",
                borderRadius: "4px",
                color: "#f8fafc",
                fontSize: "0.82rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Form Sources</option>
              <option value="contact_form">Contact Form</option>
              <option value="rfp_form">RFP Form</option>
              <option value="request_quote">Request Quote</option>
              <option value="estimator">Estimator</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "0.6rem 0.85rem",
                backgroundColor: "rgba(5, 8, 17, 0.7)",
                border: "1px solid rgba(140, 174, 187, 0.2)",
                borderRadius: "4px",
                color: "#f8fafc",
                fontSize: "0.82rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Declined / Lost</option>
            </select>

            {(searchTerm || sourceFilter || statusFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSourceFilter("");
                  setStatusFilter("");
                }}
                style={{ fontSize: "0.75rem" }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      <Card style={{ padding: "1.5rem" }} borderAccent>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              LOADING CONTACT SUBMISSIONS...
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
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
            <MessageSquare size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No contact form submissions found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 0 0" }}>
              Submissions from the website Contact Form will appear here automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredSubmissions.map((submission) => {
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
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

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                        <MessageSquare size={12} style={{ display: "inline", marginRight: "0.3rem" }} /> MESSAGE BRIEF / INQUIRY DETAILS
                      </span>
                      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5, backgroundColor: "rgba(5, 8, 17, 0.6)", padding: "0.6rem 0.75rem", borderRadius: "4px", whiteSpace: "pre-wrap" }}>
                        {submission.description || "No message body provided."}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", borderTop: "1px solid rgba(140, 174, 187, 0.1)", paddingTop: "0.75rem" }}>
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
        )}
      </Card>

      {/* Assign Sales Executive Modal */}
      {modalMode === "assign" && selectedSubmission && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "480px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.3rem", color: "#63f5e8", margin: 0 }}>Assign Lead to Sales Executive</h2>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setModalMode(null)}
                style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 1.25rem 0" }}>
              Assigning contact form lead <strong>{selectedSubmission.reference_id}</strong> ({selectedSubmission.name}) will transfer it to the selected Sales Executive's desk.
            </p>

            <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SELECT SALES EXECUTIVE *</label>
                <select
                  required
                  value={targetExecId}
                  onChange={(e) => setTargetExecId(Number(e.target.value))}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140, 174, 187, 0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                  }}
                >
                  <option value="">-- Choose Sales Executive --</option>
                  {salesExecs.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading || !targetExecId}>
                  {actionLoading ? "Assigning..." : "Assign Lead"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Decline Lead Modal */}
      {modalMode === "decline" && selectedSubmission && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "480px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.3rem", color: "#f87171", margin: 0 }}>Decline Contact Submission</h2>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setModalMode(null)}
                style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 1rem 0" }}>
              Are you sure you want to decline submission <strong>{selectedSubmission.reference_id}</strong> from {selectedSubmission.name}?
            </p>

            <form onSubmit={handleDeclineSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DECLINE REASON</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spam submission, Out of scope, Invalid contact details..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140, 174, 187, 0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Cancel</Button>
                <Button type="submit" style={{ backgroundColor: "#ef4444", color: "#ffffff" }} disabled={actionLoading}>
                  {actionLoading ? "Declining..." : "Decline Submission"}
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
