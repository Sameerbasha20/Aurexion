import React from "react";
import { useBdmDashboard } from "../../hooks/useBdmDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../../../components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_submitted: "Proposal Submitted",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#63f5e8",
  under_review: "#fbbf24",
  contacted: "#60a5fa",
  qualified: "#34d399",
  proposal_submitted: "#a78bfa",
  negotiation: "#f472b6",
  won: "#22c55e",
  lost: "#ef4444",
};

const SOURCE_LABELS: Record<string, string> = {
  rfp_form: "RFP Form",
  contact_form: "Contact Form",
  request_quote: "Request Quote",
  estimator: "Estimator",
  website_form: "Website Form",
};

const SOURCE_COLORS: Record<string, string> = {
  rfp_form: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  contact_form: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  request_quote: "bg-green-500/20 text-green-400 border-green-500/30",
  estimator: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  website_form: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  color = "#63f5e8",
  icon,
  trend,
}) => (
  <Card glowOnHover>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon && <div className="text-2xl">{icon}</div>}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend && (
        <p className="text-xs mt-1" style={{ color: trend.value >= 0 ? "#22c55e" : "#ef4444" }}>
          {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </CardContent>
  </Card>
);

interface PipelineDataItem {
  status: string;
  total: number;
  color: string;
}

interface ActivityItem {
  id: number;
  action: string;
  repr: string;
  actor: string | null;
  timestamp: string;
}

export const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useBdmDashboard();

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>BDM Dashboard</h1>
        </div>
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} glowOnHover>
              <CardContent>
                <div style={{ height: "1.5rem", background: "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "0.5rem" }} />
                <div style={{ height: "3rem", background: "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "0.5rem", marginTop: "1rem" }} />
              </CardContent>
            </Card>
          ))}
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>BDM Dashboard</h1>
        </div>
        <Card borderAccent>
          <CardContent className="text-center py-8">
            <p style={{ color: "#ef4444" }}>Failed to load dashboard: {error}</p>
            <button onClick={refetch} className="mt-4 px-4 py-2 bg-[#63f5e8] text-[#050811] rounded font-medium">
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pipelineData: PipelineDataItem[] = data?.pipeline_summary?.map((item: { status: string; total: number }) => ({
    status: STATUS_LABELS[item.status] || item.status,
    total: item.total,
    color: STATUS_COLORS[item.status] || "#64748b",
  })) || [];

  const recentActivities: ActivityItem[] = data?.recent_activities || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>BDM Dashboard</h1>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-transparent border border-[#63f5e8] text-[#63f5e8] rounded font-medium hover:bg-[#63f5e8] hover:text-[#050811] transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        <MetricCard
          title="Total Leads"
          value={data?.total_leads || 0}
          subtitle={`${data?.assigned_leads || 0} assigned, ${data?.unassigned_leads || 0} unassigned`}
          color="#63f5e8"
        />
        <MetricCard
          title="New Leads"
          value={data?.new_leads || 0}
          subtitle="Awaiting initial contact"
          color="#60a5fa"
        />
        <MetricCard
          title="Qualified Leads"
          value={data?.qualified_leads || 0}
          subtitle="Ready for proposal"
          color="#34d399"
        />
        <MetricCard
          title="Active Opportunities"
          value={data?.active_opportunities || 0}
          subtitle="In negotiation pipeline"
          color="#a78bfa"
        />
        <MetricCard
          title="Overdue Follow-ups"
          value={data?.overdue_follow_ups || 0}
          subtitle="Requires immediate action"
          color="#ef4444"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(data?.conversion_rate || 0).toFixed(1)}%`}
          subtitle={`${data?.won_leads || 0} won / ${data?.lost_leads || 0} lost`}
          color="#fbbf24"
        />
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ChartContainer
                config={{
                  total: { label: "Leads", color: "#63f5e8" },
                }}
              >
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [value.toLocaleString(), "Leads"]}
                        labelFormatter={(label) => label}
                      />
                    }
                  />
                  <ChartLegend />
                  <ResponsiveContainer width="100%" height="100%">
                    <Bar
                      dataKey="total"
                      name="Leads"
                      radius={[0, 4, 4, 0]}
                      fill="#63f5e8"
                    />
                  </ResponsiveContainer>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {recentActivities.length > 0 ? (
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {recentActivities.map((activity: ActivityItem) => (
                    <li
                      key={activity.id}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        background: "rgba(99, 245, 232, 0.05)",
                        border: "1px solid rgba(99, 245, 232, 0.1)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 500, color: "#63f5e8", margin: 0 }}>
                          {activity.action}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>
                          {activity.repr}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                          {activity.actor || "System"}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Recent Form Submissions (RFP, Contact, Quote, Estimator) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recent_form_submissions?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data?.recent_form_submissions?.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1rem",
                    background: "rgba(99, 245, 232, 0.03)",
                    border: "1px solid rgba(99, 245, 232, 0.1)",
                    borderRadius: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#63f5e8" }}>
                        {submission.reference_id}
                      </span>
                      <Badge className={SOURCE_COLORS[submission.source] || "bg-gray-500/20 text-gray-400"}>
                        {SOURCE_LABELS[submission.source] || submission.source_display}
                      </Badge>
                    </div>
                    <p style={{ fontWeight: 500, color: "#f8fafc", margin: "0 0 0.25rem 0" }}>
                      {submission.name}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0 0 0.25rem 0" }}>
                      {submission.company || "—"}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
                      {submission.email}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", whiteSpace: "nowrap" }}>
                    <Badge className={STATUS_COLORS[submission.status] || "bg-gray-500/20 text-gray-400"}>
                      {STATUS_LABELS[submission.status] || submission.status}
                    </Badge>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, fontFamily: "IBM Plex Mono, monospace" }}>
                      {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>
              No recent form submissions
            </p>
          )}
        </CardContent>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;