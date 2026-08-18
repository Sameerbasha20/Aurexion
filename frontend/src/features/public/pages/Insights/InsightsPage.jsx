import React, { useState, useMemo } from "react";
import { blogPosts } from "../../../../data/blogPosts";
import { blogCategories } from "../../../../data/blogCategories";
import { blogTags } from "../../../../data/blogTags";
import { InsightsHero } from "./components/Hub/InsightsHero";
import { FeaturedArticle } from "./components/Hub/FeaturedArticle";
import { CategoryNavigation } from "./components/Hub/CategoryNavigation";
import { SearchBar } from "./components/Hub/SearchBar";
import { TagFilter } from "./components/Hub/TagFilter";
import { ArticleGrid } from "./components/Hub/ArticleGrid";
import { InsightsCTA } from "./components/Hub/InsightsCTA";
import { authors } from "../../../../data/authors";

export const InsightsPage = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const clearFilters = () => {
    setActiveCategory("");
    setActiveTag("");
    setSearchQuery("");
  };

  // Find the featured article (first one marked as featured)
  const featuredArticle = useMemo(() => {
    return blogPosts.find(post => post.featured) || blogPosts[0];
  }, []);

  const filteredArticles = useMemo(() => {
    return blogPosts.filter((post) => {
      // Don't duplicate the featured article in the grid if no filters are active
      const isFeatured = post.id === featuredArticle?.id;
      const hasActiveFilters = Boolean(activeCategory || activeTag || searchQuery);
      
      if (isFeatured && !hasActiveFilters) {
        return false;
      }

      // Filter by Category
      if (activeCategory && post.category !== activeCategory) {
        return false;
      }

      // Filter by Tag
      if (activeTag && !post.tags.includes(activeTag)) {
        return false;
      }

      // Filter by Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const author = authors.find(a => a.id === post.authorId);
        
        const matchTitle = post.title.toLowerCase().includes(query);
        const matchExcerpt = post.excerpt.toLowerCase().includes(query);
        const matchTags = post.tags.some(tag => tag.toLowerCase().includes(query));
        const matchCategory = post.category.toLowerCase().includes(query);
        const matchAuthor = author ? author.name.toLowerCase().includes(query) : false;
        
        if (!matchTitle && !matchExcerpt && !matchTags && !matchCategory && !matchAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, activeTag, searchQuery, featuredArticle]);

  return (
    <div className="bg-background min-h-screen">
      <InsightsHero />
      
      {!activeCategory && !activeTag && !searchQuery && (
        <FeaturedArticle article={featuredArticle} />
      )}
      
      <CategoryNavigation 
        categories={blogCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
        <TagFilter tags={blogTags} activeTag={activeTag} setActiveTag={setActiveTag} />
      </div>

      <ArticleGrid articles={filteredArticles} clearFilters={clearFilters} />
      
      <InsightsCTA />
    </div>
  );
};

export default InsightsPage;
