import React from "react";
import { Blocks } from "lucide-react";

export const ModulesDeveloped = ({ caseStudy }) => {
  if (!caseStudy.modules || caseStudy.modules.length === 0) return null;

  return (
    <section className="py-8 bg-background border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">05</span>
          <h2 className="text-2xl font-bold">Modules Developed</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {caseStudy.modules.map((module, idx) => (
            <div key={idx} className="p-5 bg-card border border-border/40 rounded-xl flex items-center gap-3.5 hover:border-primary/50 transition-colors">
              <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Blocks className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-primary block mb-0.5">
                  MODULE {String(idx + 1).padStart(2, '0')}
                </span>
                <h4 className="font-bold text-foreground text-sm leading-tight">{module}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
