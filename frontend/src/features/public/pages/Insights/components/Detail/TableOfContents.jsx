import React, { useEffect, useState } from "react";

export const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Extract H2 and H3 from markdown-like content string
    // Format: ## 01 Introduction
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const matches = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      matches.push({ id, text, level });
    }
    
    setHeadings(matches);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%" }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100, // Account for sticky headers
        behavior: "smooth"
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-32">
      <h4 className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-wider mb-6">
        Table of Contents
      </h4>
      <nav className="space-y-1 border-l border-border/40">
        {headings.map((h, idx) => (
          <a
            key={`${h.id}-${idx}`}
            href={`#${h.id}`}
            onClick={(e) => scrollTo(e, h.id)}
            className={`block py-2 pr-4 transition-colors text-sm ${
              h.level === 3 ? "pl-8" : "pl-4"
            } ${
              activeId === h.id 
                ? "text-primary border-l-2 border-primary -ml-[1px] font-medium" 
                : "text-muted-foreground hover:text-foreground border-l-2 border-transparent -ml-[1px]"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
};
