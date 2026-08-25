import React from "react";

export const ResultsSection = ({ caseStudy }: { caseStudy: any }) => {
  if (!caseStudy.results || caseStudy.results.length === 0) return null;

  return (
    <section className="py-12 bg-[#050B14] border-b border-border/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mx-auto mb-8">
          <div className="inline-flex items-center gap-2 mb-3 justify-center">
            <div className="w-6 h-[1px] bg-primary" />
            <span className="text-primary font-mono text-xs tracking-[0.2em] uppercase font-bold">
              MEASURABLE RESULTS
            </span>
            <div className="w-6 h-[1px] bg-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Business Impact</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {caseStudy.results.map((result: any, idx: number) => (
            <div key={idx} className="p-8 bg-[#080f1a] border border-primary/20 rounded-2xl text-center backdrop-blur-sm relative group overflow-hidden hover:border-primary/50 transition-colors shadow-lg">
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <div className="relative z-10">
                <span className="block text-3xl md:text-4xl font-bold text-white mb-2 tracking-tighter">{result.impact}</span>
                <span className="block text-xs font-mono tracking-widest text-primary uppercase font-bold">{result.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
