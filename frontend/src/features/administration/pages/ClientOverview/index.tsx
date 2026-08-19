import React, { useState, useEffect } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Building2, Briefcase, FileText, MessageSquareCode, ShieldAlert } from "lucide-react";
import portalService from "../../../portal/services/portalService";

interface ClientAccount {
  id: string;
  name: string;
  domain: string;
  projectsCount: number;
  documentsCount: number;
  ticketsCount: number;
  status: "ACTIVE" | "INACTIVE";
}

export const ClientOverview: React.FC = () => {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const prj = await portalService.getProjects();
        const doc = await portalService.getDocuments();
        const tck = await portalService.getAllTickets();

        setClients([
          { id: "CL-901", name: "Zeta Prime Corp", domain: "zetaprime.com", projectsCount: prj.length, documentsCount: doc.length, ticketsCount: tck.filter(t => t.client_username === "venkat@aurexion.io").length, status: "ACTIVE" },
          { id: "CL-902", name: "Ion Robotics", domain: "ionrobot.io", projectsCount: 1, documentsCount: 3, ticketsCount: 1, status: "ACTIVE" },
          { id: "CL-903", name: "Neural Analytics", domain: "neural.net", projectsCount: 0, documentsCount: 1, ticketsCount: 0, status: "ACTIVE" },
          { id: "CL-904", name: "Skyline Grid", domain: "skyline.org", projectsCount: 2, documentsCount: 4, ticketsCount: 2, status: "ACTIVE" }
        ]);
      } catch (err) {
        // Fallback
        setClients([
          { id: "CL-901", name: "Zeta Prime Corp", domain: "zetaprime.com", projectsCount: 1, documentsCount: 2, ticketsCount: 1, status: "ACTIVE" },
          { id: "CL-902", name: "Ion Robotics", domain: "ionrobot.io", projectsCount: 1, documentsCount: 3, ticketsCount: 1, status: "ACTIVE" },
          { id: "CL-903", name: "Neural Analytics", domain: "neural.net", projectsCount: 0, documentsCount: 1, ticketsCount: 0, status: "ACTIVE" },
          { id: "CL-904", name: "Skyline Grid", domain: "skyline.org", projectsCount: 2, documentsCount: 4, ticketsCount: 2, status: "ACTIVE" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === "ACTIVE").length;
  const totalProjects = clients.reduce((acc, c) => acc + c.projectsCount, 0);
  const totalDocs = clients.reduce((acc, c) => acc + c.documentsCount, 0);
  const totalTickets = clients.reduce((acc, c) => acc + c.ticketsCount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Title */}
      <div>
        <p className="eyebrow"><Building2 size={12} /> PARTNER CORPORATIONS</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>Client Accounts Overview</h1>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
        {[
          { title: "Total Clients", count: totalClients, desc: "Onboarded accounts", icon: Building2 },
          { title: "Active Clients", count: activeClients, desc: "Operational accounts", icon: Building2, color: "#10b981" },
          { title: "Active Projects", count: totalProjects, desc: "Currently in development", icon: Briefcase },
          { title: "Vault Documents", count: totalDocs, desc: "Service agreements & briefs", icon: FileText },
          { title: "Support Tickets", count: totalTickets, desc: "Assigned inquiries", icon: MessageSquareCode }
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

      {/* Clients Directory */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: "1.1rem" }}>Clients Registry & Vault Scopes</CardTitle>
        </CardHeader>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
            RESOLVING PARTNER DIRECTORIES...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>CLIENT ID</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>COMPANY NAME</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>DOMAIN</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>ACTIVE PROJECTS</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>VAULT DOCUMENTS</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center" }}>OPEN TICKETS</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-muted/10">
                    <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)", fontWeight: 500 }}>{c.id}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{c.name}</td>
                    <td style={{ padding: "1rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{c.domain}</td>
                    <td style={{ padding: "1rem", textAlign: "center", fontFamily: "var(--font-mono)" }}>{c.projectsCount}</td>
                    <td style={{ padding: "1rem", textAlign: "center", fontFamily: "var(--font-mono)" }}>{c.documentsCount}</td>
                    <td style={{ padding: "1rem", textAlign: "center", fontFamily: "var(--font-mono)" }}>{c.ticketsCount}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: c.status === "ACTIVE" ? "#10b981" : "#ef4444",
                        backgroundColor: "rgba(0,0,0,0.15)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "3px",
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}>{c.status}</span>
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

export default ClientOverview;
