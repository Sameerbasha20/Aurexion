import React from "react";
import { ArticleCard } from "./ArticleCard";
import { SearchX } from "lucide-react";

export const ArticleGrid = ({ articles, clearFilters }) => {
  return (
    <section className="pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-border/40 rounded-xl max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No insights found</h3>
            <p className="text-muted-foreground mb-8">
              We couldn't find any articles matching your current search and filter criteria.
            </p>
            <button 
              onClick={clearFilters}
              className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
