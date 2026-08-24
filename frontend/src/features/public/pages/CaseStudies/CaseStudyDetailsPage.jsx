import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { caseStudiesData } from "../../../../data/caseStudies";

import { CaseStudyHero } from "./components/Detail/CaseStudyHero";
import { ClientInformation } from "./components/Detail/ClientInformation";
import { ChallengeSection } from "./components/Detail/ChallengeSection";
import { ChallengeVisualization } from "./components/Detail/ChallengeVisualization";
import { ArchitectureSection } from "./components/Detail/ArchitectureSection";
import { TechnologyStack } from "./components/Detail/TechnologyStack";
import { DevelopmentApproach } from "./components/Detail/DevelopmentApproach";
import { ModulesDeveloped } from "./components/Detail/ModulesDeveloped";
import { IntegrationsSection } from "./components/Detail/IntegrationsSection";
import { SecurityControls } from "./components/Detail/SecurityControls";
import { ComplianceSection } from "./components/Detail/ComplianceSection";
import { PerformanceSection } from "./components/Detail/PerformanceSection";
import { ResultsSection } from "./components/Detail/ResultsSection";
import { TransformationSection } from "./components/Detail/TransformationSection";
import { OutcomeSection } from "./components/Detail/OutcomeSection";
import { RelatedServices } from "./components/Detail/RelatedServices";
import { RelatedIndustry } from "./components/Detail/RelatedIndustry";
import { RelatedCaseStudies } from "./components/Detail/RelatedCaseStudies";
import { CaseStudyCTA } from "./components/Detail/CaseStudyCTA";
import { SEO } from "../../../../components/seo/SEO";
import { useCaseStudyDetails } from "../../hooks/usePublicContent";

export const CaseStudyDetailsPage = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug || "";

  // Fetch from PostgreSQL
  const { data: apiCaseStudy, loading } = useCaseStudyDetails(slug);

  // Fall back to static data
  const staticCaseStudy = caseStudiesData.find(cs => cs.slug === slug);

  const caseStudy = apiCaseStudy ? {
    id: `db-${apiCaseStudy.id}`,
    slug: apiCaseStudy.slug,
    title: apiCaseStudy.title || staticCaseStudy?.title || "",
    client: apiCaseStudy.client || staticCaseStudy?.client || "",
    clientType: apiCaseStudy.confidential ? "NDA Restricted" : (staticCaseStudy?.clientType || "Enterprise"),
    industry: staticCaseStudy?.industry || "Technology",
    country: staticCaseStudy?.country || "Global",
    category: staticCaseStudy?.category || "Core Engineering",
    coverImage: apiCaseStudy.media || staticCaseStudy?.coverImage || "/webp_images/unsplash_1563986768609-32.webp",
    challenge: apiCaseStudy.business_challenge || staticCaseStudy?.challenge || "",
    architecture: {
      description: apiCaseStudy.proposed_architecture || staticCaseStudy?.architecture?.description || "",
      components: staticCaseStudy?.architecture?.components || []
    },
    technologies: {
      frontend: staticCaseStudy?.technologies?.frontend || [],
      backend: (Array.isArray(apiCaseStudy.tech_stack) && apiCaseStudy.tech_stack.length > 0) ? apiCaseStudy.tech_stack : (staticCaseStudy?.technologies?.backend || []),
      database: staticCaseStudy?.technologies?.database || [],
      cloud: staticCaseStudy?.technologies?.cloud || [],
      devops: staticCaseStudy?.technologies?.devops || [],
      ai: staticCaseStudy?.technologies?.ai || [],
      integrations: staticCaseStudy?.technologies?.integrations || []
    },
    developmentApproach: apiCaseStudy.development_approach 
      ? [{ step: "Approach", description: apiCaseStudy.development_approach }] 
      : (staticCaseStudy?.developmentApproach || []),
    modules: apiCaseStudy.modules_integration_security 
      ? [apiCaseStudy.modules_integration_security] 
      : (staticCaseStudy?.modules || []),
    thirdPartyIntegrations: staticCaseStudy?.thirdPartyIntegrations || [],
    securityControls: staticCaseStudy?.securityControls || [],
    complianceMeasures: staticCaseStudy?.complianceMeasures || [],
    results: (apiCaseStudy.outcomes_performance && !apiCaseStudy.outcomes_performance.includes("Outcomes and performance"))
      ? [{ impact: apiCaseStudy.outcomes_performance, label: "Performance Metrics" }]
      : (staticCaseStudy?.results || []),
    services: staticCaseStudy?.services || (apiCaseStudy.services ? apiCaseStudy.services.map(s => s.slug) : [])
  } : staticCaseStudy;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading && !apiCaseStudy && !staticCaseStudy) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-primary font-mono text-sm">LOADING PORTFOLIO ARCHITECTURE...</div>
      </div>
    );
  }

  if (!caseStudy) {
    setLocation("/case-studies");
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title={`${caseStudy.title} | Enterprise Case Study`}
        description={caseStudy.challenge ? caseStudy.challenge.substring(0, 160) : `Enterprise engineering case study: ${caseStudy.title} for ${caseStudy.industry} industry.`}
        canonical={`/case-studies/${caseStudy.slug}`}
        ogImage={caseStudy.coverImage}
        ogType="article"
      />
      <CaseStudyHero caseStudy={caseStudy} />
      <ClientInformation caseStudy={caseStudy} />
      
      <ChallengeSection caseStudy={caseStudy} />
      {staticCaseStudy && <ChallengeVisualization />}
      
      <ArchitectureSection caseStudy={caseStudy} />
      <TechnologyStack caseStudy={caseStudy} />
      
      <DevelopmentApproach caseStudy={caseStudy} />
      <ModulesDeveloped caseStudy={caseStudy} />
      <IntegrationsSection caseStudy={caseStudy} />
      
      <SecurityControls caseStudy={caseStudy} />
      <ComplianceSection caseStudy={caseStudy} />
      
      <PerformanceSection caseStudy={caseStudy} />
      <ResultsSection caseStudy={caseStudy} />
      {staticCaseStudy && <TransformationSection />}
      <OutcomeSection caseStudy={caseStudy} />
      
      <RelatedServices caseStudy={caseStudy} />
      <RelatedIndustry caseStudy={caseStudy} />
      <RelatedCaseStudies currentCaseStudy={caseStudy} />
      
      <CaseStudyCTA />
    </div>
  );
};

export default CaseStudyDetailsPage;
