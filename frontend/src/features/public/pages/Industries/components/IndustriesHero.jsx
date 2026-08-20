import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const SECTOR_HERO_IMAGES = {
  "Banking & FinTech": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=1600&q=85",
  "Healthcare & Life Sciences": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=85",
  "Manufacturing & Robotics": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=85",
  "Logistics & Supply Chain": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85",
  "Government": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=85",
  "Telecom": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85",
};

const DEFAULT_INDUSTRIES_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85";

export const IndustriesHero = () => {
  const [activeSector, setActiveSector] = useState("Banking & FinTech");
  const currentBgImage = SECTOR_HERO_IMAGES[activeSector] || DEFAULT_INDUSTRIES_IMAGE;

  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Brightened Background Artwork */}
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
            <span className="subpage-cat-tag">SECTOR INTELLIGENCE</span>
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
          <div className="subpage-tech-row flex flex-wrap gap-2 pt-2">
            {["Banking & FinTech", "Healthcare & Life Sciences", "Manufacturing & Robotics", "Logistics & Supply Chain", "Government", "Telecom"].map((item) => {
              const isSelected = activeSector === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => setActiveSector(item)}
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
