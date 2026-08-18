import React, { useState } from "react";
import { Link } from "wouter";
import { useApplications } from "../../hooks/useRecruitment";
import { CandidateApplication } from "../../services/recruitmentService";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  FileText,
  Search,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  X,
  ExternalLink,
  Award,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";

export const Applications: React.FC = () => {
  const { applications, isLoading, actionLoading, error, refetch, updateStage } = useApplications();

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [reviewApp, setReviewApp] = useState<CandidateApplication | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const jobTitles = Array.from(new Set(applications.map((a) => a.job_title).filter(Boolean)));

  const filteredApplications = applications.filter((app) => {
    const fullName = `${app.first_name || ""} ${app.last_name || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.phone && app.phone.includes(searchTerm)) ||
      (app.tracking_code && app.tracking_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.job_title && app.job_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = !stageFilter || app.stage === stageFilter;
    const matchesJob = !jobFilter || app.job_title === jobFilter;

    return matchesSearch && matchesStage && matchesJob;
  });

  const handleStageUpdate = async (applicationId: number, nextStage: string) => {
    try {
      await updateStage(applicationId, nextStage);
      setActionSuccess(`Application stage updated to ${nextStage}.`);
      if (reviewApp && reviewApp.id === applicationId) {
        setReviewApp({ ...reviewApp, stage: nextStage });
      }
      setTimeout(() => setActionSuccess(null), 3000);
      refetch();
    } catch (err: any) {
      alert(err?.message || "Failed to update application stage.");
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

  const appliedCount = applications.filter((a) => (a.stage || "APPLIED").toUpperCase() === "APPLIED").length;
  const screeningCount = applications.filter((a) => a.stage?.toUpperCase() === "SCREENING").length;
  const shortlistedCount = applications.filter((a) => a.stage?.toUpperCase() === "SHORTLISTED").length;
  const interviewCount = applications.filter((a) => a.stage?.toUpperCase() === "INTERVIEW").length;
  const hiredCount = applications.filter((a) => a.stage?.toUpperCase() === "HIRED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>APPLICATIONS AUDIT TRAIL</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {applications.length} Submissions
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Job Applications Review Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/recruitment/jobs">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Briefcase size={14} /> Job Openings
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Alert */}
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

      {/* Stage KPI Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <Card glowOnHover onClick={() => setStageFilter("APPLIED")} style={{ padding: "1.1rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>NEW APPLIED</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#63f5e8", margin: "0.25rem 0" }}>{appliedCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Awaiting review</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter("SCREENING")} style={{ padding: "1.1rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#38bdf8" }}>SCREENING</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#38bdf8", margin: "0.25rem 0" }}>{screeningCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Resume evaluated</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter("SHORTLISTED")} style={{ padding: "1.1rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#a855f7" }}>SHORTLISTED</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#a855f7", margin: "0.25rem 0" }}>{shortlistedCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Interview ready</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter("INTERVIEW")} style={{ padding: "1.1rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#818cf8" }}>INTERVIEW</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#818cf8", margin: "0.25rem 0" }}>{interviewCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Rounds underway</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter("HIRED")} style={{ padding: "1.1rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#4ade80" }}>HIRED</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#4ade80", margin: "0.25rem 0" }}>{hiredCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Offers accepted</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by candidate name, email, phone, or tracking code..."
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
              <option value="">All Stages</option>
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {jobTitles.length > 0 && (
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
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
                <option value="">All Vacancies</option>
                {jobTitles.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            {(searchTerm || stageFilter || jobFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStageFilter("");
                  setJobFilter("");
                }}
                style={{ fontSize: "0.75rem" }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Applications Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              FETCHING JOB APPLICATIONS...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <FileText size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No applications found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Public candidate submissions from the Careers portal will appear in this review desk.
            </p>
            <Link href="/recruitment/jobs">
              <Button glow>View Vacancies</Button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    TRACKING REF / DATE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CANDIDATE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    APPLIED ROLE &amp; DEPT
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    STAGE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    RESUME
                  </th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    STAGE PROGRESSION
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => {
                  const badge = getStageBadgeStyle(app.stage);
                  return (
                    <tr
                      key={app.id}
                      style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                        <div>{app.tracking_code || `#APP-${app.id}`}</div>
                        <div style={{ color: "#64748b", fontSize: "0.68rem" }}>
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#f8fafc" }}>
                          {app.first_name} {app.last_name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          <a href={`mailto:${app.email}`} style={{ color: "#63f5e8", textDecoration: "none" }}>
                            {app.email}
                          </a>
                          {app.phone && ` &bull; ${app.phone}`}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ color: "#cbd5e1", fontWeight: 500 }}>{app.job_title}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{app.job_department}</div>
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
                          {app.stage || "APPLIED"}
                        </span>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        {app.resume_storage_path ? (
                          <a
                            href={app.resume_storage_path}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#63f5e8", fontSize: "0.78rem" }}
                          >
                            <Download size={13} /> Resume
                          </a>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Stored</span>
                        )}
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", alignItems: "center" }}>
                          <Button
                            variant="outline"
                            onClick={() => setReviewApp(app)}
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                          >
                            Inspect Desk
                          </Button>
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

      {/* Application Review & Stage Progression Drawer/Modal */}
      {reviewApp && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem", overflowY: "auto" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", padding: "2rem", boxSizing: "border-box", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>CANDIDATE APPLICATION REVIEW</p>
                <h2 style={{ fontSize: "1.6rem", margin: "0.25rem 0 0 0", color: "#f8fafc" }}>
                  {reviewApp.first_name} {reviewApp.last_name}
                </h2>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace" }}>
                  Tracking Code: {reviewApp.tracking_code} &bull; Applied on {new Date(reviewApp.created_at).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setReviewApp(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Candidate Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.7)", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EMAIL ADDRESS</span>
                <p style={{ margin: "0.2rem 0 0 0", color: "#63f5e8", fontSize: "0.88rem" }}>{reviewApp.email}</p>
              </div>

              <div style={{ padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.7)", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PHONE NUMBER</span>
                <p style={{ margin: "0.2rem 0 0 0", color: "#f8fafc", fontSize: "0.88rem" }}>{reviewApp.phone || "Not specified"}</p>
              </div>

              <div style={{ padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.7)", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>APPLIED POSITION</span>
                <p style={{ margin: "0.2rem 0 0 0", color: "#f8fafc", fontSize: "0.88rem", fontWeight: 600 }}>{reviewApp.job_title}</p>
              </div>

              <div style={{ padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.7)", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RESUME DOCUMENT</span>
                <div style={{ marginTop: "0.2rem" }}>
                  {reviewApp.resume_storage_path ? (
                    <a
                      href={reviewApp.resume_storage_path}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#63f5e8", fontSize: "0.85rem", textDecoration: "underline" }}
                    >
                      <Download size={14} /> Download File
                    </a>
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Stored Securely</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stage Progression Action Panel */}
            <div style={{ padding: "1.25rem", backgroundColor: "rgba(10, 17, 28, 0.7)", border: "1px solid rgba(140, 174, 187, 0.2)", borderRadius: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.82rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                  CURRENT STAGE: <strong style={{ color: "#63f5e8" }}>{reviewApp.stage || "APPLIED"}</strong>
                </span>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Select action to transition candidate:</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "SCREENING"}
                  onClick={() => handleStageUpdate(reviewApp.id, "SCREENING")}
                  style={{ fontSize: "0.75rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}
                >
                  Advance to Screening
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "SHORTLISTED"}
                  onClick={() => handleStageUpdate(reviewApp.id, "SHORTLISTED")}
                  style={{ fontSize: "0.75rem", color: "#a855f7", borderColor: "rgba(168, 85, 247, 0.3)" }}
                >
                  Shortlist Candidate
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "INTERVIEW"}
                  onClick={() => handleStageUpdate(reviewApp.id, "INTERVIEW")}
                  style={{ fontSize: "0.75rem", color: "#818cf8", borderColor: "rgba(129, 140, 248, 0.3)" }}
                >
                  Schedule Interview
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "OFFER"}
                  onClick={() => handleStageUpdate(reviewApp.id, "OFFER")}
                  style={{ fontSize: "0.75rem", color: "#facc15", borderColor: "rgba(250, 204, 21, 0.3)" }}
                >
                  Extend Offer
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "HIRED"}
                  onClick={() => handleStageUpdate(reviewApp.id, "HIRED")}
                  style={{ fontSize: "0.75rem", color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.3)" }}
                >
                  Mark as Hired
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "REJECTED"}
                  onClick={() => handleStageUpdate(reviewApp.id, "REJECTED")}
                  style={{ fontSize: "0.75rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.3)" }}
                >
                  Reject Application
                </Button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <Button variant="outline" onClick={() => setReviewApp(null)}>Close Review</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Applications;
