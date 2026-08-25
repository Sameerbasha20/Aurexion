import React from "react";
import { Link } from "wouter";
import { ArrowRight, Landmark, LineChart, ShieldCheck, Activity, GraduationCap, Factory, ShoppingBag, ShoppingCart, Truck, Building, HardHat, Utensils, Plane, Car, Signal, Briefcase, Rocket } from "lucide-react";

const iconMap = {
  Landmark, LineChart, ShieldCheck, Activity, GraduationCap, Factory, 
  ShoppingBag, ShoppingCart, Truck, Building, HardHat, Utensils, 
  Plane, Car, Signal, Briefcase, Rocket
};

export const IndustryCard = ({ industry }: { industry: any }) => {
  const Icon = (iconMap as Record<string, any>)[industry.icon] || Landmark;
  
  return (
    <Link 
      href={`/industries/${industry.slug}`}
      className="group flex flex-col h-full bg-card/10 border border-border/20 rounded-xl overflow-hidden hover:border-primary/50 hover:bg-card/30 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(var(--primary),0.3)]"
    >
      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-white transition-colors">
          {industry.name}
        </h3>
        
        <p className="text-muted-foreground line-clamp-3 mb-6 flex-grow">
          {industry.shortDescription}
        </p>

        {/* Small challenge indicator */}
        <div className="bg-background/50 border border-border/30 rounded p-3 mb-6">
          <p className="text-xs font-mono text-primary/70 mb-1 uppercase tracking-wider">Primary Challenge</p>
          <p className="text-sm text-gray-400 line-clamp-1">{industry.challenges.operational[0]?.title}</p>
        </div>
      </div>
      
      <div className="px-6 md:px-8 py-4 border-t border-border/10 bg-card/5 flex items-center justify-between group-hover:bg-primary/10 transition-colors mt-auto">
        <span className="text-sm font-bold text-primary group-hover:text-[#63f5e8] group-hover:drop-shadow-[0_0_8px_rgba(99,245,232,0.6)] transition-all">Explore Industry</span>
        <ArrowRight className="w-5 h-5 text-primary/70 group-hover:text-primary group-hover:translate-x-1.5 transition-all" />
      </div>
    </Link>
  );
};
