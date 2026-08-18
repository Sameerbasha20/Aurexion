import React from "react";
import { Link } from "wouter";
import { useCmsDashboard } from "../hooks/useCms";
import Card from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import {
  Layers,
  Briefcase,
  FileText,
  Building,
  MessageSquareCode,
  RefreshCw,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Tag,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export const CmsDashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useCmsDashboard();

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">CMS MANAGER ENGINE</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>CMS Control Console</h1>
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
          <p className="eyebrow">CMS MANAGER ENGINE</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>CMS Control Console</h1>
        </div>
        <Card style={{ padding: "2rem", borderColor: "rgba(239, 68, 68, 0.3)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#ef4444", marginBottom: "1rem" }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Unable to load CMS Dashboard Metrics</h3>
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
    total_services: 0,
    published_services: 0,
    draft_services: 0,
    total_case_studies: 0,
    published_case_studies: 0,
    draft_case_studies: 0,
    total_industries: 0,
    published_industries: 0,
    total_blog_posts: 0,
    published_blog_posts: 0,
    draft_blog_posts: 0,
    total_categories: 0,
    total_content_nodes: 0,
    published_ratio: 0,
    recent_articles: [],
    recent_case_studies: [],
    services_list: [],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header & Quick Action Desk */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>CONTENT MANAGEMENT ENGINE</p>
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
            CMS Control Console
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/cms/services">
            <Button variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Briefcase size={14} /> Services ({stats.total_services})
            </Button>
          </Link>
          <Link href="/cms/blog">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Plus size={14} /> Manage Articles
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        {/* Services */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Services Catalog
            </span>
            <Briefcase size={18} color="#63f5e8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#f8fafc", margin: "0.4rem 0" }}>
            {stats.total_services}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span style={{ color: "#63f5e8", fontWeight: 500 }}>{stats.published_services} published</span>
            <span>&bull; {stats.draft_services} draft</span>
          </div>
        </Card>

        {/* Case Studies */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Case Studies
            </span>
            <FileText size={18} color="#38bdf8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#38bdf8", margin: "0.4rem 0" }}>
            {stats.total_case_studies}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span style={{ color: "#f8fafc", fontWeight: 600 }}>{stats.published_case_studies} active cases</span>
          </div>
        </Card>

        {/* Industries */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Industry Verticals
            </span>
            <Building size={18} color="#818cf8" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#818cf8", margin: "0.4rem 0" }}>
            {stats.total_industries}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span>{stats.published_industries} mapped domains</span>
          </div>
        </Card>

        {/* Blog Articles */}
        <Card glowOnHover style={{ padding: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
              Blog Articles
            </span>
            <MessageSquareCode size={18} color="#4ade80" />
          </div>
          <p style={{ fontSize: "2.2rem", fontWeight: 600, color: "#4ade80", margin: "0.4rem 0" }}>
            {stats.total_blog_posts}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>{stats.published_blog_posts} live</span>
            <span>&bull; {stats.draft_blog_posts} drafts</span>
          </div>
        </Card>
      </div>

      {/* Content Status Breakdown & Live Services Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* Content Status & Publishing Velocity */}
        <Card style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Publishing Distribution</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
                {stats.published_ratio}% of {stats.total_content_nodes} total content nodes are live
              </p>
            </div>
            <Link href="/cms/blog">
              <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
                Blog Desk <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Services */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "#cbd5e1" }}>Services Nodes</span>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                  {stats.published_services} / {stats.total_services} Published
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(140, 174, 187, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${stats.total_services > 0 ? (stats.published_services / stats.total_services) * 100 : 0}%`,
                    height: "100%",
                    backgroundColor: "#63f5e8",
                  }}
                />
              </div>
            </div>

            {/* Case Studies */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "#cbd5e1" }}>Case Studies</span>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "#38bdf8" }}>
                  {stats.published_case_studies} / {stats.total_case_studies} Published
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(140, 174, 187, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${stats.total_case_studies > 0 ? (stats.published_case_studies / stats.total_case_studies) * 100 : 0}%`,
                    height: "100%",
                    backgroundColor: "#38bdf8",
                  }}
                />
              </div>
            </div>

            {/* Blog Posts */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "#cbd5e1" }}>Blog Articles</span>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "#4ade80" }}>
                  {stats.published_blog_posts} / {stats.total_blog_posts} Published
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(140, 174, 187, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${stats.total_blog_posts > 0 ? (stats.published_blog_posts / stats.total_blog_posts) * 100 : 0}%`,
                    height: "100%",
                    backgroundColor: "#4ade80",
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Live Services Catalog */}
        <Card style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Core Capability Nodes</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
                Public service disciplines delivered to enterprise clients
              </p>
            </div>
            <Link href="/cms/services">
              <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
                All Services ({stats.total_services}) <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          {stats.services_list.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
              <Briefcase size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
              <p style={{ margin: 0 }}>No service nodes configured yet.</p>
              <Link href="/cms/services">
                <Button variant="outline" style={{ marginTop: "1rem" }}>
                  Add First Service
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.services_list.slice(0, 4).map((svc) => (
                <div
                  key={svc.id}
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
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f8fafc" }}>
                        {svc.title}
                      </span>
                      <span style={{
                        fontSize: "0.68rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        color: svc.status === "published" ? "#4ade80" : "#facc15",
                        backgroundColor: svc.status === "published" ? "rgba(74, 222, 128, 0.1)" : "rgba(250, 204, 21, 0.1)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "2px",
                      }}>
                        {svc.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                      Slug: /{svc.slug}
                    </div>
                  </div>

                  <Link href="/cms/services">
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

      {/* Recent Blog Articles Stream */}
      <Card style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc" }}>Recent Signal &amp; Insights Articles</h3>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}>
              Technical thought leadership published to the public portal
            </p>
          </div>
          <Link href="/cms/blog">
            <span style={{ fontSize: "0.75rem", color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
              Blog Desk <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>

        {stats.recent_articles.length === 0 ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <MessageSquareCode size={32} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>No blog articles published yet.</p>
            <Link href="/cms/blog">
              <Button glow style={{ marginTop: "1rem" }}>
                Create First Article
              </Button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {stats.recent_articles.map((post) => (
              <div
                key={post.id}
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
                      {post.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "2px",
                        backgroundColor: post.status === "published" ? "rgba(74, 222, 128, 0.15)" : "rgba(250, 204, 21, 0.15)",
                        color: post.status === "published" ? "#4ade80" : "#facc15",
                        border: `1px solid ${post.status === "published" ? "rgba(74, 222, 128, 0.3)" : "rgba(250, 204, 21, 0.3)"}`,
                      }}
                    >
                      {post.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                    Category: <strong style={{ color: "#cbd5e1" }}>{post.category_name || "General"}</strong> &bull; Author: {post.author_username} &bull; Created: {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>

                <Link href="/cms/blog">
                  <Button variant="outline" style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                    Edit Article &rarr;
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CmsDashboard;
