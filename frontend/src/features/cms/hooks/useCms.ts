import { useState, useEffect, useCallback } from "react";
import cmsService, {
  ServiceItem,
  ServiceCreatePayload,
  CaseStudyItem,
  CaseStudyCreatePayload,
  IndustryItem,
  IndustryCreatePayload,
  BlogPostItem,
  BlogPostCreatePayload,
  CategoryItem,
  CategoryCreatePayload,
  CmsDashboardStats,
} from "../services/cmsService";

/**
 * Hook for CMS Dashboard KPIs and Content Stream
 */
export function useCmsDashboard() {
  const [data, setData] = useState<CmsDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await cmsService.getDashboardStats();
      setData(stats);
    } catch (err: unknown) {
      setError(err?.message || "Failed to load CMS metrics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}

/**
 * Hook for Managing Services Catalog
 */
export function useCmsServices(page = 1, pageSize = 10) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cmsService.getAdminServices(page, pageSize);
      setServices(res.results);
      setTotalCount(res.count);
    } catch (err: unknown) {
      setError(err?.message || "Failed to load services catalog.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = async (payload: ServiceCreatePayload) => {
    setActionLoading(true);
    try {
      const created = await cmsService.createService(payload);
      setServices((prev) => [created, ...prev]);
      setTotalCount((prev) => prev + 1);
      return created;
    } finally {
      setActionLoading(false);
    }
  };

  const updateService = async (id: number, payload: Partial<ServiceItem>) => {
    setActionLoading(true);
    try {
      const updated = await cmsService.updateService(id, payload);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (id: number, status: "published" | "draft" | "archived") => {
    setActionLoading(true);
    try {
      const updated = await cmsService.toggleServiceStatus(id, status);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    setActionLoading(true);
    try {
      await cmsService.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } finally {
      setActionLoading(false);
    }
  };

  return {
    services,
    totalCount,
    isLoading,
    actionLoading,
    error,
    refetch: fetchServices,
    createService,
    updateService,
    toggleStatus,
    deleteService,
  };
}

/**
 * Hook for Managing Case Studies Portfolio
 */
export function useCmsCaseStudies(page = 1, pageSize = 10) {
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchCaseStudies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cmsService.getAdminCaseStudies(page, pageSize);
      setCaseStudies(res.results);
      setTotalCount(res.count);
    } catch (err: unknown) {
      setError(err?.message || "Failed to load case studies.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCaseStudies();
  }, [fetchCaseStudies]);

  const createCaseStudy = async (payload: CaseStudyCreatePayload) => {
    setActionLoading(true);
    try {
      const created = await cmsService.createCaseStudy(payload);
      setCaseStudies((prev) => [created, ...prev]);
      setTotalCount((prev) => prev + 1);
      return created;
    } finally {
      setActionLoading(false);
    }
  };

  const updateCaseStudy = async (id: number, payload: Partial<CaseStudyItem>) => {
    setActionLoading(true);
    try {
      const updated = await cmsService.updateCaseStudy(id, payload);
      setCaseStudies((prev) => prev.map((cs) => (cs.id === id ? updated : cs)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (id: number, status: "published" | "draft" | "archived") => {
    setActionLoading(true);
    try {
      const updated = await cmsService.toggleCaseStudyStatus(id, status);
      setCaseStudies((prev) => prev.map((cs) => (cs.id === id ? updated : cs)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCaseStudy = async (id: number) => {
    setActionLoading(true);
    try {
      await cmsService.deleteCaseStudy(id);
      setCaseStudies((prev) => prev.filter((cs) => cs.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } finally {
      setActionLoading(false);
    }
  };

  return {
    caseStudies,
    totalCount,
    isLoading,
    actionLoading,
    error,
    refetch: fetchCaseStudies,
    createCaseStudy,
    updateCaseStudy,
    toggleStatus,
    deleteCaseStudy,
  };
}

/**
 * Hook for Managing Industries Directory
 */
export function useCmsIndustries(page = 1, pageSize = 10) {
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchIndustries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cmsService.getAdminIndustries(page, pageSize);
      setIndustries(res.results);
      setTotalCount(res.count);
    } catch (err: unknown) {
      setError(err?.message || "Failed to load industries.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  const createIndustry = async (payload: IndustryCreatePayload) => {
    setActionLoading(true);
    try {
      const created = await cmsService.createIndustry(payload);
      setIndustries((prev) => [created, ...prev]);
      setTotalCount((prev) => prev + 1);
      return created;
    } finally {
      setActionLoading(false);
    }
  };

  const updateIndustry = async (id: number, payload: Partial<IndustryItem>) => {
    setActionLoading(true);
    try {
      const updated = await cmsService.updateIndustry(id, payload);
      setIndustries((prev) => prev.map((ind) => (ind.id === id ? updated : ind)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (id: number, status: "published" | "draft" | "archived") => {
    setActionLoading(true);
    try {
      const updated = await cmsService.toggleIndustryStatus(id, status);
      setIndustries((prev) => prev.map((ind) => (ind.id === id ? updated : ind)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteIndustry = async (id: number) => {
    setActionLoading(true);
    try {
      await cmsService.deleteIndustry(id);
      setIndustries((prev) => prev.filter((ind) => ind.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } finally {
      setActionLoading(false);
    }
  };

  return {
    industries,
    totalCount,
    isLoading,
    actionLoading,
    error,
    refetch: fetchIndustries,
    createIndustry,
    updateIndustry,
    toggleStatus,
    deleteIndustry,
  };
}

/**
 * Hook for Managing Categories
 */
export function useCmsCategories(page = 1, pageSize = 10) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cmsService.getAdminCategories(page, pageSize);
      setCategories(res.results);
      setTotalCount(res.count);
    } catch (err: unknown) {
      setError(err?.message || "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (payload: CategoryCreatePayload) => {
    setActionLoading(true);
    try {
      const created = await cmsService.createCategory(payload);
      setCategories((prev) => [...prev, created]);
      setTotalCount((prev) => prev + 1);
      return created;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setActionLoading(true);
    try {
      await cmsService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } finally {
      setActionLoading(false);
    }
  };

  return {
    categories,
    totalCount,
    isLoading,
    actionLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    deleteCategory,
  };
}

/**
 * Hook for Managing Blog Articles
 */
export function useCmsBlog(page = 1, pageSize = 10) {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchBlog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cmsService.getAdminBlog(page, pageSize);
      setPosts(res.results);
      setTotalCount(res.count);
    } catch (err: unknown) {
      setError(err?.message || "Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const createPost = async (payload: BlogPostCreatePayload) => {
    setActionLoading(true);
    try {
      const created = await cmsService.createBlogPost(payload);
      setPosts((prev) => [created, ...prev]);
      setTotalCount((prev) => prev + 1);
      return created;
    } finally {
      setActionLoading(false);
    }
  };

  const updatePost = async (id: number, payload: Partial<BlogPostItem>) => {
    setActionLoading(true);
    try {
      const updated = await cmsService.updateBlogPost(id, payload);
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (id: number, status: "published" | "draft" | "archived") => {
    setActionLoading(true);
    try {
      const updated = await cmsService.toggleBlogStatus(id, status);
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const deletePost = async (id: number) => {
    setActionLoading(true);
    try {
      await cmsService.deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } finally {
      setActionLoading(false);
    }
  };

  return {
    posts,
    totalCount,
    isLoading,
    actionLoading,
    error,
    refetch: fetchBlog,
    createPost,
    updatePost,
    toggleStatus,
    deletePost,
  };
}
