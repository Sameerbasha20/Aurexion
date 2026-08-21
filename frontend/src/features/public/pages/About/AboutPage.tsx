import React from "react";
import { SEO } from "../../../../components/seo/SEO";
import { AboutHero } from "./components/AboutHero";
import { CompanyOverview } from "./components/CompanyOverview";
import { FoundationSection } from "./components/FoundationSection";
import { VisionSection } from "./components/VisionSection";
import { GlobalPresence } from "./components/GlobalPresence";
import { MissionSection } from "./components/MissionSection";
import { EngineeringPrinciples } from "./components/EngineeringPrinciples";
import { ValuesSection } from "./components/ValuesSection";
import { LeadershipSection } from "./components/LeadershipSection";
import { GovernanceSection } from "./components/GovernanceSection";
import { SecurityTrust } from "./components/SecurityTrust";
import { WhyAurexion } from "./components/WhyAurexion";
import { AboutCTA } from "./components/AboutCTA";
import { useCompanyInfo } from "../../hooks/usePublicContent";

export const AboutPage: React.FC = () => {
  const { data } = useCompanyInfo();

  // Safeguard default structure if data is loading/missing sections
  const heroData = data?.hero || {};
  const overviewData = data?.overview || {};
  const foundationData = data?.foundation || {};
  const visionData = data?.vision || {};
  const globalPresenceData = data?.global_presence || {};
  const missionData = data?.mission || {};
  const principlesData = data?.principles || {};
  const valuesData = data?.values || {};
  const leadershipData = data?.leadership || {};
  const governanceData = data?.governance || {};
  const securityData = data?.security || {};
  const differentiatorsData = data?.differentiators || {};

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="About Aurexion | Enterprise Engineering & Technology Leadership"
        description="Learn about Aurexion's engineering foundation, leadership, core principles, and enterprise digital transformation mission."
        canonical="/about"
      />
      <AboutHero data={heroData} />
      <CompanyOverview data={overviewData} />
      <FoundationSection data={foundationData} />
      <VisionSection data={visionData} />
      <GlobalPresence data={globalPresenceData} />
      <MissionSection data={missionData} />
      <EngineeringPrinciples data={principlesData} />
      <ValuesSection data={valuesData} />
      <LeadershipSection data={leadershipData} />
      <GovernanceSection data={governanceData} />
      <SecurityTrust data={securityData} />
      <WhyAurexion data={differentiatorsData} />
      <AboutCTA />
    </div>
  );
};

export default AboutPage;

