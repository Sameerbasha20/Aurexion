import React from "react";
import { Link } from "wouter";
import { ArrowUpRight, Users, Code2, Lock, Zap, LineChart, Award, Clock, Globe } from "lucide-react";

const DIFFERENTIATORS = [
  {
    icon: Users,
    number: "01",
    title: "Senior-Only Engineering",
    description:
      "Every engagement is executed exclusively by senior and principal engineers. We do not staff projects with junior developers or rotate inexperienced resources. Your project is built by professionals with 7+ years of domain-specific expertise.",
    stats: "100% Senior Engineers"
  },
  {
    icon: Code2,
    number: "02",
    title: "Transparent Delivery",
    description:
      "We operate with full engineering transparency — bi-weekly sprint reviews, live staging environments, GitHub commit access, and real-time progress telemetry. No black-box development. You see exactly what is being built and when.",
    stats: "100% Build Visibility"
  },
  {
    icon: Lock,
    number: "03",
    title: "Intellectual Property Security",
    description:
      "All source code, architectures, and design assets developed under engagement remain the sole intellectual property of the client. We provide full IP transfer, NDA execution, and clean source code handover at every milestone.",
    stats: "Full IP Transfer"
  },
  {
    icon: Zap,
    number: "04",
    title: "Agile Methodology & Velocity",
    description:
      "We operate on compressed 2-week sprint cycles with daily async standups, structured sprint reviews, and continuous integration pipelines. Our agile execution model consistently delivers production-ready code at measurable velocity.",
    stats: "2-Week Sprint Cycles"
  },
  {
    icon: LineChart,
    number: "05",
    title: "Performance Benchmarks",
    description:
      "We hold ourselves to verifiable engineering KPIs: TTFB <200ms for cached responses, zero N+1 query patterns, Lighthouse scores 90+ on desktop, and 99.9%+ uptime SLA targets. Performance is not aspirational — it is contractual.",
    stats: "<200ms Response Time"
  },
  {
    icon: Award,
    number: "06",
    title: "Zero Technical Debt Policy",
    description:
      "We enforce strict code review standards, automated testing gates, and documented architecture decision records (ADRs) on every project. Clean, maintainable, well-tested code is not optional — it is the baseline delivery standard.",
    stats: "Zero-Debt Enforcement"
  },
  {
    icon: Clock,
    number: "07",
    title: "Checkpoint-Based Delivery",
    description:
      "Engagements are structured around verifiable delivery checkpoints, each with defined acceptance criteria, working demos, and sign-off documentation. You never pay for progress you cannot verify.",
    stats: "Milestone-Gated Delivery"
  },
  {
    icon: Globe,
    number: "08",
    title: "Global Delivery Capability",
    description:
      "Our distributed engineering squads operate across multiple time zones, enabling 16-hour-plus development coverage. Enterprise clients benefit from overlap-friendly collaboration without the overhead of multiple vendor relationships.",
    stats: "16+ Hour Coverage"
  }
];

const METRICS = [
  { value: "100+", label: "Enterprise Systems Delivered" },
  { value: "7+", label: "Years Average Engineer Experience" },
  { value: "99.9%", label: "Uptime SLA Achievement" },
  { value: "32", label: "Technology Domains" }
];

const COMPARISON = [
  { attribute: "Engineer Seniority", aurexion: "100% Senior / Principal", typical: "Mixed (30–50% junior)" },
  { attribute: "IP Ownership", aurexion: "Full Client IP Transfer", typical: "Retained or unclear" },
  { attribute: "Build Transparency", aurexion: "GitHub access + live staging", typical: "Monthly reports only" },
  { attribute: "Tech Debt Policy", aurexion: "Zero-debt gate enforced", typical: "Best effort" },
  { attribute: "Security Compliance", aurexion: "OWASP Top 10 + RBAC", typical: "Basic HTTPS" },
  { attribute: "Performance SLA", aurexion: "Contractual TTFB <200ms", typical: "No benchmark defined" },
  { attribute: "Delivery Structure", aurexion: "Checkpoint-gated milestones", typical: "Single end-of-project demo" }
];

export const WhyUsPage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="subpage-immersive-hero">
        <div
          className="subpage-hero-art"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=85)`,
          }}
        />
        <div className="subpage-hero-overlay" />
        <div className="subpage-hero-grid" />

        <div className="subpage-hero-container">
          <div style={{ maxWidth: "880px" }}>
            <div className="subpage-hero-eyebrow">
              <span className="subpage-cat-tag">WHY AUREXION / 02</span>
              <span className="subpage-signal-divider" />
              <span className="subpage-code-tag">ENGINEERING DIFFERENTIATORS</span>
            </div>

            <h1 className="subpage-hero-title">
              Why Enterprises Choose <em>Aurexion.</em>
            </h1>

            <p className="subpage-hero-desc">
              We are not a body-shopping agency. We are a precision engineering firm. Every engagement is designed around verifiable outcomes, senior expertise, and uncompromising technical standards.
            </p>

            <div className="subpage-tech-row">
              {["Senior-Only Teams", "Full IP Transfer", "OWASP Compliant", "Zero Technical Debt", "Checkpoint-Gated"].map(tag => (
                <span key={tag} className="subpage-tech-chip">{tag}</span>
              ))}
            </div>

            <div className="subpage-hero-ctas">
              <Link href="/rfp" className="signal-button">
                SUBMIT AN RFP <ArrowUpRight size={15} />
              </Link>
              <Link href="/contact" className="outline-button">
                TALK TO US
              </Link>
            </div>

            <div className="subpage-meta-telemetry">
              {METRICS.map(m => (
                <div key={m.label} className="subpage-meta-item">
                  <span className="subpage-meta-value">{m.value}</span>
                  <span className="subpage-meta-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators Grid */}
      <section style={{ background: "#050811", padding: "6rem 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)" }}>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1rem" }}>
            DIFFERENTIATORS
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, letterSpacing: "-.05em", color: "#eef4f3", margin: "0 0 4rem", maxWidth: "600px" }}>
            What Sets Our Engineering Delivery Apart
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-[rgba(140,174,187,0.12)] bg-[rgba(140,174,187,0.12)]">
            {DIFFERENTIATORS.map((d, i) => (
              <div
                key={i}
                style={{ background: "#050811", padding: "2.2rem 1.8rem", position: "relative", overflow: "hidden", transition: "background .3s" }}
                onMouseOver={e => ((e.currentTarget as HTMLDivElement).style.background = "#060d1a")}
                onMouseOut={e => ((e.currentTarget as HTMLDivElement).style.background = "#050811")}
              >
                <span style={{ position: "absolute", top: "1.2rem", right: "1.5rem", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#63f5e8", opacity: 0.85 }}>
                  {d.number}
                </span>
                <d.icon size={22} color="#63f5e8" style={{ marginBottom: "1.2rem" }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#eef4f3", marginBottom: ".8rem" }}>{d.title}</h3>
                <p style={{ color: "#8da5ae", fontSize: ".85rem", lineHeight: 1.7, marginBottom: "1.2rem" }}>
                  {d.description}
                </p>
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".12em", color: "#63f5e8" }}>{d.stats}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ background: "#060c18", padding: "6rem 0", borderTop: "1px solid rgba(140,174,187,0.08)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)" }}>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1rem" }}>
            COMPETITIVE COMPARISON
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, letterSpacing: "-.05em", color: "#eef4f3", margin: "0 0 3rem" }}>
            Aurexion vs. Typical Vendors
          </h2>

          <div style={{ border: "1px solid rgba(140,174,187,0.12)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(99,245,232,0.15)" }}>
                  <th style={{ textAlign: "left", padding: "1rem 1.5rem", background: "#060c18", fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".12em", color: "#5e7079", width: "35%" }}>ATTRIBUTE</th>
                  <th style={{ textAlign: "left", padding: "1rem 1.5rem", background: "rgba(99,245,232,0.04)", fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".12em", color: "#63f5e8", width: "32.5%" }}>AUREXION</th>
                  <th style={{ textAlign: "left", padding: "1rem 1.5rem", background: "#060c18", fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".12em", color: "#5e7079", width: "32.5%" }}>TYPICAL VENDOR</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(140,174,187,0.06)" }}>
                    <td style={{ padding: "1rem 1.5rem", color: "#b7c4c5", fontWeight: 500 }}>{row.attribute}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#63f5e8", background: "rgba(99,245,232,0.02)", fontWeight: 500 }}>
                      {row.aurexion}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#5e7079" }}>
                      {row.typical}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#050811", padding: "6rem 0", borderTop: "1px solid rgba(140,174,187,0.08)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)", textAlign: "center" }}>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1rem" }}>START AN ENGAGEMENT</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 500, letterSpacing: "-.05em", color: "#eef4f3", margin: "0 0 1.5rem" }}>
            Ready to Engineer<br /><em style={{ color: "#b7c4c5", fontStyle: "normal" }}>Something Exceptional?</em>
          </h2>
          <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".95rem", margin: "0 0 3rem" }}>
            Submit a formal RFP or use our interactive estimator to begin scoping your project. Our team responds within 24 hours.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/rfp" className="signal-button inline-flex items-center gap-2">
              SUBMIT AN RFP <ArrowUpRight size={15} />
            </Link>
            <Link href="/estimator" className="outline-button">
              USE ESTIMATOR
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyUsPage;
