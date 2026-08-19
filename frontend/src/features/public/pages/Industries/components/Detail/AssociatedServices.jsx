import React from "react";
import ServiceCardGrid from "../../../../components/ServiceCardGrid";

export const AssociatedServices = ({ industry }) => {
  if (!industry.relatedServices || industry.relatedServices.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-12">
          Technology Services for {industry.name}
        </h2>

        <ServiceCardGrid serviceSlugs={industry.relatedServices} />
      </div>
    </section>
  );
};