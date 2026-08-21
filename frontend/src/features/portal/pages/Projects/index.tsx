import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import portalService from "../../services/portalService";
import usePortalQuery from "../../hooks/usePortalQuery";
import { ErrorState, LoadingState, EmptyState } from "../../components/StateViews";
import type { ClientProjectItem, ProjectMilestone, SprintDeliverable } from "../../types/portal.types";
import { Briefcase, RefreshCw, Flag, CheckCircle2, Clock, Calendar, Lock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  under_review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delayed: "bg-red-500/20 text-red-400 border-red-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export const Projects: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"projects" | "timeline" | "deliverables" | "milestones">("projects");

  const projectsQuery = usePortalQuery<ClientProjectItem[]>(
    ["portal", "projects"],
    () => portalService.getProjects()
  );

  const milestonesQuery = usePortalQuery<ProjectMilestone[]>(
    ["portal", "milestones"],
    () => portalService.getMilestones()
  );

  const deliverablesQuery = usePortalQuery<SprintDeliverable[]>(
    ["portal", "deliverables"],
    () => portalService.getDeliverables()
  );

  const projects = projectsQuery.data || [];
  const milestones = milestonesQuery.data || [];
  const deliverables = deliverablesQuery.data || [];

  const completedDeliverables = deliverables.filter((d) => d.delivery_status === "completed");
  const upcomingMilestones = milestones.filter((m) => m.status === "upcoming" || m.status === "in_progress");

  const isLoading = projectsQuery.isLoading || milestonesQuery.isLoading || deliverablesQuery.isLoading;
  const isError = projectsQuery.isError || milestonesQuery.isError || deliverablesQuery.isError;
  const error = projectsQuery.error || milestonesQuery.error || deliverablesQuery.error;

  const handleRefresh = () => {
    projectsQuery.refetch();
    milestonesQuery.refetch();
    deliverablesQuery.refetch();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="PROJECT TRACKER"
        title="Active Engagements & Deliverables"
        description="Read-only status timeline, milestone tracking, and completed sprint deliverables."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "IBM Plex Mono, monospace" }}>
              <Lock size={12} /> READ-ONLY VIEW
            </span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} style={{ marginRight: "0.35rem" }} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Tabs Header */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(140,174,187,0.18)", paddingBottom: "0.5rem" }}>
        {[
          { id: "projects", label: `Active Projects (${projects.length})`, icon: Briefcase },
          { id: "timeline", label: "Read-Only Timeline", icon: Clock },
          { id: "milestones", label: `Upcoming Milestones (${upcomingMilestones.length})`, icon: Flag },
          { id: "deliverables", label: `Completed Deliverables (${completedDeliverables.length})`, icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.85rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#63f5e8" : "#94a3b8",
                backgroundColor: isActive ? "rgba(99, 245, 232, 0.08)" : "transparent",
                border: isActive ? "1px solid rgba(99, 245, 232, 0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <LoadingState label="LOADING PROJECT TRACKER DATA..." rows={3} />
      ) : isError ? (
        <ErrorState error={error} onRetry={handleRefresh} title="Unable to load project tracker data" />
      ) : (
        <>
          {/* TAB 1: Active Projects */}
          {activeTab === "projects" && (
            projects.length === 0 ? (
              <EmptyState title="No active projects" description="Once your project scope is initialized by Aurexion, your active deliverables and milestone tracking will appear here." />
            ) : (
              <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                {projects.map((proj) => (
                  <Card key={proj.id} glowOnHover style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc", fontWeight: 600 }}>
                          {proj.title}
                        </h3>
                        {proj.delivery_lead_name && (
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "inline-block", marginTop: "0.2rem" }}>
                            Delivery Lead: <strong style={{ color: "#cbd5e1" }}>{proj.delivery_lead_name}</strong>
                          </span>
                        )}
                      </div>
                      <Badge className={STATUS_COLORS[proj.status] || "bg-gray-500/20 text-gray-400"}>
                        {proj.status_display || proj.status}
                      </Badge>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                      {proj.description || "No project overview description provided."}
                    </p>

                    {/* Current & Next Milestone */}
                    {(proj.current_milestone || proj.next_milestone) && (
                      <div style={{ padding: "0.75rem", backgroundColor: "rgba(10, 17, 28, 0.6)", borderRadius: "6px", marginBottom: "1rem", border: "1px solid rgba(140,174,187,0.1)" }}>
                        {proj.current_milestone && (
                          <div style={{ fontSize: "0.78rem", color: "#63f5e8", marginBottom: "0.25rem" }}>
                            Current Milestone: <strong>{proj.current_milestone.name}</strong>
                          </div>
                        )}
                        {proj.next_milestone && (
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            Next Milestone: {proj.next_milestone.name} ({proj.next_milestone.planned_date || "TBD"})
                          </div>
                        )}
                      </div>
                    )}

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
            )
          )}

          {/* TAB 2: Read-Only Timeline */}
          {activeTab === "timeline" && (
            projects.length === 0 ? (
              <EmptyState title="No active projects" description="Timeline tracking events will appear when project deliverables begin." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {projects.map((proj) => (
                  <Card key={proj.id} style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(140,174,187,0.15)", paddingBottom: "0.75rem" }}>
                      <div>
                        <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.1rem" }}>{proj.title} — Timeline</h3>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Start: {proj.start_date || "N/A"} · Target: {proj.target_completion_date || "N/A"}</span>
                      </div>
                      <Badge className={STATUS_COLORS[proj.status] || "bg-gray-500/20 text-gray-400"}>
                        {proj.status_display || proj.status}
                      </Badge>
                    </div>

                    {(!proj.milestones || proj.milestones.length === 0) && (!proj.deliverables || proj.deliverables.length === 0) ? (
                      <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No timeline events or milestones configured for this project yet.</p>
                    ) : (
                      <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: "2px solid rgba(99,245,232,0.3)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {proj.milestones?.map((ms) => (
                          <div key={`ms-${ms.id}`} style={{ position: "relative" }}>
                            <div style={{ position: "absolute", left: "-1.9rem", top: "0.2rem", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: ms.status === "completed" ? "#4ade80" : ms.is_current ? "#63f5e8" : "#94a3b8" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", textTransform: "uppercase" }}>MILESTONE</span>
                                <h4 style={{ margin: "0.1rem 0", fontSize: "0.95rem", color: "#f8fafc" }}>{ms.name}</h4>
                                <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>{ms.description}</p>
                              </div>
                              <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                                Planned: {ms.planned_date || "TBD"}
                              </span>
                            </div>
                          </div>
                        ))}

                        {proj.deliverables?.map((del) => (
                          <div key={`del-${del.id}`} style={{ position: "relative" }}>
                            <div style={{ position: "absolute", left: "-1.9rem", top: "0.2rem", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#4ade80" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#4ade80", textTransform: "uppercase" }}>SPRINT DELIVERABLE · {del.sprint_name}</span>
                                <h4 style={{ margin: "0.1rem 0", fontSize: "0.95rem", color: "#f8fafc" }}>{del.deliverable_name}</h4>
                              </div>
                              <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                                Completed: {del.completion_date || "N/A"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )
          )}

          {/* TAB 3: Upcoming Milestones */}
          {activeTab === "milestones" && (
            upcomingMilestones.length === 0 ? (
              <EmptyState title="No upcoming milestones" description="Milestones will be listed here when scheduled by the engineering delivery team." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {upcomingMilestones.map((ms) => (
                  <Card key={ms.id} style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#c4b5fd" }}>
                          {ms.project_title}
                        </span>
                        <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.05rem", color: "#f8fafc" }}>
                          {ms.name} {ms.is_current && <span style={{ color: "#63f5e8", fontSize: "0.75rem", marginLeft: "0.5rem" }}>(Current Phase)</span>}
                        </h3>
                      </div>
                      <Badge className={STATUS_COLORS[ms.status] || "bg-gray-500/20 text-gray-400"}>
                        {ms.status_display || ms.status}
                      </Badge>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.5rem 0 0.75rem 0" }}>
                      {ms.description || "No milestone notes provided."}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                      <span>Expected Date: {ms.planned_date || "TBD"}</span>
                      <span>Status: {ms.status_display || ms.status}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}

          {/* TAB 4: Completed Sprint Deliverables */}
          {activeTab === "deliverables" && (
            completedDeliverables.length === 0 ? (
              <EmptyState title="No completed sprint deliverables" description="Completed sprint deliverables will appear here upon QA sign-off." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {completedDeliverables.map((del) => (
                  <Card key={del.id} style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#4ade80" }}>
                          {del.project_title} · {del.sprint_name} ({del.sprint_period})
                        </span>
                        <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.05rem", color: "#f8fafc" }}>
                          {del.deliverable_name}
                        </h3>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {del.delivery_status_display || del.delivery_status}
                      </Badge>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", marginTop: "0.75rem" }}>
                      <span>Completed Date: {del.completion_date || "N/A"}</span>
                      <span>Delivery Status: Verified</span>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Projects;