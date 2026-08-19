import React from "react";
import { CheckCircle2 } from "lucide-react";

export const OutcomeSection = ({ caseStudy }) => {
  const hasResults = caseStudy.results && caseStudy.results.length > 0;

  const outcomeSummary = caseStudy.architecture?.description
    ? `Aurexion delivered ${caseStudy.architecture.description.toLowerCase().replace(/^a /, "a comprehensive ")}`
    : `By re-engineering the core platform from the ground up, Aurexion delivered a scalable, secure, and high-performance digital foundation that eliminated legacy technical debt and automated critical workflows.`;

  const valuePillars = hasResults
    ? caseStudy.results.map((r) => `${r.impact} ${r.label}`)
    : [
        "Business Transformation",
        "Technical Excellence",
        "Operational Efficiency",
        "Secure Architecture",
        "Infinite Scalability",
      ];

  return (
    <section className="py-12 bg-[#0a0f18] border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">The Outcome</h2>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-8">
            {outcomeSummary}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {valuePillars.map((val, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/30 rounded-full"
              >
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-bold text-gray-200">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OutcomeSection;
