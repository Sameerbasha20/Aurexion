import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import portalService from "../../services/portalService";
import usePortalQuery from "../../hooks/usePortalQuery";
import { ErrorState, LoadingState, EmptyState } from "../../components/StateViews";
import type { ClientRequestItem, ConsultationRequestItem, ClientProjectItem } from "../../types/portal.types";
import { MessageSquareCode, Plus, RefreshCw, CheckCircle2, AlertTriangle, X, Calendar, Video, ShieldAlert } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  requested: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  scheduled: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const Requests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"requests" | "consultations">("requests");

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Request Form
  const [reqTitle, setReqTitle] = useState("");
  const [reqCategory, setReqCategory] = useState("Change Request");
  const [reqDescription, setReqDescription] = useState("");
  const [reqPriority, setReqPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [reqProjectId, setReqProjectId] = useState<number | "">("");

  // Consultation Form
  const [consTitle, setConsTitle] = useState("");
  const [consType, setConsType] = useState<"technical_review" | "status_call">("technical_review");
  const [consDescription, setConsDescription] = useState("");
  const [consPreferredDate, setConsPreferredDate] = useState("");
  const [consProjectId, setConsProjectId] = useState<number | "">("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const projectsQuery = usePortalQuery<ClientProjectItem[]>(
    ["portal", "projects"],
    () => portalService.getProjects()
  );

  const requestsQuery = usePortalQuery<ClientRequestItem[]>(
    ["portal", "requests"],
    () => portalService.getRequests()
  );

  const consultationsQuery = usePortalQuery<ConsultationRequestItem[]>(
    ["portal", "consultations"],
    () => portalService.getConsultations()
  );

  const projects = projectsQuery.data || [];
  const requests = requestsQuery.data || [];
  const consultations = consultationsQuery.data || [];

  const isLoading = requestsQuery.isLoading || consultationsQuery.isLoading;

  const handleRefresh = () => {
    requestsQuery.refetch();
    consultationsQuery.refetch();
    projectsQuery.refetch();
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    setSubmitting(true);
    try {
      await portalService.createRequest({
        title: reqTitle.trim(),
        category: reqCategory.trim(),
        description: reqDescription.trim(),
        priority: reqPriority,
        project: reqProjectId ? Number(reqProjectId) : null,
      });
      setFeedback({ type: "success", text: "Request submitted successfully!" });
      setTimeout(() => setFeedback(null), 4000);
      setReqTitle("");
      setReqDescription("");
      setIsRequestModalOpen(false);
      requestsQuery.refetch();
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Failed to submit request." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consTitle.trim()) return;
    setSubmitting(true);
    try {
      await portalService.createConsultation({
        request_type: consType,
        title: consTitle.trim(),
        description: consDescription.trim(),
        preferred_date: consPreferredDate ? new Date(consPreferredDate).toISOString() : null,
        project: consProjectId ? Number(consProjectId) : null,
      });
      setFeedback({ type: "success", text: "Consultation meeting requested successfully!" });
      setTimeout(() => setFeedback(null), 4000);
      setConsTitle("");
      setConsDescription("");
      setConsPreferredDate("");
      setIsConsultationModalOpen(false);
      consultationsQuery.refetch();
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Failed to request consultation." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="CLIENT ENGAGEMENT"
        title="Requests & Consultation Schedule"
        description="Log operational incidents, change requests, or request technical reviews and status calls."
        actions={
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} style={{ marginRight: "0.35rem" }} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setFeedback(null); setIsConsultationModalOpen(true); }}>
              <Calendar size={14} style={{ marginRight: "0.35rem" }} /> Request Consultation Call
            </Button>
            <Button glow size="sm" onClick={() => { setFeedback(null); setIsRequestModalOpen(true); }}>
              <Plus size={14} style={{ marginRight: "0.35rem" }} /> Submit Request / Incident
            </Button>
          </div>
        }
      />

      {feedback && (
        <div style={{
          backgroundColor: feedback.type === "success" ? "rgba(74, 222, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
          color: feedback.type === "success" ? "#4ade80" : "#ef4444",
          border: feedback.type === "success" ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          fontSize: "0.85rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {feedback.text}
          </div>
          <button type="button" onClick={() => setFeedback(null)} style={{ background: "none", border: 0, color: "inherit", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(140,174,187,0.18)", paddingBottom: "0.5rem" }}>
        {[
          { id: "requests", label: `Requests & Incidents (${requests.length})`, icon: MessageSquareCode },
          { id: "consultations", label: `Consultation Schedule (${consultations.length})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.85rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#63f5e8" : "#94a3b8",
                backgroundColor: isActive ? "rgba(99, 245, 232, 0.08)" : "transparent",
                border: isActive ? "1px solid rgba(99, 245, 232, 0.3)" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <LoadingState label="LOADING CLIENT REQUESTS & CONSULTATIONS..." rows={3} />
      ) : activeTab === "requests" ? (
        requests.length === 0 ? (
          <EmptyState
            title="No pending requests"
            description="Submit change requests, operational incidents, or feature additions to track status updates."
            action={
              <Button glow size="sm" onClick={() => setIsRequestModalOpen(true)}>
                <Plus size={14} style={{ marginRight: "0.35rem" }} /> Submit your first request
              </Button>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {requests.map((req) => (
              <Card key={req.id} glowOnHover style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                        {req.category}
                      </span>
                      {req.project_title && (
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          · Project: <strong style={{ color: "#cbd5e1" }}>{req.project_title}</strong>
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.05rem", color: "#f8fafc" }}>
                      {req.title}
                    </h3>
                  </div>
                  <Badge className={STATUS_COLORS[req.status] || "bg-gray-500/20 text-gray-400"}>
                    {req.status_display || req.status}
                  </Badge>
                </div>

                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5, margin: "0.5rem 0 0.75rem 0" }}>
                  {req.description || "No detailed description provided."}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                  <span>Priority: {req.priority.toUpperCase()}</span>
                  <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        consultations.length === 0 ? (
          <EmptyState
            title="No consultation requests scheduled"
            description="Schedule technical review meetings or status calls with Aurexion delivery leads."
            action={
              <Button glow size="sm" onClick={() => setIsConsultationModalOpen(true)}>
                <Calendar size={14} style={{ marginRight: "0.35rem" }} /> Schedule Consultation
              </Button>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {consultations.map((cons) => (
              <Card key={cons.id} glowOnHover style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#c4b5fd", textTransform: "uppercase" }}>
                        {cons.request_type_display}
                      </span>
                      {cons.project_title && (
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          · Project: <strong style={{ color: "#cbd5e1" }}>{cons.project_title}</strong>
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.05rem", color: "#f8fafc" }}>
                      {cons.title}
                    </h3>
                  </div>
                  <Badge className={STATUS_COLORS[cons.status] || "bg-gray-500/20 text-gray-400"}>
                    {cons.status_display || cons.status}
                  </Badge>
                </div>

                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5, margin: "0.5rem 0 0.75rem 0" }}>
                  {cons.description || "No specific meeting agenda specified."}
                </p>

                {cons.meeting_link && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <a href={cons.meeting_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <Button variant="outline" size="sm" style={{ fontSize: "0.75rem", color: "#4ade80" }}>
                        <Video size={13} style={{ marginRight: "0.3rem" }} /> Join Meeting
                      </Button>
                    </a>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                  <span>Preferred: {cons.preferred_date ? new Date(cons.preferred_date).toLocaleString() : "Flexible"}</span>
                  <span>Scheduled: {cons.scheduled_at ? new Date(cons.scheduled_at).toLocaleString() : "Pending"}</span>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Modal 1: Request / Operational Incident Form */}
      {isRequestModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5,8,17,0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto", padding: "1.75rem", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "#63f5e8", margin: 0 }}>Log Request / Incident</h2>
              <button type="button" onClick={() => setIsRequestModalOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TITLE *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Change Request — API Rate Limits"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RELATED PROJECT</label>
                <select
                  value={reqProjectId}
                  onChange={(e) => setReqProjectId(e.target.value ? Number(e.target.value) : "")}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                >
                  <option value="">General (No specific project)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CATEGORY</label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                >
                  <option value="Operational Incident">Operational Incident</option>
                  <option value="Change Request">Change Request</option>
                  <option value="Feature Enhancement">Feature Enhancement</option>
                  <option value="Custom Scope Addition">Custom Scope Addition</option>
                  <option value="Technical Inquiry">Technical Inquiry</option>
                  <option value="SLA Upgrade">SLA Upgrade</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PRIORITY</label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value as any)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DESCRIPTION</label>
                <textarea
                  rows={4}
                  placeholder="Provide business or technical justification..."
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={submitting || !reqTitle.trim()}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal 2: Consultation Schedule Form */}
      {isConsultationModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5,8,17,0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto", padding: "1.75rem", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "#c4b5fd", margin: 0 }}>Request Consultation Call</h2>
              <button type="button" onClick={() => setIsConsultationModalOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateConsultation} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING TYPE</label>
                <select
                  value={consType}
                  onChange={(e) => setConsType(e.target.value as any)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                >
                  <option value="technical_review">Technical Review Meeting</option>
                  <option value="status_call">Status Call</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING TITLE *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Architecture Technical Review — Phase 2"
                  value={consTitle}
                  onChange={(e) => setConsTitle(e.target.value)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RELATED PROJECT</label>
                <select
                  value={consProjectId}
                  onChange={(e) => setConsProjectId(e.target.value ? Number(e.target.value) : "")}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                >
                  <option value="">General Engagement</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PREFERRED DATE & TIME</label>
                <input
                  type="datetime-local"
                  value={consPreferredDate}
                  onChange={(e) => setConsPreferredDate(e.target.value)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>MEETING AGENDA / NOTES</label>
                <textarea
                  rows={4}
                  placeholder="Outline topics or discussion items for Aurexion delivery leads..."
                  value={consDescription}
                  onChange={(e) => setConsDescription(e.target.value)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140,174,187,0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsConsultationModalOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={submitting || !consTitle.trim()}>
                  {submitting ? "Requesting..." : "Schedule Meeting"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Requests;