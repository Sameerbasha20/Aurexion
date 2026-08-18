import React from "react";
import { Code, Eye, Lock, Zap, Settings } from "lucide-react";

const differentiators = [
  {
    number: "01",
    title: "Senior Engineering Focus",
    description: "Teams composed of veteran architects and senior developers.",
    icon: Code
  },
  {
    number: "02",
    title: "Transparent Delivery",
    description: "Complete visibility into our agile processes and code quality.",
    icon: Eye
  },
  {
    number: "03",
    title: "IP Security",
    description: "Rigorous protection of your intellectual property and data.",
    icon: Lock
  },
  {
    number: "04",
    title: "Agile Methodology",
    description: "Adaptable execution designed for complex enterprise changes.",
    icon: Zap
  },
  {
    number: "05",
    title: "Performance Benchmarks",
    description: "Engineering measured against strict operational SLAs.",
    icon: Settings
  }
];

export const WhyAurexionServices: React.FC = () => {
  return (
    <section className="py-24 bg-[#050B14] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">Why Partner With Aurexion</h2>
        
        <div className="max-w-5xl mx-auto space-y-6">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="group flex flex-col sm:flex-row items-start sm:items-center p-6 sm:p-8 bg-card/5 border border-border/20 rounded-lg hover:border-primary/40 hover:bg-card/10 transition-all duration-300">
                <div className="flex items-center sm:w-1/3 mb-4 sm:mb-0">
                  <span className="text-3xl font-mono text-[#63f5e8] font-bold mr-6 drop-shadow-[0_0_10px_rgba(99,245,232,0.7)] group-hover:drop-shadow-[0_0_16px_rgba(99,245,232,0.95)] transition-all">
                    {item.number}
                  </span>
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mr-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{item.title}</h3>
                </div>
                
                <div className="sm:w-2/3 sm:pl-12 sm:border-l border-border/20">
                  <p className="text-gray-400 text-lg leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
