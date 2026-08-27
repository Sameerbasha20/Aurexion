import React from "react";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { slugify } from "./TableOfContents";
import { resolveMediaUrl } from "../../../../../../utils/mediaUrl";
import { FileText } from "lucide-react";

export const ArticleContent = ({ content }: { content: any }) => {
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return (
      <div className="py-12 px-6 text-center border border-white/5 rounded-xl bg-white/[0.02]">
        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm font-mono">
          No written content is available for this publication yet.
        </p>
      </div>
    );
  }

  // Parse inline markdown tokens: bold, italic, code, links
  const renderInlineFormatted = (text: string): React.ReactNode => {
    if (!text) return null;

    // Pattern for inline code, links, bold, italic
    const regex = /(`[^`]+`)|(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]+)\]\(([^)]+)\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];

      if (token.startsWith("`") && token.endsWith("`")) {
        // Inline code
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 mx-0.5 bg-white/10 text-[#63f5e8] font-mono text-xs rounded border border-white/10">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("![") && token.includes("](")) {
        // Inline Image
        const alt = match[3] || "Article Image";
        const url = resolveMediaUrl(match[4]);
        parts.push(
          <span key={match.index} className="block my-6 rounded-xl overflow-hidden border border-border/30 bg-background/50 shadow-xl">
            <img
              src={url}
              alt={alt}
              className="w-full max-h-[480px] object-cover rounded-xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {alt && alt !== "Article Image" && (
              <span className="block text-center text-xs text-muted-foreground font-mono mt-2 py-1 px-3">
                {alt}
              </span>
            )}
          </span>
        );
      } else if (token.startsWith("[") && token.includes("](")) {
        // Inline Link
        const linkText = match[6];
        const linkUrl = match[7];
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target={linkUrl.startsWith("http") ? "_blank" : undefined}
            rel={linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-[#63f5e8] hover:underline underline-offset-4 font-medium transition-colors"
          >
            {linkText}
          </a>
        );
      } else if (token.startsWith("**") && token.endsWith("**")) {
        // Bold
        parts.push(
          <strong key={match.index} className="text-foreground font-bold">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        // Italic
        parts.push(
          <em key={match.index} className="italic text-gray-200">
            {token.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const parseContent = (text: string) => {
    // Normalize newlines
    const normalized = text.replace(/\r\n/g, "\n");
    const rawBlocks = normalized.split(/\n\n+/);

    return rawBlocks.map((block, index) => {
      block = block.trim();
      if (!block) return null;

      // Standalone Markdown Image: ![alt](url)
      const imgMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1] || "Article illustration";
        const src = resolveMediaUrl(imgMatch[2]);
        return (
          <div key={index} className="my-8 rounded-xl overflow-hidden border border-border/30 bg-[#060c16] shadow-xl">
            <img
              src={src}
              alt={alt}
              className="w-full max-h-[500px] object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/unsplash_1486406146926-c6.webp";
              }}
            />
            {alt && (
              <p className="text-center text-xs text-gray-400 font-mono py-2.5 px-4 bg-black/30 border-t border-white/5">
                {alt}
              </p>
            )}
          </div>
        );
      }

      // Standalone HTML Image: <img src="..." alt="..." />
      const htmlImgMatch = block.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (htmlImgMatch) {
        const src = resolveMediaUrl(htmlImgMatch[1]);
        const altMatch = block.match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : "Article illustration";
        return (
          <div key={index} className="my-8 rounded-xl overflow-hidden border border-border/30 bg-[#060c16] shadow-xl">
            <img
              src={src}
              alt={alt}
              className="w-full max-h-[500px] object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/unsplash_1486406146926-c6.webp";
              }}
            />
            {alt && (
              <p className="text-center text-xs text-gray-400 font-mono py-2.5 px-4 bg-black/30 border-t border-white/5">
                {alt}
              </p>
            )}
          </div>
        );
      }

      // Fenced Code Block: ```lang \n code \n ```
      if (block.startsWith("```")) {
        const lines = block.split("\n");
        const firstLine = lines[0].replace("```", "").trim();
        const language = firstLine || "typescript";
        const code = lines.slice(1, lines[lines.length - 1].trim() === "```" ? -1 : undefined).join("\n");
        return <CodeBlock key={index} language={language} code={code} />;
      }

      // Custom XML <code-block>
      if (block.startsWith("<code-block")) {
        const langMatch = block.match(/language="([^"]+)"/);
        const language = langMatch ? langMatch[1] : "text";
        const code = block.replace(/<code-block[^>]*>\n?/, "").replace(/<\/code-block>/, "").trim();
        return <CodeBlock key={index} language={language} code={code} />;
      }

      // Custom XML <callout>
      if (block.startsWith("<callout")) {
        const typeMatch = block.match(/type="([^"]+)"/);
        const type = typeMatch ? typeMatch[1] : "info";
        const calloutText = block.replace(/<callout[^>]*>\n?/, "").replace(/<\/callout>/, "").trim();
        return <Callout key={index} type={type}>{renderInlineFormatted(calloutText)}</Callout>;
      }

      // Blockquote (> Quote)
      if (block.startsWith(">")) {
        const quoteText = block.split("\n").map(l => l.replace(/^>\s?/, "")).join(" ");
        return (
          <blockquote key={index} className="my-6 pl-5 border-l-2 border-[#63f5e8] bg-[rgba(99,245,232,0.03)] py-3 pr-4 rounded-r-lg italic text-lg text-gray-200 leading-relaxed">
            {renderInlineFormatted(quoteText)}
          </blockquote>
        );
      }

      // H1 (# Heading)
      if (block.startsWith("# ") && !block.startsWith("## ")) {
        const rawText = block.replace(/^#\s+/, "").trim();
        const id = slugify(rawText);
        return (
          <h2
            key={index}
            id={id}
            className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-foreground leading-snug scroll-mt-28"
          >
            {renderInlineFormatted(rawText)}
          </h2>
        );
      }

      // H2 (## Heading)
      if (block.startsWith("## ")) {
        const rawText = block.replace(/^##\s+/, "").trim();
        const id = slugify(rawText);
        return (
          <h2
            key={index}
            id={id}
            className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-foreground leading-snug scroll-mt-28"
          >
            {renderInlineFormatted(rawText)}
          </h2>
        );
      }

      // H3 (### Heading)
      if (block.startsWith("### ")) {
        const rawText = block.replace(/^###\s+/, "").trim();
        const id = slugify(rawText);
        return (
          <h3
            key={index}
            id={id}
            className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-foreground leading-snug scroll-mt-28"
          >
            {renderInlineFormatted(rawText)}
          </h3>
        );
      }

      // H4 (#### Heading)
      if (block.startsWith("#### ")) {
        const rawText = block.replace(/^####\s+/, "").trim();
        const id = slugify(rawText);
        return (
          <h4
            key={index}
            id={id}
            className="text-lg sm:text-xl font-bold mt-6 mb-2 text-foreground leading-snug scroll-mt-28"
          >
            {renderInlineFormatted(rawText)}
          </h4>
        );
      }

      // Numbered Lists (1. Item)
      if (/^\d+\.\s/.test(block)) {
        const items = block.split(/\n(?=\d+\.\s)/);
        return (
          <ol key={index} className="list-decimal list-outside ml-6 space-y-3 mb-8 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {items.map((item, i) => (
              <li key={i} className="pl-2">
                {renderInlineFormatted(item.replace(/^\d+\.\s/, ""))}
              </li>
            ))}
          </ol>
        );
      }

      // Bullet Lists (- Item or * Item)
      if (/^[-*]\s/.test(block)) {
        const items = block.split(/\n(?=[-*]\s)/);
        return (
          <ul key={index} className="list-disc list-outside ml-6 space-y-3 mb-8 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {items.map((item, i) => (
              <li key={i} className="pl-2">
                {renderInlineFormatted(item.replace(/^[-*]\s/, ""))}
              </li>
            ))}
          </ul>
        );
      }

      // Standard Paragraph with full inline formatting
      return (
        <p key={index} className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
          {renderInlineFormatted(block)}
        </p>
      );
    });
  };

  return (
    <div className="article-content max-w-none text-gray-200">
      {parseContent(content)}
    </div>
  );
};

