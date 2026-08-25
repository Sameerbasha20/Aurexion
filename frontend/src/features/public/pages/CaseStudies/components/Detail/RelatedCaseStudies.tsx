import React from "react";
import { Link } from "wouter";
import { caseStudiesData } from "../../../../../../data/caseStudies";
import { CaseStudyCard } from "../CaseStudyCard";

export const RelatedCaseStudies = ({ currentCaseStudy }: { currentCaseStudy: any }) => {
  const related = caseStudiesData.filter(cs => cs.id !== currentCaseStudy.id).slice(0, 3);
  
  if (related.length === 0) return null;

  return (
    <section className="py-12 bg-background border-t border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white tracking-tight">Explore More Case Studies</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {related.map((cs) => (
            <CaseStudyCard key={cs.id} caseStudy={cs} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedCaseStudies;
