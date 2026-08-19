import React from "react";

export const TechnologyStack = ({ caseStudy }) => {
  const categories = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "database", label: "Database" },
    { key: "cloud", label: "Cloud & Infrastructure" },
    { key: "devops", label: "DevOps & CI/CD" },
    { key: "ai", label: "AI & Machine Learning" }
  ];

  return (
    <section className="py-8 bg-background border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">03</span>
          <h2 className="text-2xl font-bold">Technology Stack</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const techs = caseStudy.technologies[cat.key];
            if (!techs || techs.length === 0) return null;

            return (
              <div key={idx}>
                <h4 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-6 border-b border-border/40 pb-2">
                  {cat.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-card border border-border/40 rounded text-sm font-bold text-foreground hover:border-primary/50 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
};
