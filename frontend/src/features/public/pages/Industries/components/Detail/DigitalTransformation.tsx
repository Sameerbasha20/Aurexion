import React from "react";
import { ArrowDown, ArrowRight } from "lucide-react";

export const DigitalTransformation = () => {
  return (
    <section className="py-16 md:py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-[#eef4f3]">From Industry Challenges to Digital Transformation</h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">Architecting the journey from legacy debt to scalable enterprise.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-6 gap-2 text-center items-center">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-xs font-mono font-bold text-amber-400">LEGACY SYSTEMS</span>
            </div>
            
            <div className="col-span-1 h-[2px] bg-border relative">
              <div className="absolute right-0 top-1/2 -mt-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-border" />
            </div>
            
            <div className="col-span-2 p-6 bg-card border border-border/40 rounded-lg shadow-lg relative z-10">
              <div className="space-y-4">
                <div className="p-2 border border-border/40 rounded text-xs font-mono bg-background text-[#eef4f3]">MODERN ARCHITECTURE</div>
                <div className="p-2 border border-border/40 rounded text-xs font-mono bg-background text-[#eef4f3]">DATA &amp; AI</div>
                <div className="p-2 border border-border/40 rounded text-xs font-mono bg-background text-[#eef4f3]">CLOUD</div>
              </div>
              <div className="absolute inset-0 bg-primary/5 pointer-events-none rounded-lg" />
            </div>

            <div className="col-span-1 h-[2px] bg-border relative">
              <div className="absolute right-0 top-1/2 -mt-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-border" />
            </div>
            
            <div className="p-4 bg-primary/20 border border-primary/40 rounded-lg shadow-[0_0_20px_rgba(99,245,232,0.2)]">
              <span className="text-xs font-mono font-bold text-primary">SCALABLE ENTERPRISE</span>
            </div>
          </div>

          {/* Mobile Vertical Flow */}
          <div className="flex md:hidden flex-col items-center gap-3 w-full max-w-sm mx-auto text-center">
            <div className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-xs font-mono font-bold text-amber-400">LEGACY SYSTEMS</span>
            </div>

            <div className="flex items-center justify-center text-[#64748b] my-0.5">
              <ArrowDown size={18} className="text-amber-400" />
            </div>

            <div className="w-full p-5 bg-[#0a111c] border border-[rgba(99,245,232,0.2)] rounded-lg shadow-lg relative">
              <div className="space-y-2.5">
                <div className="p-2.5 border border-border/40 rounded text-xs font-mono bg-[#050811] text-[#eef4f3]">MODERN ARCHITECTURE</div>
                <div className="p-2.5 border border-border/40 rounded text-xs font-mono bg-[#050811] text-[#eef4f3]">DATA &amp; AI</div>
                <div className="p-2.5 border border-border/40 rounded text-xs font-mono bg-[#050811] text-[#eef4f3]">CLOUD</div>
              </div>
            </div>

            <div className="flex items-center justify-center text-[#64748b] my-0.5">
              <ArrowDown size={18} className="text-[#63f5e8]" />
            </div>

            <div className="w-full p-4 bg-[rgba(99,245,232,0.1)] border border-[rgba(99,245,232,0.35)] rounded-lg shadow-[0_0_20px_rgba(99,245,232,0.15)]">
              <span className="text-xs font-mono font-bold text-[#63f5e8]">SCALABLE ENTERPRISE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
