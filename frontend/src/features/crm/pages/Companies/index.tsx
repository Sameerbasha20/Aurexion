import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCompaniesQuery } from "../../../../queries/useCrmQueries";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import LoadingState from "../../../../components/feedback/LoadingState";
import ErrorState from "../../../../components/feedback/ErrorState";
import EmptyState from "../../../../components/feedback/EmptyState";
import { Building, Search, Globe, Mail, Phone, RefreshCw } from "lucide-react";

export const Companies: React.FC = () => {
  const [, navigate] = useLocation();
  const { data: companies = [], isLoading, error, refetch } = useCompaniesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCompanies = companies.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.primary_contact.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalItems = filteredCompanies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + pageSize);

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
        <LoadingState message="Initializing company registry..." />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          title="No companies found"
          message="Companies are automatically registered as you establish enterprise leads."
          action={{ label: "Create Lead", onClick: () => navigate("/crm/leads") }}
        />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {paginatedCompanies.map((company) => (
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
                        <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#63f5e8" }}>
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

          {/* Standardized Pagination Controls */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid rgba(140, 174, 187, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "#94a3b8",
            }}
          >
            <div>
              Showing <strong style={{ color: "#f8fafc" }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
              <strong style={{ color: "#f8fafc" }}>{endIndex}</strong> of{" "}
              <strong style={{ color: "#f8fafc" }}>{totalItems}</strong> entries
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140, 174, 187, 0.25)",
                    color: "#f8fafc",
                    borderRadius: "4px",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <Button
                  variant="outline"
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                >
                  Previous
                </Button>
                <span style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Companies;
