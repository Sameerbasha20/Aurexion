import React from "react";
import { Link } from "wouter";
import { ArrowRight, Clock } from "lucide-react";
import { authors } from "../../../../../../data/authors";

export const ArticleCard = ({ article }) => {
  const author = authors.find(a => a.id === article.authorId);

  return (
    <Link href={`/insights/${article.slug}`} className="group flex flex-col h-full bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Cover Image */}
      <div className="h-48 bg-[#0a0f18] relative overflow-hidden flex-shrink-0 border-b border-border/40">
        <img
          src={article.coverImage || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
          {article.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-muted text-muted-foreground rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
          <div className="flex items-center gap-3">
            {author && (
              <div className="text-xs font-medium text-foreground">
                {author.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3" />
            <span>{article.readingTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
