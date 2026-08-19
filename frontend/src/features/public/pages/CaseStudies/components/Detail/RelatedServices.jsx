import React from "react";
import ServiceCardGrid from "../../../../components/ServiceCardGrid";

export const RelatedServices = ({ caseStudy }) => {
  if (!caseStudy.services || caseStudy.services.length === 0) return null;

  return (
    <section className="py-8 bg-background border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">10</span>
          <h2 className="text-2xl font-bold">Services Used</h2>
        </div>
        <ServiceCardGrid serviceSlugs={caseStudy.services} />
      </div>
    </section>
  );
};
