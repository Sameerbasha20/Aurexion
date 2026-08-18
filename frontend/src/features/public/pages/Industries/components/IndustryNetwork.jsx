import React from "react";
import { industriesData } from "../../../../../data/industries";

export const IndustryNetwork = () => {
  // We'll map the 18 industries in a circular layout
  const radius = 350;
  
  return (
    <section id="network" className="py-24 bg-[#0a0f18] overflow-hidden scroll-mt-20 border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 lg:hidden">
          <h2 className="text-3xl font-bold text-white mb-4">Enterprise Industry Ecosystem</h2>
          <p className="text-gray-400">Connecting Aurexion capabilities across 18 target verticals.</p>
        </div>

        {/* Desktop Circular Network Visualization */}
        <div className="hidden lg:flex relative w-full h-[800px] items-center justify-center max-w-6xl mx-auto">
          
          {/* Central Hub */}
          <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="px-8 py-4 bg-background border border-primary text-primary text-lg font-bold tracking-widest rounded-sm shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                AUREXION
              </div>
            </div>
          </div>

          {/* Connectors & Nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 800">
            {industriesData.map((industry, i) => {
              const angle = (i * (360 / industriesData.length)) * (Math.PI / 180);
              // Center is 500, 400
              const cx = 500 + Math.cos(angle) * (radius * 0.8);
              const cy = 400 + Math.sin(angle) * (radius * 0.8);
              
              return (
                <path 
                  key={`line-${i}`}
                  d={`M 500 400 L ${cx} ${cy}`} 
                  stroke="rgba(var(--primary), 0.2)" 
                  strokeWidth="1" 
                  strokeDasharray="4,4"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: '4s' }}
                />
              );
            })}
          </svg>

          {/* Industry Labels */}
          {industriesData.map((industry, i) => {
            const angle = (i * (360 / industriesData.length)) * (Math.PI / 180);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <div 
                key={industry.id}
                className="absolute z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group cursor-default"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`
                }}
              >
                <div className="px-3 py-1.5 bg-card/40 border border-border/30 text-white font-mono text-xs backdrop-blur-md rounded whitespace-nowrap group-hover:border-primary/60 group-hover:bg-primary/10 transition-colors">
                  {industry.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
