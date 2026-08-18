import React, { useState } from "react";
import { useCmsCategories } from "../hooks/useCms";
import { CategoryItem, CategoryCreatePayload } from "../services/cmsService";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  Layers,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Tag,
} from "lucide-react";

export const Categories: React.FC = () => {
  const {
    categories,
    isLoading,
    actionLoading,
    error,
    refetch,
    createCategory,
    deleteCategory,
  } = useCmsCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState<CategoryCreatePayload>({
    name: "",
    slug: "",
    parent: null,
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.name || !createForm.slug) {
      setCreateError("Category Name and Slug are required.");
      return;
    }

    try {
      await createCategory(createForm);
      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        slug: "",
        parent: null,
      });
      setActionSuccess("Category created successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err?.message || "Failed to create category.");
    }
  };

  const handleDelete = async (c: CategoryItem) => {
    if (!window.confirm(`Are you sure you want to delete category "${c.name}"?`)) {
      return;
    }

    try {
      await deleteCategory(c.id);
      setActionSuccess("Category deleted.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to delete category.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>CONTENT TAXONOMY &amp; TOPICS</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {categories.length} Categories Registered
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Categories Registry
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button glow onClick={() => setIsCreateOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={14} /> New Category
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

      {/* Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "420px" }}>
          <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
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
      </Card>

      {/* Categories Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              FETCHING CATEGORIES...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Tag size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No categories found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Create a category to group blog posts and insights.
            </p>
            <Button glow onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} style={{ marginRight: "0.4rem" }} /> Create Category
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ID / SLUG
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CATEGORY NAME
                  </th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "1rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                      <div>#{c.id}</div>
                      <div style={{ color: "#64748b", fontSize: "0.68rem" }}>/{c.slug}</div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>{c.name}</div>
                    </td>

                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(c)}
                        disabled={actionLoading}
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.3)" }}
                      >
                        <Trash2 size={12} style={{ marginRight: "0.3rem" }} /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Category Modal */}
      {isCreateOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 50, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>NEW TAXONOMY NODE</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Create Category</h2>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CATEGORY NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Computing"
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" glow disabled={actionLoading}>
                  {actionLoading ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Categories;
