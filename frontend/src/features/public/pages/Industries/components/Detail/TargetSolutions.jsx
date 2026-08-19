import React from "react";
import { CheckCircle2 } from "lucide-react";

export const TargetSolutions = ({ industry }) => {
  return (
    <section className="py-24 bg-[#0a0f18] border-y border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Aurexion Solutions for {industry.name}</h2>
            <div className="w-16 h-1 bg-primary mb-8" />
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              We address complex {industry.name} requirements through rigorous software engineering, AI integration, and scalable cloud architectures. Our target solutions are designed to mitigate regulatory risk while driving operational efficiency.
            </p>
            
            <ul className="grid sm:grid-cols-2 gap-4">
              {industry.solutions.map((solution, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 font-medium">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="bg-card/10 border border-border/20 rounded-xl p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-xl pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                {[
                  { label: "Architecture", value: "Enterprise-Grade" },
                  { label: "Deployment", value: "Cloud-Native / Hybrid" },
                  { label: "Security", value: "Zero-Trust Framework" },
                  { label: "Compliance", value: "Industry Standard" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-border/20 pb-4 last:border-0 last:pb-0">
                    <span className="text-muted-foreground font-mono text-sm uppercase tracking-wider">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
