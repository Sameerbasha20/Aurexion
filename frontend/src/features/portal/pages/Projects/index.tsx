import React from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import portalService from "../../services/portalService";
import usePortalQuery from "../../hooks/usePortalQuery";
import { ErrorState, LoadingState } from "../../components/StateViews";
import { Briefcase, RefreshCw } from "lucide-react";

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  status: string;
  status_display: string;
  progress_percentage: number;
  start_date: string | null;
  target_completion_date: string | null;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  under_review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export const Projects: React.FC = () => {
  const { data: projects, isLoading, isError, error, refetch } = usePortalQuery<ProjectItem[]>(
    ["portal", "projects"],
    () => portalService.getProjects()
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="WORK SCOPE"
        title="Projects Portfolio"
        description="Live status tracking for active project deliverables and engineering scope."
        actions={
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw size={14} style={{ marginRight: "0.35rem" }} />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="LOADING CLIENT PROJECTS..." rows={3} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} title="Unable to load client projects" />
      ) : !projects || projects.length === 0 ? (
        <Card style={{ padding: "3rem", textAlign: "center" }}>
          <Briefcase size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", color: "#f8fafc", margin: 0 }}>No active projects yet</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0.5rem 0 0 0" }}>
            Once your project scope is initialized by Aurexion, your active deliverables and milestone tracking will appear here.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {projects.map((proj) => (
            <Card key={proj.id} glowOnHover style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc", fontWeight: 600 }}>
                  {proj.title}
                </h3>
                <Badge className={STATUS_COLORS[proj.status] || "bg-gray-500/20 text-gray-400"}>
                  {proj.status_display || proj.status}
                </Badge>
              </div>

              <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                {proj.description || "No project overview description provided."}
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                  <span>Completion Progress</span>
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
                    {proj.progress_percentage}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(140, 174, 187, 0.15)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${proj.progress_percentage}%`,
                      height: "100%",
                      backgroundColor: "#63f5e8",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              {/* Dates Row */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", borderTop: "1px solid rgba(140,174,187,0.1)", paddingTop: "0.75rem" }}>
                <span>Start: {proj.start_date || "N/A"}</span>
                <span>Target: {proj.target_completion_date || "N/A"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;