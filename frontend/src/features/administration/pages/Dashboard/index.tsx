import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { 
  Users as UsersIcon, 
  UserCheck, 
  TrendingUp, 
  FileText, 
  Building2, 
  MessageSquare, 
  Briefcase, 
  Globe, 
  ArrowRight,
  Shield,
  Activity,
  Plus,
  Key,
  Database,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import administrationService, { AdminDashboardOverviewData } from "../../services/administrationService";
import LeadDetailDrawer from "../../../crm/components/LeadDetailDrawer";

// Sample trend chart data
const activityData = [
  { month: "Jan", pageviews: 12000, apiRequests: 8000, activeUsers: 400 },
  { month: "Feb", pageviews: 19000, apiRequests: 14000, activeUsers: 600 },
  { month: "Mar", pageviews: 15000, apiRequests: 11000, activeUsers: 550 },
  { month: "Apr", pageviews: 22000, apiRequests: 18000, activeUsers: 800 },
  { month: "May", pageviews: 31000, apiRequests: 26000, activeUsers: 1100 },
  { month: "Jun", pageviews: 45920, apiRequests: 39800, activeUsers: 1382 },
];

const leadsData = [
  { month: "Jan", NewLeads: 25, WonDeals: 8 },
  { month: "Feb", NewLeads: 40, WonDeals: 15 },
  { month: "Mar", NewLeads: 35, WonDeals: 12 },
  { month: "Apr", NewLeads: 55, WonDeals: 22 },
  { month: "May", NewLeads: 70, WonDeals: 30 },
  { month: "Jun", NewLeads: 85, WonDeals: 42 },
];

const formatTimestamp = (isoString?: string) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "N/A";
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
};

export const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<AdminDashboardOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drawer State
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await administrationService.getDashboardOverview();
      if (data && typeof data === "object" && "users" in data) {
        setOverview(data);
      } else {
        throw new Error("Invalid API response format received");
      }
    } catch (err: any) {
      console.error("Failed to load dashboard overview", err);
      setError(err?.message || "Failed to load live backend metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenLeadDrawer = (leadId: number) => {
    setSelectedLeadId(leadId);
    setDrawerOpen(true);
  };

  const usersCount = overview?.users || { total: 0, active: 0, clients: 0, sales_executives: 0, bdms: 0, administrators: 0 };
  const leadsCount = overview?.leads || { total: 0, active: 0, won: 0, lost: 0, pending: 0 };
  const supportCount = overview?.support || { open: 0, critical: 0 };

  const stats = [
    { title: "Total System Users", value: usersCount.total, detail: `${usersCount.active} active accounts`, icon: UsersIcon, path: "/admin/users" },
    { title: "Registered Clients", value: usersCount.clients, detail: `${usersCount.clients} client portal accounts`, icon: Building2, path: "/admin/users?role=client_user" },
    { title: "Sales Executives", value: usersCount.sales_executives, detail: `${usersCount.sales_executives} active sales representatives`, icon: UserCheck, path: "/admin/users?role=sales_executive" },
    { title: "Total Leads", value: leadsCount.total, detail: `${leadsCount.active} active in pipeline`, icon: TrendingUp, path: "/admin/leads" },
    { title: "Pending New Leads", value: leadsCount.pending, detail: "Awaiting assignment/review", icon: FileText, path: "/admin/leads" },
    { title: "Deals Closed Won", value: leadsCount.won, detail: `${leadsCount.lost} marked lost`, icon: Shield, path: "/admin/leads" },
    { title: "Open Support Tickets", value: supportCount.open, detail: `${supportCount.critical} marked CRITICAL`, icon: MessageSquare, path: "/admin/support" },
    { title: "Website Traffic", value: "No data", detail: "Analytics data unavailable", icon: Globe, path: "/admin/cms" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title & Eyebrow */}
      <div>
        <p className="eyebrow"><Shield size={12} /> GLOBAL SYSTEM MASTER CONTROL</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>
          Administrator Control Center
        </h1>
      </div>

      {error && (
        <Card style={{ borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          <CardContent style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f87171", fontSize: "0.9rem" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={loadDashboardData} style={{ borderColor: "#ef4444", color: "#f87171" }}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.path}>
              <Card glowOnHover style={{ cursor: "pointer", height: "100%" }}>
                <CardContent style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      {stat.title}
                    </span>
                    <Icon size={16} style={{ color: "var(--color-cyan)" }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: "1.85rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                      color: "var(--color-text-primary)",
                    }}>{loading ? "..." : stat.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                      {stat.detail}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "1.5rem" }}>
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Globe size={16} style={{ color: "var(--color-cyan)" }} /> Platform Activity & API Traffic
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: "280px" }}>
            {!overview?.activity_chart || overview.activity_chart.length === 0 ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                No activity data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.activity_chart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-cyan)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                  <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }}
                    labelStyle={{ color: "var(--color-cyan)" }}
                  />
                  <Area type="monotone" dataKey="activityCount" name="System Activity Logs" stroke="var(--color-cyan)" fillOpacity={1} fill="url(#colorPv)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={16} style={{ color: "var(--color-cyan)" }} /> Lead Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: "280px" }}>
            {!overview?.pipeline_chart || overview.pipeline_chart.length === 0 ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                No lead pipeline data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.pipeline_chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="status" stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                  <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }}
                  />
                  <Bar dataKey="count" name="Lead Count" fill="var(--color-cyan-dim)" stroke="var(--color-cyan)" strokeWidth={1} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Data Feeds & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }} className="grid-responsive">
        
        {/* Left Side: Recent Tables */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Recent Leads */}
          <Card>
            <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle style={{ fontSize: "1.1rem" }}>Recent Lead Intake</CardTitle>
              <Link href="/admin/leads">
                <span style={{ fontSize: "0.8rem", color: "var(--color-cyan)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  All CRM Leads <ArrowRight size={14} />
                </span>
              </Link>
            </CardHeader>
            <CardContent style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>REF / NAME</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>COMPANY</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>CREATED AT</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>STATUS</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>ASSIGNED</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!overview?.recent_leads || overview.recent_leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                          No recent leads found.
                        </td>
                      </tr>
                    ) : (
                      overview.recent_leads.map((l) => (
                        <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-primary)", fontWeight: 500 }}>
                            <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)", display: "block" }}>
                              {l.reference_id}
                            </span>
                            {l.name}
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-secondary)" }}>{l.company || "N/A"}</td>
                          <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                            {formatTimestamp(l.created_at)}
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem" }}>
                            <span style={{
                              fontSize: "0.68rem",
                              fontFamily: "var(--font-mono)",
                              color: l.status === "won" ? "#4ade80" : l.status === "lost" ? "#f87171" : "var(--color-cyan)",
                              backgroundColor: l.status === "won" ? "rgba(34, 197, 94, 0.15)" : l.status === "lost" ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 245, 232, 0.08)",
                              border: "1px solid rgba(99, 245, 232, 0.15)",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "3px",
                              textTransform: "uppercase"
                            }}>{l.status_display || l.status}</span>
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
                            {l.assigned_to || "Unassigned"}
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem" }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenLeadDrawer(l.id)}
                              style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", gap: "0.2rem" }}
                            >
                              <Eye size={12} /> Inspect
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Audit Ledger */}
          <Card>
            <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle style={{ fontSize: "1.1rem" }}>System Audit Ledger</CardTitle>
              <Link href="/admin/audit-logs">
                <span style={{ fontSize: "0.8rem", color: "var(--color-cyan)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  Full Audit Logs <ArrowRight size={14} />
                </span>
              </Link>
            </CardHeader>
            <CardContent style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>TIMESTAMP</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>OPERATOR</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>ACTION</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!overview?.recent_activities || overview.recent_activities.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                          No recent audit logs.
                        </td>
                      </tr>
                    ) : (
                      overview.recent_activities.map((act) => (
                        <tr key={act.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {new Date(act.timestamp).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem", color: "#fff", fontWeight: 500 }}>{act.operator}</td>
                          <td style={{ padding: "0.75rem 0.5rem" }}>
                            <span style={{
                              fontSize: "0.68rem",
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-cyan)",
                              backgroundColor: "rgba(99, 245, 232, 0.08)",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "3px"
                            }}>{act.action}</span>
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
                            {act.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Quick Actions & System Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Quick Actions Card */}
          <Card borderAccent>
            <CardHeader>
              <CardTitle style={{ fontSize: "1.1rem" }}>Administrative Actions</CardTitle>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/admin/users">
                <Button glow style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}>
                  <Plus size={16} /> USER MANAGEMENT DIRECTORY
                </Button>
              </Link>
              <Link href="/admin/roles">
                <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                  <Shield size={16} /> CONFIGURE RBAC MATRIX
                </Button>
              </Link>
              <Link href="/admin/crm">
                <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                  <TrendingUp size={16} /> ALL LEAD RECORDS
                </Button>
              </Link>
              <Link href="/admin/audit-logs">
                <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                  <Activity size={16} /> AUDIT & INTEGRITY LOGS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Core System Status Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: "1.1rem" }}>Master Core Services</CardTitle>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { name: "API GATEWAY", details: "0ms latency - JWT Cookie Auth", status: "HEALTHY", icon: Globe },
                { name: "POSTGRESQL ORM", details: "Indexed query layer", status: "HEALTHY", icon: Database },
                { name: "AUDIT RECORDER", details: "Immutable security logging", status: "HEALTHY", icon: Shield },
              ].map((proc, index) => {
                const ProcIcon = proc.icon;
                return (
                  <div key={index} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255,255,255,0.01)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <ProcIcon size={14} style={{ color: "var(--color-cyan)" }} />
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{proc.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{proc.details}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: "0.68rem",
                      fontFamily: "var(--font-mono)",
                      color: "#4ade80",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "3px",
                      border: "1px solid rgba(34, 197, 94, 0.3)"
                    }}>{proc.status}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Lead Details Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={loadDashboardData}
      />
    </div>
  );
};

export default Dashboard;
