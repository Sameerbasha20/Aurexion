import React from "react";
import { Link2 } from "lucide-react";

export const IntegrationsSection = ({ caseStudy }) => {
  if (!caseStudy.thirdPartyIntegrations) return null;

  return (
    <section className="py-8 bg-card/30 border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">06</span>
          <h2 className="text-2xl font-bold">Third-Party Integrations</h2>
        </div>

        {caseStudy.thirdPartyIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {caseStudy.thirdPartyIntegrations.map((integration, idx) => (
              <div key={idx} className="p-5 bg-background border border-border/40 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-base text-white">{integration.name}</h4>
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{integration.purpose}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-background border border-border/40 rounded-lg text-center max-w-2xl">
            <p className="text-muted-foreground">Integration details available through specific project configuration.</p>
          </div>
        )}
      </div>
    </section>
  );
};
