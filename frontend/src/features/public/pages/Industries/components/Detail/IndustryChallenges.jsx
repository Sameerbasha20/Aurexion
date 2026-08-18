import React from "react";
import { AlertCircle, FileText, Settings } from "lucide-react";

export const IndustryChallenges = ({ industry }) => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Industry Challenges</h2>
          <p className="text-muted-foreground">
            {industry.name} enterprises face unprecedented complexity scaling operations securely and modernizing legacy architectures.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Operational */}
          <div className="bg-card border border-border/40 rounded-xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-6">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-6">Operational Challenges</h3>
              <ul className="space-y-6">
                {industry.challenges.operational.map((challenge, idx) => (
                  <li key={idx}>
                    <h4 className="font-bold text-foreground mb-1">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Regulatory */}
          <div className="bg-card border border-border/40 rounded-xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-6">Regulatory Challenges</h3>
              <ul className="space-y-6">
                {industry.challenges.regulatory.map((challenge, idx) => (
                  <li key={idx}>
                    <h4 className="font-bold text-foreground mb-1">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical */}
          <div className="bg-card border border-border/40 rounded-xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-6">Technical Challenges</h3>
              <ul className="space-y-6">
                {industry.challenges.technical.map((challenge, idx) => (
                  <li key={idx}>
                    <h4 className="font-bold text-foreground mb-1">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
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
