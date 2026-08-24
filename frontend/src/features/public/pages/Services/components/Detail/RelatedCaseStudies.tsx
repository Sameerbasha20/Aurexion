import React from "react";
import { ServiceDetail } from "../../../../types/website.types";
import { caseStudiesData } from "../../../../../../data/caseStudies";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useCaseStudies } from "../../../../hooks/usePublicContent";

// Curated cover images per industry slug
const INDUSTRY_IMAGES: Record<string, string> = {
  banking: "/webp_images/unsplash_1563986768609-32.webp",
  "financial-services": "/webp_images/unsplash_1611974789855-9c.webp",
  insurance: "/webp_images/unsplash_1554224155-6726b.webp",
  healthcare: "/webp_images/unsplash_1576091160399-11.webp",
  education: "/webp_images/unsplash_1519389950473-47.webp",
  manufacturing: "/webp_images/unsplash_1504917595217-d4.webp",
  retail: "/webp_images/unsplash_1441986300917-64.webp",
  "e-commerce": "/webp_images/unsplash_1557821552-17105.webp",
  "logistics-supply-chain": "/webp_images/unsplash_1586528116311-ad.webp",
  "real-estate": "/webp_images/unsplash_1560518883-ce090.webp",
  construction: "/webp_images/unsplash_1504307651254-35.webp",
  hospitality: "/webp_images/unsplash_1566073771259-6a.webp",
  travel: "/webp_images/unsplash_1436491865332-7a.webp",
  automotive: "/webp_images/unsplash_1492144534655-ae.webp",
  telecommunications: "/webp_images/unsplash_1588600878108-57.webp",
  "professional-services": "/webp_images/unsplash_1454165804606-c3.webp",
  government: "/webp_images/unsplash_1529107386315-e1.webp",
  startups: "/webp_images/unsplash_1559136555-9303b.webp",
  default: "/webp_images/unsplash_1460925895917-af.webp",
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



