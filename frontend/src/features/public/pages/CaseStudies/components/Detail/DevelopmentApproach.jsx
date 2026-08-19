import React from "react";
import { ArrowDown } from "lucide-react";

export const DevelopmentApproach = ({ caseStudy }) => {
  if (!caseStudy.developmentApproach || caseStudy.developmentApproach.length === 0) return null;

  return (
    <section className="py-8 bg-[#0a0f18] border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">04</span>
          <h2 className="text-2xl font-bold text-white">Engineering Approach</h2>
        </div>

        <div className="max-w-2xl">
          <div className="relative border-l border-primary/30 ml-4 md:ml-6 pl-8 md:pl-12 space-y-12 py-4">
            {caseStudy.developmentApproach.map((phase, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[41px] md:-left-[57px] top-0 w-4 h-4 rounded-full bg-[#0a0f18] border-2 border-primary group-hover:bg-primary transition-colors" />
                
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                  {phase.step.toUpperCase()}
                </h3>
                <p className="text-gray-400 leading-relaxed">
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
