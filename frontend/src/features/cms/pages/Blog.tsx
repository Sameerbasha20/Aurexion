import React, { useState } from "react";
import { useCmsBlog, useCmsCategories } from "../hooks/useCms";
import { BlogPostItem, BlogPostCreatePayload, cmsService } from "../services/cmsService";
import useAuth from "../../../hooks/useAuth";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  MessageSquareCode,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  User,
  Tag,
  Calendar,
} from "lucide-react";

export const Blog: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    posts,
    totalCount,
    isLoading,
    actionLoading,
    error,
    refetch,
    createPost,
    updatePost,
    toggleStatus,
    deletePost,
  } = useCmsBlog(currentPage, pageSize);
  const { categories } = useCmsCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState<BlogPostCreatePayload>({
    title: "",
    slug: "",
    content: "",
    tags: [],
    category: categories[0]?.id || 1,
    author: Number(user?.id) || 1,
    status: "published",
    media: "",
  });
  const [tagsInput, setTagsInput] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<BlogPostItem>>({
    media: "",
  });
  const [editTagsInput, setEditTagsInput] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const filteredPosts = posts.filter((post) => {
    const tagsStr = Array.isArray(post.tags) ? post.tags.join(" ") : String(post.tags || "");
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tagsStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !categoryFilter || String(post.category) === categoryFilter;
    const matchesStatus = !statusFilter || post.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = totalCount || filteredPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await cmsService.uploadMedia(file);
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, media: res.url }));
      } else {
        setCreateForm((prev) => ({ ...prev, media: res.url }));
      }
    } catch (err: any) {
      alert("Failed to upload image: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEdit = (post: BlogPostItem) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      category: post.category,
      status: post.status,
      media: post.media,
    });
    setEditTagsInput(Array.isArray(post.tags) ? post.tags.join(", ") : String(post.tags || ""));
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.title || !createForm.slug) {
      setCreateError("Article Title and Slug are required.");
      return;
    }

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const authorId = Number(user?.id) || 1;
    const catId = createForm.category || (categories[0]?.id || 1);

    try {
      await createPost({
        ...createForm,
        category: catId,
        author: authorId,
        tags: tagsArray,
      });
      setIsCreateOpen(false);
      setCreateForm({
        title: "",
        slug: "",
        content: "",
        tags: [],
        category: categories[0]?.id || 1,
        author: authorId,
        status: "published",
        media: "",
      });
      setTagsInput("");
      setActionSuccess("Article published successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err?.message || "Failed to publish article.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setEditError(null);

    const tagsArray = editTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updatePost(editingPost.id, {
        ...editForm,
        tags: tagsArray,
      });
      setIsEditOpen(false);
      setEditingPost(null);
      setActionSuccess("Article updated successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || "Failed to update article.");
    }
  };

  const handleTogglePublish = async (post: BlogPostItem) => {
    const nextStatus = post.status?.toLowerCase() === "published" ? "draft" : "published";
    try {
      await toggleStatus(post.id, nextStatus as any);
      setActionSuccess(`Article status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async (post: BlogPostItem) => {
    if (!window.confirm(`Are you sure you want to delete article "${post.title}"?`)) {
      return;
    }

    try {
      await deletePost(post.id);
      setActionSuccess("Article deleted.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to delete article.");
    }
  };

  const publishedCount = posts.filter((p) => p.status?.toLowerCase() === "published").length;
  const draftCount = posts.filter((p) => p.status?.toLowerCase() === "draft").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>INSIGHTS &amp; SIGNAL ENGINE</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {posts.length} Articles Authored
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Blog Engine Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button glow onClick={() => setIsCreateOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={14} /> New Article
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
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>PUBLISHED POSTS</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: "0.3rem 0" }}>{publishedCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Live on insights feed</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#facc15" }}>DRAFT POSTS</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#facc15", margin: "0.3rem 0" }}>{draftCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>In progress or peer review</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#818cf8" }}>CATEGORIES</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#818cf8", margin: "0.3rem 0" }}>{categories.length}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Topic taxonomy categories</span>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by title, content, slug, or tags..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
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
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            )}

            {(searchTerm || statusFilter || categoryFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setCategoryFilter("");
                }}
                style={{ fontSize: "0.75rem" }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Blog Posts Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              FETCHING BLOG ARTICLES...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <MessageSquareCode size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No articles found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Write your first thought leadership insight or adjust search filters.
            </p>
            <Button glow onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} style={{ marginRight: "0.4rem" }} /> Author First Post
            </Button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                    <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                      ARTICLE TITLE / SLUG
                    </th>
                    <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                      CATEGORY & AUTHOR
                    </th>
                    <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                      TAGS
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
                  {filteredPosts.map((post) => {
                    const isPub = post.status?.toLowerCase() === "published";
                    const tagsList = Array.isArray(post.tags)
                      ? post.tags
                      : String(post.tags || "").split(",").map((t) => t.trim()).filter(Boolean);

                    return (
                      <tr
                        key={post.id}
                        style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        onFocus={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                        onBlur={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {post.media && (
                              <img
                                src={post.media}
                                alt=""
                                style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover", backgroundColor: "rgba(255,255,255,0.05)" }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.92rem" }}>{post.title}</div>
                              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                                /{post.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <div style={{ color: "#cbd5e1", fontWeight: 500 }}>{post.category_name || "General"}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>By @{post.author_username}</div>
                        </td>

                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                            {tagsList.map((t, idx) => (
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
                                #{t}
                              </span>
                            ))}
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
                            {post.status}
                          </span>
                        </td>

                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                            <Button
                              variant="outline"
                              onClick={() => handleTogglePublish(post)}
                              disabled={actionLoading}
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                            >
                              {isPub ? "Unpublish" : "Publish"}
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => handleOpenEdit(post)}
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                            >
                              <Edit size={12} />
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => handleDelete(post)}
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

            {/* Pagination Controls */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(140, 174, 187, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                color: "#94a3b8",
              }}
            >
              <div>
                Showing <strong style={{ color: "#f8fafc" }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
                <strong style={{ color: "#f8fafc" }}>{endIndex}</strong> of{" "}
                <strong style={{ color: "#f8fafc" }}>{totalItems}</strong> entries
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#050811",
                      border: "1px solid rgba(140, 174, 187, 0.25)",
                      color: "#f8fafc",
                      borderRadius: "4px",
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <Button
                    variant="outline"
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    Previous
                  </Button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Create Article Modal */}
      {isCreateOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "660px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>NEW THOUGHT LEADERSHIP</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Author Blog Article</h2>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setIsCreateOpen(false)}
                style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}
              >
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
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>ARTICLE TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Neural Graph Reasoning"
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
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CATEGORY</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: Number(e.target.value) })}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>TAGS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    placeholder="AI, Architecture, Systems"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>FEATURED PICTURE / MEDIA URL</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="https://example.com/image.png"
                    value={createForm.media || ""}
                    onChange={(e) => setCreateForm({ ...createForm, media: e.target.value })}
                    style={{ flex: 1, padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="blog-media-upload-create"
                    style={{ display: "none" }}
                    onChange={(e) => handleMediaUpload(e, false)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById("blog-media-upload-create")?.click()}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
                {createForm.media && (
                  <div style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "4px", display: "inline-block", alignSelf: "flex-start" }}>
                    <img
                      src={createForm.media}
                      alt="Uploaded Preview"
                      style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "2px", display: "block" }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>ARTICLE CONTENT</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Full markdown/technical content of the article..."
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", resize: "vertical" }}
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
                  {actionLoading ? "Publishing..." : "Publish Article"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Article Modal */}
      {isEditOpen && editingPost && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1.5rem" }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "660px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>EDIT ARTICLE // {editingPost.slug}</p>
                <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>Update Article</h2>
              </div>
              <button
                type="button"
                aria-label="Close edit dialog"
                onClick={() => setIsEditOpen(false)}
                style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer" }}
              >
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
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>FEATURED PICTURE / MEDIA URL</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="https://example.com/image.png"
                    value={editForm.media || ""}
                    onChange={(e) => setEditForm({ ...editForm, media: e.target.value })}
                    style={{ flex: 1, padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="blog-media-upload-edit"
                    style={{ display: "none" }}
                    onChange={(e) => handleMediaUpload(e, true)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById("blog-media-upload-edit")?.click()}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
                {editForm.media && (
                  <div style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "4px", display: "inline-block", alignSelf: "flex-start" }}>
                    <img
                      src={editForm.media}
                      alt="Uploaded Preview"
                      style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "2px", display: "block" }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CONTENT</label>
                <textarea
                  rows={6}
                  value={editForm.content || ""}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  style={{ padding: "0.6rem", backgroundColor: "#050811", border: "1px solid rgba(140, 174, 187, 0.25)", color: "#f8fafc", borderRadius: "4px", resize: "vertical" }}
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

export default Blog;
