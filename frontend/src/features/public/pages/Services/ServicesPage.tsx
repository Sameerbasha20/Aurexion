import React from "react";
import { ServicesHero } from "./components/ServicesHero";
import { ServicesOverview } from "./components/ServicesOverview";
import { ServiceExplorer } from "./components/ServiceExplorer";
import { ServiceSearch } from "./components/ServiceSearch";
import { EngineeringQuality } from "./components/EngineeringQuality";
import { WhyAurexionServices } from "./components/WhyAurexionServices";
import { ServicesCTA } from "./components/ServicesCTA";

export const ServicesPage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      <ServicesHero />
      <ServicesOverview />
      <ServiceExplorer />
      <ServiceSearch />
      <EngineeringQuality />
      <WhyAurexionServices />
      <ServicesCTA />
    </div>
  );
};

export default ServicesPage;
