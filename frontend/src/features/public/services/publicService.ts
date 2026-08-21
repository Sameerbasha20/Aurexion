import axiosClient from "../../../api/axiosClient";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { BlogPost, CaseStudy, Industry, Job, JobApplication, Service, ServiceApiDetail, ContactFormData, QuoteFormData, PublicLeadData } from "../types/website.types";

export const publicService = {
  // CMS endpoints
  getCompanyInfo: async (): Promise<any> => {
    const response = await axiosClient.get(API_ENDPOINTS.CMS.PUBLIC_COMPANY_INFO);
    return response as any;
  },

  getServiceBySlug: async (slug: string): Promise<ServiceApiDetail> => {

    const response = await axiosClient.get(API_ENDPOINTS.CMS.PUBLIC_SERVICE_DETAIL(slug));
    return response as unknown as ServiceApiDetail;
  },

  getServices: async (): Promise<Service[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.CMS.PUBLIC_SERVICES);
    return (response as any) || [];
  },

  getIndustries: async (): Promise<Industry[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.CMS.PUBLIC_INDUSTRIES);
    return (response as any) || [];
  },

  getIndustryBySlug: async (slug: string): Promise<Industry> => {
    const response = await axiosClient.get(API_ENDPOINTS.CMS.PUBLIC_INDUSTRY_DETAIL(slug));
    return response as any;
  },

  getCaseStudies: async (): Promise<CaseStudy[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.CMS.PUBLIC_CASE_STUDIES, { params: { page_size: 100 } });
    return (response as any) || [];
  },

  getCaseStudyBySlug: async (slug: string): Promise<CaseStudy> => {
    const response = await axiosClient.get(`${API_ENDPOINTS.CMS.PUBLIC_CASE_STUDIES}${slug}/`);
    return response as any;
  },

  getBlogPosts: async (params?: { category?: string; tag?: string; search?: string }): Promise<BlogPost[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.CMS.PUBLIC_BLOG, {
      params: { page_size: 100, ...params }
    });
    return (response as any) || [];
  },

  getBlogPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await axiosClient.get(`${API_ENDPOINTS.CMS.PUBLIC_BLOG}${slug}/`);
    return response as any;
  },

  getRelatedBlogPosts: async (slug: string): Promise<BlogPost[]> => {
    const response = await axiosClient.get(`${API_ENDPOINTS.CMS.PUBLIC_BLOG}${slug}/related/`);
    return (response as any) || [];
  },

  // Careers endpoints
  getJobs: async (): Promise<Job[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.RECRUITMENT.PUBLIC_JOBS);
    const data = response as any;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getJobById: async (jobId: string): Promise<Job> => {
    const response = await axiosClient.get(API_ENDPOINTS.RECRUITMENT.PUBLIC_JOB_DETAIL(jobId));
    return response as any;
  },

  applyForJob: async (data: JobApplication): Promise<void> => {
    const formData = new FormData();
    // Backend ApplySerializer expects: job_id, first_name, last_name, email, phone, resume
    formData.append("job_id", data.jobId);
    const nameParts = data.name.trim().split(" ");
    const firstName = nameParts[0] || data.name;
    const lastName = nameParts.slice(1).join(" ") || "-";
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    if (data.coverLetter) {
      formData.append("cover_letter", data.coverLetter);
      formData.append("coverLetter", data.coverLetter);
    }
    if (data.resume) formData.append("resume", data.resume);

    await axiosClient.post(API_ENDPOINTS.RECRUITMENT.PUBLIC_APPLY, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

// Public form submissions - now using real API
  submitContactForm: async (data: ContactFormData): Promise<void> => {
    await axiosClient.post(API_ENDPOINTS.CRM.PUBLIC_LEADS, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      description: data.message,
      source: "contact_form",
    });
  },

  requestQuote: async (data: QuoteFormData): Promise<void> => {
    await axiosClient.post(API_ENDPOINTS.CRM.PUBLIC_LEADS, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      industry: data.service,
      description: data.requirements,
      source: "request_quote",
    });
  },
  
  submitRfp: async (data: any): Promise<void> => {
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("company_name", data.company_name);
    formData.append("work_email", data.work_email);
    formData.append("phone", data.phone);
    formData.append("designation", data.designation);
    formData.append("country", data.country);
    formData.append("project_type", data.project_type);
    formData.append("budget_range", data.budget_range);
    formData.append("project_description", data.project_description);
    formData.append("nda_required", data.nda_required ? "true" : "false");
    if (data.file) {
      formData.append("document_attachment", data.file);
    }
    try {
      await axiosClient.post("/rfp/submit/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        await axiosClient.post("/crm/rfp/submit/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        throw err;
      }
    }
  },
  
  calculateEstimate: async (data: any): Promise<any> => {
    await axiosClient.post(API_ENDPOINTS.CRM.PUBLIC_LEADS, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      description: data.requirements,
      source: "estimator",
    });
    return { estimatedCost: data.estimatedCost || "$10,000" };
  },
};

export default publicService;
