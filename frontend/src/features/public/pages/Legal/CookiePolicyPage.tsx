import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Cookie, CheckCircle2, XCircle } from "lucide-react";

const LAST_UPDATED = "August 11, 2026";

const COOKIE_TYPES = [
  {
    id: "strictly-necessary",
    name: "Strictly Necessary Cookies",
    badge: "Always Active",
    badgeColor: "#63f5e8",
    required: true,
    description:
      "These cookies are essential for the Platform to function correctly. They enable core functionality such as authentication session management, CSRF protection, security enforcement, and load balancing. The Platform cannot function properly without these cookies.",
    examples: [
      { name: "session_id", purpose: "Maintains your authenticated session across page requests.", duration: "Session" },
      { name: "csrftoken", purpose: "Cross-Site Request Forgery (CSRF) protection token.", duration: "Session" },
      { name: "lb_session", purpose: "Load balancer session affinity for consistent server routing.", duration: "Session" }
    ]
  },
  {
    id: "analytics",
    name: "Analytics & Performance Cookies",
    badge: "Optional",
    badgeColor: "#b7c4c5",
    required: false,
    description:
      "These cookies help us understand how visitors interact with our Platform. All data collected is aggregated and anonymised. We use this information to improve Platform performance, identify issues, and optimise the user experience.",
    examples: [
      { name: "_ga", purpose: "Google Analytics — distinguishes unique users.", duration: "2 years" },
      { name: "_gid", purpose: "Google Analytics — distinguishes unique sessions.", duration: "24 hours" },
      { name: "hotjar_session", purpose: "Session recording and heatmapping (anonymised).", duration: "30 minutes" }
    ]
  },
  {
    id: "functional",
    name: "Functional Cookies",
    badge: "Optional",
    badgeColor: "#b7c4c5",
    required: false,
    description:
      "Functional cookies enable enhanced features and personalisation, such as remembering your preferences (theme, language), retaining estimator step progress, and pre-filling contact forms with saved data.",
    examples: [
      { name: "user_prefs", purpose: "Stores your UI preferences (e.g., dark/light mode).", duration: "1 year" },
      { name: "estimator_draft", purpose: "Temporarily preserves your estimator progress.", duration: "7 days" }
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Targeting Cookies",
    badge: "Optional",
    badgeColor: "#b7c4c5",
    required: false,
    description:
      "These cookies may be set by our advertising partners to build a profile of your interests and show you relevant advertisements on other websites. They do not store personally identifiable information directly but rely on uniquely identifying your browser and device.",
    examples: [
      { name: "_fbp", purpose: "Facebook Pixel — tracks conversions from Facebook Ads.", duration: "3 months" },
      { name: "li_fat_id", purpose: "LinkedIn Insight Tag — tracks ad conversions.", duration: "30 days" }
    ]
  }
];

export const CookiePolicyPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("strictly-necessary");

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #050811 0%, #060d1a 50%, #050811 100%)",
          padding: "8rem 0 5rem",
          borderBottom: "1px solid rgba(99,245,232,0.1)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(99,245,232,0.04) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
            <Cookie size={14} color="#63f5e8" />
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8" }}>LEGAL / COOKIES</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 500, letterSpacing: "-.05em", lineHeight: 1, color: "#eef4f3", margin: "0 0 1.5rem" }}>
            Cookie Policy
          </h1>
          <p style={{ color: "#8da5ae", lineHeight: 1.7, maxWidth: "600px", fontSize: ".95rem", margin: "0 0 2rem" }}>
            This Cookie Policy explains what cookies are, how Aurexion Technologies uses them, and the choices available to you regarding cookie usage.
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".7rem", color: "#5e7079", letterSpacing: ".05em" }}>
            Last Updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem max(4vw, 1.5rem) 6rem" }}>

        {/* What are cookies */}
        <div style={{ marginBottom: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(140,174,187,0.08)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#eef4f3", letterSpacing: "-.02em", marginBottom: "1rem" }}>What Are Cookies?</h2>
          <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem" }}>
            Cookies are small text files placed on your device (computer, smartphone, or tablet) when you visit a website. They allow the website to remember your actions and preferences over a period of time, so you don't have to keep re-entering information whenever you return. Cookies can be 'session' cookies, which expire when you close your browser, or 'persistent' cookies, which remain on your device for a specified duration.
          </p>
        </div>

        {/* Cookie types — accordion */}
        <div style={{ marginBottom: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(140,174,187,0.08)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#eef4f3", letterSpacing: "-.02em", marginBottom: "1.5rem" }}>Cookie Categories We Use</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {COOKIE_TYPES.map(ct => (
              <div
                key={ct.id}
                style={{ border: `1px solid ${expanded === ct.id ? "rgba(99,245,232,0.3)" : "rgba(140,174,187,0.12)"}`, background: "#060c18", transition: "border-color .2s" }}
              >
                <button
                  onClick={() => setExpanded(expanded === ct.id ? null : ct.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1.5rem", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: "#eef4f3" }}>{ct.name}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".6rem", letterSpacing: ".1em", color: ct.badgeColor, border: `1px solid ${ct.badgeColor}30`, padding: ".2rem .6rem" }}>
                      {ct.badge}
                    </span>
                  </div>
                  {ct.required
                    ? <CheckCircle2 size={16} color="#63f5e8" />
                    : (expanded === ct.id ? <XCircle size={16} color="#8da5ae" /> : <CheckCircle2 size={16} color="#8da5ae" />)
                  }
                </button>
                {expanded === ct.id && (
                  <div style={{ padding: "0 1.5rem 1.5rem" }}>
                    <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".88rem", marginBottom: "1.5rem" }}>{ct.description}</p>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                      <thead>
                        <tr>
                          {["Cookie Name", "Purpose", "Duration"].map(h => (
                            <th key={h} style={{ textAlign: "left", fontFamily: "'IBM Plex Mono'", fontSize: ".6rem", letterSpacing: ".1em", color: "#63f5e8", padding: ".5rem .75rem", borderBottom: "1px solid rgba(99,245,232,0.12)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ct.examples.map((ex, i) => (
                          <tr key={i}>
                            <td style={{ padding: ".6rem .75rem", color: "#eef4f3", fontFamily: "'IBM Plex Mono'", fontSize: ".78rem", borderBottom: "1px solid rgba(140,174,187,0.06)" }}>{ex.name}</td>
                            <td style={{ padding: ".6rem .75rem", color: "#8da5ae", borderBottom: "1px solid rgba(140,174,187,0.06)" }}>{ex.purpose}</td>
                            <td style={{ padding: ".6rem .75rem", color: "#8da5ae", whiteSpace: "nowrap", borderBottom: "1px solid rgba(140,174,187,0.06)" }}>{ex.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Managing cookies */}
        <div style={{ marginBottom: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(140,174,187,0.08)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#eef4f3", letterSpacing: "-.02em", marginBottom: "1rem" }}>How to Manage Cookies</h2>
          <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem", marginBottom: "1rem" }}>
            Most browsers allow you to control cookies through their settings. You can typically set your browser to block or delete cookies, or to notify you when a cookie is being set. However, blocking strictly necessary cookies may prevent the Platform from functioning correctly.
          </p>
          <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem" }}>
            For browser-specific instructions: Chrome — Settings &gt; Privacy and Security &gt; Cookies. Firefox — Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data. Safari — Preferences &gt; Privacy &gt; Manage Website Data. Edge — Settings &gt; Privacy, Search, and Services &gt; Cookies.
          </p>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#eef4f3", letterSpacing: "-.02em", marginBottom: "1rem" }}>Contact Us</h2>
          <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem" }}>
            If you have questions about our use of cookies, please contact us at: privacy@aurexion.io
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "2rem" }}>
            <Link href="/privacy-policy" style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".72rem", color: "#63f5e8", letterSpacing: ".08em", textDecoration: "none" }}>
              PRIVACY POLICY →
            </Link>
            <Link href="/terms" style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".72rem", color: "#63f5e8", letterSpacing: ".08em", textDecoration: "none" }}>
              TERMS &amp; CONDITIONS →
            </Link>
          </div>
          <Link href="/contact" className="signal-button inline-flex items-center gap-2" style={{ fontSize: ".75rem" }}>
            CONTACT US <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicyPage;
