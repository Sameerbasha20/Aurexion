import React, { useState } from "react";
import { Link } from "wouter";
import { useActivities } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  History,
  Activity,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Filter,
} from "lucide-react";

export const Activities: React.FC = () => {
  const { activities, isLoading, error, refetch } = useActivities();
  const [typeFilter, setTypeFilter] = useState("");

  const filteredActivities = activities.filter((act) => {
    if (!typeFilter) return true;
    return act.type === typeFilter;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CALL":
        return <Phone size={16} color="#63f5e8" />;
      case "EMAIL":
        return <Mail size={16} color="#38bdf8" />;
      case "MEETING":
        return <Calendar size={16} color="#818cf8" />;
      case "NOTE":
        return <FileText size={16} color="#facc15" />;
      case "WON":
        return <CheckCircle2 size={16} color="#4ade80" />;
      case "LOST":
        return <AlertTriangle size={16} color="#f87171" />;
      default:
        return <Activity size={16} color="#63f5e8" />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>COMMUNICATION & AUDIT TRAIL</p>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Sales Activity Ledger
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh Feed
          </Button>
          <Link href="/crm/leads">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Activity size={14} /> Leads Funnel
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            Showing {filteredActivities.length} recorded interactions
          </span>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { label: "All Activities", value: "" },
              { label: "Calls", value: "CALL" },
              { label: "Meetings", value: "MEETING" },
              { label: "Emails", value: "EMAIL" },
              { label: "Notes", value: "NOTE" },
              { label: "Won / Qualified", value: "WON" },
            ].map((f) => {
              const isSelected = typeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "4px",
                    fontSize: "0.78rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    backgroundColor: isSelected ? "rgba(99, 245, 232, 0.1)" : "rgba(5, 8, 17, 0.7)",
                    border: isSelected ? "1px solid #63f5e8" : "1px solid rgba(140, 174, 187, 0.2)",
                    color: isSelected ? "#63f5e8" : "#cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Activity Timeline List */}
      {isLoading ? (
        <Card style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
            LOADING SALES ACTIVITIES FEED...
          </p>
        </Card>
      ) : error ? (
        <Card style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
          <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
          <p>{error}</p>
          <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
        </Card>
      ) : filteredActivities.length === 0 ? (
        <Card style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
          <History size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No activities recorded</h3>
          <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
            Interact with leads in the Leads Funnel to generate live communication records.
          </p>
          <Link href="/crm/leads">
            <Button glow>Go to Leads Funnel</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {filteredActivities.map((act) => (
            <Card
              key={act.id}
              style={{
                padding: "1.25rem 1.5rem",
                borderLeft: "3px solid #63f5e8",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div
                  style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    backgroundColor: "rgba(10, 17, 28, 0.8)",
                    border: "1px solid rgba(140, 174, 187, 0.2)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {getActivityIcon(act.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc" }}>
                        {act.title}
                      </span>
                      {act.lead_company && (
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>({act.lead_company})</span>
                      )}
                    </div>

                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                    {act.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem", fontSize: "0.75rem", color: "#64748b" }}>
                    <span>Operator: <strong style={{ color: "#94a3b8" }}>{act.actor}</strong></span>
                    {act.lead_id && (
                      <Link href={`/crm/leads/${act.lead_id}`}>
                        <span style={{ color: "#63f5e8", cursor: "pointer" }}>Open Lead Desk &rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activities;
