import React from "react";
import { SEO } from "../../../../components/seo/SEO";
import { IndustriesHero } from "./components/IndustriesHero";
import { IndustryExplorer } from "./components/IndustryExplorer";
import { IndustryGrid } from "./components/IndustryGrid";
import { IndustrySearch } from "./components/IndustrySearch";
import { IndustryCTA } from "./components/IndustryCTA";

export const IndustriesPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="Enterprise Industry Solutions | Domain-Specific Engineering"
        description="Explore Aurexion's vertical industry solutions across 18 sectors including Banking, Healthcare, Manufacturing, Retail, Logistics, and Real Estate."
        canonical="/industries"
      />
      <IndustriesHero />
      <IndustryExplorer />
      <IndustryGrid />
      <IndustrySearch />
      <IndustryCTA />
    </div>
  );
};

export default IndustriesPage;
