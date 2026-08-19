import React from "react";
import { aboutData } from "../../../../../data/about";

export const MissionSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#050B14]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">{aboutData.mission.title}</h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            {aboutData.mission.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutData.mission.pillars.map((pillar: any, index: number) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={index} 
                className="group p-8 border border-border/20 bg-card/5 rounded-lg hover:bg-card/10 hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
