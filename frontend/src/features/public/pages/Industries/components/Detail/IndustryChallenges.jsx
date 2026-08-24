import React from "react";
import { AlertCircle, FileText, Settings } from "lucide-react";

const CHALLENGE_IMAGES = {
  banking: {
    operational: "/images/unsplash_1501167786227-4c.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1563986768609-32.webp"
  },
  "financial-services": {
    operational: "/images/unsplash_1590283603385-17.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1551288049-bebda.webp"
  },
  insurance: {
    operational: "/images/unsplash_1454165804606-c3.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1460925895917-af.webp"
  },
  healthcare: {
    operational: "/images/unsplash_1516549655169-df.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1576091160399-11.webp"
  },
  lifesciences: {
    operational: "/images/unsplash_1532187863486-ab.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1532187863486-ab.webp"
  },
  life: {
    operational: "/images/unsplash_1532187863486-ab.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1532187863486-ab.webp"
  },
  education: {
    operational: "/images/unsplash_1519389950473-47.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1516321318423-f0.webp"
  },
  manufacturing: {
    operational: "/images/unsplash_1581091226825-a6.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1581092580497-e0.webp"
  },
  retail: {
    operational: "/images/unsplash_1441986300917-64.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1557821552-17105.webp"
  },
  "e-commerce": {
    operational: "/images/unsplash_1557821552-17105.webp",
    regulatory: "/images/unsplash_1450133064473-71.webp",
    technical: "/images/unsplash_1557821552-17105.webp"
  },
  ecommerce: {
    operational: "/images/unsplash_1557821552-17105.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1557821552-17105.webp"
  },
  "logistics-supply-chain": {
    operational: "/images/unsplash_1586528116311-ad.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1504384308090-c8.webp"
  },
  logistics: {
    operational: "/images/unsplash_1586528116311-ad.webp",
    regulatory: "/images/unsplash_1589829545856-d1.webp",
    technical: "/images/unsplash_1504384308090-c8.webp"
  },
  default: {
    operational: "/images/unsplash_1460925895917-af.webp",
    regulatory: "/images/unsplash_1450133064473-71.webp",
    technical: "/images/unsplash_1558494949-ef010.webp"
  }
};

export const IndustryChallenges = ({ industry }) => {
  const defaultChallenges = {
    operational: [
      { 
        title: "Operational Efficiency & Scaling", 
        description: `Monolithic setups and manual operational bottlenecks slow down workflow efficiency and product delivery within the ${industry.name} sector.` 
      }
    ],
    regulatory: [
      { 
        title: "Compliance & Security Governance", 
        description: `Adapting to evolving compliance mandates, strict regional data privacy laws, and security standards for data governance.` 
      }
    ],
    technical: [
      { 
        title: "Legacy Modernization & Cloud Integration", 
        description: `Integrating secure, low-latency APIs and transitioning legacy databases to highly scalable, resilient cloud architectures.` 
      }
    ]
  };

  const operational = (industry.challenges?.operational && industry.challenges.operational.length > 0) 
    ? industry.challenges.operational 
    : defaultChallenges.operational;

  const regulatory = (industry.challenges?.regulatory && industry.challenges.regulatory.length > 0) 
    ? industry.challenges.regulatory 
    : defaultChallenges.regulatory;

  const technical = (industry.challenges?.technical && industry.challenges.technical.length > 0) 
    ? industry.challenges.technical 
    : defaultChallenges.technical;

  const images = CHALLENGE_IMAGES[industry.slug] || CHALLENGE_IMAGES.default;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Industry Challenges</h2>
          <p className="text-muted-foreground">
            {industry.name} enterprises face complexity scaling operations securely and modernizing legacy architectures.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Operational */}
          <div className="bg-card border border-border/40 rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
            <div className="h-36 bg-[#050B14] relative rounded-lg overflow-hidden mb-6">
              <img
                src={images.operational}
                alt="Operational challenges"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 w-10 h-10 rounded bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                <Settings className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="relative z-10 flex-grow">
              <h3 className="text-xl font-bold mb-4 text-white">Operational Challenges</h3>
              <ul className="space-y-4">
                {operational.map((challenge, idx) => (
                  <li key={idx}>
                    <h4 className="font-bold text-foreground mb-1 text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{challenge.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Regulatory */}
          <div className="bg-card border border-border/40 rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
            <div className="h-36 bg-[#050B14] relative rounded-lg overflow-hidden mb-6">
              <img
                src={images.regulatory}
                alt="Regulatory challenges"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 w-10 h-10 rounded bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="relative z-10 flex-grow">
              <h3 className="text-xl font-bold mb-4 text-white">Regulatory Challenges</h3>
              <ul className="space-y-4">
                {regulatory.map((challenge, idx) => (
                  <li key={idx}>
                    <h4 className="font-bold text-foreground mb-1 text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{challenge.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical */}
          <div className="bg-card border border-border/40 rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
            <div className="h-36 bg-[#050B14] relative rounded-lg overflow-hidden mb-6">
              <img
                src={images.technical}
                alt="Technical challenges"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 w-10 h-10 rounded bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="relative z-10 flex-grow">
              <h3 className="text-xl font-bold mb-4 text-white">Technical Challenges</h3>
              <ul className="space-y-4">
                {technical.map((challenge, idx) => (
                  <li key={idx}>
                    <h4 className="font-bold text-foreground mb-1 text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{challenge.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
