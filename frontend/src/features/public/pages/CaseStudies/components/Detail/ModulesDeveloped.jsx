import React from "react";
import { Blocks } from "lucide-react";

export const ModulesDeveloped = ({ caseStudy }) => {
  if (!caseStudy.modules || caseStudy.modules.length === 0) return null;

  return (
    <section className="py-12 bg-background border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Modules Developed</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {caseStudy.modules.map((module, idx) => (
            <div key={idx} className="p-6 bg-[#080f1a] border border-border/20 rounded-xl flex items-start gap-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Blocks className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#63f5e8] block mb-1">
                  MODULE {String(idx + 1).padStart(2, '0')}
                </span>
                <h4 className="font-bold text-gray-100 text-sm leading-snug">{module}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesDeveloped;
