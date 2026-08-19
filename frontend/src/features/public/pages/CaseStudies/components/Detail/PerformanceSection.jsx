import React from "react";
import { Activity } from "lucide-react";

export const PerformanceSection = ({ caseStudy }) => {
  if (!caseStudy.performance || caseStudy.performance.length === 0) return null;

  return (
    <section className="py-12 bg-card/20 border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">09</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Performance & Scalability</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {caseStudy.performance.map((perf, idx) => (
            <div key={idx} className="p-6 bg-[#080f1a] border border-border/20 rounded-xl border-l-4 border-l-primary hover:border-primary/40 transition-colors">
              <span className="text-xs font-mono tracking-widest text-[#63f5e8] uppercase mb-2 block">{perf.metric}</span>
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight">{perf.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;
