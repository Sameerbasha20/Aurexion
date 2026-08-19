import React from "react";
import { Link } from "wouter";
import { ServiceItem } from "../../../../../../data/services";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

interface ServiceHeroProps {
  service: ServiceItem;
}

const SERVICE_IMAGES: Record<string, string> = {
  // Category defaults
  "Core Engineering": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85",
  "AI & Data Science": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
  "Cloud & Infrastructure": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "Enterprise Products": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=85",
  "Digital Platforms": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
  "Quality & Advisory": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=85",

  // Core Engineering
  "custom-software-development": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85",
  "enterprise-application-engineering": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=85",
  "python-microservices": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=85",
  "legacy-system-modernization": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
  "microservices-architecture": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85",

  // AI & Data Science
  "artificial-intelligence-solutions": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
  "machine-learning-engineering": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=85",
  "generative-ai-platform-integration": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
  "data-engineering": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85",
  "data-analytics": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85",
  "business-intelligence": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85",
  "business-intelligence-bi": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85",

  // Cloud & Infrastructure
  "cloud-architecture-modernization": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "cloud-migration": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "devops-cicd-automation": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1600&q=85",
  "cybersecurity-threat-governance": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=85",
  "managed-infrastructure": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85",

  // Enterprise Products
  "custom-erp-development": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
  "enterprise-crm-solutions": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=85",
  "hrms-platforms": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85",
  "fintech-solutions": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=85",
  "healthtech-platforms": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85",
  "edtech-lms-solutions": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1600&q=85",
  "logistics-supply-chain-tech": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85",

  // Digital Platforms
  "ecommerce-platforms": "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1600&q=85",
  "cross-platform-mobile-applications": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=85",
  "rest-api-development-integrations": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85",
  "robotic-process-automation": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=85",
  "saas-product-engineering": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=85",

  // Quality & Advisory
  "software-testing-qa-automation": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85",
  "ui-ux-engineering": "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=1600&q=85",
  "strategic-technology-consulting": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85",
  "dedicated-development-team-allocation": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85",
  "managed-application-maintenance": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=85",
};

export const ServiceHero: React.FC<ServiceHeroProps> = ({ service }) => {
  const imageUrl =
    SERVICE_IMAGES[service.slug] ||
    SERVICE_IMAGES[service.category] ||
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=85";

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
