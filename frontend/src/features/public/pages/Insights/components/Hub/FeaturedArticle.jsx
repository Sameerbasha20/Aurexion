import React from "react";
import { Link } from "wouter";
import { ArrowRight, Clock, Calendar, User } from "lucide-react";
import { authors } from "../../../../../../data/authors";

export const FeaturedArticle = ({ article }) => {
  if (!article) return null;

  const author = authors.find(a => a.id === article.authorId);

  return (
    <section id="featured" className="py-6 md:py-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-card border border-border/40 rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors shadow-2xl">
          <div className="flex flex-col lg:flex-row min-h-[420px]">
            
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-4 block">
                FEATURED • {article.category.replace('-', ' ')}
              </span>
              
              <Link href={`/insights/${article.slug}`}>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground hover:text-primary transition-colors leading-tight">
                  {article.title}
                </h2>
              </Link>
              
              <p className="text-base text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-6 font-mono">
                {author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.readingTime}</span>
                </div>
              </div>

              <div>
                <Link 
                  href={`/insights/${article.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="flex-1 bg-[#0a0f18] relative overflow-hidden hidden lg:block">
              <img
                src={article.coverImage || "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80"}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent opacity-80" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
