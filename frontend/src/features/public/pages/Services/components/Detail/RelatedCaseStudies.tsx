import React from "react";
import { ServiceDetail } from "../../../../types/website.types";
import { caseStudiesData } from "../../../../../../data/caseStudies";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useCaseStudies } from "../../../../hooks/usePublicContent";

// Curated cover images per industry slug
const INDUSTRY_IMAGES: Record<string, string> = {
  banking: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  "financial-services": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  insurance: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  healthcare: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  education: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  manufacturing: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
  retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  "e-commerce": "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80",
  "logistics-supply-chain": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  "real-estate": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  construction: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  hospitality: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  travel: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  automotive: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  telecommunications: "https://images.unsplash.com/photo-1588600878108-578307a3cc9d?auto=format&fit=crop&w=1200&q=80",
  "professional-services": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  government: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  startups: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
};

const COVER_IMAGES: Record<string, string> = INDUSTRY_IMAGES;

/** Normalize an industry name from services.ts (e.g. "Financial Services (BFSI)") → slug key */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface RelatedCaseStudiesProps {
  service: ServiceDetail;
}

export const RelatedCaseStudies: React.FC<RelatedCaseStudiesProps> = ({ service }) => {
  const { data: dbCaseStudies } = useCaseStudies();

  if (!service.relatedCaseStudies || service.relatedCaseStudies.length === 0) return null;

  // Map database case studies and static ones to a unified format
  const allCaseStudies: any[] = [];

  if (dbCaseStudies && dbCaseStudies.length > 0) {
    dbCaseStudies.forEach(dbCase => {
      allCaseStudies.push({
        id: `db-${dbCase.id}`,
        slug: dbCase.slug,
        title: dbCase.title || "",
        industry: "Technology",
        coverImage: dbCase.media || INDUSTRY_IMAGES.default,
        outcome: dbCase.outcomes_performance || "Verified architecture delivered"
      });
    });
  }

  caseStudiesData.forEach(staticCs => {
    if (!allCaseStudies.some(cs => cs.slug === staticCs.slug)) {
      allCaseStudies.push({
        id: staticCs.id,
        slug: staticCs.slug,
        title: staticCs.title || "",
        industry: staticCs.industry || "Enterprise",
        coverImage: staticCs.coverImage || INDUSTRY_IMAGES.default,
        outcome: staticCs.results?.[0] ? `${staticCs.results[0].label}: ${staticCs.results[0].impact}` : "Verified architecture delivered"
      });
    }
  });

  // Lookup matched case studies by slug
  const matched = service.relatedCaseStudies.map(slug => {
    return allCaseStudies.find(cs => cs.slug === slug);
  }).filter(Boolean);

  if (matched.length === 0) return null;

  return (
    <section className="py-24 bg-[#050b14] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-mono text-[#63f5e8] tracking-widest uppercase mb-2">
              PROVEN RESULTS
            </p>
            <h2 className="text-3xl font-bold">Related Case Studies</h2>
          </div>
          <Link
            href="/case-studies"
            className="hidden sm:flex items-center text-sm font-bold text-primary hover:underline"
          >
            View All Work <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {matched.map((cs, index) => {
            const coverImg = INDUSTRY_IMAGES[cs.industry.toLowerCase().replace(/[\s()\/&]+/g, "-")] || cs.coverImage;
            return (
              <Link
                key={index}
                href={`/case-studies/${cs.slug}`}
                className="group block border border-border/20 bg-[#080f1a] rounded-xl overflow-hidden hover:border-[rgba(99,245,232,0.4)] transition-colors"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={coverImg}
                    alt={cs.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <span className="text-xs font-mono text-[#63f5e8] bg-[rgba(99,245,232,0.12)] border border-[rgba(99,245,232,0.25)] px-2 py-1 rounded mb-3 inline-block capitalize">
                      {cs.industry.replace(/-/g, " ")}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-snug line-clamp-2">{cs.title}</h3>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-mono text-[#5e7079] uppercase tracking-widest mb-1">OUTCOME</p>
                    <p className="text-base text-[#c8d8e0] line-clamp-1">{cs.outcome}</p>
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



