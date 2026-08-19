import React from "react";
import ServiceCardGrid from "../../../../components/ServiceCardGrid";

export const AssociatedServices = ({ industry }) => {
  if (!industry.relatedServices || industry.relatedServices.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
<<<<<<< HEAD
        <h2 className="text-3xl font-bold mb-12">Technology Services for {industry.name}</h2>
=======
        <h2 className="text-3xl font-bold mb-12">
          Technology Services for {industry.name}
        </h2>

>>>>>>> 687389ff60cc3f75586641e2a675f905d610c73f
        <ServiceCardGrid serviceSlugs={industry.relatedServices} />
      </div>
    </section>
  );
};