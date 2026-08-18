import React, { useEffect } from "react";
import { useParams, Redirect } from "wouter";
import { industriesData } from "../../../../data/industries";

import { IndustryHero } from "./components/Detail/IndustryHero";
import { IndustryChallenges } from "./components/Detail/IndustryChallenges";
import { TargetSolutions } from "./components/Detail/TargetSolutions";
import { ChallengeSolutionFlow } from "./components/Detail/ChallengeSolutionFlow";
import { AssociatedServices } from "./components/Detail/AssociatedServices";
import { IndustryTechnology } from "./components/Detail/IndustryTechnology";
import { DigitalTransformation } from "./components/Detail/DigitalTransformation";
import { SecurityGovernance } from "./components/Detail/SecurityGovernance";
import { IndustryCaseStudies } from "./components/Detail/IndustryCaseStudies";
import { IndustryOutcomes } from "./components/Detail/IndustryOutcomes";
import { RelatedIndustries } from "./components/Detail/RelatedIndustries";
import { IndustryDetailCTA } from "./components/Detail/IndustryDetailCTA";

export const IndustryDetailsPage = () => {
  const params = useParams();
  const slug = params.slug;

  const industry = industriesData.find(ind => ind.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!industry) {
    return <Redirect to="/industries" />;
  }

  return (
    <div className="bg-background min-h-screen">
      <IndustryHero industry={industry} />
      <IndustryChallenges industry={industry} />
      <TargetSolutions industry={industry} />
      <ChallengeSolutionFlow />
      <AssociatedServices industry={industry} />
      <IndustryTechnology industry={industry} />
      <DigitalTransformation />
      <SecurityGovernance />
      <IndustryCaseStudies industry={industry} />
      <IndustryOutcomes industry={industry} />
      <RelatedIndustries industry={industry} />
      <IndustryDetailCTA industry={industry} />
    </div>
  );
};

export default IndustryDetailsPage;
