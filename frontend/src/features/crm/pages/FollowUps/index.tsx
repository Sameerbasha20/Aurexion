import React, { useState } from "react";
import { Link } from "wouter";
import { useFollowUps } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Clock,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Filter,
} from "lucide-react";

export const FollowUps: React.FC = () => {
  const { followUps, isLoading, error, refetch, markComplete } = useFollowUps();
  const [filterTab, setFilterTab] = useState<"all" | "today" | "overdue" | "upcoming" | "completed">("today");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  const overdueList = followUps.filter((f) => f.status !== "COMPLETED" && new Date(f.scheduled_at).getTime() < startOfToday);
  const todayList = followUps.filter((f) => {
    if (f.status === "COMPLETED") return false;
    const t = new Date(f.scheduled_at).getTime();
    return t >= startOfToday && t < endOfToday;
  });
  const upcomingList = followUps.filter((f) => f.status !== "COMPLETED" && new Date(f.scheduled_at).getTime() >= endOfToday);
  const completedList = followUps.filter((f) => f.status === "COMPLETED");

  const displayedList =
    filterTab === "today"
      ? todayList
      : filterTab === "overdue"
      ? overdueList
      : filterTab === "upcoming"
      ? upcomingList
      : filterTab === "completed"
      ? completedList
      : followUps;

  const handleComplete = async (leadId: number, followUpId: number) => {
    setActionLoadingId(followUpId);
    try {
      await markComplete(leadId, followUpId);
      setSuccessMessage("Follow-up marked as completed.");
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    } catch (err: any) {
      alert(err?.message || "Failed to complete follow-up.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>CLIENT TOUCHPOINTS</p>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Follow-ups Management Desk
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/crm/leads">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={14} /> Leads Funnel
            </Button>
          </Link>
        </div>
      </div>

      {successMessage && (
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
          {successMessage}
        </div>
      )}

      {/* KPI Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <Card
          glowOnHover
          onClick={() => setFilterTab("overdue")}
          style={{
            padding: "1.25rem",
            cursor: "pointer",
            borderColor: overdueList.length > 0 ? "rgba(248, 113, 113, 0.4)" : undefined,
          }}
        >
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#f87171" }}>OVERDUE</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#f87171", margin: "0.3rem 0" }}>{overdueList.length}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Requires immediate action</span>
        </Card>

        <Card glowOnHover onClick={() => setFilterTab("today")} style={{ padding: "1.25rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#38bdf8" }}>DUE TODAY</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#38bdf8", margin: "0.3rem 0" }}>{todayList.length}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Scheduled for today</span>
        </Card>

        <Card glowOnHover onClick={() => setFilterTab("upcoming")} style={{ padding: "1.25rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>UPCOMING</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: "0.3rem 0" }}>{upcomingList.length}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Future scheduled events</span>
        </Card>

        <Card glowOnHover onClick={() => setFilterTab("completed")} style={{ padding: "1.25rem", cursor: "pointer" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#4ade80" }}>COMPLETED</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#4ade80", margin: "0.3rem 0" }}>{completedList.length}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Logged touchpoints</span>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(140, 174, 187, 0.2)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
        {[
          { key: "today", label: `Due Today (${todayList.length})` },
          { key: "overdue", label: `Overdue (${overdueList.length})` },
          { key: "upcoming", label: `Upcoming (${upcomingList.length})` },
          { key: "completed", label: `Completed (${completedList.length})` },
          { key: "all", label: `All Follow-ups (${followUps.length})` },
        ].map((tab) => {
          const isSelected = filterTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key as any)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                background: isSelected ? "rgba(99, 245, 232, 0.1)" : "transparent",
                border: isSelected ? "1px solid #63f5e8" : "1px solid transparent",
                color: isSelected ? "#63f5e8" : "#94a3b8",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Follow-ups List */}
      {isLoading ? (
        <Card style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
            SYNCING FOLLOW-UP SCHEDULE...
          </p>
        </Card>
      ) : error ? (
        <Card style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
          <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
          <p>{error}</p>
          <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
        </Card>
      ) : displayedList.length === 0 ? (
        <Card style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
          <CheckCircle2 size={36} color="#4ade80" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>
            No follow-ups found in this category
          </h3>
          <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
            Check other tabs or schedule follow-ups through the Leads Funnel.
          </p>
          <Link href="/crm/leads">
            <Button glow>Open Leads Funnel</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {displayedList.map((fu) => {
            const isCompleted = fu.status === "COMPLETED";
            const isOverdue = !isCompleted && new Date(fu.scheduled_at).getTime() < startOfToday;
            return (
              <Card
                key={fu.id}
                style={{
                  padding: "1.25rem 1.5rem",
                  borderLeft: isCompleted ? "3px solid #4ade80" : isOverdue ? "3px solid #f87171" : "3px solid #63f5e8",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "4px",
                        backgroundColor: isCompleted ? "rgba(74, 222, 128, 0.15)" : isOverdue ? "rgba(248, 113, 113, 0.15)" : "rgba(99, 245, 232, 0.1)",
                        display: "grid",
                        placeItems: "center",
                        color: isCompleted ? "#4ade80" : isOverdue ? "#f87171" : "#63f5e8",
                      }}
                    >
                      {fu.follow_up_type === "CALL" ? <Phone size={18} /> : fu.follow_up_type === "EMAIL" ? <Mail size={18} /> : <Calendar size={18} />}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <Link href={`/crm/leads/${fu.lead}`}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc", cursor: "pointer" }}>
                            {fu.lead_name || `Lead #${fu.lead}`}
                          </span>
                        </Link>
                        {fu.lead_company && (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>({fu.lead_company})</span>
                        )}
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "2px",
                            backgroundColor: isCompleted ? "rgba(74, 222, 128, 0.15)" : isOverdue ? "rgba(248, 113, 113, 0.15)" : "rgba(99, 245, 232, 0.15)",
                            color: isCompleted ? "#4ade80" : isOverdue ? "#f87171" : "#63f5e8",
                          }}
                        >
                          {fu.follow_up_type_display || fu.follow_up_type}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.78rem", color: isOverdue ? "#f87171" : "#94a3b8", fontFamily: "IBM Plex Mono, monospace", marginTop: "0.25rem" }}>
                        Scheduled: {new Date(fu.scheduled_at).toLocaleDateString()} at{" "}
                        {new Date(fu.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {fu.assigned_to_name && ` &bull; Assigned: ${fu.assigned_to_name}`}
                      </div>

                      {fu.notes && (
                        <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.82rem", color: "#cbd5e1" }}>
                          {fu.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Link href={`/crm/leads/${fu.lead}`}>
                      <Button variant="outline" style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}>
                        Open Lead <ExternalLink size={12} style={{ marginLeft: "0.3rem" }} />
                      </Button>
                    </Link>
                    {!isCompleted && (
                      <Button
                        glow
                        disabled={actionLoadingId === fu.id}
                        onClick={() => handleComplete(fu.lead, fu.id)}
                        style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
                      >
                        {actionLoadingId === fu.id ? "..." : "Mark Done"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowUps;
