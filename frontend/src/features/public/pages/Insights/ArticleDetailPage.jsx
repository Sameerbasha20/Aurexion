import React, { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useBlogPostDetails, useRelatedBlogPosts } from "../../hooks/usePublicContent";
import { blogPosts } from "../../../../data/blogPosts";
import { ArticleHero } from "./components/Detail/ArticleHero";
import { ReadingProgress } from "./components/Detail/ReadingProgress";
import { TableOfContents } from "./components/Detail/TableOfContents";
import { ArticleContent } from "./components/Detail/ArticleContent";
import { AuthorCard } from "./components/Detail/AuthorCard";
import { ShareButtons } from "./components/Detail/ShareButtons";
import { RelatedContent } from "./components/Detail/RelatedContent";
import { InsightsCTA } from "./components/Hub/InsightsCTA";
import { SEO } from "../../../../components/seo/SEO";
import { createArticleSchema } from "../../../../components/seo/structuredData";
import { getSiteUrl } from "../../../../components/seo/seoConfig";

export const ArticleDetailPage = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug || "";

  // Query details and related posts from database
  const { data: apiArticle, loading } = useBlogPostDetails(slug);
  const { data: apiRelated } = useRelatedBlogPosts(slug);

  const staticArticle = blogPosts.find(p => p.slug === slug);

  // Safe mapping of DB instance to expected component structure
  const article = apiArticle ? {
    id: String(apiArticle.id),
    slug: apiArticle.slug,
    title: apiArticle.title,
    excerpt: apiArticle.summary || apiArticle.content.substring(0, 150) + "...",
    content: apiArticle.content,
    category: apiArticle.category_name || apiArticle.category,
    tags: (Array.isArray(apiArticle.tags) && apiArticle.tags.length > 0) ? apiArticle.tags : (staticArticle?.tags || []),
    authorId: staticArticle?.authorId || (() => {
      const contentStr = (apiArticle.title + " " + apiArticle.content).toLowerCase();
      if (contentStr.includes("security") || contentStr.includes("cryptography") || contentStr.includes("zero-trust") || contentStr.includes("cybersecurity")) {
        return "auth-003";
      } else if (contentStr.includes("cloud") || contentStr.includes("devops") || contentStr.includes("kubernetes") || contentStr.includes("architecture")) {
        return "auth-002";
      } else {
        return "auth-001";
      }
    })(),
    publishedAt: apiArticle.published_at || apiArticle.created_at,
    relatedServices: staticArticle?.relatedServices || [],
    relatedIndustries: staticArticle?.relatedIndustries || [],
    relatedCaseStudies: staticArticle?.relatedCaseStudies || [],
    meta_title: apiArticle.meta_title,
    meta_description: apiArticle.meta_description,
    meta_keywords: apiArticle.meta_keywords,
    coverImage: apiArticle.media || staticArticle?.coverImage || (() => {
      const categoryImages = {
        "cybersecurity": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
        "software-engineering": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        "ai-ml": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80",
        "cloud": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
        "data": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "devops": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80",
        "enterprise": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
        "digital-transformation": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        "ui-ux": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80"
      };
      const cat = apiArticle.category_name || apiArticle.category || "";
      return categoryImages[cat.toLowerCase()] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80";
    })()
  } : staticArticle;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading && !apiArticle && !staticArticle) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-primary font-mono text-sm">RETRIEVING ARTICLE METADATA...</div>
      </div>
    );
  }

  if (!article) {
    setLocation("/not-found", { replace: true });
    return null;
  }

  const siteUrl = getSiteUrl();
  const descText = article.meta_description || article.excerpt || article.content.substring(0, 150);
  const articleSchema = createArticleSchema({
    title: article.title,
    description: descText,
    url: `/blogengine/${article.slug}`,
    image: article.coverImage,
    datePublished: article.publishedAt,
    authorName: "Aurexion Engineering Team"
  }, siteUrl);

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title={article.meta_title || `${article.title} | Insights`}
        description={descText}
        canonical={`/blogengine/${article.slug}`}
        ogImage={article.coverImage}
        ogType="article"
        publishedTime={article.publishedAt}
        keywords={article.meta_keywords ? article.meta_keywords.split(",").map((k) => k.trim()) : article.tags}
        jsonLd={articleSchema}
      />
      <ReadingProgress />
      <ArticleHero article={article} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 min-w-0">
            <ArticleContent content={article.content} />
            <AuthorCard authorId={article.authorId} />
            <ShareButtons title={article.title} />
          </div>

          {/* Sticky Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            {/* Table of Contents */}
            <div className="p-6 bg-[#080f1a] border border-border/20 rounded-xl">
              <TableOfContents content={article.content} />
            </div>

            {/* Enterprise Consultation Sidebar Widget */}
            <div className="p-6 bg-gradient-to-br from-[#0a1424] to-[#050b14] border border-[rgba(99,245,232,0.25)] rounded-xl shadow-xl">
              <span className="text-[10px] font-mono font-bold text-[#63f5e8] tracking-widest uppercase mb-2 block">EXECUTIVE ADVISORY</span>
              <h4 className="text-lg font-bold text-white mb-2">Architect Your Cloud & AI Strategy</h4>
              <p className="text-xs text-[#8da5ae] leading-relaxed mb-5">
                Schedule a 1-on-1 architecture review with our principal engineers to evaluate your infrastructure.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#63f5e8] text-[#041014] text-xs font-mono font-bold rounded hover:bg-[#86f8ee] transition-colors"
              >
                BOOK ARCHITECTURE REVIEW
              </Link>
            </div>
          </aside>

        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedContent currentArticle={article} />
      </div>

      <InsightsCTA />
    </div>
  );
};

export default ArticleDetailPage;
