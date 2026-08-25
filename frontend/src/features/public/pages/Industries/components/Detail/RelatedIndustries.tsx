import React from "react";
import { Link } from "wouter";
import { industriesData } from "../../../../../../data/industries";
import { ArrowUpRight, Building2 } from "lucide-react";

export const RelatedIndustries = ({ industry }: { industry: any }) => {
  // Grab 4 other random industries or the next 4
  const related = industriesData.filter(ind => ind.id !== industry.id).slice(0, 4);

  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-12">Explore Other Industries</h2>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {related.map((ind, idx) => (
            <Link 
              key={idx}
              href={`/industries/${ind.slug}`} 
              className="group flex items-center justify-between p-6 bg-card border border-border/40 rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{ind.name}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
