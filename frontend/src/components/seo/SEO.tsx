import React, { useEffect } from "react";
import { DEFAULT_SEO_CONFIG, getCanonicalUrl, getAbsoluteImageUrl, getSiteUrl } from "./seoConfig";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Helper to update or create a meta tag by property or name attribute.
 */
function setMetaTag(attrName: "name" | "property", attrValue: string, content: string | undefined): void {
  try {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (content !== undefined && content !== null && content !== "") {
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    } else if (el) {
      el.remove();
    }
  } catch {
    // Fail-safe: never throw inside React render/effect
  }
}

/**
 * Helper to update or create the canonical link tag.
 */
function setCanonicalLink(href: string | undefined): void {
  try {
    let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (href) {
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    } else if (el) {
      el.remove();
    }
  } catch {
    // Fail-safe
  }
}

/**
 * Helper to update or inject JSON-LD script tag.
 */
function setJsonLdScript(data: Record<string, unknown> | Record<string, unknown>[] | undefined): void {
  const SCRIPT_ID = "aurexion-seo-jsonld";
  try {
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (data) {
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
    } else if (script) {
      script.remove();
    }
  } catch {
    // Fail-safe
  }
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  noindex = false,
  nofollow = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
  jsonLd,
}) => {
  useEffect(() => {
    try {
      // 1. Document Title
      const resolvedTitle = title
        ? (title.includes("Aurexion") ? title : `${title} | Aurexion`)
        : DEFAULT_SEO_CONFIG.defaultTitle;
      document.title = resolvedTitle;

      // 2. Meta Description
      const resolvedDescription = description || DEFAULT_SEO_CONFIG.defaultDescription;
      setMetaTag("name", "description", resolvedDescription);

      // 3. Robots
      const robotsContent = (noindex || nofollow)
        ? `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`
        : "index, follow";
      setMetaTag("name", "robots", robotsContent);

      // 4. Keywords
      if (keywords && keywords.length > 0) {
        setMetaTag("name", "keywords", keywords.join(", "));
      }

      // 5. Canonical URL
      const resolvedCanonical = canonical !== undefined ? getCanonicalUrl(canonical) : undefined;
      setCanonicalLink(resolvedCanonical);

      // 6. Open Graph
      const absoluteOgImage = getAbsoluteImageUrl(ogImage);
      const siteUrl = getSiteUrl();
      const currentUrl = resolvedCanonical || (typeof window !== "undefined" ? window.location.href : siteUrl);

      setMetaTag("property", "og:title", resolvedTitle);
      setMetaTag("property", "og:description", resolvedDescription);
      setMetaTag("property", "og:type", ogType);
      setMetaTag("property", "og:site_name", DEFAULT_SEO_CONFIG.siteName);
      setMetaTag("property", "og:url", currentUrl);
      setMetaTag("property", "og:image", absoluteOgImage);

      if (ogType === "article") {
        if (publishedTime) setMetaTag("property", "article:published_time", publishedTime);
        if (modifiedTime) setMetaTag("property", "article:modified_time", modifiedTime);
        if (author) setMetaTag("property", "article:author", author);
      }

      // 7. Twitter
      setMetaTag("name", "twitter:card", DEFAULT_SEO_CONFIG.twitterCard);
      setMetaTag("name", "twitter:title", resolvedTitle);
      setMetaTag("name", "twitter:description", resolvedDescription);
      setMetaTag("name", "twitter:image", absoluteOgImage);

      // 8. JSON-LD Structured Data
      setJsonLdScript(jsonLd);
    } catch {
      // Fail-safe
    }
  }, [
    title,
    description,
    canonical,
    ogImage,
    ogType,
    noindex,
    nofollow,
    keywords,
    author,
    publishedTime,
    modifiedTime,
    jsonLd,
  ]);

  return null;
};

export default SEO;
