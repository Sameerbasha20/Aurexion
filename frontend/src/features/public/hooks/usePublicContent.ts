import { useState, useEffect } from "react";
import { publicService } from "../services/publicService";
import { BlogPost, CaseStudy, Industry, Job, Service, ServiceApiDetail } from "../types/website.types";
import { caseStudiesData } from "../../../data/caseStudies";
import { blogPosts } from "../../../data/blogPosts";
import { aboutData } from "../../../data/about";
import { resolveMediaUrl } from "../../../utils/mediaUrl";


export const useCaseStudies = () => {
  const [data, setData] = useState<any[]>(caseStudiesData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await publicService.getCaseStudies();
        if (result && Array.isArray(result) && result.length > 0) {
          // Normalize backend items to conform to the frontend schema if present
          const normalizedBackend = result.map((item: any) => ({
            ...item,
            challenge: item.challenge || item.business_challenge || item.context || "",
            solution: item.solution || item.proposed_architecture || (typeof item.architecture === "object" ? item.architecture?.description : item.architecture) || "",
            results: Array.isArray(item.results) ? item.results : (item.outcomes_performance ? [{ impact: item.outcomes_performance, label: "Key Outcome" }] : []),
            coverImage: resolveMediaUrl(item.cover_image || item.coverImage || item.coverimage || item.media || item.imageUrl) || "/images/unsplash_1618005182384-a8.webp",
          }));
          // Prefer backend when it has data; fall back to local fixtures only when backend empty
          setData(normalizedBackend.length > 0 ? normalizedBackend : caseStudiesData);
        } else {
          setData(caseStudiesData);
        }
      } catch (err) {
        setData(caseStudiesData);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};

export const useCaseStudyDetails = (slug: string) => {
  const [data, setData] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await publicService.getCaseStudyBySlug(slug);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { data, loading, error };
};

export const useBlogPosts = (filters?: { category?: string; tag?: string; search?: string }) => {
  const [data, setData] = useState<any[]>(blogPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await publicService.getBlogPosts(filters);
        if (result && Array.isArray(result) && result.length > 0) {
          const normalized = result.map((item: any) => ({
            ...item,
            category: typeof item.category === "object" && item.category !== null ? item.category.name || "engineering" : (typeof item.category === "string" ? item.category : "engineering"),
            coverImage: resolveMediaUrl(item.cover_image || item.coverImage || item.coverimage || item.media || item.imageUrl) || "/images/unsplash_1618005182384-a8.webp",
            publishedAt: item.publishedAt || item.published_at || item.created_at || "2026-06-18T09:00:00Z"
          }));
          setData(normalized.length > 0 ? normalized : blogPosts);
        } else {
          setData(blogPosts);
        }
      } catch (err) {
        setData(blogPosts);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters?.category, filters?.tag, filters?.search]);

  return { data, loading, error };
};

export const useBlogPostDetails = (slug: string) => {
  const [data, setData] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await publicService.getBlogPostBySlug(slug);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { data, loading, error };
};

export const useRelatedBlogPosts = (slug: string) => {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await publicService.getRelatedBlogPosts(slug);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { data, loading, error };
};

export const useJobs = () => {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await publicService.getJobs();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};

export const useServices = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await publicService.getServices();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};

export const useServiceDetails = (slug: string) => {
  const [data, setData] = useState<ServiceApiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await publicService.getServiceBySlug(slug);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { data, loading, error };
};

export const useIndustries = () => {
  const [data, setData] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await publicService.getIndustries();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};

export const useIndustryDetails = (slug: string) => {
  const [data, setData] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await publicService.getIndustryBySlug(slug);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { data, loading, error };
};

export const useJobDetails = (id: string) => {
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await publicService.getJobById(id);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, loading, error };
};

export const useCompanyInfo = () => {
  const [data, setData] = useState<any>(aboutData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await publicService.getCompanyInfo();
        if (result) {
          setData(result);
        } else {
          setData(aboutData);
        }
      } catch (err) {
        setData(aboutData);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};

