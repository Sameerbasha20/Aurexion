import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";

export interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  problem: string;
  solution: string;
  tech_stack: string[] | string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  is_featured: boolean;
  status: string; // "published", "draft", "archived"
  created_at: string;
  updated_at: string;
}

export interface ServiceCreatePayload {
  title: string;
  slug: string;
  description: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  is_featured?: boolean;
  status?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export interface CaseStudyItem {
  id: number;
  title: string;
  slug: string;
  client: string;
  context: string;
  business_challenge: string;
  proposed_architecture: string;
  tech_stack: string[] | string;
  development_approach: string;
  modules_integration_security: string;
  outcomes_performance: string;
  confidential: boolean;
  media: string | null;
  status: string; // "published", "draft", "archived"
  created_at: string;
  updated_at: string;
}

export interface CaseStudyCreatePayload {
  title: string;
  slug: string;
  client: string;
  context: string;
  business_challenge: string;
  proposed_architecture: string;
  tech_stack: string[];
  development_approach: string;
  modules_integration_security: string;
  outcomes_performance: string;
  confidential?: boolean;
  status?: string;
  media?: string | null;
}

export interface IndustryItem {
  id: number;
  name: string;
  slug: string;
  challenges: string;
  target_solutions: string;
  status: string; // "published", "draft", "archived"
  created_at: string;
  updated_at: string;
  services: number[];
  case_studies: number[];
}

export interface IndustryCreatePayload {
  name: string;
  slug: string;
  challenges: string;
  target_solutions: string;
  status?: string;
  services?: number[];
  case_studies?: number[];
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description?: string;
  post_count?: number;
}

export interface PaginatedCmsResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UploadResponse {
  url: string;
  file_name?: string;
  public_url?: string;
}

export interface CategoryCreatePayload {
  name: string;
  slug: string;
  parent?: number | null;
}

export interface BlogPostItem {
  id: number;
  author_username: string;
  category_name: string;
  title: string;
  slug: string;
  content: string;
  tags: string[] | string;
  media: string | null;
  cover_image?: string | null;
  coverimage?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  status: string; // "published", "draft", "archived"
  category: number;
  author: number;
}

export interface BlogPostCreatePayload {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  category: number;
  author: number;
  status?: string;
  media?: string | null;
  cover_image?: string | null;
  coverimage?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export interface CmsDashboardStats {
  total_services: number;
  published_services: number;
  draft_services: number;
  total_case_studies: number;
  published_case_studies: number;
  draft_case_studies: number;
  total_industries: number;
  published_industries: number;
  total_blog_posts: number;
  published_blog_posts: number;
  draft_blog_posts: number;
  total_categories: number;
  total_content_nodes: number;
  published_ratio: number;
  recent_articles: BlogPostItem[];
  recent_case_studies: CaseStudyItem[];
  services_list: ServiceItem[];
}

// In-Memory Cache for CMS Catalog & Dashboard Data (Cache TTL: 5 minutes)
const cmsCache: {
  services: { data: ServiceItem[]; timestamp: number } | null;
  caseStudies: { data: CaseStudyItem[]; timestamp: number } | null;
  industries: { data: IndustryItem[]; timestamp: number } | null;
  blogPosts: { data: BlogPostItem[]; timestamp: number } | null;
  categories: { data: CategoryItem[]; timestamp: number } | null;
} = {
  services: null,
  caseStudies: null,
  industries: null,
  blogPosts: null,
  categories: null,
};

const CACHE_TTL = 5 * 60 * 1000;

export const clearCmsCache = (key?: keyof typeof cmsCache) => {
  if (key) {
    cmsCache[key] = null;
  } else {
    cmsCache.services = null;
    cmsCache.caseStudies = null;
    cmsCache.industries = null;
    cmsCache.blogPosts = null;
    cmsCache.categories = null;
  }
};

export const cmsService = {
  // Services
  getAdminServices: async (page = 1, pageSize = 10): Promise<{ results: ServiceItem[]; count: number }> => {
    const data: PaginatedCmsResponse<ServiceItem> | ServiceItem[] = await axiosClient.get(API_ENDPOINTS.CMS.ADMIN_SERVICES, { params: { page, page_size: pageSize } });
    const results: ServiceItem[] = Array.isArray(data) ? data : (data?.results || []);
    const count: number = Array.isArray(data) ? results.length : (typeof data?.count === "number" ? data.count : results.length);
    return { results, count };
  },

  createService: async (serviceData: ServiceCreatePayload): Promise<ServiceItem> => {
    const data = await axiosClient.post<ServiceItem, ServiceItem>(API_ENDPOINTS.CMS.ADMIN_SERVICES, serviceData);
    clearCmsCache("services");
    return data;
  },

  updateService: async (id: number, serviceData: Partial<ServiceItem>): Promise<ServiceItem> => {
    const data = await axiosClient.patch<ServiceItem, ServiceItem>(API_ENDPOINTS.CMS.ADMIN_SERVICE_DETAIL(id), serviceData);
    clearCmsCache("services");
    return data;
  },

  toggleServiceStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<ServiceItem> => {
    const data = await axiosClient.patch<ServiceItem, ServiceItem>(API_ENDPOINTS.CMS.ADMIN_SERVICE_DETAIL(id), { status });
    clearCmsCache("services");
    return data;
  },

  deleteService: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_SERVICE_DETAIL(id));
    clearCmsCache("services");
  },

  // Case Studies
  getAdminCaseStudies: async (page = 1, pageSize = 10): Promise<{ results: CaseStudyItem[]; count: number }> => {
    const data: PaginatedCmsResponse<CaseStudyItem> | CaseStudyItem[] = await axiosClient.get(API_ENDPOINTS.CMS.ADMIN_CASE_STUDIES, { params: { page, page_size: pageSize } });
    const results: CaseStudyItem[] = Array.isArray(data) ? data : (data?.results || []);
    const count: number = Array.isArray(data) ? results.length : (typeof data?.count === "number" ? data.count : results.length);
    return { results, count };
  },

  createCaseStudy: async (csData: CaseStudyCreatePayload): Promise<CaseStudyItem> => {
    const data = await axiosClient.post<CaseStudyItem, CaseStudyItem>(API_ENDPOINTS.CMS.ADMIN_CASE_STUDIES, csData);
    clearCmsCache("caseStudies");
    return data;
  },

  updateCaseStudy: async (id: number, csData: Partial<CaseStudyItem>): Promise<CaseStudyItem> => {
    const data = await axiosClient.patch<CaseStudyItem, CaseStudyItem>(API_ENDPOINTS.CMS.ADMIN_CASE_STUDY_DETAIL(id), csData);
    clearCmsCache("caseStudies");
    return data;
  },

  toggleCaseStudyStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<CaseStudyItem> => {
    const data = await axiosClient.patch<CaseStudyItem, CaseStudyItem>(API_ENDPOINTS.CMS.ADMIN_CASE_STUDY_DETAIL(id), { status });
    clearCmsCache("caseStudies");
    return data;
  },

  deleteCaseStudy: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_CASE_STUDY_DETAIL(id));
    clearCmsCache("caseStudies");
  },

  // Industries
  getAdminIndustries: async (page = 1, pageSize = 10): Promise<{ results: IndustryItem[]; count: number }> => {
    const data: PaginatedCmsResponse<IndustryItem> | IndustryItem[] = await axiosClient.get(API_ENDPOINTS.CMS.ADMIN_INDUSTRIES, { params: { page, page_size: pageSize } });
    const results: IndustryItem[] = Array.isArray(data) ? data : (data?.results || []);
    const count: number = Array.isArray(data) ? results.length : (typeof data?.count === "number" ? data.count : results.length);
    return { results, count };
  },

  createIndustry: async (indData: IndustryCreatePayload): Promise<IndustryItem> => {
    const data = await axiosClient.post<IndustryItem, IndustryItem>(API_ENDPOINTS.CMS.ADMIN_INDUSTRIES, indData);
    clearCmsCache("industries");
    return data;
  },

  updateIndustry: async (id: number, indData: Partial<IndustryItem>): Promise<IndustryItem> => {
    const data = await axiosClient.patch<IndustryItem, IndustryItem>(API_ENDPOINTS.CMS.ADMIN_INDUSTRY_DETAIL(id), indData);
    clearCmsCache("industries");
    return data;
  },

  toggleIndustryStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<IndustryItem> => {
    const data = await axiosClient.patch<IndustryItem, IndustryItem>(API_ENDPOINTS.CMS.ADMIN_INDUSTRY_DETAIL(id), { status });
    clearCmsCache("industries");
    return data;
  },

  deleteIndustry: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_INDUSTRY_DETAIL(id));
    clearCmsCache("industries");
  },

  // Categories
  getAdminCategories: async (page = 1, pageSize = 10): Promise<{ results: CategoryItem[]; count: number }> => {
    const data: PaginatedCmsResponse<CategoryItem> | CategoryItem[] = await axiosClient.get(API_ENDPOINTS.CMS.ADMIN_CATEGORIES, { params: { page, page_size: pageSize } });
    const results: CategoryItem[] = Array.isArray(data) ? data : (data?.results || []);
    const count: number = Array.isArray(data) ? results.length : (typeof data?.count === "number" ? data.count : results.length);
    return { results, count };
  },

  createCategory: async (categoryData: CategoryCreatePayload): Promise<CategoryItem> => {
    const data = await axiosClient.post<CategoryItem, CategoryItem>(API_ENDPOINTS.CMS.ADMIN_CATEGORIES, categoryData);
    clearCmsCache("categories");
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_CATEGORY_DETAIL(id));
    clearCmsCache("categories");
  },

  // Blog
  getAdminBlog: async (page = 1, pageSize = 10): Promise<{ results: BlogPostItem[]; count: number }> => {
    const data: PaginatedCmsResponse<BlogPostItem> | BlogPostItem[] = await axiosClient.get(API_ENDPOINTS.CMS.ADMIN_BLOG, { params: { page, page_size: pageSize } });
    const results: BlogPostItem[] = Array.isArray(data) ? data : (data?.results || []);
    const count: number = Array.isArray(data) ? results.length : (typeof data?.count === "number" ? data.count : results.length);
    return { results, count };
  },

  createBlogPost: async (blogData: BlogPostCreatePayload): Promise<BlogPostItem> => {
    const data = await axiosClient.post<BlogPostItem, BlogPostItem>(API_ENDPOINTS.CMS.ADMIN_BLOG, blogData);
    clearCmsCache("blogPosts");
    return data;
  },

  updateBlogPost: async (id: number, blogData: Partial<BlogPostItem>): Promise<BlogPostItem> => {
    const data = await axiosClient.patch<BlogPostItem, BlogPostItem>(API_ENDPOINTS.CMS.ADMIN_BLOG_DETAIL(id), blogData);
    clearCmsCache("blogPosts");
    return data;
  },

  toggleBlogStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<BlogPostItem> => {
    const data = await axiosClient.patch<BlogPostItem, BlogPostItem>(API_ENDPOINTS.CMS.ADMIN_BLOG_DETAIL(id), { status });
    clearCmsCache("blogPosts");
    return data;
  },

  deleteBlogPost: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_BLOG_DETAIL(id));
    clearCmsCache("blogPosts");
  },

  // Public endpoints
  getPublicServiceDetail: async (slug: string): Promise<ServiceItem> => {
    const data = await axiosClient.get<ServiceItem, ServiceItem>(API_ENDPOINTS.CMS.PUBLIC_SERVICE_DETAIL(slug));
    return data;
  },

  getPublicIndustryDetail: async (slug: string): Promise<IndustryItem> => {
    const data = await axiosClient.get<IndustryItem, IndustryItem>(API_ENDPOINTS.CMS.PUBLIC_INDUSTRY_DETAIL(slug));
    return data;
  },

  getPublicCaseStudies: async (): Promise<CaseStudyItem[]> => {
    const data = await axiosClient.get<PaginatedCmsResponse<CaseStudyItem> | CaseStudyItem[], PaginatedCmsResponse<CaseStudyItem> | CaseStudyItem[]>(API_ENDPOINTS.CMS.PUBLIC_CASE_STUDIES, { params: { page_size: 100 } });
    return Array.isArray(data) ? data : (data.results || []);
  },

  getPublicBlog: async (): Promise<BlogPostItem[]> => {
    const data = await axiosClient.get<PaginatedCmsResponse<BlogPostItem> | BlogPostItem[], PaginatedCmsResponse<BlogPostItem> | BlogPostItem[]>(API_ENDPOINTS.CMS.PUBLIC_BLOG, { params: { page_size: 100 } });
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Aggregate CMS Dashboard Stats
  getDashboardStats: async (): Promise<CmsDashboardStats> => {
    const [servicesRes, caseStudiesRes, industriesRes, blogPostsRes, categoriesRes] = await Promise.all([
      cmsService.getAdminServices(1, 100),
      cmsService.getAdminCaseStudies(1, 100),
      cmsService.getAdminIndustries(1, 100),
      cmsService.getAdminBlog(1, 100),
      cmsService.getAdminCategories(1, 100),
    ]);

    const services = servicesRes.results;
    const caseStudies = caseStudiesRes.results;
    const industries = industriesRes.results;
    const blogPosts = blogPostsRes.results;
    const categories = categoriesRes.results;

    const totalServices = services.length;
    const publishedServices = services.filter((s) => s.status === "published").length;
    const draftServices = totalServices - publishedServices;

    const totalCaseStudies = caseStudies.length;
    const publishedCaseStudies = caseStudies.filter((cs) => cs.status === "published").length;
    const draftCaseStudies = totalCaseStudies - publishedCaseStudies;

    const totalIndustries = industries.length;
    const publishedIndustries = industries.filter((ind) => ind.status === "published").length;

    const totalBlogPosts = blogPosts.length;
    const publishedBlogPosts = blogPosts.filter((b) => b.status === "published").length;
    const draftBlogPosts = totalBlogPosts - publishedBlogPosts;

    const totalCategories = categories.length;

    const totalContentNodes = totalServices + totalCaseStudies + totalBlogPosts;
    const totalPublished = publishedServices + publishedCaseStudies + publishedBlogPosts;
    const publishedRatio = totalContentNodes > 0 ? (totalPublished / totalContentNodes) * 100 : 0;

    return {
      total_services: totalServices,
      published_services: publishedServices,
      draft_services: draftServices,
      total_case_studies: totalCaseStudies,
      published_case_studies: publishedCaseStudies,
      draft_case_studies: draftCaseStudies,
      total_industries: totalIndustries,
      published_industries: publishedIndustries,
      total_blog_posts: totalBlogPosts,
      published_blog_posts: publishedBlogPosts,
      draft_blog_posts: draftBlogPosts,
      total_categories: totalCategories,
      total_content_nodes: totalContentNodes,
      published_ratio: publishedRatio,
      recent_articles: blogPosts.slice(0, 5),
      recent_case_studies: caseStudies.slice(0, 5),
      services_list: services,
    };
  },

  // File Upload
  uploadMedia: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const data = await axiosClient.post<UploadResponse, UploadResponse>(API_ENDPOINTS.CMS.ADMIN_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};

export default cmsService;
