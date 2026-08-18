import React from "react";
import { Link } from "wouter";
import { ArrowRight, Landmark, LineChart, ShieldCheck, Activity, GraduationCap, Factory, ShoppingBag, ShoppingCart, Truck, Building, HardHat, Utensils, Plane, Car, Signal, Briefcase, Rocket } from "lucide-react";

const iconMap = {
  Landmark, LineChart, ShieldCheck, Activity, GraduationCap, Factory, 
  ShoppingBag, ShoppingCart, Truck, Building, HardHat, Utensils, 
  Plane, Car, Signal, Briefcase, Rocket
};

export const IndustryCard = ({ industry }) => {
  const Icon = iconMap[industry.icon] || Landmark;
  
  return (
    <Link 
      href={`/industries/${industry.slug}`}
      className="group flex flex-col h-full bg-card/10 border border-border/20 rounded-xl overflow-hidden hover:border-primary/50 hover:bg-card/30 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(var(--primary),0.3)]"
    >
      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <span className="font-mono text-xs font-bold text-[#63f5e8] bg-[rgba(99,245,232,0.12)] border border-[rgba(99,245,232,0.3)] px-2.5 py-0.5 rounded group-hover:drop-shadow-[0_0_8px_rgba(99,245,232,0.8)] transition-all">
            {industry.id}
          </span>
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
      
      <div className="px-6 md:px-8 py-4 border-t border-border/10 bg-card/5 flex items-center justify-between group-hover:bg-primary/5 transition-colors mt-auto">
        <span className="text-sm font-bold text-primary group-hover:text-primary-foreground transition-colors">Explore Industry</span>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
};
