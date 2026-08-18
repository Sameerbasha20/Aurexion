import React, { useState } from "react";
import { useCmsIndustries } from "../hooks/useCms";
import { IndustryItem, IndustryCreatePayload } from "../services/cmsService";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  Building,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

export const Industries: React.FC = () => {
  const {
    industries,
    isLoading,
    actionLoading,
    error,
    refetch,
    createIndustry,
    updateIndustry,
    toggleStatus,
    deleteIndustry,
  } = useCmsIndustries();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingInd, setEditingInd] = useState<IndustryItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState<IndustryCreatePayload>({
    name: "",
    slug: "",
    challenges: "",
    target_solutions: "",
    status: "published",
    services: [],
    case_studies: [],
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<IndustryItem>>({});
  const [editError, setEditError] = useState<string | null>(null);

  const filteredIndustries = industries.filter((ind) => {
    const matchesSearch =
      ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.challenges.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.target_solutions.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || ind.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (ind: IndustryItem) => {
    setEditingInd(ind);
    setEditForm({
      name: ind.name,
      slug: ind.slug,
      challenges: ind.challenges,
      target_solutions: ind.target_solutions,
      status: ind.status,
    });
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.name || !createForm.slug) {
      setCreateError("Industry Name and Slug are required.");
      return;
    }

    try {
      await createIndustry(createForm);
      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        slug: "",
        challenges: "",
        target_solutions: "",
        status: "published",
        services: [],
        case_studies: [],
      });
      setActionSuccess("Industry created successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err?.message || "Failed to create industry.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInd) return;
    setEditError(null);

    try {
      await updateIndustry(editingInd.id, editForm);
      setIsEditOpen(false);
      setEditingInd(null);
      setActionSuccess("Industry updated successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || "Failed to update industry.");
    }
  };

  const handleTogglePublish = async (ind: IndustryItem) => {
    const nextStatus = ind.status?.toLowerCase() === "published" ? "draft" : "published";
    try {
      await toggleStatus(ind.id, nextStatus as any);
      setActionSuccess(`Industry status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async (ind: IndustryItem) => {
    if (!window.confirm(`Are you sure you want to delete industry vertical "${ind.name}"?`)) {
      return;
    }

    try {
      await deleteIndustry(ind.id);
      setActionSuccess("Industry deleted.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to delete industry.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>INDUSTRY VERTICALS &amp; DOMAINS</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {industries.length} Domains Mapped
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Industries Directory Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button glow onClick={() => setIsCreateOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={14} /> Create Industry
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

      {/* Search and Filters */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by industry name, slug, challenges, or solutions..."
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

      {/* Industries Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              FETCHING INDUSTRIES DIRECTORY...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredIndustries.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Building size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No industries found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Define a new industry sector or adjust your search filter.
            </p>
            <Button glow onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} style={{ marginRight: "0.4rem" }} /> Create First Industry
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    INDUSTRY DOMAIN / SLUG
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    SECTOR CHALLENGES
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    TARGETED SOLUTIONS
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
                {filteredIndustries.map((ind) => {
                  const isPub = ind.status?.toLowerCase() === "published";
                  return (
                    <tr
                      key={ind.id}
                      style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>{ind.name}</div>
                        <div style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                          /{ind.slug}
                        </div>
                      </td>

                      <td style={{ padding: "1rem", maxWidth: "260px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ind.challenges}
                        </div>
                      </td>

                      <td style={{ padding: "1rem", maxWidth: "260px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#4ade80", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ind.target_solutions}
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
                          {ind.status}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <Button
                            variant="outline"
                            onClick={() => handleTogglePublish(ind)}
                            disabled={actionLoading}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            {isPub ? "Unpublish" : "Publish"}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleOpenEdit(ind)}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            <Edit size={12} />
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleDelete(ind)}
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

      {/* Create Industry Modal */}
      {isCreateOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>NEW INDUSTRY VERTICAL</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Create Industry</h2>
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
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>INDUSTRY NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Healthcare & Life Sciences"
                    value={createForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                      setCreateForm({ ...createForm, name, slug });
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

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SECTOR CHALLENGES</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Domain friction, compliance, scaling barriers..."
                  value={createForm.challenges}
                  onChange={(e) => setCreateForm({ ...createForm, challenges: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TARGETED SOLUTIONS</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Engineered responses, data architectures, model deployments..."
                  value={createForm.target_solutions}
                  onChange={(e) => setCreateForm({ ...createForm, target_solutions: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>
                  {actionLoading ? "Publishing..." : "Save Industry"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Industry Modal */}
      {isEditOpen && editingInd && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>EDIT INDUSTRY // {editingInd.slug}</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Update Industry</h2>
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
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>NAME</label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>SECTOR CHALLENGES</label>
                <textarea
                  rows={2}
                  value={editForm.challenges || ""}
                  onChange={(e) => setEditForm({ ...editForm, challenges: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TARGETED SOLUTIONS</label>
                <textarea
                  rows={2}
                  value={editForm.target_solutions || ""}
                  onChange={(e) => setEditForm({ ...editForm, target_solutions: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                />
              </div>

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

export default Industries;
