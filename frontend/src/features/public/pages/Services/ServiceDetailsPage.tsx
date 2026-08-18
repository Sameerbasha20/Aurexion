import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { servicesData } from "../../../../data/services";

import { ServiceHero } from "./components/Detail/ServiceHero";
import { ChallengeSection } from "./components/Detail/ChallengeSection";
import { ApproachSection } from "./components/Detail/ApproachSection";
import { TechnologySection } from "./components/Detail/TechnologySection";
import { RelatedIndustries } from "./components/Detail/RelatedIndustries";
import { RelatedCaseStudies } from "./components/Detail/RelatedCaseStudies";
import { ServiceCTA } from "./components/Detail/ServiceCTA";

export const ServiceDetailsPage: React.FC = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug;

  const service = servicesData.find((s: any) => s.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!service) {
    // Redirect to services hub if not found
    setLocation("/services");
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <ServiceHero service={service} />
      <ChallengeSection />
      <ApproachSection />
      <TechnologySection service={service} />
      <RelatedIndustries service={service} />
      <RelatedCaseStudies service={service} />
      <ServiceCTA />
    </div>
  );
};

export default ServiceDetailsPage;
