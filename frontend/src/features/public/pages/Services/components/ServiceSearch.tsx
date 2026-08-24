import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { servicesData, serviceCategories } from "../../../../../data/services";
import { useServices } from "../../../hooks/usePublicContent";
import { Search, ArrowRight } from "lucide-react";

export const ServiceSearch: React.FC = () => {
  const { data: dbServices } = useServices();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Map database services to ServiceItem format
  const mappedDbServices = useMemo(() => {
    return (dbServices || []).map((apiService: any) => ({
      id: `db-${apiService.id}`,
      slug: apiService.slug,
      category: apiService.category || "Core Engineering",
      name: apiService.title || apiService.name || "",
      description: apiService.description || "",
      technologies: apiService.tech_stack || [],
      relatedIndustries: [] as string[],
      relatedCaseStudies: [] as string[],
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

  const filteredServices = useMemo(() => {
    return allServices.filter((service: any) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(query.toLowerCase()) || 
        service.description.toLowerCase().includes(query.toLowerCase()) ||
        service.technologies.some((t: string) => t.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = activeFilter === "All" || service.category === activeFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [query, activeFilter, allServices]);

  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Search Our Capabilities</h2>
          
          <div className="relative mt-8 max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-card border border-border/50 rounded-lg text-foreground focus:ring-primary focus:border-primary transition-colors text-lg"
              placeholder="Search by keyword, technology (e.g. 'AI', 'Cloud', 'Python')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {serviceCategories.map((cat: any) => (
              <button type="button"
                key={cat.id}
                onClick={() => setActiveFilter(activeFilter === cat.name ? "All" : cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === cat.name 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border border-border/40 hover:border-primary/50 text-muted-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {query || activeFilter !== "All" ? (
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground font-mono mb-6">
              FOUND {filteredServices.length} {filteredServices.length === 1 ? 'RESULT' : 'RESULTS'}
            </p>
            
            {filteredServices.length > 0 ? (
              <div className="space-y-4">
                {filteredServices.map((service: any) => (
                  <Link 
                    key={service.id} 
                    href={`/services/${service.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card/30 border border-border/30 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                          {service.category}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{service.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary mt-4 sm:mt-0 sm:ml-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card/10 border border-border/20 rounded-lg">
                <p className="text-muted-foreground">No services found matching your criteria.</p>
                <button type="button" 
                  onClick={() => { setQuery(""); setActiveFilter("All"); }}
                  className="mt-4 text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};
