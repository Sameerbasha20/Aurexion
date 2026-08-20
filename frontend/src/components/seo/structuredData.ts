/**
 * Structured Data (JSON-LD) Generators for Aurexion Technologies
 * Generates Schema.org compliant structured objects for search engines.
 */

export function createOrganizationSchema(siteUrl: string = "") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aurexion Technologies",
    "url": siteUrl || "https://aurexion.com",
    "logo": `${siteUrl}/manus-storage/aurexion-mark_e8f9e729.webp`,
    "description": "Enterprise applications, SaaS, APIs and resilient microservices. Complexity is a signal. We turn it into structure.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Sales and Enterprise Inquiries",
      "email": "contact@aurexion.com"
    }
  };
}

export function createWebSiteSchema(siteUrl: string = "") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Aurexion Technologies",
    "url": siteUrl || "https://aurexion.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/services?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[], siteUrl: string = "") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${siteUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`
    }))
  };
}

export interface ArticleSchemaData {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}

export function createArticleSchema(data: ArticleSchemaData, siteUrl: string = "") {
  const imageUrl = data.image?.startsWith("http")
    ? data.image
    : `${siteUrl}${data.image?.startsWith("/") ? data.image : `/${data.image || "manus-storage/aurexion-mark_e8f9e729.webp"}`}`;

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": data.title,
    "description": data.description,
    "url": data.url.startsWith("http") ? data.url : `${siteUrl}${data.url.startsWith("/") ? data.url : `/${data.url}`}`,
    "image": imageUrl,
    "datePublished": data.datePublished || new Date().toISOString(),
    "dateModified": data.dateModified || data.datePublished || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": data.authorName || "Aurexion Engineering Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aurexion Technologies",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/manus-storage/aurexion-mark_e8f9e729.webp`
      }
    }
  };
}

export interface ServiceSchemaData {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}

export function createServiceSchema(data: ServiceSchemaData, siteUrl: string = "") {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": data.name,
    "serviceType": data.serviceType || "Enterprise Software Engineering",
    "description": data.description,
    "provider": {
      "@type": "Organization",
      "name": "Aurexion Technologies",
      "url": siteUrl || "https://aurexion.com"
    },
    "url": data.url.startsWith("http") ? data.url : `${siteUrl}${data.url.startsWith("/") ? data.url : `/${data.url}`}`
  };
}

export interface JobPostingSchemaData {
  title: string;
  description: string;
  datePosted?: string;
  employmentType?: string;
  hiringOrganization?: string;
  location?: string;
  url: string;
}

export function createJobPostingSchema(data: JobPostingSchemaData, siteUrl: string = "") {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": data.title,
    "description": data.description,
    "datePosted": data.datePosted || new Date().toISOString(),
    "employmentType": data.employmentType || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": data.hiringOrganization || "Aurexion Technologies",
      "sameAs": siteUrl || "https://aurexion.com",
      "logo": `${siteUrl}/manus-storage/aurexion-mark_e8f9e729.webp`
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": data.location || "Remote / Global"
      }
    },
    "url": data.url.startsWith("http") ? data.url : `${siteUrl}${data.url.startsWith("/") ? data.url : `/${data.url}`}`
  };
}
