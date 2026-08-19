import React from "react";

export const TechnologyStack = ({ caseStudy }) => {
  const categories = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "database", label: "Database" },
    { key: "cloud", label: "Cloud & Infrastructure" },
    { key: "devops", label: "DevOps & CI/CD" },
    { key: "ai", label: "AI & Machine Learning" },
    { key: "integrations", label: "Integrations & APIs" }
  ];

  return (
    <section className="py-12 bg-background border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl font-bold text-primary font-mono opacity-50">03</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Technology Stack</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => {
            const techs = caseStudy.technologies?.[cat.key];
            if (!techs || techs.length === 0) return null;

            return (
              <div key={idx} className="bg-[#080f1a] border border-border/20 rounded-xl p-6 hover:border-primary/30 transition-colors">
                <h4 className="text-xs font-mono tracking-widest text-[#63f5e8] uppercase mb-4 pb-2 border-b border-border/20">
                  {cat.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-[#050811] border border-border/40 rounded text-sm font-semibold text-gray-200 hover:border-primary/50 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechnologyStack;
