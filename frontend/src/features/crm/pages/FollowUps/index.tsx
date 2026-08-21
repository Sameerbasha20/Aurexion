import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAllFollowUpsQuery, useCompleteFollowUpMutation } from "../../../../queries/useCrmQueries";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import LoadingState from "../../../../components/feedback/LoadingState";
import ErrorState from "../../../../components/feedback/ErrorState";
import EmptyState from "../../../../components/feedback/EmptyState";
import { toast } from "sonner";
import { Clock, Phone, Mail, Calendar, RefreshCw, ExternalLink } from "lucide-react";

type FilterTabKey = "all" | "today" | "overdue" | "upcoming" | "completed";

export const categorizeFollowUps = (followUps: any[]) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  const isOpen = (f: any) => f.status !== "COMPLETED" && f.status !== "CANCELLED";

  const overdue = followUps.filter((f) => isOpen(f) && new Date(f.scheduled_at).getTime() < startOfToday);
  const today = followUps.filter((f) => {
    if (!isOpen(f)) return false;
    const t = new Date(f.scheduled_at).getTime();
    return t >= startOfToday && t < endOfToday;
  });
  const upcoming = followUps.filter((f) => isOpen(f) && new Date(f.scheduled_at).getTime() >= endOfToday);
  const completed = followUps.filter((f) => f.status === "COMPLETED");

  return { overdue, today, upcoming, completed, startOfToday };
};

interface FollowUpKpiSectionProps {
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
  completedCount: number;
  onSelectTab: (tab: FilterTabKey) => void;
}

const FollowUpKpiSection: React.FC<FollowUpKpiSectionProps> = ({
  overdueCount,
  todayCount,
  upcomingCount,
  completedCount,
  onSelectTab,
}) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
    <Card
      glowOnHover
      onClick={() => onSelectTab("overdue")}
      style={{
        padding: "1.25rem",
        cursor: "pointer",
        borderColor: overdueCount > 0 ? "rgba(248, 113, 113, 0.4)" : undefined,
      }}
    >
      <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#f87171" }}>OVERDUE</span>
      <p style={{ fontSize: "2rem", fontWeight: 600, color: "#f87171", margin: "0.3rem 0" }}>{overdueCount}</p>
      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Requires immediate action</span>
    </Card>

    <Card glowOnHover onClick={() => onSelectTab("today")} style={{ padding: "1.25rem", cursor: "pointer" }}>
      <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#38bdf8" }}>DUE TODAY</span>
      <p style={{ fontSize: "2rem", fontWeight: 600, color: "#38bdf8", margin: "0.3rem 0" }}>{todayCount}</p>
      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Scheduled for today</span>
    </Card>

    <Card glowOnHover onClick={() => onSelectTab("upcoming")} style={{ padding: "1.25rem", cursor: "pointer" }}>
      <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>UPCOMING</span>
      <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: "0.3rem 0" }}>{upcomingCount}</p>
      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Future scheduled events</span>
    </Card>

    <Card glowOnHover onClick={() => onSelectTab("completed")} style={{ padding: "1.25rem", cursor: "pointer" }}>
      <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#4ade80" }}>COMPLETED</span>
      <p style={{ fontSize: "2rem", fontWeight: 600, color: "#4ade80", margin: "0.3rem 0" }}>{completedCount}</p>
      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Logged touchpoints</span>
    </Card>
  </div>
);

interface FollowUpTabsProps {
  filterTab: FilterTabKey;
  todayCount: number;
  overdueCount: number;
  upcomingCount: number;
  completedCount: number;
  totalCount: number;
  onSelectTab: (tab: FilterTabKey) => void;
}

const FollowUpTabs: React.FC<FollowUpTabsProps> = ({
  filterTab,
  todayCount,
  overdueCount,
  upcomingCount,
  completedCount,
  totalCount,
  onSelectTab,
}) => {
  const tabs = [
    { key: "today" as const, label: `Due Today (${todayCount})` },
    { key: "overdue" as const, label: `Overdue (${overdueCount})` },
    { key: "upcoming" as const, label: `Upcoming (${upcomingCount})` },
    { key: "completed" as const, label: `Completed (${completedCount})` },
    { key: "all" as const, label: `All Follow-ups (${totalCount})` },
  ];

  return (
    <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(140, 174, 187, 0.2)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
      {tabs.map((tab) => {
        const isSelected = filterTab === tab.key;
        return (
          <button
            type="button"
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
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
  );
};

interface FollowUpItemCardProps {
  fu: any;
  startOfToday: number;
  actionLoadingId: number | null;
  onComplete: (leadId: number, fuId: number) => void;
}

const FollowUpItemCard: React.FC<FollowUpItemCardProps> = ({
  fu,
  startOfToday,
  actionLoadingId,
  onComplete,
}) => {
  const isCompleted = fu.status === "COMPLETED";
  const isOverdue = !isCompleted && new Date(fu.scheduled_at).getTime() < startOfToday;
  const borderColor = isCompleted ? "#4ade80" : isOverdue ? "#f87171" : "#63f5e8";
  const iconBg = isCompleted ? "rgba(74, 222, 128, 0.15)" : isOverdue ? "rgba(248, 113, 113, 0.15)" : "rgba(99, 245, 232, 0.1)";

  return (
    <Card
      key={fu.id}
      style={{
        padding: "1.25rem 1.5rem",
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "4px",
              backgroundColor: iconBg,
              display: "grid",
              placeItems: "center",
              color: borderColor,
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
                  backgroundColor: iconBg,
                  color: borderColor,
                }}
              >
                {fu.follow_up_type_display || fu.follow_up_type}
              </span>
            </div>

            <div style={{ fontSize: "0.78rem", color: isOverdue ? "#f87171" : "#94a3b8", fontFamily: "IBM Plex Mono, monospace", marginTop: "0.25rem" }}>
              Scheduled: {new Date(fu.scheduled_at).toLocaleDateString()} at{" "}
              {new Date(fu.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {fu.assigned_to_name && ` · Assigned: ${fu.assigned_to_name}`}
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
              onClick={() => onComplete(fu.lead, fu.id)}
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
            >
              {actionLoadingId === fu.id ? "..." : "Mark Done"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export const FollowUps: React.FC = () => {
  const [, navigate] = useLocation();
  const { data, isLoading, error, refetch } = useAllFollowUpsQuery();
  const completeMutation = useCompleteFollowUpMutation();
  const followUps = data || [];
  const [filterTab, setFilterTab] = useState<FilterTabKey>("today");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const { overdue, today, upcoming, completed, startOfToday } = useMemo(
    () => categorizeFollowUps(followUps),
    [followUps]
  );

  const displayedList = useMemo(() => {
    switch (filterTab) {
      case "today":
        return today;
      case "overdue":
        return overdue;
      case "upcoming":
        return upcoming;
      case "completed":
        return completed;
      default:
        return followUps;
    }
  }, [filterTab, today, overdue, upcoming, completed, followUps]);

  const handleComplete = async (leadId: number, followUpId: number) => {
    setActionLoadingId(followUpId);
    completeMutation.mutate(
      { leadId, followUpId },
      {
        onSuccess: () => toast.success("Follow-up marked as completed."),
        onError: (err: any) => toast.error(err?.message || "Failed to complete follow-up."),
        onSettled: () => setActionLoadingId(null),
      }
    );
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

      <FollowUpKpiSection
        overdueCount={overdue.length}
        todayCount={today.length}
        upcomingCount={upcoming.length}
        completedCount={completed.length}
        onSelectTab={setFilterTab}
      />

      <FollowUpTabs
        filterTab={filterTab}
        todayCount={today.length}
        overdueCount={overdue.length}
        upcomingCount={upcoming.length}
        completedCount={completed.length}
        totalCount={followUps.length}
        onSelectTab={setFilterTab}
      />

      {/* Follow-ups List */}
      {isLoading ? (
        <LoadingState message="Syncing follow-up schedule..." />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : displayedList.length === 0 ? (
        <EmptyState
          title="No follow-ups found in this category"
          message="Check other tabs or schedule follow-ups through the Leads Funnel."
          action={{ label: "Open Leads Funnel", onClick: () => navigate("/crm/leads") }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {displayedList.map((fu) => (
            <FollowUpItemCard
              key={fu.id}
              fu={fu}
              startOfToday={startOfToday}
              actionLoadingId={actionLoadingId}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowUps;
