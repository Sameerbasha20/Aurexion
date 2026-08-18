import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { serviceCategories, servicesData } from "../../../../../data/services";
import { ChevronRight, ArrowRight } from "lucide-react";

export const ServiceExplorer: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam && serviceCategories.some((c: any) => c.name === catParam)) {
        return catParam;
      }
    }
    return serviceCategories[0].name;
  });

  useEffect(() => {
    const syncCategoryFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam && serviceCategories.some((c: any) => c.name === catParam)) {
        setActiveCategory(catParam);
      }
    };
    syncCategoryFromUrl();
  }, []);
  
  const activeServices = servicesData.filter((s: any) => s.category === activeCategory);

  return (
    <section id="explorer" className="py-24 bg-[#0a0f18] scroll-mt-20 border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Explore Our Services</h2>
          <p className="text-gray-400 max-w-2xl">
            Select a technology domain below to view our specific engineering capabilities and service offerings.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Category Navigation */}
          <div className="lg:w-1/3">
            <div className="flex flex-col gap-2 sticky top-32">
              {serviceCategories.map((category: any) => {
                const isActive = activeCategory === category.name;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.name)}
                    className={`flex items-center justify-between p-4 text-left border rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(var(--primary),0.2)]' 
                        : 'border-border/20 bg-card/10 text-gray-400 hover:border-primary/40 hover:bg-card/30 hover:text-gray-200'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs opacity-70 mr-3">{category.id}</span>
                      <span className="font-bold text-lg">{category.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-5 h-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Services List */}
          <div className="lg:w-2/3 min-h-[500px]">
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 border-b border-border/20 pb-4">
                <h3 className="text-2xl font-bold text-white">{activeCategory}</h3>
                <p className="text-primary font-mono text-sm mt-2">{activeServices.length} CAPABILITIES</p>
              </div>

              <div className="space-y-4">
                {activeServices.map((service: any, index: number) => (
                  <Link 
                    key={service.id} 
                    href={`/services/${service.slug}`}
                    className="group block p-6 bg-card/5 border border-border/20 rounded-lg hover:border-primary/50 hover:bg-card/10 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">
                          {service.name}
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                          {service.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {service.technologies.slice(0, 3).map((tech: string, i: number) => (
                            <span key={i} className="text-xs font-mono px-2 py-1 bg-background border border-border/30 rounded text-gray-400">
                              {tech}
                            </span>
                          ))}
                          {service.technologies.length > 3 && (
                            <span className="text-xs font-mono px-2 py-1 text-primary/60">
                              +{service.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-primary whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity mt-4 sm:mt-0">
                        <span className="text-sm font-bold mr-2">Explore Service</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
