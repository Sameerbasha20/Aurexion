import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useApplications, useJobs } from "../../hooks/useRecruitment";
import recruitmentService, { CandidateApplication } from "../../services/recruitmentService";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  Eye,
  Download,
  Filter,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  Shield,
  Briefcase,
} from "lucide-react";

export const Applications: React.FC = () => {
  const { applications, isLoading, actionLoading, error, refetch, updateStage } = useApplications();
  const { jobs } = useJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [reviewApp, setReviewApp] = useState<CandidateApplication | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Read URL query parameters on mount or when URL changes
  useEffect(() => {
    const syncFiltersFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const jobParam = params.get("job") || params.get("job_title") || params.get("job_id") || params.get("vacancy");
      const stageParam = params.get("stage");
      const searchParam = params.get("search") || params.get("q");

      if (jobParam) setJobFilter(jobParam);
      if (stageParam) setStageFilter(stageParam);
      if (searchParam) setSearchTerm(searchParam);
    };

    syncFiltersFromUrl();
    window.addEventListener("popstate", syncFiltersFromUrl);
    return () => window.removeEventListener("popstate", syncFiltersFromUrl);
  }, []);

  const jobTitles = Array.from(
    new Set([
      ...applications.map((a) => a.job_title).filter(Boolean),
      ...jobs.map((j) => j.title).filter(Boolean),
    ])
  );

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchTerm ||
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job_title && app.job_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = !stageFilter || app.stage === stageFilter;
    const matchesJob =
      !jobFilter ||
      app.job_title === jobFilter ||
      app.job_code === jobFilter ||
      String(app.job_vacancy) === jobFilter ||
      (app.job_title && app.job_title.toLowerCase() === jobFilter.toLowerCase()) ||
      (app.job_code && app.job_code.toLowerCase() === jobFilter.toLowerCase());

    return matchesSearch && matchesStage && matchesJob;
  });

  const handleViewResume = async (trackingCode: string) => {
    try {
      const response = await recruitmentService.getApplicationResumeUrl(trackingCode);
      if (response?.download_url) {
        window.open(response.download_url, "_blank");
      } else {
        alert("No resume file is attached to this application.");
      }
    } catch (err: any) {
      alert("Unable to open resume: " + (err?.message || "File unavailable"));
    }
  };

  const handleStageUpdate = async (trackingCode: string, nextStage: string) => {
    try {
      await updateStage(trackingCode, nextStage);
      if (reviewApp && reviewApp.tracking_code === trackingCode) {
        setReviewApp({ ...reviewApp, stage: nextStage });
      }
      setActionSuccess(`Application candidate moved to ${nextStage} stage.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to advance stage.");
    }
  };

  const getStageBadgeStyle = (stage: string) => {
    switch ((stage || "").toUpperCase()) {
      case "APPLIED":
        return { bg: "rgba(99, 245, 232, 0.15)", color: "#63f5e8", border: "rgba(99, 245, 232, 0.3)" };
      case "SCREENING":
        return { bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" };
      case "SHORTLISTED":
        return { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7", border: "rgba(168, 85, 247, 0.3)" };
      case "INTERVIEW":
        return { bg: "rgba(251, 146, 60, 0.15)", color: "#fb923c", border: "rgba(251, 146, 60, 0.3)" };
      case "OFFER":
        return { bg: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "rgba(234, 179, 8, 0.3)" };
      case "HIRED":
        return { bg: "rgba(74, 222, 128, 0.15)", color: "#4ade80", border: "rgba(74, 222, 128, 0.3)" };
      case "REJECTED":
        return { bg: "rgba(248, 113, 113, 0.15)", color: "#f87171", border: "rgba(248, 113, 113, 0.3)" };
      default:
        return { bg: "rgba(140, 174, 187, 0.15)", color: "#cbd5e1", border: "rgba(140, 174, 187, 0.2)" };
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
            <p className="eyebrow" style={{ margin: 0 }}>CANDIDATE PIPELINE &amp; SUBMISSIONS</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {applications.length} Active Records
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Applications Map
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/recruitment/jobs">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Briefcase size={14} /> Job Openings Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Success Alert */}
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

      {/* Stage Counter Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <Card glowOnHover onClick={() => setStageFilter(stageFilter === "APPLIED" ? "" : "APPLIED")} style={{ padding: "1.1rem", cursor: "pointer", borderColor: stageFilter === "APPLIED" ? "#63f5e8" : undefined }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>APPLIED</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#63f5e8", margin: "0.25rem 0" }}>{appliedCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Awaiting review</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter(stageFilter === "SCREENING" ? "" : "SCREENING")} style={{ padding: "1.1rem", cursor: "pointer", borderColor: stageFilter === "SCREENING" ? "#38bdf8" : undefined }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#38bdf8" }}>SCREENING</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#38bdf8", margin: "0.25rem 0" }}>{screeningCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Resume evaluated</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter(stageFilter === "SHORTLISTED" ? "" : "SHORTLISTED")} style={{ padding: "1.1rem", cursor: "pointer", borderColor: stageFilter === "SHORTLISTED" ? "#a855f7" : undefined }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#a855f7" }}>SHORTLISTED</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#a855f7", margin: "0.25rem 0" }}>{shortlistedCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Interview ready</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter(stageFilter === "INTERVIEW" ? "" : "INTERVIEW")} style={{ padding: "1.1rem", cursor: "pointer", borderColor: stageFilter === "INTERVIEW" ? "#fb923c" : undefined }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#fb923c" }}>INTERVIEW</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#fb923c", margin: "0.25rem 0" }}>{interviewCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Rounds underway</span>
        </Card>

        <Card glowOnHover onClick={() => setStageFilter(stageFilter === "HIRED" ? "" : "HIRED")} style={{ padding: "1.1rem", cursor: "pointer", borderColor: stageFilter === "HIRED" ? "#4ade80" : undefined }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#4ade80" }}>HIRED</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, color: "#4ade80", margin: "0.25rem 0" }}>{hiredCount}</p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Offers accepted</span>
        </Card>
      </div>

      {/* Main Filter & Applications Table */}
      <Card style={{ padding: "1.5rem" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by candidate name, email, phone, or tracking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.65rem 1rem 0.65rem 2.4rem",
                backgroundColor: "rgba(10, 17, 28, 0.7)",
                border: "1px solid rgba(140, 174, 187, 0.2)",
                borderRadius: "4px",
                color: "#f8fafc",
                fontSize: "0.85rem",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{
                padding: "0.65rem 1rem",
                backgroundColor: "rgba(10, 17, 28, 0.7)",
                border: "1px solid rgba(140, 174, 187, 0.2)",
                borderRadius: "4px",
                color: "#f8fafc",
                fontSize: "0.85rem",
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
                  padding: "0.65rem 1rem",
                  backgroundColor: "rgba(10, 17, 28, 0.7)",
                  border: "1px solid rgba(140, 174, 187, 0.2)",
                  borderRadius: "4px",
                  color: "#f8fafc",
                  fontSize: "0.85rem",
                  maxWidth: "240px",
                }}
              >
                <option value="">All Vacancies</option>
                {jobTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
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
                style={{ fontSize: "0.8rem", padding: "0.65rem 0.85rem" }}
              >
                <X size={14} style={{ marginRight: "0.3rem" }} /> Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 0.75rem" }} />
            <p style={{ margin: 0 }}>Syncing candidates pipeline stream...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", color: "#ef4444" }}>
            <p style={{ margin: 0 }}>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <FileText size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No candidate applications match</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              {jobFilter ? `No applications found for "${jobFilter}".` : "Try broadening your filter criteria."}
            </p>
            {(searchTerm || stageFilter || jobFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStageFilter("");
                  setJobFilter("");
                }}
              >
                Reset Filter Parameters
              </Button>
            )}
          </div>
        ) : (
          <div
            className="custom-scrollbar"
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "520px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.95)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)", position: "sticky", top: 0, zIndex: 2 }}>
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
                  <th style={{ padding: "0.85rem 1rem", textAlign: "center", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ACTION
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
                      onFocus={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onBlur={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                        <div>{app.tracking_code}</div>
                        <div style={{ color: "#64748b", fontSize: "0.68rem" }}>
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>
                          {app.first_name} {app.last_name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                          {app.email} &bull; {app.phone || "No phone"}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ color: "#cbd5e1", fontWeight: 500 }}>{app.job_title || `Job #${app.job_vacancy}`}</div>
                        {app.job_department && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{app.job_department}</div>
                        )}
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
                          <button
                            type="button"
                            onClick={() => handleViewResume(app.tracking_code)}
                            style={{
                              background: "none",
                              border: 0,
                              color: "#63f5e8",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontSize: "0.78rem",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            <Download size={13} /> Resume
                          </button>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "0.75rem" }}>None</span>
                        )}
                      </td>

                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
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

      {/* Review / Inspect Application Modal */}
      {reviewApp && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "600px", padding: "2rem", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>CANDIDATE DOSSIER</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0", color: "#f8fafc" }}>
                  {reviewApp.first_name} {reviewApp.last_name}
                </h2>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                  Tracking Code: {reviewApp.tracking_code} &bull; Applied on {new Date(reviewApp.created_at).toLocaleString()}
                </span>
              </div>
              <button type="button" onClick={() => setReviewApp(null)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem", backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "4px", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EMAIL ADDRESS</label>
                <p style={{ margin: "0.2rem 0 0 0", color: "#63f5e8", fontSize: "0.88rem" }}>{reviewApp.email}</p>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PHONE</label>
                <p style={{ margin: "0.2rem 0 0 0", color: "#f8fafc", fontSize: "0.88rem" }}>{reviewApp.phone || "Not specified"}</p>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>POSITION VACANCY</label>
                <p style={{ margin: "0.2rem 0 0 0", color: "#f8fafc", fontSize: "0.88rem", fontWeight: 600 }}>{reviewApp.job_title}</p>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RESUME ATTACHMENT</label>
                <div>
                  {reviewApp.resume_storage_path ? (
                    <Button
                      variant="outline"
                      onClick={() => handleViewResume(reviewApp.tracking_code)}
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <Download size={12} style={{ marginRight: "0.3rem" }} /> Open Resume
                    </Button>
                  ) : (
                    <p style={{ margin: "0.2rem 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>No resume file</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pipeline Stage Transition Flow */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                  CURRENT STAGE: <strong style={{ color: "#63f5e8" }}>{reviewApp.stage || "APPLIED"}</strong>
                </span>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Advance stage workflow</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "SCREENING"}
                  onClick={() => handleStageUpdate(reviewApp.tracking_code, "SCREENING")}
                  style={{ fontSize: "0.75rem", padding: "0.4rem" }}
                >
                  &rarr; Screening
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "SHORTLISTED"}
                  onClick={() => handleStageUpdate(reviewApp.tracking_code, "SHORTLISTED")}
                  style={{ fontSize: "0.75rem", padding: "0.4rem", color: "#a855f7", borderColor: "rgba(168, 85, 247, 0.4)" }}
                >
                  &rarr; Shortlist
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "INTERVIEW"}
                  onClick={() => handleStageUpdate(reviewApp.tracking_code, "INTERVIEW")}
                  style={{ fontSize: "0.75rem", padding: "0.4rem", color: "#fb923c", borderColor: "rgba(251, 146, 60, 0.4)" }}
                >
                  &rarr; Interview
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "OFFER"}
                  onClick={() => handleStageUpdate(reviewApp.tracking_code, "OFFER")}
                  style={{ fontSize: "0.75rem", padding: "0.4rem", color: "#eab308", borderColor: "rgba(234, 179, 8, 0.4)" }}
                >
                  &rarr; Offer
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "HIRED"}
                  onClick={() => handleStageUpdate(reviewApp.tracking_code, "HIRED")}
                  style={{ fontSize: "0.75rem", padding: "0.4rem", color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.4)" }}
                >
                  &rarr; Hired
                </Button>

                <Button
                  variant="outline"
                  disabled={actionLoading || reviewApp.stage === "REJECTED"}
                  onClick={() => handleStageUpdate(reviewApp.tracking_code, "REJECTED")}
                  style={{ fontSize: "0.75rem", padding: "0.4rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.4)" }}
                >
                  &times; Reject
                </Button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={() => setReviewApp(null)}>Close Review</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Applications;
