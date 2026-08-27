import React, { useEffect, useState } from "react";

export const slugify = (text: any): string => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/\*\*/g, '')    // remove markdown bold
    .replace(/\*/g, '')     // remove markdown italic
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export const extractHeadings = (content: string): HeadingItem[] => {
  if (!content || typeof content !== "string") return [];
  
  const matches: HeadingItem[] = [];
  const seenIds = new Set<string>();

  // 1. Check for Markdown headings (## Heading or ### Heading or # Heading)
  const mdRegex = /^(#{1,4})\s+(.+)$/gm;
  let mdMatch;
  while ((mdMatch = mdRegex.exec(content)) !== null) {
    const level = mdMatch[1].length;
    const rawText = mdMatch[2].replace(/\*\*/g, "").replace(/\*/g, "").trim();
    if (rawText) {
      let id = slugify(rawText);
      if (!id) id = `section-${matches.length + 1}`;
      if (seenIds.has(id)) id = `${id}-${matches.length + 1}`;
      seenIds.add(id);
      matches.push({ id, text: rawText, level });
    }
  }

  // 2. If no markdown headings found, check for HTML headings <h1> through <h4>
  if (matches.length === 0) {
    const htmlRegex = /<h([1-4])[^>]*>(.*?)<\/h\1>/gi;
    let htmlMatch;
    while ((htmlMatch = htmlRegex.exec(content)) !== null) {
      const level = parseInt(htmlMatch[1], 10);
      const rawText = htmlMatch[2].replace(/<[^>]*>/g, "").trim();
      if (rawText) {
        let id = slugify(rawText);
        if (!id) id = `section-${matches.length + 1}`;
        if (seenIds.has(id)) id = `${id}-${matches.length + 1}`;
        seenIds.add(id);
        matches.push({ id, text: rawText, level });
      }
    }
  }

  return matches;
};

export const TableOfContents = ({ content, headings: propHeadings }: { content?: string; headings?: HeadingItem[] }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>(propHeadings || []);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (propHeadings && propHeadings.length > 0) {
      setHeadings(propHeadings);
    } else if (content) {
      setHeadings(extractHeadings(content));
    } else {
      setHeadings([]);
    }
  }, [content, propHeadings]);

  useEffect(() => {
    if (headings.length === 0) return;

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

  const scrollTo = (e: React.MouseEvent, id: string) => {
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
              h.level === 3 ? "pl-7 text-xs text-muted-foreground" : h.level === 4 ? "pl-9 text-xs text-muted-foreground" : "pl-4 font-medium"
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

