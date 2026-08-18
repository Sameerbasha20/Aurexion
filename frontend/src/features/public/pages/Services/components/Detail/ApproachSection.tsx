import React from "react";

const steps = [
  "DISCOVER",
  "ARCHITECT",
  "ENGINEER",
  "INTEGRATE",
  "TEST",
  "DEPLOY",
  "OPTIMIZE"
];

export const ApproachSection: React.FC = () => {
  return (
    <section className="py-10 bg-[#060c18] border-y border-[rgba(99,245,232,0.12)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#eef4f3] tracking-tight">
            Our Approach
          </h2>
          <p className="text-[#8da5ae] text-base mt-3">
            A proven, rigorous engineering methodology.
          </p>
        </div>

        {/* Desktop Horizontal Process */}
        <div className="hidden lg:block max-w-5xl mx-auto relative pt-2 pb-4">
          {/* Subtle Connecting Line */}
          <div 
            className="absolute left-[6%] right-[6%] top-[34px] h-[1px] z-0 bg-[rgba(99,245,232,0.25)]" 
          />

          <div className="grid grid-cols-7 gap-4 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                {/* Refined Step Circle */}
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-200 bg-[#0a1422] border border-[rgba(99,245,232,0.35)] group-hover:border-[#63f5e8] group-hover:bg-[rgba(99,245,232,0.08)] group-hover:shadow-[0_0_15px_rgba(99,245,232,0.2)]"
                >
                  <span className="font-['IBM_Plex_Mono',monospace] text-sm font-semibold text-[#63f5e8]">
                    {index + 1}
                  </span>
                </div>

                {/* Step Label */}
                <span className="font-['IBM_Plex_Mono',monospace] text-[0.72rem] font-medium tracking-[0.14em] text-[#a2b5be] group-hover:text-[#eef4f3] transition-colors">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / Tablet Vertical Process */}
        <div className="lg:hidden flex flex-col space-y-6 max-w-xs mx-auto relative pl-4">
          <div className="absolute top-3 bottom-3 left-9 w-[1px] bg-[rgba(99,245,232,0.2)]" />

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0a1422] border border-[rgba(99,245,232,0.35)] group-hover:border-[#63f5e8] group-hover:bg-[rgba(99,245,232,0.08)]">
                <span className="font-['IBM_Plex_Mono',monospace] text-sm font-semibold text-[#63f5e8]">
                  {index + 1}
                </span>
              </div>
              <span className="font-['IBM_Plex_Mono',monospace] text-xs tracking-wider text-[#a2b5be] group-hover:text-white">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApproachSection;
