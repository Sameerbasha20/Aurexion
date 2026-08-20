import React, { useState, useMemo } from "react";
import { CaseStudiesHero } from "./components/CaseStudiesHero";
import { CaseStudyFilters } from "./components/CaseStudyFilters";
import { FeaturedCaseStudy } from "./components/FeaturedCaseStudy";
import { CaseStudyGrid } from "./components/CaseStudyGrid";
import { EngineeringCapabilities } from "./components/EngineeringCapabilities";
import { CaseStudiesCTA } from "./components/CaseStudiesCTA";
import { caseStudiesData } from "../../../../data/caseStudies";
import { useCaseStudies } from "../../hooks/usePublicContent";

export const CaseStudiesPage = () => {
  const { data: dbCaseStudies } = useCaseStudies();
  const [filters, setFilters] = useState({
    query: "",
    industry: "",
    clientType: "",
    category: ""
  });

  // Map database case studies to CaseStudyItem format
  const mappedDbCaseStudies = useMemo(() => {
    return (dbCaseStudies || []).map((dbCase) => {
      const staticCaseStudy = caseStudiesData.find(cs => cs.slug === dbCase.slug);
      
      return {
        id: `db-${dbCase.id}`,
        slug: dbCase.slug,
        title: dbCase.title || staticCaseStudy?.title || "",
        client: dbCase.client || staticCaseStudy?.client || "",
        clientType: dbCase.confidential ? "NDA Restricted" : (staticCaseStudy?.clientType || "Enterprise"),
        industry: staticCaseStudy?.industry || "Technology",
        country: staticCaseStudy?.country || "Global",
        category: staticCaseStudy?.category || "Core Engineering",
        coverImage: dbCase.media || staticCaseStudy?.coverImage || "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        challenge: dbCase.business_challenge || staticCaseStudy?.challenge || "",
        architecture: {
          description: dbCase.proposed_architecture || staticCaseStudy?.architecture?.description || "",
          components: staticCaseStudy?.architecture?.components || []
        },
        technologies: {
          frontend: staticCaseStudy?.technologies?.frontend || [],
          backend: (Array.isArray(dbCase.tech_stack) && dbCase.tech_stack.length > 0) ? dbCase.tech_stack : (staticCaseStudy?.technologies?.backend || []),
          database: staticCaseStudy?.technologies?.database || [],
          cloud: staticCaseStudy?.technologies?.cloud || [],
          devops: staticCaseStudy?.technologies?.devops || [],
          ai: staticCaseStudy?.technologies?.ai || [],
          integrations: staticCaseStudy?.technologies?.integrations || []
        },
        developmentApproach: dbCase.development_approach 
          ? [{ step: "Approach", description: dbCase.development_approach }] 
          : (staticCaseStudy?.developmentApproach || []),
        modules: dbCase.modules_integration_security 
          ? [dbCase.modules_integration_security] 
          : (staticCaseStudy?.modules || []),
        thirdPartyIntegrations: staticCaseStudy?.thirdPartyIntegrations || [],
        securityControls: staticCaseStudy?.securityControls || [],
        complianceMeasures: staticCaseStudy?.complianceMeasures || [],
        results: (dbCase.outcomes_performance && !dbCase.outcomes_performance.includes("Outcomes and performance"))
          ? [{ impact: dbCase.outcomes_performance, label: "Performance Metrics" }]
          : (staticCaseStudy?.results || []),
        services: staticCaseStudy?.services || (dbCase.services ? dbCase.services.map(s => s.slug) : [])
      };
    });
  }, [dbCaseStudies]);

  // Combine static and DB case studies, prioritizing DB case studies for duplicates
  const allCaseStudies = useMemo(() => {
    const combined = [...mappedDbCaseStudies];
    caseStudiesData.forEach((staticS) => {
      if (!combined.some((s) => s.slug === staticS.slug)) {
        combined.push(staticS);
      }
    });
    return combined;
  }, [mappedDbCaseStudies]);

  const filteredCaseStudies = useMemo(() => {
    return allCaseStudies.filter((cs) => {
      const matchQuery = cs.title.toLowerCase().includes(filters.query.toLowerCase()) || 
                         cs.challenge.toLowerCase().includes(filters.query.toLowerCase());
      const matchIndustry = filters.industry === "" || cs.industry === filters.industry;
      const matchClientType = filters.clientType === "" || cs.clientType === filters.clientType;
      const matchCategory = filters.category === "" || cs.category === filters.category;

      return matchQuery && matchIndustry && matchClientType && matchCategory;
    });
  }, [filters, allCaseStudies]);

  const featured = allCaseStudies[0];
  
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
