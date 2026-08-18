import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { industriesData } from "../../../../../data/industries";
import { ArrowRight } from "lucide-react";

export const IndustryExplorer = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndustry = industriesData[activeIndex];

  // Auto cycle (optional, could be disabled on interaction)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % industriesData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="industries-explorer" className="py-24 bg-[#0a0f18] border-t border-border/10 hidden md:block scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Navigation List */}
          <div className="lg:w-1/3">
            <h3 className="text-xs font-mono tracking-[0.2em] text-primary mb-6">INDUSTRIES</h3>
            <div className="h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div className="flex flex-col gap-1">
                {industriesData.map((ind, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`text-left px-4 py-3 rounded flex items-center justify-between transition-colors ${
                        isActive 
                          ? "bg-primary/10 text-primary font-bold border-l-2 border-primary" 
                          : "text-gray-400 hover:text-white hover:bg-card/20 border-l-2 border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-xs opacity-50">{ind.id}</span>
                        <span>{ind.name}</span>
                      </span>
                      {isActive && <ArrowRight className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Selected Industry Content */}
          <div className="lg:w-2/3">
            <div className="h-full bg-card/10 border border-border/20 rounded-xl p-8 lg:p-12 relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full">
                <span className="text-6xl font-bold text-[#63f5e8] opacity-75 drop-shadow-[0_0_12px_rgba(99,245,232,0.6)] absolute top-4 right-8 font-mono">{activeIndustry.id}</span>
                
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 pr-16">
                  {activeIndustry.name}
                </h3>
                
                <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
                  {activeIndustry.shortDescription}
                </p>

                <div className="grid sm:grid-cols-2 gap-8 mb-12 flex-grow">
                  <div>
                    <h4 className="text-sm font-mono text-primary mb-4">PRIMARY CHALLENGES</h4>
                    <ul className="space-y-3">
                      {activeIndustry.challenges.operational.slice(0,2).map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-400">{c.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-mono text-primary mb-4">AUREXION SOLUTIONS</h4>
                    <ul className="space-y-3">
                      {activeIndustry.solutions.slice(0,3).map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-400">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-border/20">
                  <Link 
                    href={`/industries/${activeIndustry.slug}`}
                    className="inline-flex items-center text-primary font-bold hover:text-white transition-colors group"
                  >
                    View Industry Details
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
