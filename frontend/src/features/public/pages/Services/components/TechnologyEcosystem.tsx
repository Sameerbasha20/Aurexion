import React from "react";

export const TechnologyEcosystem: React.FC = () => {
  return (
    <section className="py-24 bg-[#0a0f18] overflow-hidden border-y border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Built Across the Modern Enterprise Technology Stack</h2>
          <p className="text-gray-400">
            Aurexion's services operate as a connected ecosystem, ensuring interoperability, scale, and security across all domains.
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px] flex items-center justify-center">
          
          {/* Animated Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500">
            {/* Center Node Connections */}
            <path d="M 500 250 L 500 100" stroke="rgba(var(--primary), 0.3)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
            <path d="M 500 250 L 500 400" stroke="rgba(var(--primary), 0.3)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
            <path d="M 500 250 L 200 250" stroke="rgba(var(--primary), 0.3)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
            <path d="M 500 250 L 800 250" stroke="rgba(var(--primary), 0.3)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
            
            <path d="M 200 250 Q 350 100 500 100" stroke="rgba(0, 255, 255, 0.2)" fill="none" strokeWidth="1" />
            <path d="M 800 250 Q 650 100 500 100" stroke="rgba(0, 255, 255, 0.2)" fill="none" strokeWidth="1" />
            <path d="M 200 250 Q 350 400 500 400" stroke="rgba(0, 255, 255, 0.2)" fill="none" strokeWidth="1" />
            <path d="M 800 250 Q 650 400 500 400" stroke="rgba(0, 255, 255, 0.2)" fill="none" strokeWidth="1" />
          </svg>

          {/* Central Hub */}
          <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[30px] animate-pulse" />
              <div className="px-6 py-3 bg-background border border-primary text-primary font-bold tracking-widest rounded-sm shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                AUREXION
              </div>
            </div>
          </div>

          {/* Top Node */}
          <div className="absolute z-10 top-[15%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="px-4 py-2 bg-card/50 border border-border/40 text-white font-mono text-sm backdrop-blur-md rounded">
              AI / DATA SCIENCE
            </div>
          </div>

          {/* Bottom Node */}
          <div className="absolute z-10 bottom-[15%] left-1/2 transform -translate-x-1/2 translate-y-1/2 flex flex-col gap-4 items-center">
            <div className="px-4 py-2 bg-card/50 border border-border/40 text-white font-mono text-sm backdrop-blur-md rounded">
              ENTERPRISE PRODUCTS
            </div>
            <div className="px-4 py-2 bg-card/50 border border-border/40 text-white font-mono text-sm backdrop-blur-md rounded">
              DIGITAL PLATFORMS
            </div>
            <div className="px-4 py-2 bg-card/50 border border-border/40 text-white font-mono text-sm backdrop-blur-md rounded">
              QUALITY & ADVISORY
            </div>
          </div>

          {/* Left Node */}
          <div className="absolute z-10 top-1/2 left-[15%] md:left-[20%] transform -translate-x-1/2 -translate-y-1/2">
            <div className="px-4 py-2 bg-card/50 border border-border/40 text-white font-mono text-sm backdrop-blur-md rounded">
              CORE ENGINEERING
            </div>
          </div>

          {/* Right Node */}
          <div className="absolute z-10 top-1/2 right-[15%] md:right-[20%] transform translate-x-1/2 -translate-y-1/2">
            <div className="px-4 py-2 bg-card/50 border border-border/40 text-white font-mono text-sm backdrop-blur-md rounded">
              CLOUD & INFRA
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
