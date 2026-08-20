import React, { useMemo } from "react";
import { serviceCategories, servicesData } from "../../../../../data/services";
import { useServices } from "../../../hooks/usePublicContent";
import { Code, Cpu, Cloud, Layout, Layers, Shield, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const iconMap: Record<string, React.ElementType> = {
  Code,
  Cpu,
  Cloud,
  Layout,
  Layers,
  Shield
};

export const ServicesOverview: React.FC = () => {
  const { data: dbServices } = useServices();

  // Map database services to ServiceItem format
  const mappedDbServices = useMemo(() => {
    return (dbServices || []).map((apiService: any) => ({
      id: `db-${apiService.id}`,
      slug: apiService.slug,
      category: apiService.category || "Core Engineering",
      name: apiService.title || apiService.name || "",
      description: apiService.description || "",
      technologies: apiService.tech_stack || [],
      relatedIndustries: [],
      relatedCaseStudies: [],
    }));
  }, [dbServices]);

  // Combine static and DB services, prioritizing DB services for duplicates
  const allServices = useMemo(() => {
    const combined: any[] = [...mappedDbServices];
    servicesData.forEach((staticS) => {
      if (!combined.some((s) => s.slug === staticS.slug)) {
        combined.push(staticS);
      }
    });
    return combined;
  }, [mappedDbServices]);

  return (
    <section id="capabilities" className="py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Core Capabilities</h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Aurexion operates across six primary technology domains, engineering bespoke solutions for modern enterprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category: any) => {
            const Icon = iconMap[category.iconName];
            const serviceCount = allServices.filter((s: any) => s.category === category.name).length;

            return (
              <div 
                key={category.id}
                className="group relative flex flex-col p-8 border border-border/40 bg-card rounded-lg hover:border-primary/50 hover:bg-card/40 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                
                <div className="flex items-center mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <div className="flex-grow relative z-10">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {category.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40 relative z-10">
                  <span className="text-sm font-mono text-muted-foreground">
                    {serviceCount} SERVICES
                  </span>
                  <a href="#explorer" className="inline-flex items-center text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
