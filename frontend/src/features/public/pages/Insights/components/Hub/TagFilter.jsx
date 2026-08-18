import React from "react";

export const TagFilter = ({ tags, activeTag, setActiveTag }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-12 max-w-4xl mx-auto">
      {tags.map(tag => (
        <button type="button"
          key={tag.slug}
          onClick={() => setActiveTag(activeTag === tag.slug ? "" : tag.slug)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeTag === tag.slug
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
};
