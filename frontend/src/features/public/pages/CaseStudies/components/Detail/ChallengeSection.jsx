import React from "react";

export const ChallengeSection = ({ caseStudy }) => {
  return (
    <section className="py-8 bg-background border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">01</span>
          <h2 className="text-2xl font-bold">The Challenge</h2>
        </div>
        
        <p className="text-base text-gray-300 leading-relaxed">
          {caseStudy.challenge}
        </p>
      </div>
    </section>
  );
};
