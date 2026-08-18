import React, { useState } from "react";
import { Link } from "wouter";
import { useContacts } from "../../hooks/useCrm";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export const Contacts: React.FC = () => {
  const { contacts, isLoading, error, refetch } = useContacts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>CLIENT DIRECTORY</p>
          <h1 style={{ fontSize: "2.2rem", margin: "0.35rem 0 0 0", letterSpacing: "-0.04em" }}>
            Contacts Directory
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="outline" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/crm/leads">
            <Button glow style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Users size={14} /> Leads Funnel
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
              placeholder="Search contacts by name, email, company, or phone..."
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
            {filteredContacts.length} Contacts Found
          </span>
        </div>
      </Card>

      {/* Contacts Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
              FETCHING CLIENT DIRECTORY...
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 1rem" }} />
            <p>{error}</p>
            <Button onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</Button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <Users size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: 0 }}>No contacts found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Contacts will automatically appear as you establish leads in the system.
            </p>
            <Link href="/crm/leads">
              <Button glow>Create Lead</Button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(10, 17, 28, 0.8)", borderBottom: "1px solid rgba(140, 174, 187, 0.2)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    CONTACT PERSON
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    COMPANY & INDUSTRY
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    DIRECT REACH
                  </th>
                  <th style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    STATUS
                  </th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", transition: "background-color 150ms" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 245, 232, 0.02)")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600, color: "#f8fafc" }}>{contact.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                        Added {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ color: "#cbd5e1", fontWeight: 500 }}>{contact.company || "Direct Individual"}</div>
                      {contact.industry && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{contact.industry}</div>
                      )}
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <a
                          href={`mailto:${contact.email}`}
                          style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#63f5e8", textDecoration: "none", fontSize: "0.8rem" }}
                        >
                          <Mail size={12} /> {contact.email}
                        </a>
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#94a3b8", textDecoration: "none", fontSize: "0.75rem" }}
                          >
                            <Phone size={12} /> {contact.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "2px",
                          fontSize: "0.7rem",
                          fontFamily: "IBM Plex Mono, monospace",
                          backgroundColor: "rgba(99, 245, 232, 0.1)",
                          color: "#63f5e8",
                        }}
                      >
                        {contact.lead_status}
                      </span>
                    </td>

                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <Link href={`/crm/leads/${contact.lead_id}`}>
                        <Button variant="outline" style={{ padding: "0.35rem 0.7rem", fontSize: "0.75rem" }}>
                          View Lead <ExternalLink size={12} style={{ marginLeft: "0.3rem" }} />
                        </Button>
                      </Link>
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

export default Contacts;
