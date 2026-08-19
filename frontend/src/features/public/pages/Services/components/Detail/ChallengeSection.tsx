import React from "react";
import { ShieldAlert } from "lucide-react";

export const ChallengeSection: React.FC = () => {
  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-destructive/10 mb-6">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Enterprise Challenges We Address</h2>
            <div className="w-16 h-1 bg-primary mb-8" />
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Modern enterprises face unprecedented complexity in scaling operations securely, integrating disparate legacy systems, and extracting actionable intelligence from massive datasets.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Without rigorous engineering standards and an adaptable architecture, organizations risk technical debt, security vulnerabilities, and stalled digital transformation initiatives.
            </p>
          </div>
          
          <div className="bg-card border border-border/40 rounded-xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />
            <ul className="space-y-6 relative z-10">
              {[
                "Scaling complex workloads without compromising performance or security.",
                "Modernizing legacy architectures to support agile deployment pipelines.",
                "Ensuring regulatory compliance and data governance across the enterprise.",
                "Accelerating time-to-market for custom software and digital products."
              ].map((challenge, index) => (
                <li key={index} className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
