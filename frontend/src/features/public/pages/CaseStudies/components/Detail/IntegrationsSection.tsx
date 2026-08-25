import React from "react";
import { Link2 } from "lucide-react";

export const IntegrationsSection = ({ caseStudy }: { caseStudy: any }) => {
  if (!caseStudy.thirdPartyIntegrations) return null;

  return (
    <section className="py-12 bg-card/30 border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Third-Party Integrations</h2>
        </div>

        {caseStudy.thirdPartyIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {caseStudy.thirdPartyIntegrations.map((integration: any, idx: number) => (
              <div key={idx} className="p-6 bg-[#080f1a] border border-border/20 rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-base text-white">{integration.name}</h4>
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{integration.purpose}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#080f1a] border border-border/20 rounded-xl text-center max-w-2xl">
            <p className="text-gray-400">Integration details available through specific project configuration.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default IntegrationsSection;
