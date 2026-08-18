import React, { useState } from "react";
import { Link } from "wouter";
import { useRecruitmentDashboard } from "../hooks/useRecruitment";
import recruitmentService from "../services/recruitmentService";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  Briefcase,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ChevronRight,
  FileText,
  Building,
  Award,
  Filter,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useRecruitmentDashboard();
  const [advancingId, setAdvancingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAdvanceStage = async (applicationId: number, nextStage: string) => {
    setAdvancingId(applicationId);
    try {
      await recruitmentService.updateApplicationStage(applicationId, nextStage);
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
            <span>&bull; {stats.offer_count} pending offers</span>
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
                      {job.department} &bull; {job.location} &bull; {job.experience}
                    </div>
                  </div>

                  <Link href="/recruitment/jobs">
                    <Button variant="outline" style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}>
                      Manage
                    </Button>
                  </Link>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
                      Role: <strong style={{ color: "#cbd5e1" }}>{app.job_title || `Job #${app.job_vacancy}`}</strong> &bull; {app.email} &bull; Applied: {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {app.stage === "APPLIED" && (
                      <Button
                        variant="outline"
                        disabled={advancingId === app.id}
                        onClick={() => handleAdvanceStage(app.id, "SCREENING")}
                        style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                      >
                        {advancingId === app.id ? "..." : "Screen Candidate"}
                      </Button>
                    )}
                    {app.stage === "SCREENING" && (
                      <Button
                        variant="outline"
                        disabled={advancingId === app.id}
                        onClick={() => handleAdvanceStage(app.id, "SHORTLISTED")}
                        style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", color: "#a855f7", borderColor: "rgba(168, 85, 247, 0.4)" }}
                      >
                        {advancingId === app.id ? "..." : "Shortlist"}
                      </Button>
                    )}
                    <Link href="/recruitment/applications">
                      <Button glow style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                        Review Application &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
