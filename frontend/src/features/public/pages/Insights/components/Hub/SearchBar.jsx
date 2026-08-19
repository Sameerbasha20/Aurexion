import React from "react";
import { Search } from "lucide-react";

export const SearchBar = ({ query, setQuery }) => {
  return (
    <div className="relative max-w-xl mx-auto w-full mb-12">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-4 py-4 border border-border/40 rounded-xl leading-5 bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
        placeholder="Search insights..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};
