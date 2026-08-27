import React, { useState, useEffect } from "react";
import { useBdmDashboard } from "../../hooks/useBdmDashboard";
import bdmService, { FormSubmission } from "../../services/bdmService";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../components/ui/select";
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
  Eye,
  ArrowUpRight,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedLeadDetail, setSelectedLeadDetail] = useState<FormSubmission | null>(null);
  const [salesExecs, setSalesExecs] = useState<Array<{ id: number; username: string; name: string }>>(() => {
    return (bdmService.getCachedAssignableUsers() || []).map((u) => ({ id: u.id, username: u.username, name: u.name }));
  });
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [modalMode, setModalMode] = useState<"assign" | "decline" | null>(null);
  const [targetExecId, setTargetExecId] = useState<number | "">("");
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (data?.team_workload && data.team_workload.length > 0) {
      setSalesExecs(data.team_workload.map((u) => ({ id: u.id, username: u.username, name: u.name || u.username })));
    } else {
      bdmService.getAssignableUsers().then((users) => {
        if (users && users.length > 0) {
          setSalesExecs(users.map((u) => ({ id: u.id, username: u.username, name: u.name })));
        }
      }).catch((err) => {
        console.error("Failed to fetch assignable users:", err);
      });
    }
  }, [data?.team_workload]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenAssign = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setTargetExecId(submission.assigned_to || "");
    setModalMode("assign");
    if (salesExecs.length === 0) {
      bdmService.getAssignableUsers(true).then((users) => {
        if (users && users.length > 0) {
          setSalesExecs(users.map((u) => ({ id: u.id, username: u.username, name: u.name })));
        }
      }).catch((err) => {
        console.error("Failed to force refresh assignable users:", err);
      });
    }
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
    const reason = declineReason.trim();
    if (reason.length < 10) {
      showFeedback("error", "Reason for declining must be at least 10 characters long.");
      return;
    }
    setActionLoading(true);
    try {
      await bdmService.markLeadLost(selectedSubmission.id, reason);
      showFeedback("success", `Submission (${selectedSubmission.reference_id}) marked as Declined & notification email sent.`);
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

  const totalItems = filteredSubmissions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + pageSize);

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
            {paginatedSubmissions.map((submission) => {
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

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
                      <p style={{ fontWeight: 600, color: "#f8fafc", margin: 0, fontSize: "1rem" }}>
                        {submission.name}
                      </p>
                      {submission.company && (
                        <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.82rem" }}>
                          Company: <strong style={{ color: "#f8fafc" }}>{submission.company}</strong>
                        </p>
                      )}
                      <a href={`mailto:${submission.email}`} style={{ color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", fontSize: "0.82rem", wordBreak: "break-all" }}>
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

                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "0.6rem", borderTop: "1px solid rgba(140, 174, 187, 0.1)", paddingTop: "0.75rem", width: "100%" }}>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedLeadDetail(submission)}
                      style={{ fontSize: "0.78rem", color: "#63f5e8", borderColor: "rgba(99, 245, 232, 0.3)", whiteSpace: "nowrap" }}
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

            {/* Pagination Controls */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(140, 174, 187, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginTop: "1rem"
              }}
            >
              <div>
                Showing <strong style={{ color: "#f8fafc" }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
                <strong style={{ color: "#f8fafc" }}>{endIndex}</strong> of{" "}
                <strong style={{ color: "#f8fafc" }}>{totalItems}</strong> entries
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <Button
                    variant="outline"
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    Previous
                  </Button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Assign Sales Executive Modal */}
      {modalMode === "assign" && selectedSubmission && (
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
              Assigning contact form lead <strong>{selectedSubmission.reference_id}</strong> ({selectedSubmission.name}) will transfer it to the selected Sales Executive's dashboard.
            </p>

            <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SELECT SALES EXECUTIVE *</label>
                <Select value={targetExecId ? String(targetExecId) : ""} onValueChange={(val) => setTargetExecId(Number(val))}>
                  <SelectTrigger style={{ width: "100%", backgroundColor: "#050811", border: "1px solid rgba(99, 245, 232, 0.35)", color: "#f8fafc" }}>
                    <SelectValue placeholder="-- Choose Sales Executive --" />
                  </SelectTrigger>
                  <SelectContent style={{ maxHeight: "180px", overflowY: "auto" }}>
                    {salesExecs.map((user) => {
                      const shortUser = user.username.length > 22 ? `${user.username.slice(0, 19)}...` : user.username;
                      const label = user.name && user.name !== user.username ? `${user.name} (${shortUser})` : shortUser;
                      return (
                        <SelectItem key={user.id} value={String(user.id)} title={`${user.name} (${user.username})`}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DECLINE REASON *</label>
                  <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: declineReason.trim().length >= 10 ? "#22c55e" : "#f87171" }}>
                    {declineReason.trim().length} / 10 min chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  required
                  minLength={10}
                  style={{
                    padding: "0.65rem",
                    backgroundColor: "#050811",
                    border: declineReason.trim().length > 0 && declineReason.trim().length < 10 ? "1px solid #ef4444" : "1px solid rgba(140, 174, 187, 0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {declineReason.trim().length > 0 && declineReason.trim().length < 10 && (
                  <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: "0.2rem 0 0 0" }}>
                    Please enter at least 10 characters explaining the reason for declining.
                  </p>
                )}
                <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0.2rem 0 0 0" }}>
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
              <Button
                variant="outline"
                onClick={() => setSelectedLeadDetail(null)}
                style={{ fontSize: "0.82rem" }}
              >
                Close Desk
              </Button>
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
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContactForms;
