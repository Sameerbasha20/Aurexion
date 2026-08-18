import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

export const IndustriesHero = () => {
  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Brightened Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85)`,
        }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <div style={{ maxWidth: "880px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">SECTOR INTELLIGENCE / 02</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">18 VERTICALS</span>
          </div>

          <h1 className="subpage-hero-title">
            Technology Solutions Engineered for <em>Every Industry</em>
          </h1>

          <p className="subpage-hero-desc">
            Aurexion delivers bespoke enterprise software, digital transformation, AI/ML pipelines, cloud modernization, and compliance-first architectures across 18 specialized global industry verticals.
          </p>

          {/* Sector Highlights */}
          <div className="subpage-tech-row">
            {["Banking & FinTech", "Healthcare & Life Sciences", "Manufacturing & Robotics", "Logistics & Supply Chain", "Government", "Telecom"].map((item) => (
              <span key={item} className="subpage-tech-chip">
                {item}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="subpage-hero-ctas">
            <a href="#industries-explorer" className="signal-button">
              EXPLORE INDUSTRIES <ArrowUpRight size={15} />
            </a>
            <Link href="/contact" className="outline-button">
              DISCUSS SECTOR CHALLENGE
            </Link>
          </div>

          {/* Telemetry Metrics */}
          <div className="subpage-meta-telemetry">
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">18</span>
              <span className="subpage-meta-label">Industry Verticals</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">100%</span>
              <span className="subpage-meta-label">Compliance Mapped</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">Tier-1</span>
              <span className="subpage-meta-label">Enterprise Grade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustriesHero;
