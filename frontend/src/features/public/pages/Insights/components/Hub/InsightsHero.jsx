import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const TOPIC_HERO_IMAGES = {
  "Artificial Intelligence": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
  "Cloud Architecture": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "Distributed Systems": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85",
  "Enterprise Security": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=85",
  "Data Engineering": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=85",
  "UI/UX Platforms": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=85",
};

const DEFAULT_INSIGHTS_IMAGE = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85";

export const InsightsHero = () => {
  const [activeTopic, setActiveTopic] = useState(null);

  const currentBgImage = (activeTopic && TOPIC_HERO_IMAGES[activeTopic]) || DEFAULT_INSIGHTS_IMAGE;

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
            <span className="subpage-cat-tag">PUBLICATIONS & RESEARCH / 06</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">INSIGHTS</span>
          </div>

          <h1 className="subpage-hero-title">
            Signals Worth <em>Following.</em>
          </h1>

          <p className="subpage-hero-desc">
            Deep technical perspectives, architectural blueprints, and emerging technology analysis authored by Aurexion’s senior engineering practice leads.
          </p>

          {/* Interactive Research Categories */}
          <div className="subpage-tech-row flex flex-wrap gap-2 pt-2">
            {["Artificial Intelligence", "Cloud Architecture", "Distributed Systems", "Enterprise Security", "Data Engineering", "UI/UX Platforms"].map((item) => {
              const isSelected = activeTopic === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => setActiveTopic(item)}
                  className={`subpage-tech-chip cursor-pointer transition-all duration-300 select-none ${isSelected
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
            <div className="subpage-meta-item">
              <span className="subpage-meta-label">Technical Authority</span>
              <span className="subpage-meta-value">Tier-1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsHero;
