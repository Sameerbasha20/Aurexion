import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

export const CaseStudiesHero = () => {
  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Brightened Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=85)`,
        }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <div style={{ maxWidth: "880px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">DEPLOYMENTS / 04</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">PROVEN IMPACT</span>
          </div>

          <h1 className="subpage-hero-title">
            Engineering Solutions for <em>Complex Enterprise Challenges</em>
          </h1>

          <p className="subpage-hero-desc">
            Explore structured engineering case studies detailing architectural blueprints, neural integration, zero-downtime migrations, and measurable business outcomes across global enterprises.
          </p>

          {/* Solution Focus Areas */}
          <div className="subpage-tech-row">
            {["Distributed Systems", "Cloud Migration", "AI Model Serving", "High-Throughput Pipelines", "Microservices Modernization"].map((item) => (
              <span key={item} className="subpage-tech-chip">
                {item}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="subpage-hero-ctas">
            <a href="#case-studies-grid" className="signal-button">
              BROWSE CASE STUDIES <ArrowUpRight size={15} />
            </a>
            <Link href="/rfp" className="outline-button">
              SUBMIT RFP
            </Link>
          </div>

          {/* Telemetry Metrics */}
          <div className="subpage-meta-telemetry">
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">99.999%</span>
              <span className="subpage-meta-label">System Availability</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">&lt;50ms</span>
              <span className="subpage-meta-label">Avg P99 Latency</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">100%</span>
              <span className="subpage-meta-label">Delivery Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesHero;
