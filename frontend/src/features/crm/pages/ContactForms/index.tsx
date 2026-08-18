import React, { useState } from "react";
import { Link } from "wouter";
import { useLeads } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Mail,
  Phone,
  Search,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Building,
  CheckCircle2,
} from "lucide-react";

export const ContactForms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { leads, isLoading, error, refetch } = useLeads({ page_size: 50 });

  const contactLeads = leads.filter((lead) => {
    const isContactSource =
      lead.source === "contact_form" ||
      lead.source === "website_form" ||
      lead.source === "website";

    const matchesSearch =
      !searchTerm ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.reference_id && lead.reference_id.toLowerCase().includes(searchTerm.toLowerCase()));

    return isContactSource && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>ASSIGNED DESK</p>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.72rem",
              color: "#63f5e8",
              backgroundColor: "rgba(99, 245, 232, 0.1)",
              padding: "0.1rem 0.5rem",
              borderRadius: "2px",
            }}>
              {contactLeads.length} Assigned Entries
            </span>
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Contact Forms Desk
          </h1>
        </div>

        <Button variant="outline" onClick={refetch} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <RefreshCw size={14} /> Refresh Leads
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: "1.25rem" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search assigned contact forms by name, email, company, or ID..."
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
      </Card>

      {/* Assigned Contact Leads List */}
      <Card style={{ padding: "1.5rem" }} borderAccent>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              LOADING ASSIGNED CONTACT FORMS...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p style={{ margin: 0 }}>{error}</p>
            <Button onClick={refetch} style={{ marginTop: "1rem" }}>
              Retry
            </Button>
          </div>
        ) : contactLeads.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
            <MessageSquare size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No assigned contact forms found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 0 0" }}>
              When BDM assigns an inbound contact form submission to you, it will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {contactLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1.25rem",
                  backgroundColor: "rgba(10, 17, 28, 0.6)",
                  border: "1px solid rgba(140, 174, 187, 0.15)",
                  borderRadius: "6px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.78rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
                      {lead.reference_id || `#LD-${lead.id}`}
                    </span>
                    <span
                      style={{
                        padding: "0.15rem 0.45rem",
                        borderRadius: "2px",
                        fontSize: "0.68rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        backgroundColor: "rgba(99, 245, 232, 0.12)",
                        color: "#63f5e8",
                        textTransform: "uppercase",
                      }}
                    >
                      {lead.source ? lead.source.replace("_", " ") : "Contact Form"}
                    </span>
                    <span
                      style={{
                        padding: "0.15rem 0.45rem",
                        borderRadius: "2px",
                        fontSize: "0.68rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        backgroundColor: "rgba(56, 189, 248, 0.12)",
                        color: "#38bdf8",
                      }}
                    >
                      {lead.status_display || lead.status}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", color: "#f8fafc" }}>
                    {lead.company ? `${lead.company} (${lead.name})` : lead.name}
                  </h3>

                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.82rem", color: "#94a3b8", flexWrap: "wrap" }}>
                    <a href={`mailto:${lead.email}`} style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Mail size={13} color="#63f5e8" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Phone size={13} color="#64748b" /> {lead.phone}
                      </a>
                    )}
                  </div>

                  {lead.description && (
                    <div style={{ marginTop: "0.6rem" }}>
                      <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>
                        <MessageSquare size={12} style={{ display: "inline", marginRight: "0.3rem" }} /> INQUIRY / MESSAGE BRIEF
                      </span>
                      <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#cbd5e1", backgroundColor: "rgba(5, 8, 17, 0.6)", padding: "0.6rem 0.75rem", borderRadius: "4px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {lead.description}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                    Received on {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  <Link href={`/crm/leads/${lead.id}`}>
                    <Button glow style={{ fontSize: "0.78rem" }}>
                      Open Desk &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContactForms;
