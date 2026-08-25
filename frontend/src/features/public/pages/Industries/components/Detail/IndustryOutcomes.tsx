import React from "react";
import { Target, Zap, Activity } from "lucide-react";

export const IndustryOutcomes = ({ industry }: { industry: any }) => {
  if (!industry.outcomes || industry.outcomes.length === 0) return null;

  return (
    <section className="py-24 bg-[#0a0f18] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Engineering Outcomes</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {industry.outcomes.map((outcome: any, idx: number) => {
            const Icon = idx === 0 ? Target : idx === 1 ? Zap : Activity;
            return (
              <div key={idx} className="p-8 bg-card/10 border border-border/20 rounded-lg hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{outcome}</h3>
                <p className="text-gray-400">
                  Measurable improvements in {outcome.toLowerCase()} driven by scalable architecture and rigorous engineering standards.
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
};
