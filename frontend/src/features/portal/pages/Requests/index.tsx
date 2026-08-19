import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import portalService from "../../services/portalService";
import { MessageSquareCode, Plus, RefreshCw, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface RequestItem {
  id: number;
  title: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  status_display: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const Requests: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Feature Enhancement");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await portalService.getRequests();
      setRequests(data);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await portalService.createRequest({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        priority,
      });
      setFeedback({ type: "success", text: "Request submitted successfully!" });
      setTimeout(() => {
        setFeedback(null);
      }, 4000);
      setTitle("");
      setDescription("");
      setIsModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Failed to submit request." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="CLIENT REQUESTS"
        title="Custom Service & Feature Requests"
        description="Submit custom scope additions, feature enhancements, or technical inquiries."
        actions={
          <Button glow size="sm" onClick={() => { setFeedback(null); setIsModalOpen(true); }}>
            <Plus size={14} style={{ marginRight: "0.35rem" }} />
            Submit Request
          </Button>
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
          <button type="button" onClick={() => setFeedback(null)} style={{ background: "none", border: 0, color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
            LOADING REQUESTS...
          </p>
        </div>
      ) : requests.length === 0 ? (
        <Card style={{ padding: "3rem", textAlign: "center" }}>
          <MessageSquareCode size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", color: "#f8fafc", margin: 0 }}>No requests submitted yet</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0.5rem 0 1.25rem 0" }}>
            Need a new feature, module customization, or SLA upgrade? Submit your request above.
          </p>
          <Button glow size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} style={{ marginRight: "0.35rem" }} /> Submit your first request
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map((req) => (
            <Card key={req.id} style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                    {req.category}
                  </span>
                  <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.1rem", color: "#f8fafc" }}>
                    {req.title}
                  </h3>
                </div>
                <Badge className={STATUS_COLORS[req.status] || "bg-gray-500/20 text-gray-400"}>
                  {req.status_display || req.status}
                </Badge>
              </div>

              <p style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.5, margin: "0.5rem 0 0.75rem 0" }}>
                {req.description || "No detailed description provided."}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                <span>Priority: {req.priority.toUpperCase()}</span>
                <span>Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5,8,17,0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "480px", maxHeight: "85vh", overflowY: "auto", padding: "1.75rem", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "#63f5e8", margin: 0 }}>Submit Custom Request</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>REQUEST TITLE *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Additional Cloud Storage Scope"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  <option value="Feature Enhancement">Feature Enhancement</option>
                  <option value="Custom Scope Addition">Custom Scope Addition</option>
                  <option value="Technical Inquiry">Technical Inquiry</option>
                  <option value="SLA Upgrade">SLA Upgrade</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PRIORITY</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
                  placeholder="Describe your request requirement in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem", flexShrink: 0 }}>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={submitting || !title.trim()}>
                  {submitting ? "Submitting..." : "Submit Request"}
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