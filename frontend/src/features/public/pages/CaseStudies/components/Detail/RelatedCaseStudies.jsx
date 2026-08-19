import React from "react";
import { Link } from "wouter";
import { caseStudiesData } from "../../../../../../data/caseStudies";
import { CaseStudyCard } from "../CaseStudyCard";

export const RelatedCaseStudies = ({ currentCaseStudy }) => {
  const related = caseStudiesData.filter(cs => cs.id !== currentCaseStudy.id).slice(0, 3);
  
  if (related.length === 0) return null;

  return (
    <section className="py-10 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Explore More Case Studies</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {related.map((cs) => (
            <CaseStudyCard key={cs.id} caseStudy={cs} />
          ))}
        </div>
      </div>
    </section>
  );
};
