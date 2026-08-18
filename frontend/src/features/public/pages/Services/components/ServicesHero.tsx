import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

export const ServicesHero: React.FC = () => {
  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Brightened Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85)`,
        }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <div style={{ maxWidth: "880px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">CAPABILITIES / 01</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">ENTERPRISE SOLUTIONS</span>
          </div>

          <h1 className="subpage-hero-title">
            Technology Solutions Built for <em>Enterprise Scale</em>
          </h1>

          <p className="subpage-hero-desc">
            Aurexion provides enterprise technology consulting, custom software development, AI/ML engineering, cloud modernization, and digital transformation capabilities across mission-critical domains.
          </p>

          {/* Technology Pillars */}
          <div className="subpage-tech-row">
            {["Core Engineering", "AI & Data Science", "Cloud Architecture", "Enterprise Products", "Digital Platforms", "Quality & Advisory"].map((item) => (
              <span key={item} className="subpage-tech-chip">
                {item}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="subpage-hero-ctas">
            <a href="#capabilities" className="signal-button">
              EXPLORE CAPABILITIES <ArrowUpRight size={15} />
            </a>
            <Link href="/contact" className="outline-button">
              TALK TO AN EXPERT
            </Link>
          </div>

          {/* Telemetry Metrics */}
          <div className="subpage-meta-telemetry">
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">6</span>
              <span className="subpage-meta-label">Core Domains</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">36+</span>
              <span className="subpage-meta-label">Bespoke Services</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">99.99%</span>
              <span className="subpage-meta-label">SLA Architecture</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;
