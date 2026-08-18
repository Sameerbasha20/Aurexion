import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";

export interface JobVacancy {
  id: number;
  job_id: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  skills: string;
  responsibilities: string;
  status: string; // ACTIVE, CLOSED, DRAFT
  created_at: string;
  updated_at: string;
  applications_count?: number;
}

export interface JobCreatePayload {
  job_id: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  skills: string;
  responsibilities: string;
  status: string;
}

export interface CandidateApplication {
  id: number;
  tracking_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  resume_storage_path: string;
  stage: string; // APPLIED, SCREENING, SHORTLISTED, INTERVIEW, OFFER, HIRED, REJECTED
  created_at: string;
  updated_at: string;
  job_vacancy: number;
  job_title?: string;
  job_department?: string;
  job_code?: string;
}

export interface CandidateItem {
  id: number;
  application_id: number;
  name: string;
  email: string;
  phone: string;
  job_id: number;
  job_code?: string;
  job_title?: string;
  job_department?: string;
  stage: string;
  applied_date: string;
  resume_url: string;
  tracking_code: string;
}

export interface RecruitmentDashboardStats {
  active_vacancies: number;
  closed_vacancies: number;
  total_jobs: number;
  total_applications: number;
  applied_count: number;
  screening_count: number;
  shortlisted_count: number;
  interview_count: number;
  offer_count: number;
  hired_count: number;
  rejected_count: number;
  pipeline_stages: Array<{
    stage: string;
    label: string;
    count: number;
    color: string;
  }>;
  recent_applications: CandidateApplication[];
  active_jobs: JobVacancy[];
  department_distribution: Array<{
    department: string;
    jobs_count: number;
    applications_count: number;
  }>;
}

export const recruitmentService = {
  /**
   * Fetch all jobs from admin recruitment API
   */
  getAdminJobs: async (): Promise<JobVacancy[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.RECRUITMENT.ADMIN_JOBS);
    const jobs = Array.isArray(data) ? data : (data.results || []);
    return jobs;
  },

  /**
   * Fetch public jobs listing
   */
  getPublicJobs: async (): Promise<JobVacancy[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.RECRUITMENT.PUBLIC_JOBS);
    return Array.isArray(data) ? data : (data.results || []);
  },

  /**
   * Fetch job details by job_id
   */
  getJobDetail: async (jobId: string): Promise<JobVacancy> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.RECRUITMENT.PUBLIC_JOB_DETAIL(jobId));
    return data;
  },

  /**
   * Create a new job vacancy in the admin recruitment portal
   */
  createJob: async (jobData: JobCreatePayload): Promise<JobVacancy> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.RECRUITMENT.ADMIN_JOBS, jobData);
    return data;
  },

  /**
   * Update a job vacancy using job_id
   */
  updateJob: async (jobId: string, jobData: Partial<JobVacancy>): Promise<JobVacancy> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.RECRUITMENT.ADMIN_JOB_DETAIL(jobId), jobData);
    return data;
  },

  /**
   * Toggle job status (e.g. ACTIVE -> CLOSED or CLOSED -> ACTIVE)
   */
  toggleJobStatus: async (jobId: string, status: "ACTIVE" | "CLOSED" | "DRAFT"): Promise<JobVacancy> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.RECRUITMENT.ADMIN_JOB_DETAIL(jobId), { status });
    return data;
  },

  /**
   * Fetch all candidate applications
   */
  getAdminApplications: async (): Promise<CandidateApplication[]> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.RECRUITMENT.ADMIN_APPLICATIONS);
    const apps = Array.isArray(data) ? data : (data.results || []);
    return apps;
  },

  /**
   * Fetch a single application
   */
  getApplication: async (applicationId: number): Promise<CandidateApplication> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.RECRUITMENT.ADMIN_APPLICATION_DETAIL(applicationId));
    return data;
  },

  /**
   * Update application candidate stage (APPLIED, SCREENING, SHORTLISTED, INTERVIEW, OFFER, HIRED, REJECTED)
   */
  updateApplicationStage: async (applicationId: number, stage: string): Promise<CandidateApplication> => {
    const data = await axiosClient.patch<any, any>(API_ENDPOINTS.RECRUITMENT.ADMIN_APPLICATION_DETAIL(applicationId), { stage });
    return data;
  },

  /**
   * Extract unique candidates from applications
   */
  getCandidates: async (): Promise<CandidateItem[]> => {
    const [apps, jobs] = await Promise.all([
      recruitmentService.getAdminApplications(),
      recruitmentService.getAdminJobs(),
    ]);

    const jobMap = new Map<number, JobVacancy>();
    jobs.forEach((j) => jobMap.set(j.id, j));

    return apps.map((app) => {
      const job = jobMap.get(app.job_vacancy);
      return {
        id: app.id,
        application_id: app.id,
        name: `${app.first_name || ""} ${app.last_name || ""}`.trim() || "Candidate",
        email: app.email,
        phone: app.phone,
        job_id: app.job_vacancy,
        job_code: job?.job_id,
        job_title: job?.title || `Position #${app.job_vacancy}`,
        job_department: job?.department || "General",
        stage: app.stage || "APPLIED",
        applied_date: app.created_at,
        resume_url: app.resume_storage_path,
        tracking_code: app.tracking_code,
      };
    });
  },

  /**
   * Aggregate real Recruitment Dashboard stats from jobs and applications
   */
  getDashboardStats: async (): Promise<RecruitmentDashboardStats> => {
    const [jobs, applications] = await Promise.all([
      recruitmentService.getAdminJobs(),
      recruitmentService.getAdminApplications(),
    ]);

    const jobMap = new Map<number, JobVacancy>();
    jobs.forEach((j) => jobMap.set(j.id, j));

    // Enrich applications with job details
    const enrichedApps: CandidateApplication[] = applications.map((app) => {
      const job = jobMap.get(app.job_vacancy);
      return {
        ...app,
        job_title: job?.title,
        job_department: job?.department,
        job_code: job?.job_id,
      };
    });

    const active_jobs = jobs.filter((j) => j.status?.toUpperCase() === "ACTIVE");
    const closed_jobs = jobs.filter((j) => j.status?.toUpperCase() === "CLOSED");

    const applied_count = applications.filter((a) => (a.stage || "APPLIED").toUpperCase() === "APPLIED").length;
    const screening_count = applications.filter((a) => a.stage?.toUpperCase() === "SCREENING").length;
    const shortlisted_count = applications.filter((a) => a.stage?.toUpperCase() === "SHORTLISTED").length;
    const interview_count = applications.filter((a) => a.stage?.toUpperCase() === "INTERVIEW").length;
    const offer_count = applications.filter((a) => a.stage?.toUpperCase() === "OFFER").length;
    const hired_count = applications.filter((a) => a.stage?.toUpperCase() === "HIRED").length;
    const rejected_count = applications.filter((a) => a.stage?.toUpperCase() === "REJECTED").length;

    const pipeline_stages = [
      { stage: "APPLIED", label: "Applied", count: applied_count, color: "#63f5e8" },
      { stage: "SCREENING", label: "Screening", count: screening_count, color: "#38bdf8" },
      { stage: "SHORTLISTED", label: "Shortlisted", count: shortlisted_count, color: "#a855f7" },
      { stage: "INTERVIEW", label: "Interview", count: interview_count, color: "#818cf8" },
      { stage: "OFFER", label: "Offer", count: offer_count, color: "#facc15" },
      { stage: "HIRED", label: "Hired", count: hired_count, color: "#4ade80" },
      { stage: "REJECTED", label: "Rejected", count: rejected_count, color: "#f87171" },
    ];

    // Compute department distribution
    const deptMap = new Map<string, { jobs_count: number; applications_count: number }>();
    jobs.forEach((job) => {
      const dept = job.department || "General";
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { jobs_count: 0, applications_count: 0 });
      }
      deptMap.get(dept)!.jobs_count += 1;
    });

    enrichedApps.forEach((app) => {
      const dept = app.job_department || "General";
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { jobs_count: 0, applications_count: 0 });
      }
      deptMap.get(dept)!.applications_count += 1;
    });

    const department_distribution = Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      jobs_count: data.jobs_count,
      applications_count: data.applications_count,
    }));

    return {
      active_vacancies: active_jobs.length,
      closed_vacancies: closed_jobs.length,
      total_jobs: jobs.length,
      total_applications: applications.length,
      applied_count,
      screening_count,
      shortlisted_count,
      interview_count,
      offer_count,
      hired_count,
      rejected_count,
      pipeline_stages,
      recent_applications: enrichedApps.slice(0, 10),
      active_jobs,
      department_distribution,
    };
  },
};

export default recruitmentService;
