import React, { useState } from "react";
import { useCmsCaseStudies } from "../hooks/useCms";
import { CaseStudyItem, CaseStudyCreatePayload } from "../services/cmsService";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  Building,
} from "lucide-react";

export const CaseStudies: React.FC = () => {
  const {
    caseStudies,
    isLoading,
    actionLoading,
    error,
    refetch,
    createCaseStudy,
    updateCaseStudy,
    toggleStatus,
    deleteCaseStudy,
  } = useCmsCaseStudies();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCs, setEditingCs] = useState<CaseStudyItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState<CaseStudyCreatePayload>({
    title: "",
    slug: "",
    client: "",
    context: "",
    business_challenge: "",
    proposed_architecture: "",
    tech_stack: [],
    development_approach: "",
    modules_integration_security: "",
    outcomes_performance: "",
    confidential: false,
    status: "published",
  });
  const [techStackInput, setTechStackInput] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<CaseStudyItem>>({});
  const [editTechInput, setEditTechInput] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const filteredCaseStudies = caseStudies.filter((cs) => {
    const techStr = Array.isArray(cs.tech_stack) ? cs.tech_stack.join(" ") : String(cs.tech_stack || "");
    const matchesSearch =
      cs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
      techStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || cs.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (cs: CaseStudyItem) => {
    setEditingCs(cs);
    setEditForm({
      title: cs.title,
      slug: cs.slug,
      client: cs.client,
      context: cs.context,
      business_challenge: cs.business_challenge,
      proposed_architecture: cs.proposed_architecture,
      development_approach: cs.development_approach,
      modules_integration_security: cs.modules_integration_security,
      outcomes_performance: cs.outcomes_performance,
      confidential: cs.confidential,
      status: cs.status,
    });
    setEditTechInput(Array.isArray(cs.tech_stack) ? cs.tech_stack.join(", ") : String(cs.tech_stack || ""));
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.title || !createForm.slug || !createForm.client) {
      setCreateError("Title, Slug, and Client are required.");
      return;
    }

    const techArray = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await createCaseStudy({ ...createForm, tech_stack: techArray });
      setIsCreateOpen(false);
      setCreateForm({
        title: "",
        slug: "",
        client: "",
        context: "",
        business_challenge: "",
        proposed_architecture: "",
        tech_stack: [],
        development_approach: "",
        modules_integration_security: "",
        outcomes_performance: "",
        confidential: false,
        status: "published",
      });
      setTechStackInput("");
      setActionSuccess("Case study created successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err?.message || "Failed to create case study.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCs) return;
    setEditError(null);

    const techArray = editTechInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updateCaseStudy(editingCs.id, { ...editForm, tech_stack: techArray });
      setIsEditOpen(false);
      setEditingCs(null);
      setActionSuccess("Case study updated successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || "Failed to update case study.");
    }
  };

  const handleTogglePublish = async (cs: CaseStudyItem) => {
    const nextStatus = cs.status?.toLowerCase() === "published" ? "draft" : "published";
    try {
      await toggleStatus(cs.id, nextStatus as any);
      setActionSuccess(`Case study status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async (cs: CaseStudyItem) => {
    if (!window.confirm(`Are you sure you want to delete case study "${cs.title}"?`)) {
      return;
    }

    try {
      await deleteCaseStudy(cs.id);
      setActionSuccess("Case study deleted.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to delete case study.");
    }
  };

  const publishedCount = caseStudies.filter((cs) => cs.status?.toLowerCase() === "published").length;
  const draftCount = caseStudies.filter((cs) => cs.status?.toLowerCase() === "draft").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>ENTERPRISE PORTFOLIO &amp; WORK</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {caseStudies.length} Cases Documented
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Case Studies Portfolio Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button glow onClick={() => setIsCreateOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={14} /> Create Case Study
          </Button>
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

      {/* KPI Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>PUBLISHED PORTFOLIO</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: "0.3rem 0" }}>{publishedCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Showcased to enterprise prospects</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#facc15" }}>DRAFT CASE STUDIES</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#facc15", margin: "0.3rem 0" }}>{draftCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Under client review or NDA clearance</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#818cf8" }}>CONFIDENTIAL DEPLOYMENTS</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#818cf8", margin: "0.3rem 0" }}>
            {caseStudies.filter((cs) => cs.confidential).length}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Anonymized client cases</span>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by title, client, slug, or tech stack..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {(searchTerm || statusFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
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

      {/* Case Studies Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              FETCHING CASE STUDIES...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredCaseStudies.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <FileText size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No case studies found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Document an enterprise client case study or adjust filters.
            </p>
            <Button glow onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} style={{ marginRight: "0.4rem" }} /> Create First Case Study
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CASE TITLE / CLIENT
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CONTEXT &amp; CHALLENGE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    DELIVERED OUTCOMES
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
                {filteredCaseStudies.map((cs) => {
                  const isPub = cs.status?.toLowerCase() === "published";
                  return (
                    <tr
                      key={cs.id}
                      style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          {cs.confidential && <Lock size={12} color="#f87171" />}
                          <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>{cs.title}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#63f5e8", marginTop: "0.2rem" }}>
                          Client: {cs.client} &bull; /{cs.slug}
                        </div>
                      </td>

                      <td style={{ padding: "1rem", maxWidth: "260px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cs.business_challenge || cs.context}
                        </div>
                      </td>

                      <td style={{ padding: "1rem", maxWidth: "240px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#4ade80", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cs.outcomes_performance || "Verified architecture delivered"}
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
                            backgroundColor: isPub ? "rgba(74, 222, 128, 0.15)" : "rgba(250, 204, 21, 0.15)",
                            color: isPub ? "#4ade80" : "#facc15",
                            border: `1px solid ${isPub ? "rgba(74, 222, 128, 0.3)" : "rgba(250, 204, 21, 0.3)"}`,
                          }}
                        >
                          {cs.status}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <Button
                            variant="outline"
                            onClick={() => handleTogglePublish(cs)}
                            disabled={actionLoading}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            {isPub ? "Unpublish" : "Publish"}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleOpenEdit(cs)}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            <Edit size={12} />
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleDelete(cs)}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.3)" }}
                          >
                            <Trash2 size={12} />
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

      {/* Create Case Study Modal */}
      {isCreateOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "660px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>PORTFOLIO RECORD</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Create Case Study</h2>
              </div>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
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

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CASE STUDY TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autonomous Logistics Engine"
                    value={createForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                      setCreateForm({ ...createForm, title, slug });
                    }}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SLUG *</label>
                  <input
                    type="text"
                    required
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CLIENT / ORGANIZATION *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Global Freight Logistics Corp"
                    value={createForm.client}
                    onChange={(e) => setCreateForm({ ...createForm, client: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TECH STACK</label>
                  <input
                    type="text"
                    placeholder="e.g. Python, Ray, PostgreSQL, Kafka"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>BUSINESS CHALLENGE</label>
                <textarea
                  rows={2}
                  required
                  placeholder="The core problem the enterprise faced..."
                  value={createForm.business_challenge}
                  onChange={(e) => setCreateForm({ ...createForm, business_challenge: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PROPOSED ARCHITECTURE</label>
                <textarea
                  rows={2}
                  required
                  placeholder="System design & technical implementation..."
                  value={createForm.proposed_architecture}
                  onChange={(e) => setCreateForm({ ...createForm, proposed_architecture: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DELIVERED OUTCOMES &amp; BENCHMARKS</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Measurable business results (e.g. 34% cost reduction)..."
                  value={createForm.outcomes_performance}
                  onChange={(e) => setCreateForm({ ...createForm, outcomes_performance: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#cbd5e1", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={createForm.confidential}
                    onChange={(e) => setCreateForm({ ...createForm, confidential: e.target.checked })}
                  />
                  Confidential / NDA Protected
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>STATUS:</span>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    style={{ padding: "0.4rem 0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>
                  {actionLoading ? "Publishing..." : "Save Case Study"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Case Study Modal */}
      {isEditOpen && editingCs && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "660px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>EDIT CASE STUDY // {editingCs.slug}</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Update Case Study</h2>
              </div>
              <button onClick={() => setIsEditOpen(false)} style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}>
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

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TITLE</label>
                  <input
                    type="text"
                    required
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CLIENT</label>
                  <input
                    type="text"
                    required
                    value={editForm.client || ""}
                    onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DELIVERED OUTCOMES</label>
                <textarea
                  rows={2}
                  value={editForm.outcomes_performance || ""}
                  onChange={(e) => setEditForm({ ...editForm, outcomes_performance: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#cbd5e1", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.confidential || false}
                    onChange={(e) => setEditForm({ ...editForm, confidential: e.target.checked })}
                  />
                  Confidential
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>STATUS:</span>
                  <select
                    value={editForm.status || "published"}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ padding: "0.4rem 0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
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

export default CaseStudies;
