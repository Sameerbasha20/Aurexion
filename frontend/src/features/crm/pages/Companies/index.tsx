import React, { useState } from "react";
import { Link } from "wouter";
import { useCompanies } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Building,
  Search,
  Globe,
  Mail,
  Phone,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

export const Companies: React.FC = () => {
  const { companies, isLoading, error, refetch } = useCompanies();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = companies.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.primary_contact.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>CLIENT REGISTRY</p>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Company Registry
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/crm/leads">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Building size={14} /> Leads Funnel
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search companies by name, industry, or contact..."
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

          <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace" }}>
            {filteredCompanies.length} Organizations Registered
          </span>
        </div>
      </Card>

      {/* Companies Grid / Table */}
      {isLoading ? (
        <Card style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
            INITIALIZING COMPANY REGISTRY...
          </p>
        </Card>
      ) : error ? (
        <Card style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
          <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
          <p>{error}</p>
          <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
        </Card>
      ) : filteredCompanies.length === 0 ? (
        <Card style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
          <Building size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No companies found</h3>
          <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
            Companies are automatically registered as you establish enterprise leads.
          </p>
          <Link href="/crm/leads">
            <Button glow>Create Lead</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filteredCompanies.map((company) => (
            <Card key={company.id} glowOnHover style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", margin: 0, color: "#f8fafc" }}>
                    {company.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontFamily: "IBM Plex Mono, monospace",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "2px",
                      backgroundColor: "rgba(99, 245, 232, 0.1)",
                      color: "#63f5e8",
                    }}
                  >
                    {company.total_leads} {company.total_leads === 1 ? "Lead" : "Leads"}
                  </span>
                </div>

                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1rem" }}>
                  {company.industry}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem" }}>
                  <div style={{ color: "#cbd5e1" }}>
                    Primary: <strong style={{ color: "#f8fafc" }}>{company.primary_contact}</strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8" }}>
                    <Mail size={13} color="#63f5e8" />
                    <a href={`mailto:${company.email}`} style={{ color: "#63f5e8", textDecoration: "none" }}>
                      {company.email}
                    </a>
                  </div>

                  {company.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8" }}>
                      <Phone size={13} color="#64748b" />
                      <span>{company.phone}</span>
                    </div>
                  )}

                  {company.website && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8" }}>
                      <Globe size={13} color="#64748b" />
                      <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" style={{ color: "#63f5e8" }}>
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(140, 174, 187, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                  Status: {company.status}
                </span>

                <Link href={`/crm/leads`}>
                  <Button variant="outline" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>
                    View Funnel &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
