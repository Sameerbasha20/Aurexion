import React from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const INDUSTRY_IMAGES = {
  banking: "/webp_images/unsplash_1501167786227-4c.webp",
  "financial-services": "/webp_images/unsplash_1486406146926-c6.webp",
  insurance: "/webp_images/unsplash_1454165804606-c3.webp",
  healthcare: "/webp_images/unsplash_1516549655169-df.webp",
  lifesciences: "/webp_images/unsplash_1532187863486-ab.webp",
  life: "/webp_images/unsplash_1532187863486-ab.webp",
  education: "/webp_images/unsplash_1524178232363-1f.webp",
  manufacturing: "/webp_images/unsplash_1581091226825-a6.webp",
  retail: "/webp_images/unsplash_1441986300917-64.webp",
  "e-commerce": "/webp_images/unsplash_1557821552-17105.webp",
  ecommerce: "/webp_images/unsplash_1557821552-17105.webp",
  "logistics-supply-chain": "/webp_images/unsplash_1586528116311-ad.webp",
  logistics: "/webp_images/unsplash_1586528116311-ad.webp",
  "real-estate": "/webp_images/unsplash_1486406146926-c6.webp",
  realestate: "/webp_images/unsplash_1486406146926-c6.webp",
  construction: "/webp_images/unsplash_1504307651254-35.webp",
  hospitality: "/webp_images/unsplash_1542314831-068cd.webp",
  travel: "/webp_images/unsplash_1436491865332-7a.webp",
  automotive: "/webp_images/unsplash_1503376780353-7e.webp",
  telecommunications: "/webp_images/unsplash_1516321318423-f0.webp",
  telecom: "/webp_images/unsplash_1516321318423-f0.webp",
  "professional-services": "/webp_images/unsplash_1497366216548-37.webp",
  professional: "/webp_images/unsplash_1497366216548-37.webp",
  government: "/webp_images/unsplash_1517048676732-d6.webp",
  publicsector: "/webp_images/unsplash_1517048676732-d6.webp",
  startups: "/webp_images/unsplash_1519389950473-47.webp",
  aerospace: "/webp_images/unsplash_1518770660439-46.webp",
};

export const IndustryHero = ({ industry }) => {
  const imageUrl =
    INDUSTRY_IMAGES[industry.slug] ||
    "/webp_images/unsplash_1486406146926-c6.webp";

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
            <span className="subpage-cat-tag">INDUSTRY VERTICAL</span>
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
              <span className="subpage-meta-value">{industry.relatedServices?.length !== undefined ? industry.relatedServices.length : 0}</span>
              <span className="subpage-meta-label">Associated Services</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">{industry.relatedCaseStudies?.length !== undefined ? industry.relatedCaseStudies.length : 0}</span>
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
