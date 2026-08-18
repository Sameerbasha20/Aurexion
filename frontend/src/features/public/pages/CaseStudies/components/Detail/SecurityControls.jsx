import React from "react";
import { ShieldCheck } from "lucide-react";

export const SecurityControls = ({ caseStudy }) => {
  if (!caseStudy.securityControls || caseStudy.securityControls.length === 0) return null;

  return (
    <section className="py-8 bg-[#0a0f18] border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">07</span>
          <h2 className="text-2xl font-bold text-white">Security Controls</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {caseStudy.securityControls.map((control, idx) => (
            <div key={idx} className="p-4 bg-card/10 border border-border/20 rounded-xl flex items-center gap-3.5">
              <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-bold text-gray-200 text-sm">{control}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
