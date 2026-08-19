import React from "react";

export const DigitalTransformation = () => {
  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">From Industry Challenges to Digital Transformation</h2>
          <p className="text-muted-foreground">Architecting the journey from legacy debt to scalable enterprise.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center items-center">
            
            <div className="md:col-span-1 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <span className="text-xs font-mono font-bold text-destructive">LEGACY SYSTEMS</span>
            </div>
            
            <div className="hidden md:block col-span-1 h-[2px] bg-border relative">
              <div className="absolute right-0 top-1/2 -mt-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-border" />
            </div>
            
            <div className="md:col-span-2 p-6 bg-card border border-border/40 rounded-lg shadow-lg relative z-10">
              <div className="space-y-4">
                <div className="p-2 border border-border/40 rounded text-xs font-mono bg-background">MODERN ARCHITECTURE</div>
                <div className="p-2 border border-border/40 rounded text-xs font-mono bg-background">DATA & AI</div>
                <div className="p-2 border border-border/40 rounded text-xs font-mono bg-background">CLOUD</div>
              </div>
              <div className="absolute inset-0 bg-primary/5 pointer-events-none rounded-lg" />
            </div>

            <div className="hidden md:block col-span-1 h-[2px] bg-border relative">
              <div className="absolute right-0 top-1/2 -mt-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-border" />
            </div>
            
            <div className="md:col-span-1 p-4 bg-primary/20 border border-primary/40 rounded-lg shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <span className="text-xs font-mono font-bold text-primary">SCALABLE ENTERPRISE</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
