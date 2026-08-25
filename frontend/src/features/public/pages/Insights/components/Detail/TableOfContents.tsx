import React, { useEffect, useState } from "react";

const slugify = (text: any) => 
  text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export const TableOfContents = ({ content }: { content: any }) => {
  const [headings, setHeadings] = useState<any[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Extract H2 and H3 from markdown-like content string
    // Format: ## 01 Introduction or ### 1. Subheading
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const matches = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
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
      { rootMargin: "-15% 0% -60% 0%" }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollTo = (e: any, id: any) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-mono font-bold text-[#63f5e8] uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#63f5e8]" />
        Table of Contents
      </h4>
      <nav className="space-y-1 border-l border-border/40">
        {headings.map((h, idx) => (
          <a
            key={`${h.id}-${idx}`}
            href={`#${h.id}`}
            onClick={(e) => scrollTo(e, h.id)}
            className={`block py-1.5 pr-4 transition-all text-xs sm:text-sm cursor-pointer select-none ${
              h.level === 3 ? "pl-7 text-xs text-muted-foreground" : "pl-4 font-medium"
            } ${
              activeId === h.id 
                ? "text-[#63f5e8] border-l-2 border-[#63f5e8] -ml-[1px] font-semibold bg-[rgba(99,245,232,0.05)] rounded-r" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent -ml-[1px] rounded-r"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
};
