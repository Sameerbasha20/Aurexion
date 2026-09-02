import axiosClient from "../../../api/axiosClient";
import { API_ENDPOINTS } from "../../../api/endpoints";
import {
  BlogPost,
  CaseStudy,
  Industry,
  Job,
  JobApplication,
  Service,
  ServiceApiDetail,
  ContactFormData,
  QuoteFormData,
} from "../types/website.types";

export const publicService = {
  // CMS endpoints
  getCompanyInfo: async (): Promise<Record<string, unknown>> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.CMS.PUBLIC_COMPANY_INFO
    );

    return response.data || {};
  },

  getServiceBySlug: async (slug: string): Promise<ServiceApiDetail> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.CMS.PUBLIC_SERVICE_DETAIL(slug)
    );

    return response.data as ServiceApiDetail;
  },

  getServices: async (): Promise<Service[]> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.CMS.PUBLIC_SERVICES
    );

    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getIndustries: async (): Promise<Industry[]> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.CMS.PUBLIC_INDUSTRIES
    );

    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getIndustryBySlug: async (slug: string): Promise<Industry> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.CMS.PUBLIC_INDUSTRY_DETAIL(slug)
    );

    return response.data as Industry;
  },

  getCaseStudies: async (): Promise<CaseStudy[]> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.CMS.PUBLIC_CASE_STUDIES,
      {
        params: { page_size: 100 },
      }
    );

    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getCaseStudyBySlug: async (slug: string): Promise<CaseStudy> => {
    const response = await axiosClient.get(
      `${API_ENDPOINTS.CMS.PUBLIC_CASE_STUDIES}${slug}/`
    );

    return response.data as CaseStudy;
  },

  getBlogPosts: async (
    params?: { category?: string; tag?: string; search?: string }
  ): Promise<BlogPost[]> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.CMS.PUBLIC_BLOG,
      {
        params: { page_size: 100, ...params },
      }
    );

    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getBlogPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await axiosClient.get(
      `${API_ENDPOINTS.CMS.PUBLIC_BLOG}${slug}/`
    );

    return response.data as BlogPost;
  },

  getRelatedBlogPosts: async (slug: string): Promise<BlogPost[]> => {
    const response = await axiosClient.get(
      `${API_ENDPOINTS.CMS.PUBLIC_BLOG}${slug}/related/`
    );

    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  // Careers endpoints
  getJobs: async (): Promise<Job[]> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.RECRUITMENT.PUBLIC_JOBS
    );

    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getJobById: async (jobId: string): Promise<Job> => {
    const response = await axiosClient.get(
      API_ENDPOINTS.RECRUITMENT.PUBLIC_JOB_DETAIL(jobId)
    );

    return response.data as Job;
  },

  applyForJob: async (data: JobApplication): Promise<void> => {
    const formData = new FormData();

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

    if (data.resume) {
      formData.append("resume", data.resume);
    }

    await axiosClient.post(
      API_ENDPOINTS.RECRUITMENT.PUBLIC_APPLY,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // Public form submissions
  submitContactForm: async (
    data: ContactFormData
  ): Promise<void> => {
    await axiosClient.post(API_ENDPOINTS.CRM.PUBLIC_LEADS, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      description: data.message,
      source: "contact_form",
    });
  },

  requestQuote: async (
    data: QuoteFormData
  ): Promise<void> => {
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

  submitRfp: async (
    data: Record<string, any>
  ): Promise<void> => {
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
    formData.append(
      "nda_required",
      data.nda_required ? "true" : "false"
    );

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

  calculateEstimate: async (
    data: Record<string, any>
  ): Promise<{ estimatedCost: string }> => {
    await axiosClient.post(API_ENDPOINTS.CRM.PUBLIC_LEADS, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      description: data.requirements,
      source: "estimator",
    });

    return {
      estimatedCost: data.estimatedCost || "$10,000",
    };
  },
};

export default publicService;
