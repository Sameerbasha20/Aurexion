import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const LIFECYCLE_STEPS = [
  { step: "01", name: "CLIENT", desc: "Strategic intake & discovery" },
  { step: "02", name: "ENGAGEMENT", desc: "Architecture roadmap & SLAs" },
  { step: "03", name: "SOLUTION", desc: "Bespoke engineering design" },
  { step: "04", name: "DELIVERY", desc: "Agile sprints & CI/CD release" },
  { step: "05", name: "OPERATIONS", desc: "24/7 observability & scaling" },
  { step: "06", name: "TRANSFORMATION", desc: "Enterprise value realized" },
];

export const VisionSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#060c16] border-y border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#63f5e8]" />
            <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase text-[#63f5e8]">
              STRATEGIC VISION
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            End-to-End Enterprise Transformation Lifecycle
          </h2>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed">
            How we translate complex business objectives into resilient, high-velocity digital capabilities.
          </p>
        </div>

        {/* Responsive Horizontal / Grid Lifecycle Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {LIFECYCLE_STEPS.map((item, index) => (
            <div
              key={item.step}
              className={`p-5 rounded-lg border transition-all duration-200 flex flex-col justify-between ${
                index === LIFECYCLE_STEPS.length - 1
                  ? "bg-[#0c1c2e] border-[#63f5e8]/50 shadow-[0_0_20px_rgba(99,245,232,0.15)]"
                  : "bg-[#0b1420] border-[#1b2b3d] hover:border-[#63f5e8]/30 hover:bg-[#0e1a2b]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-[#63f5e8] bg-[#63f5e8]/10 border border-[#63f5e8]/20 px-2 py-0.5 rounded">
                    {item.step}
                  </span>
                  {index < LIFECYCLE_STEPS.length - 1 ? (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 hidden lg:block" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#63f5e8]" />
                  )}
                </div>
                <h3 className="font-mono text-sm font-bold text-white tracking-wider mb-2">
                  {item.name}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
