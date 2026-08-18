import React from "react";
import { ArrowDown } from "lucide-react";

export const ChallengeSolutionFlow = () => {
  const steps = [
    { label: "INDUSTRY CHALLENGE", color: "text-destructive" },
    { label: "BUSINESS REQUIREMENT", color: "text-orange-400" },
    { label: "AUREXION SOLUTION", color: "text-primary" },
    { label: "TECHNOLOGY", color: "text-cyan-400" },
    { label: "BUSINESS OUTCOME", color: "text-green-400" }
  ];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-4">Engineering Approach</h2>
          <p className="text-muted-foreground">From complex challenge to measurable outcome.</p>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-border via-primary/50 to-border transform -translate-x-1/2" />
          
          <div className="flex flex-col space-y-12 relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className={`px-6 py-3 rounded-full bg-card border border-border/40 shadow-lg text-center min-w-[280px] transition-all duration-500 hover:scale-105 hover:border-primary/50`}>
                  <span className={`font-mono text-sm tracking-[0.2em] font-bold ${step.color}`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowDown className="w-6 h-6 text-muted-foreground mt-12 animate-bounce" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
