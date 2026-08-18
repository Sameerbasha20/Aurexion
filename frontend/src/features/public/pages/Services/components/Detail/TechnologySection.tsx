import React from "react";
import { ServiceItem } from "../../../../../../data/services";
import { Code2 } from "lucide-react";

interface TechnologySectionProps {
  service: ServiceItem;
}

export const TechnologySection: React.FC<TechnologySectionProps> = ({ service }) => {
  if (!service.technologies || service.technologies.length === 0) return null;

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold mb-4">Technology & Engineering</h2>
            <p className="text-muted-foreground">
              We leverage an enterprise-grade technology stack to engineer this capability, ensuring maximum performance, security, and scalability.
            </p>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            {service.technologies.map((tech: string, index: number) => (
              <div key={index} className="flex items-center gap-3 p-4 border border-border/40 rounded bg-card/50 hover:bg-card hover:border-primary/50 transition-colors">
                <Code2 className="w-5 h-5 text-primary opacity-70" />
                <span className="font-mono text-sm font-bold text-foreground">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
