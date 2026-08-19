import React from "react";
import { FileCheck } from "lucide-react";

export const ComplianceSection = ({ caseStudy }) => {
  if (!caseStudy.complianceMeasures || caseStudy.complianceMeasures.length === 0) return null;

  return (
    <section className="py-12 bg-background border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">08</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Compliance & Governance</h2>
        </div>

        <div className="space-y-6 max-w-4xl">
          {caseStudy.complianceMeasures.map((measure, idx) => (
            <div key={idx} className="p-6 bg-[#080f1a] border border-border/20 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-center">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1.5">{measure.requirement}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{measure.approach}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
