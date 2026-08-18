import React, { useState, useEffect } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Calculator, CheckCircle2, Clock, ShieldAlert, Award } from "lucide-react";
import estimatorService from "../../../estimator/services/estimatorService";

interface EstimateItem {
  id: string;
  project: string;
  devsCount: number;
  monthsCount: number;
  totalCost: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "FINAL";
  updatedAt: string;
}

export const EstimatorOverview: React.FC = () => {
  const [estimates, setEstimates] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimates = async () => {
      setLoading(true);
      try {
        // Fetch basic cost estimate using service to see if connection is healthy
        const result = await estimatorService.calculateProjectCost(5, 6);
        
        // Mock a list of multiple estimates including the calculated one
        setEstimates([
          { id: "EST-091", project: "Ion Logistics Scheduling System", devsCount: 8, monthsCount: 8, totalCost: "$640,000", status: "PENDING_APPROVAL", updatedAt: "Aug 15, 2026" },
          { id: "EST-092", project: "Zeta Prime AI Hosting Platform", devsCount: 4, monthsCount: 8, totalCost: "$320,000", status: "APPROVED", updatedAt: "Aug 14, 2026" },
          { id: "EST-093", project: "Skyline Grid Forecasting Dashboard", devsCount: result.devsCount, monthsCount: result.monthsCount, totalCost: "$" + result.totalCost.toLocaleString(), status: "FINAL", updatedAt: "Aug 12, 2026" },
          { id: "EST-094", project: "Neural Analytics Data Pipeline", devsCount: 3, monthsCount: 6, totalCost: "$180,000", status: "PENDING_APPROVAL", updatedAt: "Aug 11, 2026" }
        ]);
      } catch (err) {
        // Fallback list
        setEstimates([
          { id: "EST-091", project: "Ion Logistics Scheduling System", devsCount: 8, monthsCount: 8, totalCost: "$640,000", status: "PENDING_APPROVAL", updatedAt: "Aug 15, 2026" },
          { id: "EST-092", project: "Zeta Prime AI Hosting Platform", devsCount: 4, monthsCount: 8, totalCost: "$320,000", status: "APPROVED", updatedAt: "Aug 14, 2026" },
          { id: "EST-093", project: "Skyline Grid Forecasting Dashboard", devsCount: 5, monthsCount: 6, totalCost: "$300,000", status: "FINAL", updatedAt: "Aug 12, 2026" },
          { id: "EST-094", project: "Neural Analytics Data Pipeline", devsCount: 3, monthsCount: 6, totalCost: "$180,000", status: "PENDING_APPROVAL", updatedAt: "Aug 11, 2026" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEstimates();
  }, []);

  const handleApproveEstimate = (id: string) => {
    setEstimates(estimates.map(est => {
      if (est.id === id) {
        return {
          ...est,
          status: "APPROVED",
          updatedAt: new Date().toLocaleDateString()
        };
      }
      return est;
    }));
  };

  // Compute metrics
  const totalEstimates = estimates.length;
  const pending = estimates.filter(e => e.status === "PENDING_APPROVAL").length;
  const approved = estimates.filter(e => e.status === "APPROVED").length;
  const final = estimates.filter(e => e.status === "FINAL").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title */}
      <div>
        <p className="eyebrow"><Calculator size={12} /> COST ESTIMATION ENGINE</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>Estimator Overview</h1>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
        {[
          { title: "Total Estimations", count: totalEstimates, desc: "Valuations created by BDM", icon: Calculator },
          { title: "Pending Approval", count: pending, desc: "Requires administrative review", icon: Clock },
          { title: "Approved Estimates", count: approved, desc: "Ready for proposal pricing", icon: CheckCircle2, color: "#10b981" },
          { title: "Final Agreements", count: final, desc: "Contracts executed under estimate", icon: Award }
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
                <StatIcon size={24} style={{ color: "var(--color-cyan)" }} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: "1.1rem" }}>Cost Estimates Approval Ledger</CardTitle>
        </CardHeader>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
            RESOLVING COST MODEL SCHEMAS...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>ESTIMATE ID</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>PROJECT TARGET</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>DEV COUNT</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>MONTHS</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>BUDGET VALUATION</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STATUS</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((est) => (
                  <tr key={est.id} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-muted/10">
                    <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)", fontWeight: 500 }}>{est.id}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{est.project}</td>
                    <td style={{ padding: "1rem", textAlign: "center", fontFamily: "var(--font-mono)" }}>{est.devsCount}</td>
                    <td style={{ padding: "1rem", textAlign: "center", fontFamily: "var(--font-mono)" }}>{est.monthsCount}</td>
                    <td style={{ padding: "1rem", color: "var(--color-text-primary)", fontWeight: 500 }}>{est.totalCost}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: est.status === "FINAL" ? "#10b981" : est.status === "APPROVED" ? "var(--color-cyan)" : "#eab308",
                        backgroundColor: "rgba(0, 0, 0, 0.15)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "3px",
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}>{est.status.replace("_", " ")}</span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      {est.status === "PENDING_APPROVAL" && (
                        <Button variant="outline" size="sm" onClick={() => handleApproveEstimate(est.id)} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", borderColor: "var(--color-border)", color: "var(--color-cyan)" }}>
                          <CheckCircle2 size={12} /> Approve Cost
                        </Button>
                      )}
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

export default EstimatorOverview;
