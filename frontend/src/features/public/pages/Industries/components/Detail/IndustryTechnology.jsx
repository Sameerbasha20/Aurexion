import React from "react";
import { Cpu } from "lucide-react";

export const IndustryTechnology = ({ industry }) => {
  if (!industry.technologies || industry.technologies.length === 0) return null;

  return (
    <section className="py-24 bg-[#0a0f18] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Technology Capabilities</h2>
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          We leverage these specific technologies to engineer secure, high-performance solutions for {industry.name}.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {industry.technologies.map((tech, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 px-6 py-3 border border-border/30 rounded bg-card/20 hover:bg-card hover:border-primary/50 transition-colors"
            >
              <Cpu className="w-4 h-4 text-primary opacity-70" />
              <span className="font-mono font-bold text-gray-200">{tech}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
