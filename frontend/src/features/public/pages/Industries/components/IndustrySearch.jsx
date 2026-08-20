import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { industriesData } from "../../../../../data/industries";
import { Search, ArrowRight } from "lucide-react";

export const IndustrySearch = () => {
  const [query, setQuery] = useState("");

  const filteredIndustries = useMemo(() => {
    return industriesData.filter((ind) => {
      return ind.name.toLowerCase().includes(query.toLowerCase()) || 
             ind.shortDescription.toLowerCase().includes(query.toLowerCase());
    });
  }, [query]);

  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-6">Search Industries</h2>
          
          <div className="relative mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-card border border-border/50 rounded-lg text-foreground focus:ring-primary focus:border-primary transition-colors text-lg"
              placeholder="Search by industry name (e.g. 'Banking', 'Healthcare')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {query ? (
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground font-mono mb-6">
              FOUND {filteredIndustries.length} {filteredIndustries.length === 1 ? 'RESULT' : 'RESULTS'}
            </p>
            
            {filteredIndustries.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredIndustries.map(industry => (
                  <Link 
                    key={industry.id} 
                    href={`/industries/${industry.slug}`}
                    className="group flex flex-col justify-between p-6 bg-card/30 border border-border/30 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <div className="flex justify-end items-start mb-2">
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                      <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{industry.name}</h4>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{industry.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card/10 border border-border/20 rounded-lg">
                <p className="text-muted-foreground">No industries found matching your criteria.</p>
                <button type="button" 
                  onClick={() => setQuery("")}
                  className="mt-4 text-primary hover:underline font-bold"
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
