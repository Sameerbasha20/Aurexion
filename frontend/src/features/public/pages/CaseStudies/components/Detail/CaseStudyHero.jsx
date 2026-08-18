import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export const CaseStudyHero = ({ caseStudy }) => {
  if (!caseStudy) return null;

  return (
    <section className="relative bg-[#050B14] overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16 border-b border-border/10">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <a 
          href="/case-studies" 
          onClick={(e) => {
            if (window.history.length > 1) {
              e.preventDefault();
              window.history.back();
            }
          }}
          className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2" />
          BACK TO CASE STUDIES
        </a>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Main Title & Overview (Left ~58%: 7 of 12 cols) */}
          <div className="lg:col-span-7 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-[1px] bg-primary" />
              <span className="text-primary font-mono text-xs tracking-[0.2em] uppercase font-semibold">
                TECHNICAL CASE STUDY • {caseStudy.category}
              </span>
            </div>
            
            <h1 
              className="font-bold tracking-tight text-white mb-6 break-words"
              style={{
                fontSize: "clamp(1.75rem, 3.6vw, 3.25rem)",
                lineHeight: 1.18,
                margin: "0 0 1.5rem 0",
                maxWidth: "100%",
              }}
            >
              {caseStudy.title}
            </h1>
            
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6">
              {caseStudy.challenge}
            </p>

            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              {caseStudy.clientType && (
                <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded font-bold">
                  {caseStudy.clientType}
                </span>
              )}
              {caseStudy.industry && (
                <span className="bg-card border border-border/40 text-muted-foreground px-3 py-1 rounded">
                  {caseStudy.industry.replace('-', ' ').toUpperCase()}
                </span>
              )}
              {caseStudy.country && (
                <span className="bg-card border border-border/40 text-muted-foreground px-3 py-1 rounded">
                  {caseStudy.country}
                </span>
              )}
            </div>
          </div>

          {/* Right Media & Key Results Card (Right ~42%: 5 of 12 cols) */}
          <div className="lg:col-span-5 min-w-0 w-full">
            <div className="bg-[#080f1a] border border-[rgba(99,245,232,0.25)] rounded-2xl overflow-hidden shadow-2xl relative group w-full max-w-md lg:max-w-none mx-auto">
              {caseStudy.coverImage && (
                <div className="h-48 sm:h-56 relative overflow-hidden bg-background">
                  <img
                    src={caseStudy.coverImage}
                    alt={caseStudy.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080f1a] via-[#080f1a]/40 to-transparent" />
                </div>
              )}
              
              <div className="p-6 relative z-10">
                <span className="text-[10px] font-mono font-bold text-[#63f5e8] tracking-widest uppercase mb-1.5 block">
                  KEY IMPACT OUTCOME
                </span>
                {caseStudy.results && caseStudy.results.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {caseStudy.results[0].impact}
                    </h3>
                    <p className="text-xs font-mono text-[#8da5ae]">
                      {caseStudy.results[0].label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CaseStudyHero;
