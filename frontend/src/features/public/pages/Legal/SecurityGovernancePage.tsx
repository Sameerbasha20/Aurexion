import React from "react";
import { Link } from "wouter";
import { ArrowUpRight, Shield, Lock, Eye, AlertTriangle, Server, Key } from "lucide-react";

const PILLARS = [
  {
    icon: Lock,
    title: "Encryption at Rest & In Transit",
    description:
      "All data stored in our PostgreSQL databases is encrypted using AES-256. All data transmitted between your browser and our servers is protected via TLS 1.3 / HTTPS. Unencrypted HTTP connections are automatically redirected to HTTPS."
  },
  {
    icon: Shield,
    title: "OWASP Top 10 Compliance",
    description:
      "Our platform is engineered and audited against the OWASP Top 10 security risks, including SQL Injection prevention (parameterized ORM queries), XSS mitigation (automatic HTML escaping), CSRF protection (Django CSRF middleware), and Broken Access Control prevention (backend RBAC enforcement)."
  },
  {
    icon: Key,
    title: "Authentication & Access Control",
    description:
      "We implement PBKDF2/Argon2 password hashing, strong password policies (minimum 10 characters, symbols, numbers), login attempt throttling (maximum 5 failures before lockout), and JWT-based API authentication with strict token expiry."
  },
  {
    icon: Eye,
    title: "Immutable Audit Logging",
    description:
      "Every critical administrative and operational transaction generates an immutable audit record, including the actor, action type, affected entity, IP address, user agent, and UTC timestamp. These logs are stored with write-once protection and are searchable by administrators."
  },
  {
    icon: Server,
    title: "Infrastructure Security",
    description:
      "Our infrastructure is deployed behind an Nginx reverse proxy with Web Application Firewall (WAF) rules and rate limiting. API endpoints enforce throttling (60 req/min for public, 1000 req/min for authenticated users). All secrets are stored in environment variables and never committed to source control."
  },
  {
    icon: AlertTriangle,
    title: "Vulnerability Management",
    description:
      "We maintain a continuous security posture through automated vulnerability scanning, CORS restriction (whitelisted origins only), file upload validation (MIME-type checks, extension filtering, 10MB size limits), and regular penetration testing audits."
  }
];

const COMPLIANCE = [
  { framework: "OWASP Top 10", status: "Compliant", year: "2021 Edition" },
  { framework: "GDPR", status: "Aligned", year: "EU 2016/679" },
  { framework: "HIPAA", status: "Design Aligned", year: "US HHS Standards" },
  { framework: "SOC 2 Type II", status: "In Progress", year: "AICPA TSC" },
  { framework: "ISO 27001", status: "Framework Applied", year: "ISO/IEC 27001:2022" }
];

export const SecurityGovernancePage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #050811 0%, #060d1a 60%, #050811 100%)",
          padding: "8rem 0 5rem",
          borderBottom: "1px solid rgba(99,245,232,0.1)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,245,232,0.05) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
            <Shield size={14} color="#63f5e8" />
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8" }}>LEGAL / SECURITY GOVERNANCE</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 500, letterSpacing: "-.05em", lineHeight: 1, color: "#eef4f3", margin: "0 0 1.5rem" }}>
            Security &amp;<br /><em style={{ color: "#b7c4c5", fontStyle: "normal" }}>Governance Standards</em>
          </h1>
          <p style={{ color: "#8da5ae", lineHeight: 1.7, maxWidth: "660px", fontSize: ".95rem", margin: "0 0 2rem" }}>
            Aurexion Technologies is committed to the highest standards of information security. This page documents our security architecture, data protection practices, and compliance posture.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {["Zero-Trust Architecture", "OWASP Compliant", "TLS 1.3 Enforced", "RBAC Enforced"].map(tag => (
              <span key={tag} style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".6rem", letterSpacing: ".12em", color: "#63f5e8", border: "1px solid rgba(99,245,232,0.25)", padding: ".3rem .8rem" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "5rem max(4vw, 1.5rem) 0" }}>
        <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1rem" }}>SECURITY ARCHITECTURE</p>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 500, letterSpacing: "-.04em", color: "#eef4f3", margin: "0 0 3rem" }}>
          Our Security Pillars
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {PILLARS.map((p, i) => (
            <div key={i} style={{ border: "1px solid rgba(140,174,187,0.12)", background: "#060c18", padding: "2rem" }}>
              <p.icon size={22} color="#63f5e8" style={{ marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#eef4f3", marginBottom: ".8rem" }}>{p.title}</h3>
              <p style={{ color: "#8da5ae", fontSize: ".85rem", lineHeight: 1.7 }}>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance Matrix */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "5rem max(4vw, 1.5rem)" }}>
        <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1rem" }}>COMPLIANCE POSTURE</p>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 500, letterSpacing: "-.04em", color: "#eef4f3", margin: "0 0 2.5rem" }}>
          Regulatory &amp; Compliance Alignment
        </h2>
        <div style={{ border: "1px solid rgba(140,174,187,0.12)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(99,245,232,0.15)" }}>
                {["Framework", "Status", "Standard"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".12em", color: "#63f5e8", padding: "1rem 1.5rem", background: "#060c18" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(140,174,187,0.06)" }}>
                  <td style={{ padding: "1rem 1.5rem", color: "#eef4f3", fontWeight: 600 }}>{row.framework}</td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".68rem", letterSpacing: ".08em", color: row.status === "Compliant" || row.status === "Aligned" ? "#63f5e8" : "#8da5ae", border: `1px solid ${row.status === "Compliant" || row.status === "Aligned" ? "rgba(99,245,232,0.3)" : "rgba(140,174,187,0.2)"}`, padding: ".2rem .7rem" }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", color: "#8da5ae" }}>{row.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 max(4vw, 1.5rem) 6rem" }}>
        <div style={{ border: "1px solid rgba(99,245,232,0.2)", background: "#060c18", padding: "3rem" }}>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1rem" }}>RESPONSIBLE DISCLOSURE</p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#eef4f3", marginBottom: "1rem" }}>Report a Security Vulnerability</h2>
          <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem", marginBottom: "2rem", maxWidth: "600px" }}>
            If you believe you have discovered a security vulnerability in our platform, we encourage responsible disclosure. Please report it directly to our security team. We are committed to acknowledging receipt within 24 hours and providing a resolution timeline.
          </p>
          <a
            href="mailto:security@aurexion.io"
            className="signal-button inline-flex items-center gap-2"
          >
            REPORT A VULNERABILITY <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default SecurityGovernancePage;
