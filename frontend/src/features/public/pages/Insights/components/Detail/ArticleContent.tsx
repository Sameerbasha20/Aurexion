import React from "react";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";

const slugify = (text: any) => 
  text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export const ArticleContent = ({ content }: { content: any }) => {
  // A simple simulated markdown parser for the demo data
  // In a real app, you'd use react-markdown or a robust MDX parser

  const parseContent = (text: any) => {
    const blocks = text.split(/\n\n+/);
    
    return blocks.map((block: any, index: number) => {
      block = block.trim();
      if (!block) return null;

      // H2
      if (block.startsWith("## ")) {
        const rawText = block.replace("## ", "").trim();
        const id = slugify(rawText);
        return (
          <h2 
            key={index} 
            id={id} 
            className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-foreground leading-snug scroll-mt-28"
          >
            {rawText}
          </h2>
        );
      }
      
      // H3
      if (block.startsWith("### ")) {
        const rawText = block.replace("### ", "").trim();
        const id = slugify(rawText);
        return (
          <h3 
            key={index} 
            id={id} 
            className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-foreground leading-snug scroll-mt-28"
          >
            {rawText}
          </h3>
        );
      }

      // Code Block
      if (block.startsWith("<code-block")) {
        const langMatch = block.match(/language="([^"]+)"/);
        const language = langMatch ? langMatch[1] : "text";
        const code = block.replace(/<code-block[^>]*>\n?/, "").replace(/<\/code-block>/, "").trim();
        return <CodeBlock key={index} language={language} code={code} />;
      }

      // Callout
      if (block.startsWith("<callout")) {
        const typeMatch = block.match(/type="([^"]+)"/);
        const type = typeMatch ? typeMatch[1] : "info";
        const text = block.replace(/<callout[^>]*>\n?/, "").replace(/<\/callout>/, "").trim();
        return <Callout key={index} type={type}>{text}</Callout>;
      }
      
      // Numbered Lists (crude regex check)
      if (/^\d+\.\s/.test(block)) {
        const items = block.split(/\n(?=\d+\.\s)/);
        return (
          <ol key={index} className="list-decimal list-outside ml-6 space-y-3 mb-8 text-lg text-foreground leading-relaxed">
            {items.map((item: any, i: number) => (
              <li key={i} className="pl-2">
                {/* Parse bold text within list items */}
                {item.replace(/^\d+\.\s/, "").split(/(\*\*.*?\*\*)/).map((part: any, j: number) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </li>
            ))}
          </ol>
        );
      }

      // Standard Paragraph with bold support
      return (
        <p key={index} className="text-foreground">
          {block.split(/(\*\*.*?\*\*)/).map((part: any, i: number) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="article-content max-w-none">
      {parseContent(content)}
    </div>
  );
};
