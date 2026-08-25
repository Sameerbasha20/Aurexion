import React from "react";
import { Link } from "wouter";
import { Building2, ArrowUpRight } from "lucide-react";
import { industriesData } from "../../../../../../data/industries";

export const RelatedIndustry = ({ caseStudy }: { caseStudy: any }) => {
  const ind = industriesData?.find(i => i.slug === caseStudy.industry) || { name: caseStudy.industry, slug: caseStudy.industry };

  return (
    <section className="py-12 bg-card/20 border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-[#080f1a] border border-[rgba(99,245,232,0.2)] rounded-2xl gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <span className="block text-[10px] font-mono font-bold text-[#63f5e8] uppercase tracking-widest mb-1">RELATED INDUSTRY VERTICAL</span>
              <h3 className="text-2xl font-bold text-white tracking-tight">{ind.name}</h3>
            </div>
          </div>

          <Link 
            href={`/industries/${ind.slug}`} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#63f5e8] text-[#041014] text-xs font-mono font-bold rounded hover:bg-[#86f8ee] transition-colors flex-shrink-0"
          >
            EXPLORE INDUSTRY SOLUTIONS <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RelatedIndustry;
