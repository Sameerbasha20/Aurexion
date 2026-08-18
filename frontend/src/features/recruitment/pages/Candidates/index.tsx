import React, { useState } from "react";
import { Link } from "wouter";
import { useCandidates } from "../../hooks/useRecruitment";
import { CandidateItem } from "../../services/recruitmentService";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Users,
  Search,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Filter,
  X,
} from "lucide-react";

export const Candidates: React.FC = () => {
  const { candidates, isLoading, error, refetch, updateCandidateStage } = useCandidates();

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [newStage, setNewStage] = useState("SCREENING");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.job_title && c.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.tracking_code && c.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = !stageFilter || c.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const handleOpenStageModal = (candidate: CandidateItem) => {
    setSelectedCandidate(candidate);
    setNewStage(candidate.stage || "SCREENING");
    setIsStageModalOpen(true);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setActionLoading(true);

    try {
      await updateCandidateStage(selectedCandidate.application_id, newStage);
      setIsStageModalOpen(false);
      setSelectedCandidate(null);
      setActionSuccess("Candidate stage updated successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
      refetch();
    } catch (err: any) {
      alert(err?.message || "Failed to update candidate stage.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStageBadgeStyle = (stage: string) => {
    switch (stage?.toUpperCase()) {
      case "APPLIED":
        return { color: "#63f5e8", bg: "rgba(99, 245, 232, 0.15)", border: "rgba(99, 245, 232, 0.3)" };
      case "SCREENING":
        return { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.3)" };
      case "SHORTLISTED":
        return { color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)" };
      case "INTERVIEW":
        return { color: "#818cf8", bg: "rgba(129, 140, 248, 0.15)", border: "rgba(129, 140, 248, 0.3)" };
      case "OFFER":
        return { color: "#facc15", bg: "rgba(250, 204, 21, 0.15)", border: "rgba(250, 204, 21, 0.3)" };
      case "HIRED":
        return { color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)", border: "rgba(74, 222, 128, 0.3)" };
      case "REJECTED":
        return { color: "#f87171", bg: "rgba(248, 113, 113, 0.15)", border: "rgba(248, 113, 113, 0.3)" };
      default:
        return { color: "#cbd5e1", bg: "rgba(140, 174, 187, 0.15)", border: "rgba(140, 174, 187, 0.3)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>TALENT DIRECTORY</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {candidates.length} Registered Candidates
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Candidates Talent Pool
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/recruitment/applications">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileText size={14} /> Applications Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div style={{
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          border: "1px solid rgba(74, 222, 128, 0.3)",
          color: "#4ade80",
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem",
          fontFamily: "IBM Plex Mono, monospace",
        }}>
          <CheckCircle2 size={16} />
          {actionSuccess}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by candidate name, email, phone, role, or tracking code..."
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

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
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
              <option value="">All Candidate Stages</option>
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {(searchTerm || stageFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStageFilter("");
                }}
                style={{ fontSize: "0.75rem" }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Candidates Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              SYNCING CANDIDATE TALENT POOL...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Users size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No candidates match</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Candidates will populate as applications are submitted via the Careers portal.
            </p>
            <Link href="/recruitment/jobs">
              <Button glow>View Job Openings</Button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CANDIDATE NAME / CODE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CONTACT REACH
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    APPLIED POSITION
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CURRENT STAGE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    RESUME
                  </th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => {
                  const badge = getStageBadgeStyle(candidate.stage);
                  return (
                    <tr
                      key={candidate.id}
                      style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>{candidate.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                          Ref: {candidate.tracking_code || `#APP-${candidate.id}`} &bull; Applied: {new Date(candidate.applied_date).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <a
                            href={`mailto:${candidate.email}`}
                            style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#63f5e8", textDecoration: "none", fontSize: "0.78rem" }}
                          >
                            <Mail size={12} /> {candidate.email}
                          </a>
                          {candidate.phone && (
                            <a
                              href={`tel:${candidate.phone}`}
                              style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#94a3b8", textDecoration: "none", fontSize: "0.75rem" }}
                            >
                              <Phone size={12} /> {candidate.phone}
                            </a>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ color: "#cbd5e1", fontWeight: 500 }}>{candidate.job_title}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{candidate.job_department}</div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.15rem 0.55rem",
                            borderRadius: "2px",
                            fontSize: "0.7rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {candidate.stage}
                        </span>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        {candidate.resume_url ? (
                          <a
                            href={candidate.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#63f5e8", fontSize: "0.78rem", textDecoration: "underline" }}
                          >
                            <Download size={13} /> View Resume
                          </a>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Attached</span>
                        )}
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <Button
                            variant="outline"
                            onClick={() => handleOpenStageModal(candidate)}
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                          >
                            Update Stage
                          </Button>
                          <Link href="/recruitment/applications">
                            <Button glow style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}>
                              Review &rarr;
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stage Progression Modal */}
      {isStageModalOpen && selectedCandidate && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem", overflowY: "auto" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "480px", padding: "2rem", boxSizing: "border-box", margin: "auto", overflowX: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>CANDIDATE STAGE PROGRESSION</p>
                <h2 style={{ fontSize: "1.3rem", margin: "0.25rem 0 0 0" }}>{selectedCandidate.name}</h2>
              </div>
              <button onClick={() => setIsStageModalOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", padding: "0.25rem" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 1rem 0" }}>
              Applied for <strong>{selectedCandidate.job_title}</strong>. Advance or transition candidate through the hiring pipeline:
            </p>

            <form onSubmit={handleSaveStage} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "0.75rem",
                  backgroundColor: "#050811",
                  border: "1px solid rgba(140, 174, 187, 0.25)",
                  color: "#f8fafc",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                }}
              >
                <option value="APPLIED">Applied (Initial Intake)</option>
                <option value="SCREENING">Screening (Resume Evaluation)</option>
                <option value="SHORTLISTED">Shortlisted (Selected for Interview)</option>
                <option value="INTERVIEW">Interview (Active Interview Round)</option>
                <option value="OFFER">Offer (Formal Offer Extended)</option>
                <option value="HIRED">Hired (Candidate Accepted)</option>
                <option value="REJECTED">Rejected (Candidate Not Selected)</option>
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsStageModalOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>
                  {actionLoading ? "Updating..." : "Confirm Stage Update"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Candidates;
