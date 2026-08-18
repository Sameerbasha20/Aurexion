import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { aboutData } from "../../../../../data/about";

export const AboutHero: React.FC = () => {
  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Brightened Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85)`,
        }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <div style={{ maxWidth: "880px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">ABOUT AUREXION / 03</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">ENGINEERING HERITAGE</span>
          </div>

          <h1 className="subpage-hero-title">
            Engineering the Foundations of the <em>Digital Future</em>
          </h1>

          <p className="subpage-hero-desc">
            {aboutData.hero.description ||
              "Aurexion is a global technology consulting and software engineering firm dedicated to designing resilient, scalable, and intelligent software systems for forward-looking enterprises."}
          </p>

          {/* Core Values / Focus */}
          <div className="subpage-tech-row">
            {["Architectural Rigor", "Zero-Trust Security", "AI & Neural Mesh", "Global Distributed Engineering", "Client Velocity"].map((item) => (
              <span key={item} className="subpage-tech-chip">
                {item}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="subpage-hero-ctas">
            <Link href="/contact" className="signal-button">
              TALK TO LEADERSHIP <ArrowUpRight size={15} />
            </Link>
            <Link href="/careers" className="outline-button">
              JOIN THE TEAM
            </Link>
          </div>

          {/* Telemetry Metrics */}
          <div className="subpage-meta-telemetry">
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">Global</span>
              <span className="subpage-meta-label">Engineering Footprint</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">100+</span>
              <span className="subpage-meta-label">Systems Shipped</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">Zero</span>
              <span className="subpage-meta-label">Tech Debt Tolerance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
