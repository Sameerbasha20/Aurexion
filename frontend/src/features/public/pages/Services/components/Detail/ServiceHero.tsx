import React from "react";
import { Link } from "wouter";
import { ServiceItem } from "../../../../../../data/services";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

interface ServiceHeroProps {
  service: ServiceItem;
}

const SERVICE_IMAGES: Record<string, string> = {
  // Category defaults (Abstract, cinematic, text-free enterprise visuals)
  "Core Engineering": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=85",
  "AI & Data Science": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=85",
  "Cloud & Infrastructure": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "Enterprise Products": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
  "Digital Platforms": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
  "Quality & Advisory": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85",

  // Specific Slug Overrides (No chart UI or dashboard text)
  "artificial-intelligence-solutions": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
  "machine-learning-engineering": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=85",
  "generative-ai-platform-integration": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
  "data-engineering": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=85",
  "data-analytics": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85",
  "business-intelligence-bi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85",
  "custom-software-development": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85",
  "enterprise-application-engineering": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=85",
  "python-microservices": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=85",
  "legacy-system-modernization": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
  "microservices-architecture": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=85",
  "cloud-architecture-modernization": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "cloud-migration": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85",
  "devops-cicd-automation": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1600&q=85",
  "cybersecurity-threat-governance": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=85",
};

export const ServiceHero: React.FC<ServiceHeroProps> = ({ service }) => {
  const imageUrl =
    SERVICE_IMAGES[service.slug] ||
    SERVICE_IMAGES[service.category] ||
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85";

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
