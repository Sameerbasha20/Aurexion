import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const DOMAIN_HERO_IMAGES: Record<string, string> = {
  "Core Engineering": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85",
  "AI & Data Science": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
  "Cloud Architecture": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "Enterprise Products": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=85",
  "Digital Platforms": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
  "Quality & Advisory": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=85",
};

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=85";

export const ServicesHero: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<string>("Core Engineering");

  const currentBgImage = DOMAIN_HERO_IMAGES[activeDomain] || DEFAULT_HERO_IMAGE;

  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Dynamic Background Artwork */}
      <div
        className="subpage-hero-art transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url(${currentBgImage})`,
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

          {/* Interactive Technology Pillars */}
          <div className="subpage-tech-row flex flex-wrap gap-2 pt-2">
            {[
              "Core Engineering",
              "AI & Data Science",
              "Cloud Architecture",
              "Enterprise Products",
              "Digital Platforms",
              "Quality & Advisory",
            ].map((item) => {
              const isSelected = activeDomain === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => setActiveDomain(item)}
                  className={`subpage-tech-chip cursor-pointer transition-all duration-300 select-none ${
                    isSelected
                      ? "border-primary bg-primary/20 text-[#63f5e8] shadow-[0_0_15px_rgba(99,245,232,0.4)] scale-105"
                      : "hover:border-primary/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
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
