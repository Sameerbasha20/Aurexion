import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "../../../../../../data/blogPosts";

export const RelatedContent = ({ currentArticle }) => {
  // Find related articles (same category, excluding current)
  const relatedArticles = blogPosts
    .filter(p => p.id !== currentArticle.id && p.category === currentArticle.category)
    .slice(0, 3);

  return (
    <div className="space-y-16 py-16 border-t border-border/40">
      
      {/* Dynamic Linkages Based on Data */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Services */}
        {currentArticle.relatedServices.length > 0 && (
          <div className="bg-muted/30 p-6 rounded-xl border border-border/40">
            <h4 className="text-sm font-mono font-bold text-primary uppercase mb-4">Related Services</h4>
            <ul className="space-y-3">
              {currentArticle.relatedServices.map(service => (
                <li key={service}>
                  <Link href={`/services/${service}`} className="group flex items-center justify-between text-sm hover:text-primary transition-colors">
                    <span className="capitalize">{service.replace(/-/g, ' ')}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Industries */}
        {currentArticle.relatedIndustries.length > 0 && (
          <div className="bg-muted/30 p-6 rounded-xl border border-border/40">
            <h4 className="text-sm font-mono font-bold text-primary uppercase mb-4">Related Industries</h4>
            <ul className="space-y-3">
              {currentArticle.relatedIndustries.map(industry => (
                <li key={industry}>
                  <Link href={`/industries/${industry}`} className="group flex items-center justify-between text-sm hover:text-primary transition-colors">
                    <span className="capitalize">{industry.replace(/-/g, ' ')}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Case Studies */}
        {currentArticle.relatedCaseStudies.length > 0 && (
          <div className="bg-muted/30 p-6 rounded-xl border border-border/40">
            <h4 className="text-sm font-mono font-bold text-primary uppercase mb-4">Related Case Studies</h4>
            <ul className="space-y-3">
              {currentArticle.relatedCaseStudies.map(cs => (
                <li key={cs}>
                  <Link href={`/case-studies/${cs}`} className="group flex items-center justify-between text-sm hover:text-primary transition-colors">
                    <span className="capitalize">{cs.replace(/-/g, ' ')}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Continue Reading */}
      {relatedArticles.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-8">Continue Reading</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles.map(article => (
              <Link key={article.id} href={`/blogengine/${article.slug}`} className="group block bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                <div className="p-6">
                  <span className="text-[10px] font-mono text-primary uppercase mb-2 block">
                    {article.category.replace('-', ' ')}
                  </span>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};
