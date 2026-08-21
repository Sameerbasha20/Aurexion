import React from "react";
import { ArrowUpRight } from "lucide-react";

const INSIGHTS_HERO_IMAGE = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85";

export const InsightsHero = () => {
  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{
          backgroundImage: `url(${INSIGHTS_HERO_IMAGE})`,
        }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <div style={{ maxWidth: "880px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">PUBLICATIONS & RESEARCH</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">INSIGHTS</span>
          </div>

          <h1 className="subpage-hero-title">
            Signals Worth <em>Following.</em>
          </h1>

          <p className="subpage-hero-desc">
            Deep technical perspectives, architectural blueprints, and emerging technology analysis authored by Aurexion’s senior engineering practice leads.
          </p>

          {/* Research Categories */}
          <div className="subpage-tech-row flex flex-wrap gap-2 pt-2">
            {["Artificial Intelligence", "Cloud Architecture", "Distributed Systems", "Enterprise Security", "Data Engineering", "UI/UX Platforms"].map((item) => (
              <span
                key={item}
                className="subpage-tech-chip"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="subpage-hero-ctas">
            <a href="#articles" className="signal-button">
              EXPLORE ARTICLES <ArrowUpRight size={15} />
            </a>
            <a href="#categories" className="outline-button">
              FILTER BY TOPIC
            </a>
          </div>

          {/* Telemetry Metrics */}
          <div className="subpage-meta-telemetry">
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">Weekly</span>
              <span className="subpage-meta-label">Research Cadence</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">Peer-Reviewed</span>
              <span className="subpage-meta-label">Engineering Specs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsHero;
