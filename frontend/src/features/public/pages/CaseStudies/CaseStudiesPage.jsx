import React, { useState, useMemo } from "react";
import { CaseStudiesHero } from "./components/CaseStudiesHero";
import { CaseStudyFilters } from "./components/CaseStudyFilters";
import { FeaturedCaseStudy } from "./components/FeaturedCaseStudy";
import { CaseStudyGrid } from "./components/CaseStudyGrid";
import { EngineeringCapabilities } from "./components/EngineeringCapabilities";
import { CaseStudiesCTA } from "./components/CaseStudiesCTA";
import { caseStudiesData } from "../../../../data/caseStudies";

export const CaseStudiesPage = () => {
  const [filters, setFilters] = useState({
    query: "",
    industry: "",
    clientType: "",
    category: ""
  });

  const filteredCaseStudies = useMemo(() => {
    return caseStudiesData.filter((cs) => {
      const matchQuery = cs.title.toLowerCase().includes(filters.query.toLowerCase()) || 
                         cs.challenge.toLowerCase().includes(filters.query.toLowerCase());
      const matchIndustry = filters.industry === "" || cs.industry === filters.industry;
      const matchClientType = filters.clientType === "" || cs.clientType === filters.clientType;
      const matchCategory = filters.category === "" || cs.category === filters.category;

      return matchQuery && matchIndustry && matchClientType && matchCategory;
    });
  }, [filters]);

  const featured = caseStudiesData[0];
  
  const hasActiveFilters = Boolean(
    filters.query || filters.industry || filters.clientType || filters.category
  );

  const gridCaseStudies = filteredCaseStudies.filter(cs => {
    if (cs.id === featured?.id && !hasActiveFilters) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-background min-h-screen">
      <CaseStudiesHero />
      <CaseStudyFilters filters={filters} setFilters={setFilters} />
      
      {!hasActiveFilters && featured && (
        <FeaturedCaseStudy caseStudy={featured} />
      )}
      
      <CaseStudyGrid caseStudies={gridCaseStudies} />
      <EngineeringCapabilities />
      <CaseStudiesCTA />
    </div>
  );
};

export default CaseStudiesPage;
