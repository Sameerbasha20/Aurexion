import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const DEFAULT_HERO_IMAGE = "/webp_images/unsplash_1555066931-4365d.webp";

export const ServicesHero: React.FC = () => {
  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{
          backgroundImage: `url(${DEFAULT_HERO_IMAGE})`,
        }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <div style={{ maxWidth: "880px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">CAPABILITIES</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">ENTERPRISE SOLUTIONS</span>
          </div>

          <h1 className="subpage-hero-title">
            Technology Solutions Built for <em>Enterprise Scale</em>
          </h1>

          <p className="subpage-hero-desc">
            Aurexion provides enterprise technology consulting, custom software development, AI/ML engineering, cloud modernization, and digital transformation capabilities across mission-critical domains.
          </p>

          {/* Static Technology Pillars */}
          <div className="subpage-tech-row flex flex-wrap gap-2 pt-2">
            {[
              "Core Engineering",
              "AI & Data Science",
              "Cloud Architecture",
              "Enterprise Products",
              "Digital Platforms",
              "Quality & Advisory",
            ].map((item) => (
              <span
                key={item}
                className="subpage-tech-chip select-none"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="subpage-hero-ctas">
            <a href="#explorer" className="signal-button">
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
