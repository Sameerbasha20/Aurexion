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

export const cmsService = {
  // Services
  getAdminServices: async (): Promise<ServiceItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.ADMIN_SERVICES);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createService: async (serviceData: ServiceCreatePayload): Promise<ServiceItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CMS.ADMIN_SERVICES, serviceData);
    return data;
  },

  updateService: async (id: number, serviceData: Partial<ServiceItem>): Promise<ServiceItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_SERVICE_DETAIL(id), serviceData);
    return data;
  },

  toggleServiceStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<ServiceItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_SERVICE_DETAIL(id), { status });
    return data;
  },

  deleteService: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_SERVICE_DETAIL(id));
  },

  // Case Studies
  getAdminCaseStudies: async (): Promise<CaseStudyItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.ADMIN_CASE_STUDIES);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createCaseStudy: async (csData: CaseStudyCreatePayload): Promise<CaseStudyItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CMS.ADMIN_CASE_STUDIES, csData);
    return data;
  },

  updateCaseStudy: async (id: number, csData: Partial<CaseStudyItem>): Promise<CaseStudyItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_CASE_STUDY_DETAIL(id), csData);
    return data;
  },

  toggleCaseStudyStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<CaseStudyItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_CASE_STUDY_DETAIL(id), { status });
    return data;
  },

  deleteCaseStudy: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_CASE_STUDY_DETAIL(id));
  },

  // Industries
  getAdminIndustries: async (): Promise<IndustryItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.ADMIN_INDUSTRIES);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createIndustry: async (indData: IndustryCreatePayload): Promise<IndustryItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CMS.ADMIN_INDUSTRIES, indData);
    return data;
  },

  updateIndustry: async (id: number, indData: Partial<IndustryItem>): Promise<IndustryItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_INDUSTRY_DETAIL(id), indData);
    return data;
  },

  toggleIndustryStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<IndustryItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_INDUSTRY_DETAIL(id), { status });
    return data;
  },

  deleteIndustry: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_INDUSTRY_DETAIL(id));
  },

  // Categories
  getAdminCategories: async (): Promise<CategoryItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.ADMIN_CATEGORIES);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createCategory: async (categoryData: CategoryCreatePayload): Promise<CategoryItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CMS.ADMIN_CATEGORIES, categoryData);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_CATEGORY_DETAIL(id));
  },

  // Blog
  getAdminBlog: async (): Promise<BlogPostItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.ADMIN_BLOG);
    return Array.isArray(data) ? data : (data.results || []);
  },

  createBlogPost: async (blogData: BlogPostCreatePayload): Promise<BlogPostItem> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.CMS.ADMIN_BLOG, blogData);
    return data;
  },

  updateBlogPost: async (id: number, blogData: Partial<BlogPostItem>): Promise<BlogPostItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_BLOG_DETAIL(id), blogData);
    return data;
  },

  toggleBlogStatus: async (id: number, status: "published" | "draft" | "archived"): Promise<BlogPostItem> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.CMS.ADMIN_BLOG_DETAIL(id), { status });
    return data;
  },

  deleteBlogPost: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CMS.ADMIN_BLOG_DETAIL(id));
  },

  // Public endpoints
  getPublicServiceDetail: async (slug: string) => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.PUBLIC_SERVICE_DETAIL(slug));
    return data;
  },

  getPublicIndustryDetail: async (slug: string) => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.PUBLIC_INDUSTRY_DETAIL(slug));
    return data;
  },

  getPublicCaseStudies: async (): Promise<CaseStudyItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.PUBLIC_CASE_STUDIES);
    return Array.isArray(data) ? data : (data.results || []);
  },

  getPublicBlog: async (): Promise<BlogPostItem[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.CMS.PUBLIC_BLOG);
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Aggregate CMS Dashboard Stats
  getDashboardStats: async (): Promise<CmsDashboardStats> => {
    const [services, caseStudies, industries, blogPosts, categories] = await Promise.all([
      cmsService.getAdminServices(),
      cmsService.getAdminCaseStudies(),
      cmsService.getAdminIndustries(),
      cmsService.getAdminBlog(),
      cmsService.getAdminCategories(),
    ]);

    const published_services = services.filter((s) => s.status?.toLowerCase() === "published").length;
    const draft_services = services.filter((s) => s.status?.toLowerCase() === "draft").length;

    const published_case_studies = caseStudies.filter((cs) => cs.status?.toLowerCase() === "published").length;
    const draft_case_studies = caseStudies.filter((cs) => cs.status?.toLowerCase() === "draft").length;

    const published_industries = industries.filter((i) => i.status?.toLowerCase() === "published").length;

    const published_blog_posts = blogPosts.filter((b) => b.status?.toLowerCase() === "published").length;
    const draft_blog_posts = blogPosts.filter((b) => b.status?.toLowerCase() === "draft").length;

    const total_content_nodes = services.length + caseStudies.length + industries.length + blogPosts.length;
    const total_published = published_services + published_case_studies + published_industries + published_blog_posts;
    const published_ratio = total_content_nodes > 0 ? Math.round((total_published / total_content_nodes) * 100) : 0;

    return {
      total_services: services.length,
      published_services,
      draft_services,
      total_case_studies: caseStudies.length,
      published_case_studies,
      draft_case_studies,
      total_industries: industries.length,
      published_industries,
      total_blog_posts: blogPosts.length,
      published_blog_posts,
      draft_blog_posts,
      total_categories: categories.length,
      total_content_nodes,
      published_ratio,
      recent_articles: blogPosts.slice(0, 5),
      recent_case_studies: caseStudies.slice(0, 5),
      services_list: services,
    };
  },
};

export default cmsService;
