import React from "react";
import { AboutHero } from "./components/AboutHero";
import { CompanyOverview } from "./components/CompanyOverview";
import { FoundationSection } from "./components/FoundationSection";
import { VisionSection } from "./components/VisionSection";
import { MissionSection } from "./components/MissionSection";
import { EngineeringPrinciples } from "./components/EngineeringPrinciples";
import { ValuesSection } from "./components/ValuesSection";
import { LeadershipSection } from "./components/LeadershipSection";
import { GovernanceSection } from "./components/GovernanceSection";
import { SecurityTrust } from "./components/SecurityTrust";
import { WhyAurexion } from "./components/WhyAurexion";
import { AboutCTA } from "./components/AboutCTA";

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      <AboutHero />
      <CompanyOverview />
      <FoundationSection />
      <VisionSection />
      <MissionSection />
      <EngineeringPrinciples />
      <ValuesSection />
      <LeadershipSection />
      <GovernanceSection />
      <SecurityTrust />
      <WhyAurexion />
      <AboutCTA />
    </div>
  );
};

export default AboutPage;
