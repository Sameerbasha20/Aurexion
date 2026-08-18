import React from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const INDUSTRY_IMAGES = {
  banking: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=1600&q=85",
  "financial-services": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
  insurance: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85",
  healthcare: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=85",
  lifesciences: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=85",
  education: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=85",
  manufacturing: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=85",
  retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
  "e-commerce": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1600&q=85",
  ecommerce: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1600&q=85",
  "logistics-supply-chain": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85",
  logistics: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85",
  "real-estate": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
  realestate: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
  construction: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=85",
  hospitality: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
  travel: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=85",
  automotive: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
  telecommunications: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85",
  telecom: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85",
  "professional-services": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
  professional: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
  government: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=85",
  publicsector: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=85",
  startups: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=85",
  aerospace: "https://images.unsplash.com/photo-1517976487524-749e49c71987?auto=format&fit=crop&w=1600&q=85",
};

export const IndustryHero = ({ industry }) => {
  const imageUrl =
    INDUSTRY_IMAGES[industry.slug] ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85";

  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Brightened Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <Link href="/industries" className="subpage-back-link">
          <ArrowLeft size={14} /> BACK TO ALL INDUSTRIES
        </Link>

        <div style={{ maxWidth: "860px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">INDUSTRY VERTICAL / {industry.id || "01"}</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">{industry.name.toUpperCase()} SECTOR</span>
          </div>

          <h1 className="subpage-hero-title">
            Engineering the Next Decade of <em>{industry.name}</em>
          </h1>

          <p className="subpage-hero-desc">
            {industry.shortDescription}
          </p>

          {/* Focus outcome pills */}
          {industry.outcomes && (
            <div className="subpage-tech-row">
              {industry.outcomes.map((item) => (
                <span key={item} className="subpage-tech-chip">
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* Brand Action Buttons */}
          <div className="subpage-hero-ctas">
            <Link href="/contact" className="signal-button">
              DISCUSS SECTOR CHALLENGE <ArrowUpRight size={15} />
            </Link>
            <Link href="/rfp" className="outline-button">
              SUBMIT RFP
            </Link>
          </div>

          {/* Telemetry Metrics */}
          <div className="subpage-meta-telemetry">
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">{industry.relatedServices?.length || 4}</span>
              <span className="subpage-meta-label">Associated Services</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">{industry.relatedCaseStudies?.length || 1}</span>
              <span className="subpage-meta-label">Sector Case Studies</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">Enterprise</span>
              <span className="subpage-meta-label">Compliance Architecture</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustryHero;
