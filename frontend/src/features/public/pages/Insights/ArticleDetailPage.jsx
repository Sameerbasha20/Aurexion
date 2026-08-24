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
        "cybersecurity": "/images/unsplash_1563986768609-32.webp",
        "software-engineering": "/images/unsplash_1555066931-4365d.webp",
        "ai-ml": "/images/unsplash_1527474305487-b8.webp",
        "cloud": "/images/unsplash_1558494949-ef010.webp",
        "data": "/images/unsplash_1551288049-bebda.webp",
        "devops": "/images/unsplash_1618401471353-b9.webp",
        "enterprise": "/images/unsplash_1486406146926-c6.webp",
        "digital-transformation": "/images/unsplash_1460925895917-af.webp",
        "ui-ux": "/images/unsplash_1581291518633-83.webp"
      };
      const cat = apiArticle.category_name || apiArticle.category || "";
      return categoryImages[cat.toLowerCase()] || "/images/unsplash_1486406146926-c6.webp";
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
      
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Table of Contents & Quick Meta Header Card */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 bg-[#080f1a] border border-border/20 rounded-xl shadow-lg">
            <TableOfContents content={article.content} />
          </div>

          <div className="p-6 bg-[#080f1a] border border-border/20 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#63f5e8] tracking-widest uppercase mb-3 block">ARTICLE INSIGHT</span>
              <div className="space-y-2.5 text-xs font-mono text-gray-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">CATEGORY</span>
                  <span className="text-[#63f5e8] font-bold capitalize">{(article.category || "Technology").replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">EST. READ TIME</span>
                  <span className="text-white font-semibold">{article.readingTime || "6 min read"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">PUBLISHED</span>
                  <span className="text-white">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Recent"}</span>
                </div>
              </div>
            </div>

            <Link
              href="/contact"
              className="mt-4 inline-flex items-center justify-center w-full py-2 px-3 bg-[#63f5e8] text-[#041014] text-xs font-mono font-bold rounded hover:bg-[#86f8ee] transition-colors"
            >
              DISCUSS ARCHITECTURE
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <article className="bg-[#080f1a]/80 border border-border/20 rounded-2xl p-6 sm:p-12 shadow-2xl backdrop-blur-sm">
          <ArticleContent content={article.content} />
          
          <div className="border-t border-border/30 mt-12 pt-8">
            <ShareButtons title={article.title} />
          </div>
        </article>

        {/* Author Spotlight */}
        <div className="mt-10">
          <AuthorCard authorId={article.authorId} />
        </div>

        {/* Executive Consultation Box */}
        <div className="mt-10 p-8 bg-gradient-to-br from-[#0a1424] to-[#050b14] border border-[rgba(99,245,232,0.25)] rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono font-bold text-[#63f5e8] tracking-widest uppercase mb-2 block">EXECUTIVE ADVISORY</span>
            <h4 className="text-xl font-bold text-white mb-2">Architect Your Cloud &amp; AI Strategy</h4>
            <p className="text-sm text-[#8da5ae] leading-relaxed">
              Schedule a 1-on-1 architecture review with our principal engineers to evaluate your infrastructure, security postures, and digital roadmap.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-shrink-0 inline-flex items-center justify-center py-3.5 px-6 bg-[#63f5e8] text-[#041014] text-sm font-mono font-bold rounded-lg hover:bg-[#86f8ee] transition-all shadow-[0_0_20px_rgba(99,245,232,0.25)]"
          >
            SCHEDULE REVIEW
          </Link>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedContent currentArticle={article} />
      </div>

      <InsightsCTA />
    </div>
  );
};

export default ArticleDetailPage;
