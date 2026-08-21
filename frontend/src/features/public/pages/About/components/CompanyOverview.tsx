import React from "react";
import { aboutData } from "../../../../../data/about";

interface CompanyOverviewProps {
  data?: {
    headline?: string;
    description?: string[];
  };
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({ data }) => {
  const headline = data?.headline || aboutData.overview.headline;
  const description = data?.description || aboutData.overview.description;

  return (
    <section className="py-24 bg-background border-b border-border/20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
              {headline}
            </h2>
            <div className="mt-8 w-16 h-1 bg-primary" />
          </div>
          
          <div className="space-y-6">
            {description && description.map((paragraph: string, index: number) => (
              <p key={index} className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      
      {/* Decorative technical element */}
      <div className="absolute right-0 bottom-0 w-32 h-32 border-l border-t border-border/20 opacity-50 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary/40 rounded-full" />
      </div>
    </section>
  );
};
