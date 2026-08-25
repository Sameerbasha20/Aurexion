import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useCaseStudies } from "../../../../hooks/usePublicContent";
import { caseStudiesData } from "../../../../../../data/caseStudies";

export const IndustryCaseStudies = ({ industry }) => {
  const { data: dbCaseStudies } = useCaseStudies();

  if (!industry.relatedCaseStudies || industry.relatedCaseStudies.length === 0) return null;

  // Map database case studies and static ones to a unified format
  const allCaseStudies = [];

  if (dbCaseStudies && dbCaseStudies.length > 0) {
    dbCaseStudies.forEach(dbCase => {
      allCaseStudies.push({
        slug: dbCase.slug,
        title: dbCase.title || "",
        coverImage: dbCase.media || "/images/unsplash_1563986768609-32.webp",
        challenge: dbCase.business_challenge || "",
        outcomes: dbCase.outcomes_performance ? [dbCase.outcomes_performance] : []
      });
    });
  }

  caseStudiesData.forEach(staticCs => {
    if (!allCaseStudies.some(cs => cs.slug === staticCs.slug)) {
      allCaseStudies.push({
        slug: staticCs.slug,
        title: staticCs.title || "",
        coverImage: staticCs.coverImage || "/images/unsplash_1563986768609-32.webp",
        challenge: staticCs.challenge || "",
        outcomes: staticCs.results?.map(r => r.impact) || []
      });
    }
  });

  // Lookup matched case studies by slug
  const matchedCaseStudies = industry.relatedCaseStudies.map(slug => {
    return allCaseStudies.find(cs => cs.slug === slug);
  }).filter(Boolean);

  if (matchedCaseStudies.length === 0) return null;

  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-mono text-[#63f5e8] tracking-widest uppercase mb-2">
              PROVEN RESULTS
            </p>
            <h2 className="text-3xl font-bold">Case Studies in {industry.name}</h2>
          </div>
          <Link
            href="/case-studies"
            className="hidden sm:flex items-center text-sm font-bold text-primary hover:underline"
          >
            View All Work <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {matchedCaseStudies.map((cs, idx) => { return (
            <Link 
              key={idx}
              href={`/case-studies/${cs.slug}`} 
              className="group block border border-border/40 bg-card rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                <img 
                  src={cs.coverImage} 
                  alt={cs.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <div className="absolute bottom-6 left-6 z-20">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded mb-2 inline-block">
                    {industry.name}
                  </span>
                  <h3 className="text-xl font-bold text-white max-w-sm line-clamp-2">
                    {cs.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex justify-between items-end">
                <div className="flex-1 mr-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">CHALLENGE</p>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{cs.challenge}</p>
                  {cs.outcomes && cs.outcomes.length > 0 && (
                    <>
                      <p className="text-xs font-mono text-[#5e7079] uppercase tracking-widest mb-1">OUTCOME</p>
                      <p className="text-sm text-foreground line-clamp-1">{cs.outcomes[0]} Achieved</p>
                    </>
                  )}
                </div>

                <div className="w-10 h-10 rounded-full border border-[rgba(99,245,232,0.2)] flex items-center justify-center group-hover:bg-[#63f5e8] group-hover:border-[#63f5e8] transition-colors flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-[#63f5e8] group-hover:text-[#041014]" />
                </div>
              </div>
            </Link>
            );
          })}
        </div>

        <Link
          href="/case-studies"
          className="sm:hidden flex items-center justify-center w-full mt-8 h-12 border border-border rounded-md text-sm font-bold"
        >
          View All Work
        </Link>
      </div>
    </section>
  );
};
