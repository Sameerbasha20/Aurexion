import React, { useMemo } from "react";
import { industriesData } from "../../../../../data/industries";
import { useIndustries } from "../../../hooks/usePublicContent";
import { IndustryCard } from "./IndustryCard";

export const IndustryGrid = () => {
  const { data: dbIndustries } = useIndustries();

  // Map database industries to Industry format
  const mappedDbIndustries = useMemo(() => {
    return (dbIndustries || []).map((dbInd) => {
      let challengesObj = { operational: [] as any[], regulatory: [] as any[], technical: [] as any[] };
      try {
        challengesObj = JSON.parse(dbInd.challenges);
      } catch (e) {
        challengesObj = {
          operational: [{ title: dbInd.challenges ? dbInd.challenges.slice(0, 50) + "..." : "Operational challenges", description: dbInd.challenges || "" }],
          regulatory: [] as any[],
          technical: [] as any[]
        };
      }

      let solutionsArr = [];
      try {
        solutionsArr = JSON.parse(dbInd.target_solutions);
      } catch (e) {
        solutionsArr = dbInd.target_solutions ? [dbInd.target_solutions] : [];
      }

      return {
        id: `db-${dbInd.id}`,
        slug: dbInd.slug,
        name: dbInd.name || "",
        shortDescription: dbInd.challenges ? dbInd.challenges.slice(0, 150) + (dbInd.challenges.length > 150 ? "..." : "") : "Enterprise technology solutions.",
        icon: "Building",
        challenges: challengesObj,
        solutions: solutionsArr,
        relatedServices: [] as any[],
        technologies: [] as any[],
        relatedCaseStudies: [] as any[],
        outcomes: ["Security", "Scalability"] as any[]
      };
    });
  }, [dbIndustries]);

  // Combine static and DB industries, prioritizing DB industries for duplicates
  const allIndustries = useMemo(() => {
    const combined = [...mappedDbIndustries];
    industriesData.forEach((staticS) => {
      if (!combined.some((s) => s.slug === staticS.slug)) {
        combined.push(staticS);
      }
    });
    return combined;
  }, [mappedDbIndustries]);

  return (
    <section className="py-24 bg-background border-t border-border/10" id="all-industries">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Target Verticals</h2>
          <p className="text-lg text-muted-foreground">
            Aurexion engineers digital platforms and custom enterprise solutions tailored to the strict regulatory and operational demands of these specific sectors.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {allIndustries.map(industry => (
            <IndustryCard key={industry.id} industry={industry} />
          ))}
        </div>
      </div>
    </section>
  );
};
