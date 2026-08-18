import React from "react";
import { aboutData } from "../../../../../data/about";

export const SecurityTrust: React.FC = () => {
  return (
    <section className="py-20 bg-[#050B14] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#63f5e8]" />
            <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase text-[#63f5e8]">
              ZERO-TRUST ARCHITECTURE
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {aboutData.security.title}
          </h2>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed">
            Enterprise software engineered with defense-in-depth protocols across every storage, network, and application layer.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {aboutData.security.items.map((item: any, index: number) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 bg-[#0b1420] border border-[#1b2b3d] rounded-xl hover:border-[#63f5e8]/40 hover:bg-[#0e1a2b] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#63f5e8]/10 border border-[#63f5e8]/20 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#63f5e8]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1b2b3d] flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>LAYER 0{index + 1}</span>
                  <span className="text-[#63f5e8]">ENFORCED</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SecurityTrust;
