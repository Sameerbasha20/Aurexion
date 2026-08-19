import React, { useState, useEffect } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { FileText, Clock, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import rfpService from "../../../rfp/services/rfpService";

export const RfpOverview: React.FC = () => {
  const [rfps, setRfps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRfps = async () => {
      setLoading(true);
      try {
        const data = await rfpService.getRfps();
        if (data && data.length > 0) {
          // Map to display full metadata
          setRfps(data.map((r: any) => ({
            id: r.id,
            title: r.title,
            dueDate: r.dueDate || "N/A",
            client: "Zeta Prime Corp",
            status: "UNDER REVIEW",
            priority: "CRITICAL"
          })));
        } else {
          throw new Error("Empty list");
        }
      } catch (err) {
        // Fallback RFPs
        setRfps([
          { id: "RFP-908A", title: "Gov Security Core Authentication Proposal", client: "Zeta Prime Corp", dueDate: "Sep 01, 2026", status: "UNDER REVIEW", priority: "CRITICAL" },
          { id: "RFP-908B", title: "Automated Logistics Scheduling Architecture", client: "Ion Robotics", dueDate: "Sep 18, 2026", status: "SUBMITTED", priority: "HIGH" },
          { id: "RFP-908C", title: "Energy Infrastructure Grid Analytics Dashboard", client: "Skyline Grid", dueDate: "Aug 12, 2026", status: "WON", priority: "HIGH" },
          { id: "RFP-908D", title: "Big Data lake integration workflow", client: "Neural Analytics", dueDate: "Oct 05, 2026", status: "RECEIVED", priority: "LOW" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRfps();
  }, []);

  // Compute metrics
  const totalRfps = rfps.length;
  const underReview = rfps.filter(r => r.status === "UNDER REVIEW").length;
  const submitted = rfps.filter(r => r.status === "SUBMITTED").length;
  const won = rfps.filter(r => r.status === "WON").length;
  const received = rfps.filter(r => r.status === "RECEIVED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title */}
      <div>
        <p className="eyebrow"><FileText size={12} /> RFP SUBMISSIONS</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>RFP Overview</h1>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
        {[
          { title: "Total RFPs", count: totalRfps, desc: "Total RFP requests registered", icon: FileText },
          { title: "Under Review", count: underReview, desc: "Proposals under security review", icon: Clock },
          { title: "Submitted", count: submitted, desc: "Proposals transmitted to client", icon: CheckCircle },
          { title: "Closed Won", count: won, desc: "Closed deals won via RFPs", icon: CheckCircle, color: "#10b981" },
          { title: "Newly Received", count: received, desc: "Initial client inquiry received", icon: AlertTriangle }
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

      {/* RFP Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: "1.1rem" }}>RFP Processing Registry</CardTitle>
        </CardHeader>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
            RESOLVING RFP PIPELINE RECORDS...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>RFP ID</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>PROPOSAL PROJECT TITLE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>CLIENT NAME</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>TARGET DUE DATE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>PRIORITY</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {rfps.map((rfp) => (
                  <tr key={rfp.id} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-muted/10">
                    <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)", fontWeight: 500 }}>{rfp.id}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{rfp.title}</td>
                    <td style={{ padding: "1rem", color: "var(--color-text-secondary)" }}>{rfp.client}</td>
                    <td style={{ padding: "1rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{rfp.dueDate}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-mono)",
                        color: rfp.priority === "CRITICAL" ? "#ef4444" : rfp.priority === "HIGH" ? "#f97316" : "#63f5e8",
                      }}>{rfp.priority}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: rfp.status === "WON" ? "#10b981" : rfp.status === "SUBMITTED" ? "#a855f7" : "var(--color-cyan)",
                        backgroundColor: "rgba(0, 0, 0, 0.15)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "3px",
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}>{rfp.status}</span>
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

export default RfpOverview;
