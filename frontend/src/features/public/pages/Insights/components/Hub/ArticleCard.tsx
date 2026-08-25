import React from "react";
import { Link } from "wouter";
import { ArrowRight, Clock } from "lucide-react";
import { authors } from "../../../../../../data/authors";

export const ArticleCard = ({ article }: { article: any }) => {
  const author = authors.find(a => a.id === article.authorId);

  return (
    <Link href={`/blogengine/${article.slug}`} className="group flex flex-col h-full bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Cover Image */}
      <div className="h-48 bg-[#0a0f18] relative overflow-hidden flex-shrink-0 border-b border-border/40">
        <img
          src={article.coverImage || "/images/unsplash_1460925895917-af.webp"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/unsplash_1460925895917-af.webp";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18]/80 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-xs font-mono font-bold text-primary tracking-wider uppercase mb-3 block">
          {article.category.replace('-', ' ')}
        </span>
        
        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">
          {article.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.slice(0, 3).map((tag: any) => (
            <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-muted text-muted-foreground rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            Read Blog
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3 text-[#63f5e8]" />
            <span>{article.readingTime || "5 min read"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
