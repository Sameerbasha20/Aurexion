import React from "react";
import { serviceCategories, servicesData } from "../../../../../data/services";
import { Code, Cpu, Cloud, Layout, Layers, Shield, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const iconMap: Record<string, React.ElementType> = {
  Code,
  Cpu,
  Cloud,
  Layout,
  Layers,
  Shield
};

export const ServicesOverview: React.FC = () => {
  return (
    <section id="capabilities" className="py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Core Capabilities</h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Aurexion operates across six primary technology domains, engineering bespoke solutions for modern enterprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category: any) => {
            const Icon = iconMap[category.iconName];
            const serviceCount = servicesData.filter((s: any) => s.category === category.name).length;

            return (
              <div 
                key={category.id}
                className="group relative flex flex-col p-8 border border-border/40 bg-card rounded-lg hover:border-primary/50 hover:bg-card/40 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 rounded flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-mono text-4xl font-bold text-[#63f5e8] drop-shadow-[0_0_10px_rgba(99,245,232,0.7)] group-hover:drop-shadow-[0_0_16px_rgba(99,245,232,0.95)] transition-all select-none">
                    {category.id}
                  </span>
                </div>
                
                <div className="flex-grow relative z-10">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {category.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40 relative z-10">
                  <span className="text-sm font-mono text-muted-foreground">
                    {serviceCount} SERVICES
                  </span>
                  <a href="#explorer" className="inline-flex items-center text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
