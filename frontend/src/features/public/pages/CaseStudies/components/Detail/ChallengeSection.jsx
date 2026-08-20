import React from "react";

export const ChallengeSection = ({ caseStudy }) => {
  return (
    <section className="py-12 bg-background border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">The Challenge</h2>
        </div>
        
        <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-4xl">
          {caseStudy.challenge}
        </p>
      </div>
    </section>
  );
};

export default ChallengeSection;
