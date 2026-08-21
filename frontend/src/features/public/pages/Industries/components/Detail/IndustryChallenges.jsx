import React from "react";
import { AlertCircle, FileText, Settings } from "lucide-react";

const CHALLENGE_IMAGES = {
  banking: {
    operational: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"
  },
  "financial-services": {
    operational: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
  },
  insurance: {
    operational: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
  },
  healthcare: {
    operational: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
  },
  lifesciences: {
    operational: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=600&q=80"
  },
  life: {
    operational: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=600&q=80"
  },
  education: {
    operational: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
  },
  manufacturing: {
    operational: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  retail: {
    operational: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80"
  },
  "e-commerce": {
    operational: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80"
  },
  ecommerce: {
    operational: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=600&q=80"
  },
  "logistics-supply-chain": {
    operational: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80"
  },
  logistics: {
    operational: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80"
  },
  default: {
    operational: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    regulatory: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    technical: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
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
