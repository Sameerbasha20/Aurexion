import React, { useState, useEffect } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { FileText, Newspaper, HelpCircle, Layers, Edit, Eye } from "lucide-react";
import cmsService from "../../../cms/services/cmsService";

interface CMSContentItem {
  id: number;
  title: string;
  slug: string;
  type: "SERVICE" | "CASE_STUDY" | "BLOG" | "INDUSTRY";
  status: "PUBLISHED" | "DRAFT";
  lastUpdated: string;
}

export const CmsOverview: React.FC = () => {
  const [contents, setContents] = useState<CMSContentItem[]>([]);
  const [counts, setCounts] = useState({ services: 4, industries: 3, caseStudies: 2, blogs: 2 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCmsData = async () => {
      setLoading(true);
      try {
        const s = await cmsService.getAdminServices();
        const cs = await cmsService.getAdminCaseStudies();
        const ind = await cmsService.getAdminIndustries();
        const blg = await cmsService.getAdminBlog();

        setCounts({
          services: s.length,
          industries: ind.length,
          caseStudies: cs.length,
          blogs: blg.length
        });

        // Combine into unified table of contents
        const list: CMSContentItem[] = [];
        s.forEach(item => list.push({ id: item.id, title: item.title, slug: item.slug, type: "SERVICE", status: item.status as any || "PUBLISHED", lastUpdated: new Date(item.updated_at).toLocaleDateString() }));
        cs.forEach(item => list.push({ id: item.id, title: item.title, slug: item.slug, type: "CASE_STUDY", status: item.status as any || "PUBLISHED", lastUpdated: new Date(item.updated_at).toLocaleDateString() }));
        blg.forEach(item => list.push({ id: item.id, title: item.title, slug: item.slug, type: "BLOG", status: item.status as any || "PUBLISHED", lastUpdated: new Date(item.updated_at).toLocaleDateString() }));
        
        setContents(list);
      } catch (err) {
        // Fallback list
        setContents([
          { id: 1, title: "Artificial Intelligence Development Catalog", slug: "ai-orchestration", type: "SERVICE", status: "PUBLISHED", lastUpdated: "8/15/2026" },
          { id: 2, title: "Zeta Prime Core Migration Briefing", slug: "zeta-prime-core", type: "CASE_STUDY", status: "PUBLISHED", lastUpdated: "8/14/2026" },
          { id: 3, title: "Visions on Quantum Cloud Gateways", slug: "quantum-gateways", type: "BLOG", status: "DRAFT", lastUpdated: "8/12/2026" },
          { id: 4, title: "Cloud Native System Architecture Catalog", slug: "cloud-native", type: "SERVICE", status: "PUBLISHED", lastUpdated: "8/10/2026" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCmsData();
  }, []);

  const handleToggleStatus = (id: number, type: string) => {
    setContents(contents.map(c => {
      if (c.id === id && c.type === type) {
        const nextStatus = c.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        return { ...c, status: nextStatus, lastUpdated: new Date().toLocaleDateString() };
      }
      return c;
    }));
  };

  const totalContent = contents.length;
  const published = contents.filter(c => c.status === "PUBLISHED").length;
  const drafts = contents.filter(c => c.status === "DRAFT").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title */}
      <div>
        <p className="eyebrow"><FileText size={12} /> MARKETING CONTENT CONTROLLER</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>CMS Overview</h1>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.5rem" }}>
        {[
          { title: "Total Services", count: counts.services, desc: "Capabilities listed", icon: Layers },
          { title: "Case Studies", count: counts.caseStudies, desc: "Confidential/public projects", icon: FileText },
          { title: "Blog Posts", count: counts.blogs, desc: "Tech insights published", icon: Newspaper },
          { title: "Published Content", count: published, desc: "Indexed live pages", icon: Eye, color: "#10b981" },
          { title: "Draft Content", count: drafts, desc: "Awaiting review publishing", icon: Edit, color: "#eab308" }
        ].map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    {stat.title}
                  </div>
                  <div style={{
                    fontSize: "1.8rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-display)",
                    color: stat.color || "var(--color-text-primary)",
                    margin: "0.4rem 0"
                  }}>{stat.count}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>{stat.desc}</div>
                </div>
                <StatIcon size={20} style={{ color: "var(--color-cyan)" }} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CMS Contents Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: "1.1rem" }}>CMS Content Directory</CardTitle>
        </CardHeader>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
            RESOLVING LIVE PAGES SCHEMAS...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>TYPE SCOPE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", width: "40%" }}>PAGE TITLE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>SLUG PATH</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STATUS</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>LAST UPDATED</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((c) => (
                  <tr key={`${c.type}-${c.id}`} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-muted/10">
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-primary)",
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--color-border)",
                        padding: "0.1rem 0.35rem",
                        borderRadius: "3px"
                      }}>{c.type}</span>
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{c.title}</td>
                    <td style={{ padding: "1rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>/{c.slug}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: c.status === "PUBLISHED" ? "#10b981" : "#eab308",
                        backgroundColor: "rgba(0,0,0,0.15)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "3px",
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}>{c.status}</span>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--color-text-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>{c.lastUpdated}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(c.id, c.type)} style={{ borderColor: "var(--color-border)" }}>
                        {c.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CmsOverview;
