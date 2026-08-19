import React, { useState } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { TrendingUp, FileText, Calendar, Filter, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

const reportData = {
  LEADS: [
    { name: "Jan", Contacts: 40, Opportunities: 24, Value: 2400 },
    { name: "Feb", Contacts: 30, Opportunities: 13, Value: 2210 },
    { name: "Mar", Contacts: 20, Opportunities: 98, Value: 2290 },
    { name: "Apr", Contacts: 27, Opportunities: 39, Value: 2000 },
    { name: "May", Contacts: 18, Opportunities: 48, Value: 2181 },
    { name: "Jun", Contacts: 23, Opportunities: 38, Value: 2500 },
  ],
  SALES: [
    { month: "Jan", target: 40000, revenue: 24000 },
    { month: "Feb", target: 50000, revenue: 45000 },
    { month: "Mar", target: 60000, revenue: 58000 },
    { month: "Apr", target: 60000, revenue: 48000 },
    { month: "May", target: 70000, revenue: 78000 },
    { month: "Jun", target: 80000, revenue: 95000 },
  ],
  SUPPORT: [
    { name: "Critical", value: 6, color: "#ef4444" },
    { name: "High", value: 12, color: "#f97316" },
    { name: "Medium", value: 8, color: "#eab308" },
    { name: "Low", value: 15, color: "var(--color-cyan)" },
  ],
  ACTIVITY: [
    { date: "08/10", logins: 120, edits: 45, apiCalls: 800 },
    { date: "08/11", logins: 145, edits: 60, apiCalls: 950 },
    { date: "08/12", logins: 130, edits: 55, apiCalls: 890 },
    { date: "08/13", logins: 180, edits: 88, apiCalls: 1240 },
    { date: "08/14", logins: 210, edits: 104, apiCalls: 1480 },
    { date: "08/15", logins: 240, edits: 112, apiCalls: 1670 },
  ]
};

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<keyof typeof reportData>("LEADS");
  const [timeRange, setTimeRange] = useState("30D");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow"><TrendingUp size={12} /> ANALYTICAL COMPUTATION MATRIX</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>System Reports</h1>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
            <Filter size={14} /> Report Type:
          </div>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              padding: "0.4rem 0.75rem",
              borderRadius: "6px",
              outline: "none",
              fontSize: "0.85rem"
            }}
          >
            <option value="LEADS">Lead Analytics</option>
            <option value="SALES">Sales Performance</option>
            <option value="SUPPORT">Support Distribution</option>
            <option value="ACTIVITY">User & System Activity</option>
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
            <Calendar size={14} /> Range:
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              padding: "0.4rem 0.75rem",
              borderRadius: "6px",
              outline: "none",
              fontSize: "0.85rem"
            }}
          >
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="12M">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Main Graph Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart2 size={16} style={{ color: "var(--color-cyan)" }} /> Interactive Data Visualization ({reportType})
          </CardTitle>
        </CardHeader>
        <CardContent style={{ height: "380px" }}>
          {reportType === "LEADS" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.LEADS}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" style={{ fontSize: "0.75rem" }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "0.75rem" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                <Bar dataKey="Contacts" name="Qualified Contacts" fill="var(--color-cyan-dim)" stroke="var(--color-cyan)" strokeWidth={1} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Opportunities" name="Opportunities Registered" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth={1} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {reportType === "SALES" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.SALES}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: "0.75rem" }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "0.75rem" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                <Area type="monotone" dataKey="revenue" name="Closed Revenue ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="target" name="Quota Target ($)" stroke="var(--color-text-muted)" fillOpacity={0} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {reportType === "SUPPORT" && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.SUPPORT}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {reportData.SUPPORT.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {reportType === "ACTIVITY" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.ACTIVITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: "0.75rem" }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "0.75rem" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                <Area type="monotone" dataKey="logins" name="Operator Sessions" stroke="var(--color-cyan)" fill="rgba(99, 245, 232, 0.05)" />
                <Area type="monotone" dataKey="apiCalls" name="API Calls (x10)" stroke="#a855f7" fill="rgba(168, 85, 247, 0.05)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Available Documents Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }} className="grid-responsive">
        {[
          { title: "Quarterly Estimator Report", size: "124 KB", updated: "Aug 14", type: "VALUATION" },
          { title: "BDM Lead Conversion Statistics", size: "450 KB", updated: "Aug 10", type: "PERFORMANCE" },
          { title: "Platform Compliance Integrity", size: "1.2 MB", updated: "Aug 01", type: "COMPLIANCE" }
        ].map((rep, idx) => (
          <Card key={idx} glowOnHover>
            <CardContent style={{ padding: "1.25rem" }}>
              <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)", backgroundColor: "rgba(99, 245, 232, 0.05)", border: "1px solid rgba(99, 245, 232, 0.15)", padding: "0.1rem 0.35rem", borderRadius: "3px" }}>
                {rep.type}
              </span>
              <h3 style={{ margin: "0.75rem 0", fontSize: "1rem", fontWeight: 600 }}>{rep.title}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "1rem" }}>
                <span>Size: {rep.size}</span>
                <span>Updated: {rep.updated}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
