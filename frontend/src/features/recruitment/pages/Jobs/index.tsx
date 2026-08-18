import React, { useState } from "react";
import { Link } from "wouter";
import { useJobs } from "../../hooks/useRecruitment";
import { JobVacancy, JobCreatePayload } from "../../services/recruitmentService";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Briefcase,
  Search,
  Plus,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Building,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";

export const Jobs: React.FC = () => {
  const { jobs, isLoading, actionLoading, error, refetch, createJob, updateJob, toggleStatus } = useJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState<JobCreatePayload>({
    job_id: "",
    title: "",
    department: "",
    location: "",
    experience: "",
    skills: "",
    responsibilities: "",
    status: "ACTIVE",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<JobVacancy>>({});
  const [editError, setEditError] = useState<string | null>(null);

  const departments = Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)));

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesDepartment = !departmentFilter || job.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.job_id || !createForm.title) {
      setCreateError("Job ID and Job Title are required.");
      return;
    }

    try {
      await createJob(createForm);
      setIsCreateOpen(false);
      setCreateForm({
        job_id: "",
        title: "",
        department: "",
        location: "",
        experience: "",
        skills: "",
        responsibilities: "",
        status: "ACTIVE",
      });
      setActionSuccess("Job vacancy published successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err?.message || "Failed to create job vacancy.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setEditError(null);

    try {
      await updateJob(editingJob.job_id, editForm);
      setIsEditOpen(false);
      setEditingJob(null);
      setActionSuccess("Job vacancy updated successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || "Failed to update job vacancy.");
    }
  };

  const handleTogglePublish = async (job: JobVacancy) => {
    const nextStatus = job.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    try {
      await toggleStatus(job.job_id, nextStatus);
      setActionSuccess(`Job status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to toggle job status.");
    }
  };

  const activeCount = jobs.filter((j) => j.status === "ACTIVE").length;
  const closedCount = jobs.filter((j) => j.status === "CLOSED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>TALENT ACQUISITION &amp; VACANCIES</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {jobs.length} Total Positions
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Job Openings Board
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button glow onClick={() => setIsCreateOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={14} /> Create Vacancy
          </Button>
        </div>
      </div>

      {/* Success Notification */}
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

      {/* KPI Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>ACTIVE VACANCIES</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: "0.3rem 0" }}>{activeCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Accepting candidate submissions</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CLOSED POSITIONS</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#94a3b8", margin: "0.3rem 0" }}>{closedCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Applications paused</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#818cf8" }}>DEPARTMENTS</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#818cf8", margin: "0.3rem 0" }}>{departments.length}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Cross-functional divisions</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by title, job ID, department, or required skills..."
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
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>

            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
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
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {(searchTerm || statusFilter || departmentFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setDepartmentFilter("");
                }}
                style={{ fontSize: "0.75rem" }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Jobs Listing */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              SYNCING JOBS BOARD...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p style={{ margin: 0 }}>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Briefcase size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No job openings match</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Create a new vacancy or adjust your search filter.
            </p>
            <Button glow onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} style={{ marginRight: "0.4rem" }} /> Create First Vacancy
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    JOB CODE / DATE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    POSITION &amp; DEPARTMENT
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    LOCATION &amp; EXPERIENCE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    KEY SKILLS
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    STATUS
                  </th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const isActive = job.status === "ACTIVE";
                  return (
                    <tr
                      key={job.id}
                      style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                        <div>{job.job_id}</div>
                        <div style={{ color: "#64748b", fontSize: "0.68rem" }}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>{job.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{job.department}</div>
                      </td>

                      <td style={{ padding: "1rem", fontSize: "0.82rem" }}>
                        <div style={{ color: "#cbd5e1" }}>{job.location}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{job.experience}</div>
                      </td>

                      <td style={{ padding: "1rem", maxWidth: "220px" }}>
                        <div style={{ fontSize: "0.78rem", color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {job.skills}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.15rem 0.55rem",
                            borderRadius: "2px",
                            fontSize: "0.7rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            backgroundColor: isActive ? "rgba(74, 222, 128, 0.15)" : "rgba(248, 113, 113, 0.15)",
                            color: isActive ? "#4ade80" : "#f87171",
                            border: `1px solid ${isActive ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
                          }}
                        >
                          {job.status}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <Button
                            variant="outline"
                            onClick={() => handleTogglePublish(job)}
                            disabled={actionLoading}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            {isActive ? "Close" : "Publish"}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleOpenEdit(job)}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            <Edit size={12} />
                          </Button>

                          <Link href="/recruitment/applications">
                            <Button glow style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>
                              Applications &rarr;
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

      {/* Create Job Vacancy Modal */}
      {isCreateOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem", overflowY: "auto" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", padding: "2rem", boxSizing: "border-box", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>TALENT OPENING</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Create Job Vacancy</h2>
              </div>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", padding: "0.25rem" }}>
                <X size={20} />
              </button>
            </div>

            {createError && (
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
                ERROR // {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem", width: "100%" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>JOB ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-003"
                    value={createForm.job_id}
                    onChange={(e) => setCreateForm({ ...createForm, job_id: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>JOB TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Engineer"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DEPARTMENT</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EXPERIENCE</label>
                  <input
                    type="text"
                    placeholder="e.g. 3+ Years"
                    value={createForm.experience}
                    onChange={(e) => setCreateForm({ ...createForm, experience: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>REQUIRED SKILLS</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js, GraphQL"
                  value={createForm.skills}
                  onChange={(e) => setCreateForm({ ...createForm, skills: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RESPONSIBILITIES</label>
                <textarea
                  rows={3}
                  placeholder="Describe key responsibilities and deliverables..."
                  value={createForm.responsibilities}
                  onChange={(e) => setCreateForm({ ...createForm, responsibilities: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>
                  {actionLoading ? "Publishing..." : "Publish Vacancy"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Job Vacancy Modal */}
      {isEditOpen && editingJob && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem", overflowY: "auto" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", padding: "2rem", boxSizing: "border-box", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>EDIT VACANCY // {editingJob.job_id}</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Update Job Specification</h2>
              </div>
              <button onClick={() => setIsEditOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", padding: "0.25rem" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
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
                <Button type="submit" glow disabled={actionLoading}>
                  {actionLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Jobs;
