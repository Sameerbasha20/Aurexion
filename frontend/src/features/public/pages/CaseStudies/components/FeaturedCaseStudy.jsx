import React from "react";
import { Link } from "wouter";
import { ArrowRight, Server, Database, Shield, Blocks } from "lucide-react";

export const FeaturedCaseStudy = ({ caseStudy }) => {
  if (!caseStudy) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xs font-mono tracking-widest text-primary mb-8 uppercase font-bold">Featured Case Study</h2>
        
        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden flex flex-col lg:flex-row group hover:border-primary/50 transition-colors shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="lg:w-1/2 p-8 md:p-12 relative z-10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded">
                  {caseStudy.clientType}
                </span>
                <span className="text-xs font-mono font-bold bg-secondary text-secondary-foreground border border-border/40 px-3 py-1 rounded">
                  {caseStudy.industry}
                </span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{caseStudy.title}</h3>
              
              <div className="space-y-6 mb-12">
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Challenge</h4>
                  <p className="text-gray-300 leading-relaxed line-clamp-3">{caseStudy.challenge}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Outcome</h4>
                  <p className="text-primary font-bold">{caseStudy.results?.[0]?.impact} {caseStudy.results?.[0]?.label}</p>
                </div>
              </div>
            </div>
            
            <Link 
              href={`/case-studies/${caseStudy.slug}`}
              className="inline-flex items-center text-primary font-bold hover:text-white transition-colors"
            >
              Read Technical Case Study
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="lg:w-1/2 bg-[#050B14] relative overflow-hidden border-l border-border/20 min-h-[300px]">
            <img
              src={caseStudy.coverImage || "/webp_images/unsplash_1563986768609-32.webp"}
              alt={caseStudy.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent opacity-80" />
          </div>
        </div>
      </div>
    </section>
  );
};
