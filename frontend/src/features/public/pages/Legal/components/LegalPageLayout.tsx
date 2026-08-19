import React from "react";
import { Link } from "wouter";
import { ArrowUpRight, LucideIcon } from "lucide-react";

export interface LegalSectionItem {
  id: string;
  title: string;
  text?: string;
  content?: Array<{ subtitle?: string; text: string }>;
}

export interface LegalPageLayoutProps {
  icon: LucideIcon;
  badgeLabel: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSectionItem[];
  relatedLinks: Array<{ title: string; href: string }>;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  icon: Icon,
  badgeLabel,
  title,
  description,
  lastUpdated,
  sections,
  relatedLinks,
}) => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #050811 0%, #060d1a 50%, #050811 100%)",
          padding: "8rem 0 5rem",
          borderBottom: "1px solid rgba(99,245,232,0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse 60% 40% at 30% 50%, rgba(99,245,232,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 max(4vw, 1.5rem)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
            <Icon size={14} color="#63f5e8" />
            <span
              style={{
                fontFamily: "'IBM Plex Mono'",
                fontSize: ".62rem",
                letterSpacing: ".18em",
                color: "#63f5e8",
              }}
            >
              {badgeLabel}
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              fontWeight: 500,
              letterSpacing: "-.05em",
              lineHeight: 1,
              color: "#eef4f3",
              margin: "0 0 1.5rem",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: "#8da5ae",
              lineHeight: 1.7,
              maxWidth: "600px",
              fontSize: ".95rem",
              margin: "0 0 2rem",
            }}
          >
            {description}
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Mono'",
              fontSize: ".7rem",
              color: "#5e7079",
              letterSpacing: ".05em",
            }}
          >
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem max(4vw, 1.5rem) 6rem" }}>
        {/* Table of Contents */}
        <div
          style={{
            border: "1px solid rgba(99,245,232,0.12)",
            background: "#060c18",
            padding: "2rem",
            marginBottom: "3rem",
          }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Mono'",
              fontSize: ".65rem",
              letterSpacing: ".15em",
              color: "#63f5e8",
              marginBottom: "1.2rem",
            }}
          >
            TABLE OF CONTENTS
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: ".5rem",
            }}
          >
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  color: "#8da5ae",
                  fontSize: ".85rem",
                  textDecoration: "none",
                  padding: ".3rem 0",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#63f5e8")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#8da5ae")}
                onFocus={(e) => (e.currentTarget.style.color = "#63f5e8")}
                onBlur={(e) => (e.currentTarget.style.color = "#8da5ae")}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {sections.map((s, idx) => (
          <div
            key={s.id}
            id={s.id}
            style={{
              marginBottom: "3rem",
              paddingBottom: "3rem",
              borderBottom: idx < sections.length - 1 ? "1px solid rgba(140,174,187,0.08)" : "none",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "#eef4f3",
                letterSpacing: "-.02em",
                marginBottom: s.content ? "1.5rem" : "1rem",
              }}
            >
              {s.title}
            </h2>
            {s.text && (
              <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem" }}>{s.text}</p>
            )}
            {s.content &&
              s.content.map((c, i) => (
                <div key={i} style={{ marginBottom: c.subtitle ? "1.5rem" : 0 }}>
                  {c.subtitle && (
                    <h3
                      style={{
                        fontSize: ".95rem",
                        fontWeight: 600,
                        color: "#b7c4c5",
                        marginBottom: ".8rem",
                      }}
                    >
                      {c.subtitle}
                    </h3>
                  )}
                  <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem" }}>{c.text}</p>
                </div>
              ))}
          </div>
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <div style={{ display: "flex", gap: "2rem" }}>
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "'IBM Plex Mono'",
                  fontSize: ".72rem",
                  color: "#63f5e8",
                  letterSpacing: ".08em",
                  textDecoration: "none",
                }}
              >
                {link.title} →
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            className="signal-button inline-flex items-center gap-2"
            style={{ fontSize: ".75rem" }}
          >
            CONTACT US <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LegalPageLayout;
