import React from "react";
import { CaseStudyCard } from "./CaseStudyCard";

export const CaseStudyGrid = ({ caseStudies }) => {
  return (
    <section className="py-12 md:py-24 bg-background" id="case-studies-grid">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {caseStudies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((cs) => (
              <CaseStudyCard key={cs.id} caseStudy={cs} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-border/40 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">No case studies found</h3>
            <p className="text-muted-foreground">Adjust your filters to see more results.</p>
          </div>
        )}
        
      </div>
    </section>
  );
};
