import React from "react";
import { AlertTriangle, HardDrive, Network, XOctagon, ArrowDown } from "lucide-react";

export const ChallengeVisualization = () => {
  return (
    <section className="py-12 bg-card/20 border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-sm font-mono tracking-widest text-primary text-center mb-12">CURRENT STATE LIMITATIONS</h3>
          
          <div className="flex flex-col items-center gap-4 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber-500/30 -z-10" />
            
            {[
              { icon: HardDrive, label: "Legacy Monolithic Systems" },
              { icon: XOctagon, label: "Manual Redundant Processes" },
              { icon: Network, label: "Fragmented Data Silos" },
              { icon: AlertTriangle, label: "Integration Complexity & Security Risks" }
            ].map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="bg-background border border-amber-500/30 px-6 py-4 rounded-lg flex items-center gap-4 w-full md:w-96 shadow-lg relative">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-bold text-sm text-foreground">{item.label}</span>
                </div>
                {idx < 3 && <ArrowDown className="w-5 h-5 text-amber-400/60" />}
              </React.Fragment>
            ))}
            
            <ArrowDown className="w-5 h-5 text-amber-400/60" />
            <div className="bg-amber-500/10 border border-amber-500/40 px-8 py-4 rounded-lg w-full md:w-96 text-center">
               <span className="font-bold text-amber-400">ENTERPRISE BOTTLENECK</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
