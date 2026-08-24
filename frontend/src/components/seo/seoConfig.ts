export interface SEOConfig {
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterCard: 'summary' | 'summary_large_image';
}

export const DEFAULT_SEO_CONFIG: SEOConfig = {
  siteName: "Aurexion Technologies",
  defaultTitle: "Aurexion | AI, Cloud & Digital Transformation",
  titleTemplate: "%s | Aurexion",
  defaultDescription: "Enterprise applications, SaaS, APIs and resilient microservices. Complexity is a signal. We turn it into structure.",
  defaultOgImage: "/images/aurexion-mark_e8f9e729.webp",
  twitterCard: "summary_large_image",
};

/**
 * Resolves the absolute site base URL from environment or browser runtime.
 * Never defaults to localhost in production mode.
 */
export function getSiteUrl(): string {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return "";
}

/**
 * Resolves a canonical URL path to an absolute or clean root-relative path.
 */
export function getCanonicalUrl(path: string = ""): string {
  const siteUrl = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (siteUrl) {
    return `${siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
  }
  return cleanPath;
}

/**
 * Resolves an image path to an absolute URL for social sharing (Open Graph / Twitter).
 */
export function getAbsoluteImageUrl(imagePath?: string): string {
  const target = imagePath || DEFAULT_SEO_CONFIG.defaultOgImage;
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target;
  }
  const siteUrl = getSiteUrl();
  const cleanPath = target.startsWith("/") ? target : `/${target}`;
  return siteUrl ? `${siteUrl}${cleanPath}` : cleanPath;
}
