import React from "react";
import { Activity } from "lucide-react";

export const PerformanceSection = ({ caseStudy }) => {
  if (!caseStudy.performance || caseStudy.performance.length === 0) return null;

  return (
    <section className="py-8 bg-card/20 border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">09</span>
          <h2 className="text-2xl font-bold">Performance & Scalability</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {caseStudy.performance.map((perf, idx) => (
            <div key={idx} className="p-5 bg-background border border-border/40 rounded-xl border-l-4 border-l-primary">
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-1 block">{perf.metric}</span>
              <span className="text-xl font-bold text-white">{perf.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
