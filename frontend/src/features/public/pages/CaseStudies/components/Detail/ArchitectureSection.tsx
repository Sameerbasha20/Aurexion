import React from "react";
import { Server, Database, Cloud, Globe } from "lucide-react";

export const ArchitectureSection = ({ caseStudy }: { caseStudy: any }) => {
  return (
    <section className="py-12 bg-[#0a0f18] border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Proposed Architecture</h2>
          </div>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-4xl">
            {caseStudy.architecture.description}
          </p>
        </div>

        {/* Abstract Technical Architecture Diagram */}
        <div className="bg-[#080f1a] border border-border/20 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-6">
            
            {/* User / Client Layer */}
            <div className="border border-primary/30 bg-primary/5 rounded-xl p-6 text-center flex flex-col items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              <span className="text-sm font-mono font-bold text-white tracking-widest">CLIENT / PRESENTATION LAYER</span>
              <p className="text-xs text-gray-400">Web / Mobile Interfaces</p>
            </div>
            
            <div className="flex justify-center">
              <div className="w-[1px] h-8 bg-gradient-to-b from-primary/50 to-primary/20" />
            </div>

            {/* API Gateway Layer */}
            <div className="border border-cyan-500/30 bg-cyan-500/5 rounded-xl p-6 text-center flex flex-col items-center gap-3">
              <Cloud className="w-6 h-6 text-cyan-400" />
              <span className="text-sm font-mono font-bold text-white tracking-widest">API GATEWAY & SECURITY</span>
              <p className="text-xs text-gray-400">Rate Limiting, Authentication, Routing</p>
            </div>

            <div className="flex justify-center">
              <div className="w-[1px] h-8 bg-gradient-to-b from-cyan-500/50 to-indigo-500/20" />
            </div>

            {/* Microservices Layer */}
            <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-xl p-6 flex flex-col gap-4">
              <div className="text-center">
                <span className="text-sm font-mono font-bold text-white tracking-widest">MICROSERVICES / APPLICATION LAYER</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {caseStudy.architecture.components.slice(0,4).map((comp: any, i: number) => (
                  <div key={i} className="bg-background/80 border border-border/40 p-4 rounded text-center flex flex-col items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-bold text-gray-300">{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-[1px] h-8 bg-gradient-to-b from-indigo-500/50 to-orange-500/20" />
            </div>

            {/* Data Layer */}
            <div className="border border-orange-500/30 bg-orange-500/5 rounded-xl p-6 text-center flex flex-col items-center gap-3">
              <Database className="w-6 h-6 text-orange-400" />
              <span className="text-sm font-mono font-bold text-white tracking-widest">DATA LAYER</span>
              <p className="text-xs text-gray-400">Primary Databases, Cache, Event Streams</p>
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
};

export default ArchitectureSection;
