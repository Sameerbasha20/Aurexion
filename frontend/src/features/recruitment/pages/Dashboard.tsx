import React, { useState } from "react";
import { Link } from "wouter";
import { useRecruitmentDashboard } from "../hooks/useRecruitment";
import recruitmentService, { JobVacancy, CandidateApplication } from "../services/recruitmentService";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  Briefcase,
  Users,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ChevronRight,
  FileText,
  Award,
  X,
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText as FileIcon,
  Download,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useRecruitmentDashboard();
  const [advancingId, setAdvancingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit vacancy modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);
  const [editForm, setEditForm] = useState<Partial<JobVacancy>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Candidate review modal state (read-only)
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewApp, setReviewApp] = useState<CandidateApplication | null>(null);
  const [reviewResumeUrl, setReviewResumeUrl] = useState<string | null>(null);
  const [reviewResumeLoading, setReviewResumeLoading] = useState(false);

  const handleOpenReview = async (app: CandidateApplication) => {
    setReviewApp(app);
    setReviewResumeUrl(null);
    setIsReviewOpen(true);
    // Try to fetch resume URL
    if (app.resume_storage_path) {
      setReviewResumeLoading(true);
      try {
        const result = await recruitmentService.getApplicationResumeUrl(app.tracking_code);
        setReviewResumeUrl(result.download_url);
      } catch {
        setReviewResumeUrl(null);
      } finally {
        setReviewResumeLoading(false);
      }
    }
  };

  const handleOpenEdit = (job: JobVacancy) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      department: job.department,
      location: job.location,
      experience: job.experience,
      skills: job.skills,
      responsibilities: job.responsibilities,
      status: job.status,
    });
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setEditError(null);
    setEditLoading(true);
    try {
      await recruitmentService.updateJob(editingJob.job_id, editForm);
      setIsEditOpen(false);
      setEditingJob(null);
      setSuccessMessage(`Vacancy "${editingJob.title}" updated successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || "Failed to update job vacancy.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleAdvanceStage = async (applicationId: number, trackingCode: string, nextStage: string) => {
    setAdvancingId(applicationId);
    try {
      await recruitmentService.updateApplicationStage(trackingCode, nextStage);
      setSuccessMessage(`Candidate stage advanced to ${nextStage}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    } catch (err: any) {
      alert(err?.message || "Failed to update candidate stage.");
    } finally {
      setAdvancingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow">TALENT ACQUISITION ENGINE</p>
            <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>HR Recruiter Desk</h1>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} style={{ padding: "1.5rem", minHeight: "130px", animation: "pulse 1.5s infinite" }}>
              <div style={{ height: "14px", width: "40%", backgroundColor: "rgba(140, 174, 187, 0.15)", marginBottom: "1rem" }} />
              <div style={{ height: "32px", width: "60%", backgroundColor: "rgba(99, 245, 232, 0.2)", marginBottom: "0.5rem" }} />
              <div style={{ height: "12px", width: "80%", backgroundColor: "rgba(140, 174, 187, 0.1)" }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">TALENT ACQUISITION ENGINE</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>HR Recruiter Desk</h1>
        </div>
        <Card style={{ padding: "2rem", borderColor: "rgba(239, 68, 68, 0.3)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#ef4444", marginBottom: "1rem" }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Unable to load HR Dashboard Metrics</h3>
          </div>
          <p style={{ color: "#cbd5e1", marginBottom: "1.5rem" }}>{error}</p>
          <Button onClick={() => refetch()} glow style={{ width: "fit-content" }}>
            <RefreshCw size={16} style={{ marginRight: "0.5rem" }} /> Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  const stats = data || {
    active_vacancies: 0,
    closed_vacancies: 0,
    total_jobs: 0,
    total_applications: 0,
    applied_count: 0,
    screening_count: 0,
    shortlisted_count: 0,
    interview_count: 0,
    offer_count: 0,
    hired_count: 0,
    rejected_count: 0,
    pipeline_stages: [],
    recent_applications: [],
    active_jobs: [],
    department_distribution: [],
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
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Header & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>HR RECRUITER DESK</p>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.15rem 0.5rem",
              borderRadius: "2px",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              border: "1px solid rgba(99, 245, 232, 0.3)",
              color: "#63f5e8",
              fontSize: "0.68rem",
              fontFamily: "IBM Plex Mono, monospace",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#63f5e8" }} />
              API LIVE
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Recruitment &amp; Talent Console
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/recruitment/applications">
            <Button variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileText size={14} /> Applications ({stats.total_applications})
            </Button>
          </Link>
          <Link href="/recruitment/jobs">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Plus size={14} /> Manage Vacancies
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
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
          {successMessage}
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        {/* Active Vacancies */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Active Vacancies
            </span>
            <Briefcase size={18} color="#63f5e8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#f8fafc", margin: "0.4rem 0" }}>
            {stats.active_vacancies}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span style={{ color: "#63f5e8", fontWeight: 500 }}>{stats.total_jobs} total</span>
            <span>positions listed</span>
          </div>
        </Card>

        {/* Total Applications */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Total Candidates
            </span>
            <Users size={18} color="#38bdf8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#38bdf8", margin: "0.4rem 0" }}>
            {stats.total_applications}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span style={{ color: "#f8fafc", fontWeight: 600 }}>{stats.screening_count} in screening</span>
          </div>
        </Card>

        {/* Shortlisted / Interviews */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Interviews &amp; Shortlist
            </span>
            <UserCheck size={18} color="#818cf8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#818cf8", margin: "0.4rem 0" }}>
            {stats.shortlisted_count + stats.interview_count}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span>{stats.interview_count} active interviews</span>
          </div>
        </Card>

        {/* Hired / Offers */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Offers &amp; Hired
            </span>
            <Award size={18} color="#4ade80" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#4ade80", margin: "0.4rem 0" }}>
            {stats.hired_count + stats.offer_count}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>{stats.hired_count} hired</span>
            <span>� {stats.offer_count} pending offers</span>
          </div>
        </Card>
      </div>

      {/* Recruitment Funnel & Active Openings Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* Recruitment Pipeline Funnel */}
        <Card style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Recruitment Pipeline Funnel</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
                Candidate distribution across {stats.total_applications} active applications
              </p>
            </div>
            <Link href="/recruitment/applications">
              <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
                Full Map <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {stats.pipeline_stages.map((stage) => {
              const percentage =
                stats.total_applications > 0
                  ? Math.round((stage.count / stats.total_applications) * 100)
                  : 0;
              return (
                <div key={stage.stage} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                    <span style={{ color: "#cbd5e1" }}>{stage.label}</span>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", color: stage.color, fontWeight: 500 }}>
                      {stage.count} ({percentage}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(140, 174, 187, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: stage.color,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Active Openings Quick Panel */}
        <Card style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Active Job Openings</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
                Current live vacancies open for candidate applications
              </p>
            </div>
            <Link href="/recruitment/jobs">
              <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
                All Openings ({stats.active_vacancies}) <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          {stats.active_jobs.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
              <Briefcase size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
              <p style={{ margin: 0 }}>No active job openings published.</p>
              <Link href="/recruitment/jobs">
                <Button variant="outline" style={{ marginTop: "1rem" }}>
                  Create Job Vacancy
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.active_jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(14, 24, 38, 0.6)",
                    border: "1px solid rgba(140, 174, 187, 0.15)",
                    borderRadius: "4px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                        {job.job_id}
                      </span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f8fafc" }}>
                        {job.title}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                      {job.department} � {job.location} � {job.experience}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleOpenEdit(job)}
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <Edit size={12} /> Manage
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Applications Stream */}
      <Card style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Recent Candidate Applications</h3>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
              Candidate submissions awaiting screening and stage progression
            </p>
          </div>
          <Link href="/recruitment/applications">
            <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
              Applications Desk <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>

        {stats.recent_applications.length === 0 ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Users size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>No candidate applications received yet.</p>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Published jobs on the Careers portal will populate this stream.
            </span>
          </div>
        ) : (
          <div
            className="custom-scrollbar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              maxHeight: "360px",
              overflowY: "auto",
              paddingRight: "0.5rem",
            }}
          >
            {stats.recent_applications.map((app) => {
              const badge = getStageBadgeStyle(app.stage);
              return (
                <div
                  key={app.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 1.25rem",
                    backgroundColor: "rgba(10, 17, 28, 0.5)",
                    border: "1px solid rgba(140, 174, 187, 0.12)",
                    borderRadius: "4px",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: 600, color: "#f8fafc" }}>
                        {app.first_name} {app.last_name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontFamily: "IBM Plex Mono, monospace",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "2px",
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {app.stage || "APPLIED"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                      Role: <strong style={{ color: "#cbd5e1" }}>{app.job_title || `Job #${app.job_vacancy}`}</strong> � {app.email} � Applied: {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Button
                      glow
                      onClick={() => handleOpenReview(app)}
                      style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                    >
                      Review Application &rarr;
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Candidate Application Review Modal (Read-Only) */}
      {isReviewOpen && reviewApp && (() => {
        const stage = reviewApp.stage || "APPLIED";
        const stageColors: Record<string, { color: string; bg: string; border: string }> = {
          APPLIED:    { color: "#63f5e8", bg: "rgba(99,245,232,0.15)",   border: "rgba(99,245,232,0.3)" },
          SCREENING:  { color: "#38bdf8", bg: "rgba(56,189,248,0.15)",   border: "rgba(56,189,248,0.3)" },
          SHORTLISTED:{ color: "#a855f7", bg: "rgba(168,85,247,0.15)",   border: "rgba(168,85,247,0.3)" },
          INTERVIEW:  { color: "#818cf8", bg: "rgba(129,140,248,0.15)",  border: "rgba(129,140,248,0.3)" },
          OFFER:      { color: "#facc15", bg: "rgba(250,204,21,0.15)",   border: "rgba(250,204,21,0.3)" },
          HIRED:      { color: "#4ade80", bg: "rgba(74,222,128,0.15)",   border: "rgba(74,222,128,0.3)" },
          REJECTED:   { color: "#f87171", bg: "rgba(248,113,113,0.15)",  border: "rgba(248,113,113,0.3)" },
        };
        const sc = stageColors[stage.toUpperCase()] || stageColors.APPLIED;
        return (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5,8,17,0.88)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem", overflowY: "auto" }}>
            <Card borderAccent style={{ width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", boxSizing: "border-box", margin: "auto" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <p className="eyebrow" style={{ margin: 0, color: "#63f5e8", fontSize: "0.7rem" }}>CANDIDATE APPLICATION REVIEW</p>
                  <h2 style={{ fontSize: "1.6rem", margin: "0.3rem 0 0 0", color: "#f8fafc" }}>
                    {reviewApp.first_name} {reviewApp.last_name}
                  </h2>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.3rem 0 0 0", fontFamily: "IBM Plex Mono, monospace" }}>
                    Tracking Code: {reviewApp.tracking_code} &nbsp;◆&nbsp; Applied on {new Date(reviewApp.created_at).toLocaleString()}
                  </p>
                </div>
                <button type="button" onClick={() => setIsReviewOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", padding: "0.25rem", flexShrink: 0 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ backgroundColor: "rgba(14,24,38,0.7)", border: "1px solid rgba(140,174,187,0.15)", borderRadius: "6px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.68rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", margin: "0 0 0.4rem 0" }}>EMAIL ADDRESS</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#63f5e8", fontSize: "0.88rem", fontWeight: 500 }}>
                    <Mail size={14} />
                    <span style={{ wordBreak: "break-all" }}>{reviewApp.email}</span>
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(14,24,38,0.7)", border: "1px solid rgba(140,174,187,0.15)", borderRadius: "6px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.68rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", margin: "0 0 0.4rem 0" }}>PHONE NUMBER</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f8fafc", fontSize: "0.88rem", fontWeight: 500 }}>
                    <Phone size={14} color="#64748b" />
                    <span>{reviewApp.phone || "—"}</span>
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(14,24,38,0.7)", border: "1px solid rgba(140,174,187,0.15)", borderRadius: "6px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.68rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", margin: "0 0 0.4rem 0" }}>APPLIED POSITION</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f8fafc", fontSize: "0.88rem", fontWeight: 600 }}>
                    <FileIcon size={14} color="#64748b" />
                    <span>{reviewApp.job_title || `Job #${reviewApp.job_vacancy}`}</span>
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(14,24,38,0.7)", border: "1px solid rgba(140,174,187,0.15)", borderRadius: "6px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.68rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", margin: "0 0 0.4rem 0" }}>RESUME DOCUMENT</p>
                  {reviewResumeLoading ? (
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Loading...</span>
                  ) : reviewResumeUrl ? (
                    <a href={reviewResumeUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#63f5e8", fontSize: "0.85rem", textDecoration: "underline" }}>
                      <Download size={14} /> Download File
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>No resume attached</span>
                  )}
                </div>
              </div>

              {/* Current Stage — Read Only */}
              <div style={{ backgroundColor: "rgba(14,24,38,0.7)", border: `1px solid ${sc.border}`, borderRadius: "8px", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>Current Stage:</span>
                  <span style={{
                    fontSize: "0.78rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 700,
                    padding: "0.25rem 0.75rem",
                    borderRadius: "3px",
                    backgroundColor: sc.bg,
                    color: sc.color,
                    border: `1px solid ${sc.border}`,
                    letterSpacing: "0.05em",
                  }}>
                    {stage}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Close Review</Button>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Edit Job Vacancy Modal */}
      {isEditOpen && editingJob && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem", overflowY: "auto" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", padding: "2rem", boxSizing: "border-box", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>EDIT VACANCY // {editingJob.job_id}</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Update Job Specification</h2>
              </div>
              <button type="button" onClick={() => setIsEditOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", padding: "0.25rem" }}>
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div style={{
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "0.75rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
                fontFamily: "IBM Plex Mono, monospace",
              }}>
                ERROR // {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>JOB TITLE</label>
                <input
                  type="text"
                  required
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.85rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DEPARTMENT</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={editForm.department || ""}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote"
                    value={editForm.location || ""}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EXPERIENCE</label>
                  <input
                    type="text"
                    placeholder="e.g. 3+ Years"
                    value={editForm.experience || ""}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>STATUS</label>
                  <select
                    value={editForm.status || "ACTIVE"}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>REQUIRED SKILLS</label>
                <input
                  type="text"
                  value={editForm.skills || ""}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RESPONSIBILITIES</label>
                <textarea
                  rows={3}
                  value={editForm.responsibilities || ""}
                  onChange={(e) => setEditForm({ ...editForm, responsibilities: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
