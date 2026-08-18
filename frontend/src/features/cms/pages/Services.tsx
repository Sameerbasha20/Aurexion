import React, { useState } from "react";
import { useCmsServices } from "../hooks/useCms";
import { ServiceItem, ServiceCreatePayload } from "../services/cmsService";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  Briefcase,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Star,
  ExternalLink,
} from "lucide-react";

export const Services: React.FC = () => {
  const {
    services,
    isLoading,
    actionLoading,
    error,
    refetch,
    createService,
    updateService,
    toggleStatus,
    deleteService,
  } = useCmsServices();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState<ServiceCreatePayload>({
    title: "",
    slug: "",
    description: "",
    problem: "",
    solution: "",
    tech_stack: [],
    is_featured: false,
    status: "published",
  });
  const [techStackInput, setTechStackInput] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<ServiceItem>>({});
  const [editTechInput, setEditTechInput] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const filteredServices = services.filter((svc) => {
    const techStr = Array.isArray(svc.tech_stack) ? svc.tech_stack.join(" ") : String(svc.tech_stack || "");
    const matchesSearch =
      svc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      techStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || svc.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingService(svc);
    setEditForm({
      title: svc.title,
      slug: svc.slug,
      description: svc.description,
      problem: svc.problem,
      solution: svc.solution,
      is_featured: svc.is_featured,
      status: svc.status,
    });
    setEditTechInput(Array.isArray(svc.tech_stack) ? svc.tech_stack.join(", ") : String(svc.tech_stack || ""));
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.title || !createForm.slug) {
      setCreateError("Service Title and Slug are required.");
      return;
    }

    const techArray = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await createService({ ...createForm, tech_stack: techArray });
      setIsCreateOpen(false);
      setCreateForm({
        title: "",
        slug: "",
        description: "",
        problem: "",
        solution: "",
        tech_stack: [],
        is_featured: false,
        status: "published",
      });
      setTechStackInput("");
      setActionSuccess("Service node created successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err?.message || "Failed to create service.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setEditError(null);

    const techArray = editTechInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updateService(editingService.id, { ...editForm, tech_stack: techArray });
      setIsEditOpen(false);
      setEditingService(null);
      setActionSuccess("Service updated successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || "Failed to update service.");
    }
  };

  const handleTogglePublish = async (svc: ServiceItem) => {
    const nextStatus = svc.status?.toLowerCase() === "published" ? "draft" : "published";
    try {
      await toggleStatus(svc.id, nextStatus as any);
      setActionSuccess(`Service status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to toggle service status.");
    }
  };

  const handleDelete = async (svc: ServiceItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete service "${svc.title}"?`)) {
      return;
    }

    try {
      await deleteService(svc.id);
      setActionSuccess("Service deleted.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to delete service.");
    }
  };

  const publishedCount = services.filter((s) => s.status?.toLowerCase() === "published").length;
  const draftCount = services.filter((s) => s.status?.toLowerCase() === "draft").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>CORE CAPABILITIES &amp; ARCHITECTURE</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {services.length} Nodes Registered
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Services Catalog Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button glow onClick={() => setIsCreateOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={14} /> Create Service
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
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>PUBLISHED SERVICES</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: "0.3rem 0" }}>{publishedCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Live on public portal</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#facc15" }}>DRAFT SERVICES</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#facc15", margin: "0.3rem 0" }}>{draftCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Pending editorial review</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#818cf8" }}>FEATURED DISCIPLINES</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#818cf8", margin: "0.3rem 0" }}>
            {services.filter((s) => s.is_featured).length}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Highlighted on landing page</span>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by title, slug, description, or tech stack..."
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

      {/* Services Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              FETCHING SERVICES CATALOG...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Briefcase size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No services match</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Create a new core capability or adjust filters.
            </p>
            <Button glow onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} style={{ marginRight: "0.4rem" }} /> Create First Service
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    SERVICE NODE / SLUG
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    EXECUTIVE SUMMARY
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    TECH STACK
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
                {filteredServices.map((svc) => {
                  const isPub = svc.status?.toLowerCase() === "published";
                  const techList = Array.isArray(svc.tech_stack)
                    ? svc.tech_stack
                    : String(svc.tech_stack || "").split(",").map((t) => t.trim()).filter(Boolean);

                  return (
                    <tr
                      key={svc.id}
                      style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          {svc.is_featured && <Star size={13} color="#facc15" fill="#facc15" />}
                          <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>{svc.title}</span>
                        </div>
                        <div style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                          /{svc.slug}
                        </div>
                      </td>

                      <td style={{ padding: "1rem", maxWidth: "260px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {svc.description}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {techList.slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: "0.68rem",
                                fontFamily: "IBM Plex Mono, monospace",
                                padding: "0.1rem 0.4rem",
                                backgroundColor: "rgba(140, 174, 187, 0.1)",
                                color: "#cbd5e1",
                                borderRadius: "2px",
                              }}
                            >
                              {t}
                            </span>
                          ))}
                          {techList.length > 3 && (
                            <span style={{ fontSize: "0.68rem", color: "#64748b" }}>+{techList.length - 3}</span>
                          )}
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
                          {svc.status}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <Button
                            variant="outline"
                            onClick={() => handleTogglePublish(svc)}
                            disabled={actionLoading}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            {isPub ? "Unpublish" : "Publish"}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleOpenEdit(svc)}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            <Edit size={12} />
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleDelete(svc)}
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

      {/* Create Service Modal */}
      {isCreateOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>NEW CORE DISCIPLINE</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Create Service Node</h2>
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
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SERVICE TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Neural Systems"
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
                    placeholder="enterprise-neural-systems"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>EXECUTIVE DESCRIPTION</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Overview of core capability..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PROBLEM SOLVED</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enterprise bottlenecks..."
                    value={createForm.problem}
                    onChange={(e) => setCreateForm({ ...createForm, problem: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>ENGINEERED SOLUTION</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Technical architecture..."
                    value={createForm.solution}
                    onChange={(e) => setCreateForm({ ...createForm, solution: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TECH STACK (COMMA SEPARATED)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, PyTorch, Ray, Kubernetes"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#cbd5e1", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={createForm.is_featured}
                    onChange={(e) => setCreateForm({ ...createForm, is_featured: e.target.checked })}
                  />
                  Featured Capability
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
                  {actionLoading ? "Publishing..." : "Save Service Node"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Service Modal */}
      {isEditOpen && editingService && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>EDIT SERVICE // {editingService.slug}</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Update Service Node</h2>
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
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SERVICE TITLE</label>
                  <input
                    type="text"
                    required
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SLUG</label>
                  <input
                    type="text"
                    required
                    value={editForm.slug || ""}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TECH STACK</label>
                <input
                  type="text"
                  value={editTechInput}
                  onChange={(e) => setEditTechInput(e.target.value)}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#cbd5e1", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.is_featured || false}
                    onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                  />
                  Featured Capability
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

export default Services;
