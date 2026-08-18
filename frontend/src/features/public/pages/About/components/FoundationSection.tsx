import React from "react";
import { aboutData } from "../../../../../data/about";

export const FoundationSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#080d16] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#63f5e8]" />
            <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase text-[#63f5e8]">
              HERITAGE & MILESTONES
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {aboutData.foundation.title}
          </h2>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed">
            A sustained trajectory of software engineering rigor, systems architecture, and digital transformation.
          </p>
        </div>

        {/* Enterprise Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Clean Corporate Vertical Timeline Spine */}
          <div className="absolute top-3 bottom-3 left-4 md:left-1/2 w-[1px] bg-[#223244] transform md:-translate-x-1/2" />

          <div className="space-y-12">
            {aboutData.foundation.milestones.map((milestone: any, index: number) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Clean Professional Timeline Node */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[#63f5e8] ring-4 ring-[#080d16] transform -translate-x-1/2 mt-5 z-10" />

                {/* Milestone Card */}
                <div
                  className={`md:w-1/2 ml-10 md:ml-0 ${
                    index % 2 === 0 ? "md:pl-10" : "md:pr-10 md:text-right"
                  }`}
                >
                  <div className="p-7 bg-[#0b1420] border border-[#1b2b3d] rounded-lg hover:border-[#63f5e8]/40 hover:bg-[#0e1a2b] transition-all duration-200">
                    <div
                      className={`flex items-center gap-3 mb-3 ${
                        index % 2 === 0 ? "" : "md:justify-end"
                      }`}
                    >
                      <span className="font-mono text-xs font-semibold text-[#63f5e8] bg-[#63f5e8]/10 border border-[#63f5e8]/20 px-2.5 py-0.5 rounded">
                        PHASE 0{index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundationSection;
