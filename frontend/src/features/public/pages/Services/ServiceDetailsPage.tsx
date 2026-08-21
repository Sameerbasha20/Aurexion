import React, { useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useServiceDetails } from "../../hooks/usePublicContent";
import { servicesData } from "../../../../data/services";
import { ServiceDetail } from "../../types/website.types";

import { ServiceHero } from "./components/Detail/ServiceHero";
import { ChallengeSection } from "./components/Detail/ChallengeSection";
import { ApproachSection } from "./components/Detail/ApproachSection";
import { TechnologySection } from "./components/Detail/TechnologySection";
import { RelatedIndustries } from "./components/Detail/RelatedIndustries";
import { RelatedCaseStudies } from "./components/Detail/RelatedCaseStudies";
import { ServiceCTA } from "./components/Detail/ServiceCTA";
import { SEO } from "../../../../components/seo/SEO";
import { createServiceSchema } from "../../../../components/seo/structuredData";
import { getSiteUrl } from "../../../../components/seo/seoConfig";

export const ServiceDetailsPage: React.FC = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug || "";

  // Query PostgreSQL model via public API
  const { data: apiService, loading } = useServiceDetails(slug);

  // Fall back to static data if not yet loaded or not present in DB
  const staticService = servicesData.find((s) => s.slug === slug);

  // Normalize both sources into the shared ServiceDetail shape
  const service = useMemo<ServiceDetail | null>(() => {
    if (apiService) {
      return {
        id: String(apiService.id),
        slug: apiService.slug,
        name: apiService.title || staticService?.name || "",
        category: staticService?.category || "Core Engineering",
        description: apiService.description || staticService?.description || "",
        problem: apiService.problem,
        solution: apiService.solution,
        technologies: apiService.tech_stack.length > 0 ? apiService.tech_stack : staticService?.technologies || [],
        meta_title: apiService.meta_title,
        meta_description: apiService.meta_description,
        meta_keywords: apiService.meta_keywords,
        relatedIndustries: staticService?.relatedIndustries || [],
        relatedCaseStudies: staticService?.relatedCaseStudies || []
      };
    }
    if (staticService) {
      return {
        id: staticService.id,
        slug: staticService.slug,
        name: staticService.name,
        category: staticService.category,
        description: staticService.description,
        problem: "",
        solution: "",
        technologies: staticService.technologies,
        meta_title: null,
        meta_description: null,
        meta_keywords: null,
        relatedIndustries: staticService.relatedIndustries,
        relatedCaseStudies: staticService.relatedCaseStudies
      };
    }
    return null;
  }, [apiService, staticService]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading && !apiService && !staticService) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-primary font-mono text-sm">LOADING SERVICE ARCHITECTURE...</div>
      </div>
    );
  }

  if (!service) {
    setLocation("/services");
    return null;
  }

  const siteUrl = getSiteUrl();
  const serviceJsonLd = createServiceSchema({
    name: service.name,
    description: service.meta_description || service.description,
    url: `/services/${service.slug}`,
    serviceType: service.category
  }, siteUrl);

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title={service.meta_title || `${service.name} | Technology Services`}
        description={service.meta_description || service.description}
        canonical={`/services/${service.slug}`}
        keywords={service.meta_keywords ? service.meta_keywords.split(",").map((k) => k.trim()) : [service.name, service.category, "enterprise engineering"]}
        jsonLd={serviceJsonLd}
      />
      <ServiceHero service={service} />
      <ChallengeSection service={service} />
      <ApproachSection />
      <TechnologySection service={service} />
      <RelatedIndustries service={service} />
      <RelatedCaseStudies service={service} />
      <ServiceCTA />
    </div>
  );
};

export default ServiceDetailsPage;
