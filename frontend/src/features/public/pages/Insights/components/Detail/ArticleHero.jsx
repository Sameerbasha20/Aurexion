import React from "react";
import { Link } from "wouter";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { authors } from "../../../../../../data/authors";

export const ArticleHero = ({ article }) => {
  if (!article) return null;
  const author = authors.find(a => a.id === article.authorId);

  return (
    <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 bg-[#050B14] relative overflow-hidden border-b border-border/10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <a 
          href="/insights"
          onClick={(e) => {
            if (window.history.length > 1) {
              e.preventDefault();
              window.history.back();
            }
          }}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-6 font-mono cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO INSIGHTS
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Header Copy Column (Left ~58%: 7 of 12 cols) */}
          <div className="lg:col-span-7 min-w-0 w-full">
            <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-3 block">
              {article.category ? article.category.replace('-', ' ') : 'INSIGHT'}
            </span>
            
            <h1 
              className="font-bold text-white mb-4 break-words"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 3.25rem)",
                lineHeight: 1.18,
                margin: "0 0 1rem 0",
                maxWidth: "100%",
              }}
            >
              {article.title}
            </h1>
            
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-5 text-xs text-gray-400 font-mono mb-6">
              {author && (
                <div className="flex items-center gap-2.5">
                  {author.image ? (
                    <img src={author.image} alt={author.name} className="w-7 h-7 rounded-full object-cover border border-primary/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-gray-200 font-semibold">{author.name}</span>
                </div>
              )}
              
              {article.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {article.readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{article.readingTime}</span>
                </div>
              )}
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-mono px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Header Image / Media Column (Right ~42%: 5 of 12 cols) */}
          <div className="lg:col-span-5 min-w-0 w-full">
            {article.coverImage && (
              <div className="w-full h-64 sm:h-80 lg:h-96 max-w-md lg:max-w-none mx-auto rounded-xl overflow-hidden border border-border/20 shadow-2xl relative group bg-background">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/80 via-transparent to-transparent pointer-events-none" />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ArticleHero;
