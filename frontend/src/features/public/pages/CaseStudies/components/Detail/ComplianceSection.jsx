import React from "react";
import { FileCheck } from "lucide-react";

export const ComplianceSection = ({ caseStudy }) => {
  if (!caseStudy.complianceMeasures || caseStudy.complianceMeasures.length === 0) return null;

  return (
    <section className="py-8 bg-background border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">08</span>
          <h2 className="text-2xl font-bold">Compliance & Governance</h2>
        </div>

        <div className="space-y-6 max-w-4xl">
          {caseStudy.complianceMeasures.map((measure, idx) => (
            <div key={idx} className="p-6 bg-card border border-border/40 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center justify-center flex-shrink-0 text-center">
                <FileCheck className="w-6 h-6 text-primary mb-1" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{measure.requirement}</h4>
                <p className="text-muted-foreground leading-relaxed">{measure.approach}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
