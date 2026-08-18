import React, { useState } from "react";
import { Link } from "wouter";
import { useOpportunities } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  TrendingUp,
  Award,
  Filter,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Search,
} from "lucide-react";

export const Opportunities: React.FC = () => {
  const { opportunities, isLoading, error, refetch } = useOpportunities();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.contact_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !stageFilter || opp.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const totalPipelineValue = opportunities
    .filter((o) => o.stage !== "LOST")
    .reduce((sum, o) => sum + (o.value || 0), 0);

  const wonValue = opportunities
    .filter((o) => o.stage === "WON")
    .reduce((sum, o) => sum + (o.value || 0), 0);

  const activeCount = opportunities.filter((o) => ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "IN_PROGRESS"].includes(o.stage)).length;

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "QUALIFIED":
        return { color: "#818cf8", bg: "rgba(129, 140, 248, 0.15)", border: "rgba(129, 140, 248, 0.3)" };
      case "PROPOSAL":
        return { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.3)" };
      case "NEGOTIATION":
        return { color: "#facc15", bg: "rgba(250, 204, 21, 0.15)", border: "rgba(250, 204, 21, 0.3)" };
      case "WON":
        return { color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)", border: "rgba(74, 222, 128, 0.3)" };
      case "LOST":
        return { color: "#f87171", bg: "rgba(248, 113, 113, 0.15)", border: "rgba(248, 113, 113, 0.3)" };
      default:
        return { color: "#cbd5e1", bg: "rgba(140, 174, 187, 0.15)", border: "rgba(140, 174, 187, 0.3)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>DEALS & OPPORTUNITIES</p>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Sales Opportunities Pipeline
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh Pipeline
          </Button>
          <Link href="/crm/leads">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <TrendingUp size={14} /> Convert Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>ACTIVE DEALS</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#63f5e8", margin: "0.3rem 0" }}>{activeCount}</p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>In negotiation/proposal</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>PIPELINE VALUE</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#f8fafc", margin: "0.3rem 0" }}>
            ${totalPipelineValue.toLocaleString()}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Total weighted potential</span>
        </Card>

        <Card glowOnHover style={{ padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>CLOSED WON VALUE</span>
          <p style={{ fontSize: "2rem", fontWeight: 600, color: "#4ade80", margin: "0.3rem 0" }}>
            ${wonValue.toLocaleString()}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Converted revenue</span>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search opportunities by title, client, or contact..."
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
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
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
              <option value="">All Opportunity Stages</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>

            {(searchTerm || stageFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStageFilter("");
                }}
                style={{ fontSize: "0.75rem" }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Opportunities Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              SYNCING PIPELINE OPPORTUNITIES...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p style={{ margin: 0 }}>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>
              Retry
            </Button>
          </div>
        ) : filteredOpps.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Award size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No active opportunities match</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Qualify active leads in the Leads Funnel to populate your opportunity pipeline.
            </p>
            <Link href="/crm/leads">
              <Button glow>Go to Leads Funnel</Button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    OPPORTUNITY / CLIENT
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CONTACT PERSON
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    STAGE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ESTIMATED VALUE
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    PROBABILITY
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ASSIGNED
                  </th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOpps.map((opp) => {
                  const badge = getStageBadge(opp.stage);
                  return (
                    <tr
                      key={opp.id}
                      style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem" }}>
                        <Link href={`/crm/leads/${opp.lead_id}`}>
                          <div style={{ fontWeight: 600, color: "#f8fafc", cursor: "pointer" }}>
                            {opp.title}
                          </div>
                        </Link>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Client: {opp.company}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ color: "#f8fafc", fontSize: "0.85rem" }}>{opp.contact_name}</div>
                        <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{opp.contact_email}</div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "3px",
                            fontSize: "0.72rem",
                            fontFamily: "IBM Plex Mono, monospace",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {opp.stage_display || opp.stage}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem", color: "#63f5e8", fontWeight: 600 }}>
                        ${opp.value.toLocaleString()}
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ width: "60px", height: "6px", backgroundColor: "rgba(140, 174, 187, 0.15)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${opp.probability}%`, height: "100%", backgroundColor: opp.probability >= 70 ? "#4ade80" : opp.probability >= 40 ? "#63f5e8" : "#facc15" }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                            {opp.probability}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#cbd5e1" }}>
                        {opp.assigned_to_name}
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <Link href={`/crm/leads/${opp.lead_id}`}>
                          <Button variant="outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                            Manage Deal &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Opportunities;
