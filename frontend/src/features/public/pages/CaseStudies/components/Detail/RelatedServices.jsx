import React from "react";
import ServiceCardGrid from "../../../../components/ServiceCardGrid";

export const RelatedServices = ({ caseStudy }) => {
  if (!caseStudy.services || caseStudy.services.length === 0) return null;

  return (
    <section className="py-8 bg-background border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">10</span>
          <h2 className="text-2xl font-bold">Services Used</h2>
        </div>
<<<<<<< Updated upstream
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {caseStudy.services.map((slug, idx) => {
            const service = servicesData?.find(s => s.slug === slug);
            const title = service ? service.name : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            return (
              <Link 
                key={idx}
                href={`/services/${slug}`} 
                className="group flex flex-col justify-between p-6 bg-card border border-border/40 rounded-xl hover:border-primary/50 hover:bg-card/50 transition-colors h-48"
              >
                <div>
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
                </div>
                <div className="flex justify-end">
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
=======
        <ServiceCardGrid serviceSlugs={caseStudy.services} />
>>>>>>> Stashed changes
      </div>
    </section>
  );
};
