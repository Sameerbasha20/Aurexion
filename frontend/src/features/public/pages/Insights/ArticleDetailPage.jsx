import React, { useEffect } from "react";
import { useParams, Redirect } from "wouter";
import { blogPosts } from "../../../../data/blogPosts";
import { ArticleHero } from "./components/Detail/ArticleHero";
import { ReadingProgress } from "./components/Detail/ReadingProgress";
import { TableOfContents } from "./components/Detail/TableOfContents";
import { ArticleContent } from "./components/Detail/ArticleContent";
import { AuthorCard } from "./components/Detail/AuthorCard";
import { ShareButtons } from "./components/Detail/ShareButtons";
import { RelatedContent } from "./components/Detail/RelatedContent";
import { InsightsCTA } from "./components/Hub/InsightsCTA";

export const ArticleDetailPage = () => {
  const params = useParams();
  
  const article = blogPosts.find(p => p.slug === params.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.slug]);

  if (!article) {
    return <Redirect to="/not-found" />;
  }

  return (
    <div className="bg-background min-h-screen">
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
              <a
                href="/contact"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#63f5e8] text-[#041014] text-xs font-mono font-bold rounded hover:bg-[#86f8ee] transition-colors"
              >
                BOOK ARCHITECTURE REVIEW
              </a>
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
