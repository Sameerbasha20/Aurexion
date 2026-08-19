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

export const CaseStudyDetailsPage = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug;

  const caseStudy = caseStudiesData.find(cs => cs.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!caseStudy) {
    setLocation("/case-studies");
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <CaseStudyHero caseStudy={caseStudy} />
      <ClientInformation caseStudy={caseStudy} />
      
      <ChallengeSection caseStudy={caseStudy} />
      <ChallengeVisualization />
      
      <ArchitectureSection caseStudy={caseStudy} />
      <TechnologyStack caseStudy={caseStudy} />
      
      <DevelopmentApproach caseStudy={caseStudy} />
      <ModulesDeveloped caseStudy={caseStudy} />
      <IntegrationsSection caseStudy={caseStudy} />
      
      <SecurityControls caseStudy={caseStudy} />
      <ComplianceSection caseStudy={caseStudy} />
      
      <PerformanceSection caseStudy={caseStudy} />
      <ResultsSection caseStudy={caseStudy} />
      <TransformationSection />
      <OutcomeSection caseStudy={caseStudy} />
      
      <RelatedServices caseStudy={caseStudy} />
      <RelatedIndustry caseStudy={caseStudy} />
      <RelatedCaseStudies currentCaseStudy={caseStudy} />
      
      <CaseStudyCTA />
    </div>
  );
};

export default CaseStudyDetailsPage;
