import React from "react";
import { Link } from "wouter";
import { ServiceDetail } from "../../../../types/website.types";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

interface ServiceHeroProps {
  service: ServiceDetail;
}

const SERVICE_IMAGES: Record<string, string> = {
  // Category defaults
  "Core Engineering": "/images/unsplash_1555066931-4365d.webp",
  "AI & Data Science": "/images/unsplash_1677442136019-21.webp",
  "Cloud & Infrastructure": "/images/unsplash_1544197150-b99a5.webp",
  "Enterprise Products": "/images/unsplash_1504868584819-f8.webp",
  "Digital Platforms": "/images/unsplash_1518770660439-46.webp",
  "Quality & Advisory": "/images/unsplash_1563986768609-32.webp",

  // Core Engineering
  "custom-software-development": "/images/unsplash_1555066931-4365d.webp",
  "enterprise-application-engineering": "/images/unsplash_1504868584819-f8.webp",
  "python-microservices": "/images/unsplash_1555066931-4365d.webp",
  "legacy-system-modernization": "/images/unsplash_1518770660439-46.webp",
  "microservices-architecture": "/images/unsplash_1558494949-ef010.webp",

  // AI & Data Science
  "artificial-intelligence-solutions": "/images/unsplash_1677442136019-21.webp",
  "machine-learning-engineering": "/images/unsplash_1555949963-aa79d.webp",
  "generative-ai-platform-integration": "/images/unsplash_1677442136019-21.webp",
  "data-engineering": "/images/unsplash_1558494949-ef010.webp",
  "data-analytics": "/images/unsplash_1551288049-bebda.webp",
  "business-intelligence": "/images/unsplash_1460925895917-af.webp",
  "business-intelligence-bi": "/images/unsplash_1460925895917-af.webp",

  // Cloud & Infrastructure
  "cloud-architecture-modernization": "/images/unsplash_1544197150-b99a5.webp",
  "cloud-migration": "/images/unsplash_1544197150-b99a5.webp",
  "devops-cicd-automation": "/images/unsplash_1618401471353-b9.webp",
  "cybersecurity-threat-governance": "/images/unsplash_1563986768609-32.webp",
  "managed-infrastructure": "/images/unsplash_1558494949-ef010.webp",

  // Enterprise Products
  "custom-erp-development": "/images/unsplash_1486406146926-c6.webp",
  "enterprise-crm-solutions": "/images/unsplash_1552664730-d307c.webp",
  "hrms-platforms": "/images/unsplash_1522071820081-00.webp",
  "fintech-solutions": "/images/unsplash_1611974789855-9c.webp",
  "healthtech-platforms": "/images/unsplash_1576091160399-11.webp",
  "edtech-lms-solutions": "/images/unsplash_1501504905252-47.webp",
  "logistics-supply-chain-tech": "/images/unsplash_1586528116311-ad.webp",

  // Digital Platforms
  "ecommerce-platforms": "/images/unsplash_1557821552-17105.webp",
  "cross-platform-mobile-applications": "/images/unsplash_1512941937669-90.webp",
  "rest-api-development-integrations": "/images/unsplash_1558494949-ef010.webp",
  "robotic-process-automation": "/images/unsplash_1485827404703-89.webp",
  "saas-product-engineering": "/images/unsplash_1507238691740-18.webp",

  // Quality & Advisory
  "software-testing-qa-automation": "/images/unsplash_1516321318423-f0.webp",
  "ui-ux-engineering": "/images/unsplash_1581291518633-83.webp",
  "strategic-technology-consulting": "/images/unsplash_1454165804606-c3.webp",
  "dedicated-development-team-allocation": "/images/unsplash_1522071820081-00.webp",
  "managed-application-maintenance": "/images/unsplash_1504384308090-c8.webp",
};

export const ServiceHero: React.FC<ServiceHeroProps> = ({ service }) => {
  const imageUrl =
    SERVICE_IMAGES[service.slug] ||
    SERVICE_IMAGES[service.category] ||
    "/images/unsplash_1526374965328-7f.webp";

  return (
    <section className="subpage-immersive-hero">
      {/* High-Resolution Brightened Abstract Background Artwork */}
      <div
        className="subpage-hero-art"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="subpage-hero-overlay" />
      <div className="subpage-hero-grid" />

      {/* Main Content */}
      <div className="subpage-hero-container">
        <Link href="/services" className="subpage-back-link">
          <ArrowLeft size={14} /> BACK TO ALL SERVICES
        </Link>

        <div style={{ maxWidth: "860px" }}>
          <div className="subpage-hero-eyebrow">
            <span className="subpage-cat-tag">{service.category}</span>
            <span className="subpage-signal-divider" />
            <span className="subpage-code-tag">CAPABILITY / {service.id.toUpperCase()}</span>
          </div>

          <h1 className="subpage-hero-title">
            {service.name}
          </h1>

          <p className="subpage-hero-desc">
            {service.description}
          </p>

          {/* Tech Stack Chips */}
          <div className="subpage-tech-row">
            {service.technologies.map((tech) => (
              <span key={tech} className="subpage-tech-chip">
                {tech}
              </span>
            ))}
          </div>

          {/* Brand Action Buttons */}
          <div className="subpage-hero-ctas">
            <Link href="/contact" className="signal-button">
              DISCUSS REQUIREMENT <ArrowUpRight size={15} />
            </Link>
            <Link href="/rfp" className="outline-button">
              REQUEST PROPOSAL
            </Link>
          </div>

          {/* Telemetry Metrics */}
          <div className="subpage-meta-telemetry">
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">{service.technologies.length}</span>
              <span className="subpage-meta-label">Core Technologies</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">{service.relatedIndustries?.length || 3}+</span>
              <span className="subpage-meta-label">Industry Applications</span>
            </div>
            <div className="subpage-meta-item">
              <span className="subpage-meta-value">99.99%</span>
              <span className="subpage-meta-label">Enterprise SLA Reliability</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceHero;
