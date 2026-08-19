import React from "react";
import { industriesData } from "../../../../../data/industries";
import { IndustryCard } from "./IndustryCard";

export const IndustryGrid = () => {
  return (
    <section className="py-24 bg-background border-t border-border/10" id="all-industries">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The 18 Target Verticals</h2>
          <p className="text-lg text-muted-foreground">
            Aurexion engineers digital platforms and custom enterprise solutions tailored to the strict regulatory and operational demands of these specific sectors.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {industriesData.map(industry => (
            <IndustryCard key={industry.id} industry={industry} />
          ))}
        </div>
      </div>
    </section>
  );
};
