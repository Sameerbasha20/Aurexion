import React from "react";
import { aboutData } from "../../../../../data/about";
import { Shield, Code, Eye, Zap, Layers, Users } from "lucide-react";

const VALUE_ICONS: Record<string, React.ElementType> = {
  "01": Code,
  "02": Shield,
  "03": Eye,
  "04": Zap,
  "05": Layers,
  "06": Users,
};

export const ValuesSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#050B14] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#63f5e8]" />
            <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase text-[#63f5e8]">
              OUR FOUNDATIONAL VALUES
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {aboutData.values.title}
          </h2>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed">
            The core architectural and ethical tenets guiding every client engagement and engineering decision.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aboutData.values.items.map((value: any, index: number) => {
            const Icon = VALUE_ICONS[value.id] || Code;
            return (
              <div
                key={index}
                className="p-8 bg-[#0b1420] border border-[#1b2b3d] rounded-xl hover:border-[#63f5e8]/40 hover:bg-[#0e1a2b] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-lg bg-[#63f5e8]/10 border border-[#63f5e8]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#63f5e8]" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#63f5e8] bg-[#63f5e8]/10 border border-[#63f5e8]/20 px-2.5 py-0.5 rounded">
                      {value.id}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                    {value.title}
                  </h3>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mt-2">
                  Applied across all development cycles, code reviews, and enterprise delivery governance.
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
