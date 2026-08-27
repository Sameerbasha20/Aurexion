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
  Database
} from "lucide-react";
import { useIsMobile } from "../../../../hooks/useMobile";
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
import administrationService from "../../services/administrationService";
import crmService from "../../../crm/services/crmService";
import supportService from "../../../support/services/supportService";
import useAuth from "../../../../hooks/useAuth";

// Mock/Standard charts data
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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "ADMIN" && user?.rawRole === "super_admin";
  const isMobile = useIsMobile();
  const [usersCount, setUsersCount] = useState({ total: 1424, active: 1382 });
  const [leadsCount, setLeadsCount] = useState({ total: 642, unassignedRfps: 12 });
  const [supportTicketsCount, setSupportTicketsCount] = useState({ open: 18, critical: 6 });
  const [recruitmentCount, setRecruitmentCount] = useState({ applications: 87, vacancies: 14 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [openTickets, setOpenTickets] = useState<any[]>([]);

  useEffect(() => {
    // Attempt loading real data from services with robust fallbacks
    const loadDashboardData = async () => {
      try {
        const u = await administrationService.getUsers();
        if (u && u.length > 0) {
          setUsersCount({
            total: u.length,
            active: u.filter(user => user.status === "ACTIVE").length
          });
          setRecentUsers(u.slice(0, 4));
        } else {
          setRecentUsers([
            { id: "usr_10", name: "Venkat G.", email: "venkat@aurexion.io", role: "ADMIN", status: "ACTIVE" },
            { id: "usr_11", name: "Alice S.", email: "alice@aurexion.io", role: "BDM", status: "ACTIVE" },
            { id: "usr_12", name: "Marcus L.", email: "marcus@client.com", role: "CLIENT", status: "ACTIVE" },
            { id: "usr_13", name: "Sarah K.", email: "sarah@aurexion.io", role: "SALES_EXECUTIVE", status: "ACTIVE" },
          ]);
        }
      } catch (err) {
        // Safe fallback
      }

      try {
        const l = await crmService.getLeads();
        if (l && l.length > 0) {
          setLeadsCount({
            total: l.length,
            unassignedRfps: l.filter(lead => lead.status === "NEW").length
          });
          setRecentLeads(l.slice(0, 4));
        } else {
          setRecentLeads([
            { id: 101, name: "Zeta Prime Corp", status_display: "Proposal", value: "$320,000" },
            { id: 102, name: "Ion Robotics", status_display: "Negotiation", value: "$640,000" },
            { id: 103, name: "Neural Analytics", status_display: "Lead", value: "$120,000" },
            { id: 104, name: "Skyline Grid", status_display: "Won", value: "$450,000" }
          ]);
        }
      } catch (err) {
        // Safe fallback
      }

      try {
        const t = await supportService.getAdminTickets();
        if (t && t.length > 0) {
          setSupportTicketsCount({
            open: t.filter(ticket => ticket.status !== "resolved" && ticket.status !== "closed").length,
            critical: t.filter(ticket => ticket.priority === "critical").length
          });
          setOpenTickets(t.slice(0, 4));
        } else {
          setOpenTickets([
            { id: "tck_1", subject: "API Gateway latency spikes", client_username: "venkat@aurexion.io", priority: "HIGH", status: "OPEN" },
            { id: "tck_2", subject: "Estimator xlsx parse failure", client_username: "sarah@aurexion.io", priority: "CRITICAL", status: "ASSIGNED" },
            { id: "tck_3", subject: "SMTP credential renewal required", client_username: "system@aurexion.io", priority: "LOW", status: "OPEN" }
          ]);
        }
      } catch (err) {
        // Safe fallback
      }
    };

    loadDashboardData();
  }, []);

  const stats = isSuperAdmin ? [
    { title: "Total Users", value: usersCount.total, detail: `${usersCount.active} active profiles`, icon: UsersIcon, path: "/admin/users" },
    { title: "Active Operators", value: usersCount.active, detail: "All permissions secure", icon: UserCheck, path: "/admin/roles" },
    { title: "Total Leads", value: leadsCount.total, detail: "Qualified CRM targets", icon: TrendingUp, path: "/admin/crm" },
    { title: "Unassigned RFPs", value: leadsCount.unassignedRfps, detail: "Requires immediate assignment", icon: FileText, path: "/admin/rfp" },
    { title: "Active Clients", value: 98, detail: "8 pipeline contracts", icon: Building2, path: "/admin/clients" },
    { title: "Open Support Tickets", value: supportTicketsCount.open, detail: `${supportTicketsCount.critical} marked CRITICAL`, icon: MessageSquare, path: "/admin/support" },
    { title: "Job Applications", value: recruitmentCount.applications, detail: `${recruitmentCount.vacancies} vacant positions`, icon: Briefcase, path: "/admin/recruitment" },
    { title: "Website Activity", value: "45.9k", detail: "Platform views monthly", icon: Globe, path: "/admin/cms" },
  ] : [
    { title: "Total Accounts", value: usersCount.total, detail: `${usersCount.active} active logins`, icon: UsersIcon, path: "/admin/users" },
    { title: "Active Operators", value: usersCount.active, detail: "Staff and executive roles", icon: UserCheck, path: "/admin/roles" },
    { title: "CRM Leads", value: leadsCount.total, detail: "Total pipeline items", icon: TrendingUp, path: "/admin/crm" },
    { title: "RFPs Pending", value: leadsCount.unassignedRfps, detail: "Awaiting review", icon: FileText, path: "/admin/rfp" },
    { title: "Managed Clients", value: 98, detail: "Contracted accounts", icon: Building2, path: "/admin/clients" },
    { title: "Support Queue", value: supportTicketsCount.open, detail: `${supportTicketsCount.critical} critical tickets`, icon: MessageSquare, path: "/admin/support" },
    { title: "Open Positions", value: recruitmentCount.vacancies, detail: `${recruitmentCount.applications} applicants pending`, icon: Briefcase, path: "/admin/recruitment" },
    { title: "Content Articles", value: "142", detail: "Published CMS pages", icon: FileText, path: "/admin/cms" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title & Eyebrow */}
      <div>
        <p className="eyebrow">
          <Shield size={12} style={{ color: isSuperAdmin ? "#c084fc" : "var(--color-cyan)" }} />{" "}
          {isSuperAdmin ? "GLOBAL SYSTEM MASTER CONTROL" : "ENTERPRISE OPERATOR PANEL"}
        </p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {isSuperAdmin ? "Super Admin Dashboard" : "Administrator Dashboard"}
        </h1>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.path}>
              <Card glowOnHover style={{ cursor: "pointer", height: "100%" }}>
                <CardContent style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      {stat.title}
                    </span>
                    <Icon size={16} style={{ color: isSuperAdmin ? "#c084fc" : "var(--color-cyan)" }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: "2rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                      color: "var(--color-text-primary)",
                    }}>{stat.value}</div>
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
              <Globe size={16} style={{ color: isSuperAdmin ? "#c084fc" : "var(--color-cyan)" }} />{" "}
              {isSuperAdmin ? "Platform Activity & API Traffic" : "User Activity & Actions"}
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isSuperAdmin ? "#c084fc" : "var(--color-cyan)"} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={isSuperAdmin ? "#c084fc" : "var(--color-cyan)"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }}
                  labelStyle={{ color: isSuperAdmin ? "#c084fc" : "var(--color-cyan)" }}
                />
                <Area type="monotone" dataKey="pageviews" name={isSuperAdmin ? "Page Views" : "Total Actions"} stroke={isSuperAdmin ? "#c084fc" : "var(--color-cyan)"} fillOpacity={1} fill="url(#colorPv)" />
                <Area type="monotone" dataKey={isSuperAdmin ? "apiRequests" : "activeUsers"} name={isSuperAdmin ? "API Calls" : "Active Operators"} stroke={isSuperAdmin ? "#a855f7" : "#0ea5e9"} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={16} style={{ color: isSuperAdmin ? "#c084fc" : "var(--color-cyan)" }} /> Lead Pipeline Performance
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: "0.7rem" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0c1222", borderColor: "#1e293b", color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Bar dataKey="NewLeads" name="New Pipeline Leads" fill="var(--color-cyan-dim)" stroke="var(--color-cyan)" strokeWidth={1} radius={[2, 2, 0, 0]} />
                <Bar dataKey="WonDeals" name="Deals Closed Won" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth={1} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Data Feeds & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "1.5rem" }} className="grid-responsive">
        
        {/* Left Side: Recent Tables */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Recent Leads */}
          <Card>
            <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <CardTitle style={{ fontSize: isMobile ? "0.95rem" : "1.1rem" }}>Pipeline Targets (Leads)</CardTitle>
              <Link href="/admin/crm">
                <span style={{ fontSize: "0.8rem", color: "var(--color-cyan)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  CRM Funnel <ArrowRight size={14} />
                </span>
              </Link>
            </CardHeader>
            <CardContent style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: isMobile ? "280px" : "auto", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", whiteSpace: "nowrap" }}>LEAD/COMPANY</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", whiteSpace: "nowrap" }}>VALUE</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", whiteSpace: "nowrap" }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((l, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-primary)", fontWeight: 500 }}>{l.name || l.company}</td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-secondary)" }}>{l.value || "$250,000"}</td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-cyan)",
                            backgroundColor: "rgba(99, 245, 232, 0.05)",
                            border: "1px solid rgba(99, 245, 232, 0.15)",
                            padding: "0.1rem 0.3rem",
                            borderRadius: "3px"
                          }}>{l.status_display || l.status || "NEW"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Open Tickets */}
          <Card>
            <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <CardTitle style={{ fontSize: isMobile ? "0.95rem" : "1.1rem" }}>Active Support Queue</CardTitle>
              <Link href="/admin/support">
                <span style={{ fontSize: "0.8rem", color: "var(--color-cyan)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  Support Center <ArrowRight size={14} />
                </span>
              </Link>
            </CardHeader>
            <CardContent style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: isMobile ? "280px" : "auto", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", whiteSpace: "nowrap" }}>TICKET ID</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", whiteSpace: "nowrap" }}>SUBJECT</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", whiteSpace: "nowrap" }}>PRIORITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTickets.map((t, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)" }}>{(t.ticket_id || t.id).toUpperCase()}</td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-primary)" }}>{t.subject}</td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            color: t.priority === "CRITICAL" ? "#ef4444" : t.priority === "HIGH" ? "#f97316" : "#63f5e8",
                            backgroundColor: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            padding: "0.1rem 0.3rem",
                            borderRadius: "3px"
                          }}>{t.priority}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Quick Actions & System Processes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Quick Actions Card */}
          <Card borderAccent>
            <CardHeader>
              <CardTitle style={{ fontSize: "1.1rem" }}>Administrative Actions</CardTitle>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/admin/users">
                <Button glow style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", background: isSuperAdmin ? "var(--color-purple)" : undefined }}>
                  <Plus size={16} /> CREATE NEW OPERATOR
                </Button>
              </Link>
              {isSuperAdmin ? (
                <>
                  <Link href="/admin/roles">
                    <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                      <Shield size={16} /> MODIFY RBAC MATRIX
                    </Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                      <Key size={16} /> ROTATE API GATEWAY KEYS
                    </Button>
                  </Link>
                  <Link href="/admin/audit-logs">
                    <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                      <Activity size={16} /> VIEW SECURE LEDGER
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/admin/clients">
                    <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                      <Building2 size={16} /> MANAGE CLIENT LIST
                    </Button>
                  </Link>
                  <Link href="/admin/support">
                    <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                      <MessageSquare size={16} /> OPEN SUPPORT DESK
                    </Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", borderColor: "var(--color-border)" }}>
                      <Settings size={16} /> VIEW SYSTEM SETTINGS
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
 
          {/* System Processes Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: "1.1rem" }}>
                {isSuperAdmin ? "Master Core Services" : "Operational Gateways"}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(isSuperAdmin ? [
                { name: "API GATEWAY", details: "0ms latency", status: "ONLINE", icon: Globe },
                { name: "ESTIMATOR ENGINE", details: "v1.2.0-core", status: "ONLINE", icon: Database },
                { name: "AUDIT RECORDER", details: "verified secure", status: "ONLINE", icon: Shield },
              ] : [
                { name: "CRM SYNC GATEWAY", details: "synced 2m ago", status: "ONLINE", icon: Globe },
                { name: "EMAIL SERVER", details: "SMTP active", status: "ONLINE", icon: Database },
                { name: "CLIENT PORTAL ENGINE", details: "v1.1.5-deploy", status: "ONLINE", icon: Shield },
              ]).map((proc, index) => {
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
                      <ProcIcon size={14} style={{ color: isSuperAdmin ? "#c084fc" : "var(--color-cyan)" }} />
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{proc.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{proc.details}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: "0.7rem",
                      fontFamily: "var(--font-mono)",
                      color: isSuperAdmin ? "#c084fc" : "var(--color-cyan)",
                      backgroundColor: isSuperAdmin ? "rgba(192, 132, 252, 0.05)" : "rgba(99, 245, 232, 0.05)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "3px",
                      border: isSuperAdmin ? "1px solid rgba(192, 132, 252, 0.15)" : "1px solid rgba(99, 245, 232, 0.15)"
                    }}>{proc.status}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
