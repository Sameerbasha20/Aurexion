import React, { useState, useMemo, useEffect } from "react";
import { useBlogPosts } from "../../hooks/usePublicContent";
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

  // SEO tags
  useEffect(() => {
    document.title = "Insights & Technology Blog | Aurexion Technologies";
    const descText = "Explore deep-dive technical articles, research papers, and guides on AI engineering, zero trust cloud security, and scalable microservices.";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", descText);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = descText;
      document.head.appendChild(meta);
    }
  }, []);

  const clearFilters = () => {
    setActiveCategory("");
    setActiveTag("");
    setSearchQuery("");
  };

  // Query PostgreSQL database
  const { data: dbPosts, loading } = useBlogPosts({
    category: activeCategory,
    tag: activeTag,
    search: searchQuery
  });

  const isUsingDb = dbPosts && dbPosts.length > 0;

  // Adapt database posts to frontend expected structure
  const articlesList = useMemo(() => {
    if (isUsingDb) {
      return dbPosts.map(post => ({
        id: String(post.id),
        slug: post.slug,
        title: post.title,
        excerpt: post.summary || post.content.substring(0, 150) + "...",
        content: post.content,
        category: post.category_name || post.category,
        tags: Array.isArray(post.tags) ? post.tags : [],
        authorId: "auth-001",
        publishedAt: post.published_at || post.created_at,
        featured: post.is_featured || false
      }));
    }
    return blogPosts;
  }, [dbPosts, isUsingDb]);

  // Find the featured article
  const featuredArticle = useMemo(() => {
    return articlesList.find(post => post.featured) || articlesList[0];
  }, [articlesList]);

  const filteredArticles = useMemo(() => {
    if (isUsingDb) {
      // Backend already filtered. Exclude featured post if no active filters
      const hasActiveFilters = Boolean(activeCategory || activeTag || searchQuery);
      if (!hasActiveFilters && featuredArticle) {
        return articlesList.filter(post => post.id !== featuredArticle.id);
      }
      return articlesList;
    }

    // Client-side filtering logic for fallback data
    return articlesList.filter((post) => {
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
        const matchExcerpt = (post.excerpt || "").toLowerCase().includes(query);
        const matchTags = post.tags.some(tag => tag.toLowerCase().includes(query));
        const matchCategory = post.category.toLowerCase().includes(query);
        const matchAuthor = author ? author.name.toLowerCase().includes(query) : false;
        
        if (!matchTitle && !matchExcerpt && !matchTags && !matchCategory && !matchAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [articlesList, activeCategory, activeTag, searchQuery, featuredArticle, isUsingDb]);

  return (
    <div className="bg-background min-h-screen">
      <InsightsHero />
      
      {!activeCategory && !activeTag && !searchQuery && featuredArticle && (
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

      {loading && !isUsingDb ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="text-primary font-mono text-sm">RETRIEVING LATEST INSIGHTS...</span>
        </div>
      ) : (
        <ArticleGrid articles={filteredArticles} clearFilters={clearFilters} />
      )}
      
      <InsightsCTA />
    </div>
  );
};

export default InsightsPage;
