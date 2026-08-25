import React from "react";
import { Search } from "lucide-react";
import { industriesData } from "../../../../../data/industries";

export const CaseStudyFilters = ({ filters, setFilters }: { filters: any; setFilters: any }) => {
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-card/30 border-b border-border/10 py-6 sticky top-16 z-40 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-border/40 rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Search case studies..."
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <select
              className="bg-background border border-border/40 text-sm rounded-md px-3 py-2 focus:ring-primary focus:border-primary text-foreground"
              value={filters.industry}
              onChange={(e) => handleFilterChange("industry", e.target.value)}
            >
              <option value="">All Industries</option>
              {industriesData.map(ind => (
                <option key={ind.slug} value={ind.slug}>{ind.name}</option>
              ))}
            </select>

            <select
              className="bg-background border border-border/40 text-sm rounded-md px-3 py-2 focus:ring-primary focus:border-primary text-foreground"
              value={filters.clientType}
              onChange={(e) => handleFilterChange("clientType", e.target.value)}
            >
              <option value="">All Client Types</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Scale-up">Scale-up</option>
            </select>

            <select
              className="bg-background border border-border/40 text-sm rounded-md px-3 py-2 focus:ring-primary focus:border-primary text-foreground"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Cloud Modernization">Cloud Modernization</option>
              <option value="AI/ML Engineering">AI/ML Engineering</option>
              <option value="Custom Software Development">Custom Software Development</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
