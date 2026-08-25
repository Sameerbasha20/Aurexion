import React from "react";

export const DevelopmentApproach = ({ caseStudy }: { caseStudy: any }) => {
  if (!caseStudy.developmentApproach || caseStudy.developmentApproach.length === 0) return null;

  return (
    <section className="py-12 bg-[#0a0f18] border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Engineering Approach</h2>
        </div>

        <div className="max-w-3xl">
          <div className="relative border-l-2 border-primary/30 ml-4 md:ml-6 pl-8 md:pl-12 space-y-10 py-2">
            {caseStudy.developmentApproach.map((phase: any, idx: number) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[41px] md:-left-[57px] top-1 w-5 h-5 rounded-full bg-[#0a0f18] border-2 border-primary group-hover:bg-primary group-hover:shadow-[0_0_12px_rgba(99,245,232,0.6)] transition-all" />
                
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 tracking-wide font-mono">
                  {phase.step.toUpperCase()}
                </h3>
                <p className="text-gray-300 leading-relaxed text-base">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DevelopmentApproach;
