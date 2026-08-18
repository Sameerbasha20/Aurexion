import React from "react";
import { aboutData } from "../../../../../data/about";

export const EngineeringPrinciples: React.FC = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">{aboutData.principles.title}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {aboutData.principles.items.map((principle: any, index: number) => {
            const Icon = principle.icon;
            return (
              <div key={index} className="group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 border border-border/40 rounded flex items-center justify-center bg-card group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{principle.title}</h3>
                </div>
                <p className="text-muted-foreground pl-14 leading-relaxed group-hover:text-foreground transition-colors">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
