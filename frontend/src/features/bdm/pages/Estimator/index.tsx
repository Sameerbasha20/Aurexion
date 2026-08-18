import React, { useState } from "react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";

export const Estimator: React.FC = () => {
  const [developerCount, setDeveloperCount] = useState(5);
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [calculatedCost, setCalculatedCost] = useState(0);

  const calculateEstimate = () => {
    // Basic mock calculation rate: $10,000 per dev per month
    const estimate = developerCount * timelineMonths * 10000;
    setCalculatedCost(estimate);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "100%" }}>
      <div>
        <p className="eyebrow" style={{ color: "#63f5e8", margin: 0 }}>ESTIMATOR ENGINE</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>Project Cost Estimator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ width: "100%", alignItems: "stretch" }}>
        <Card style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box", minHeight: "340px" }}>
          <div>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", fontWeight: 500 }}>Input Scope Parameters</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label htmlFor="devs" style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                  ENGINEERING HEADCOUNT (DEVS)
                </label>
                <input
                  id="devs"
                  type="number"
                  value={developerCount}
                  onChange={(e) => setDeveloperCount(parseInt(e.target.value) || 0)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 0.75rem",
                    borderRadius: "4px",
                    backgroundColor: "#050811",
                    border: "1px solid #1e293b",
                    color: "#eef4f3",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color 150ms",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#63f5e8")}
                  onBlur={(e) => (e.target.style.borderColor = "#1e293b")}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label htmlFor="months" style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                  PROJECT TIMELINE (MONTHS)
                </label>
                <input
                  id="months"
                  type="number"
                  value={timelineMonths}
                  onChange={(e) => setTimelineMonths(parseInt(e.target.value) || 0)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 0.75rem",
                    borderRadius: "4px",
                    backgroundColor: "#050811",
                    border: "1px solid #1e293b",
                    color: "#eef4f3",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color 150ms",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#63f5e8")}
                  onBlur={(e) => (e.target.style.borderColor = "#1e293b")}
                />
              </div>
            </div>
          </div>
          <Button onClick={calculateEstimate} glow style={{ width: "100%", height: "46px", marginTop: "24px" }}>
            RUN SIMULATE CALCULATION
          </Button>
        </Card>

        <Card borderAccent style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box", minHeight: "340px" }}>
          <div>
            <p className="eyebrow" style={{ color: "#63f5e8", margin: 0 }}>CALCULATION OUTPUT</p>
            <h3 style={{ margin: "0.5rem 0 0 0", fontSize: "1.25rem", fontWeight: 500 }}>Project Cost Valuation</h3>
            <div style={{
              fontSize: "3.5rem",
              fontWeight: 600,
              fontFamily: "Space Grotesk, sans-serif",
              color: "#63f5e8",
              margin: "2rem 0",
              lineHeight: 1.1,
            }}>
              ${calculatedCost.toLocaleString()}
            </div>
          </div>
          <div style={{ color: "#64748b", fontSize: "0.8rem", lineHeight: 1.5 }}>
            Based on core developer allocation of $10,000 / month / developer.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Estimator;

