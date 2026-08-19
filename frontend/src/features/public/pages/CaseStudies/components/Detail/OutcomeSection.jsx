import React from "react";
import { CheckCircle2 } from "lucide-react";

export const OutcomeSection = ({ caseStudy }) => {
  return (
    <section className="py-8 bg-[#0a0f18] border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">The Outcome</h2>
          <p className="text-base text-gray-300 leading-relaxed mb-6">
            By completely re-architecting the system from the ground up, Aurexion delivered a scalable, secure, and high-performance digital platform. The new infrastructure eliminated technical debt, automated critical workflows, and provided a future-proof foundation for the enterprise's continued growth.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {["Business Transformation", "Technical Excellence", "Operational Efficiency", "Secure Architecture", "Infinite Scalability"].map((val, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-gray-200">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
