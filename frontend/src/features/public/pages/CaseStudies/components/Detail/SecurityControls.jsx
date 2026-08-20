import React from "react";
import { ShieldCheck } from "lucide-react";

export const SecurityControls = ({ caseStudy }) => {
  if (!caseStudy.securityControls || caseStudy.securityControls.length === 0) return null;

  return (
    <section className="py-12 bg-[#0a0f18] border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Security Controls</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {caseStudy.securityControls.map((control, idx) => (
            <div key={idx} className="p-5 bg-[#080f1a] border border-border/20 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <span className="font-bold text-gray-200 text-sm">{control}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityControls;
