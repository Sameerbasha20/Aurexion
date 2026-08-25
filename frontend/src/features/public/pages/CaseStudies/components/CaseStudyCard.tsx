import React from "react";
import { Link } from "wouter";
import { ArrowRight, Server, Database, Cloud } from "lucide-react";

export const CaseStudyCard = ({ caseStudy }: { caseStudy: any }) => {
  return (
    <Link 
      href={`/case-studies/${caseStudy.slug}`}
      className="group flex flex-col h-full bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(var(--primary),0.3)]"
    >
      <div className="h-48 bg-[#050B14] relative border-b border-border/20 overflow-hidden">
        <img
          src={caseStudy.coverImage || "/images/unsplash_1563986768609-32.webp"}
          alt={caseStudy.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/80 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-3 right-3 flex gap-2">
           {caseStudy.technologies.cloud?.slice(0, 1).map((tech: any, i: number) => (
             <span key={i} className="text-[10px] font-mono font-bold bg-background/80 border border-border/50 text-muted-foreground px-2 py-0.5 rounded backdrop-blur-sm">
               {tech}
             </span>
           ))}
        </div>
      </div>

      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-mono font-bold text-primary">{caseStudy.clientType}</span>
          <span className="w-1 h-1 bg-border rounded-full" />
          <span className="text-xs font-bold text-muted-foreground uppercase">{caseStudy.industry.replace('-', ' ')}</span>
          <span className="w-1 h-1 bg-border rounded-full" />
          <span className="text-xs text-muted-foreground">{caseStudy.country}</span>
        </div>

        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-white transition-colors line-clamp-2">
          {caseStudy.title}
        </h3>
        
        <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-grow">
          {caseStudy.challenge}
        </p>

        {caseStudy.results && caseStudy.results.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded p-3 mb-6">
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Key Outcome</p>
            <p className="text-sm font-bold text-white">{caseStudy.results[0].impact} {caseStudy.results[0].label}</p>
          </div>
        )}
      </div>
      
      <div className="px-6 md:px-8 py-4 border-t border-border/10 bg-card/5 flex items-center justify-between mt-auto group-hover:bg-primary/5 transition-colors">
        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">View Case Study</span>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
};
