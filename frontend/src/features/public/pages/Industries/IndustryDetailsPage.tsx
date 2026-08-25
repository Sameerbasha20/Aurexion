import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useIndustryDetails } from "../../hooks/usePublicContent";
import { industriesData } from "../../../../data/industries";

import { IndustryHero } from "./components/Detail/IndustryHero";
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
import { SEO } from "../../../../components/seo/SEO";

export const IndustryDetailsPage = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug || "";

  // Fetch PostgreSQL model via public API
  const { data: apiIndustry, loading } = useIndustryDetails(slug);

  const staticIndustry = industriesData.find(ind => ind.slug === slug);
  
  // Safe mapping of DB instance to frontend format
  const industry = apiIndustry ? {
    id: String(apiIndustry.id),
    slug: apiIndustry.slug,
    name: apiIndustry.name || staticIndustry?.name || "",
    shortDescription: staticIndustry?.shortDescription || apiIndustry.challenges || "",
    challenges: (typeof apiIndustry.challenges === "string" && !apiIndustry.challenges.includes("Challenges faced in the")) ? {
      operational: [{ title: "Operational Impact", description: apiIndustry.challenges }],
      regulatory: [{ title: "Regulatory Impact", description: apiIndustry.challenges }],
      technical: [{ title: "Technical Impact", description: apiIndustry.challenges }]
    } : (staticIndustry?.challenges || { operational: [], regulatory: [], technical: [] }),
    solutions: (apiIndustry.target_solutions && !apiIndustry.target_solutions.includes("Solutions designed for the"))
      ? apiIndustry.target_solutions.split("\n").filter(Boolean)
      : (staticIndustry?.solutions || []),
    target_solutions: apiIndustry.target_solutions,
    relatedServices: (apiIndustry.services && apiIndustry.services.length > 0)
      ? apiIndustry.services.map((s: any) => s.slug)
      : (staticIndustry?.relatedServices || []),
    relatedCaseStudies: (apiIndustry.case_studies && apiIndustry.case_studies.length > 0)
      ? apiIndustry.case_studies.map((cs: any) => cs.slug)
      : (staticIndustry?.relatedCaseStudies || []),
    outcomes: staticIndustry?.outcomes || ["Operational Efficiency", "Compliance Architecture", "Security Risk Mitigation"]
  } : staticIndustry;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // SEO & Schema Mapping (PRD 4.3)
  useEffect(() => {
    if (industry) {
      document.title = `Enterprise ${industry.name} Technology Solutions | Aurexion Technologies`;

      // Update meta description
      const descText = `Learn how Aurexion Technologies designs custom software engineering and digital transformation architectures for ${industry.name} sector.`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", descText);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = descText;
        document.head.appendChild(meta);
      }

      // Update meta keywords
      const keywordsText = `${industry.name}, technology solutions, compliance, enterprise architecture`;
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute("content", keywordsText);
      } else {
        const meta = document.createElement("meta");
        meta.name = "keywords";
        meta.content = keywordsText;
        document.head.appendChild(meta);
      }

      // Inject JSON-LD Schema
      const schemaId = "jsonld-industry-schema";
      let script = document.getElementById(schemaId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = schemaId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `Enterprise ${industry.name} Technology Solutions`,
        "description": descText,
        "provider": {
          "@type": "Organization",
          "name": "Aurexion Technologies",
          "url": window.location.origin
        },
        "url": window.location.href
      };
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [industry]);

  if (loading && !apiIndustry && !staticIndustry) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-primary font-mono text-sm">RETRIEVING SECTOR PROFILE...</div>
      </div>
    );
  }

  if (!industry) {
    setLocation("/industries");
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title={`${industry.name} Solutions | Industry Engineering`}
        description={industry.shortDescription || `Enterprise engineering solutions and digital transformation architecture for the ${industry.name} sector.`}
        canonical={`/industries/${industry.slug}`}
      />
      <IndustryHero industry={industry} />
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
