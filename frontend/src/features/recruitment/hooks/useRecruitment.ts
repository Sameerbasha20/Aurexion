import { useState, useEffect, useCallback } from "react";
import recruitmentService, {
  JobVacancy,
  JobCreatePayload,
  CandidateApplication,
  CandidateItem,
  RecruitmentDashboardStats,
} from "../services/recruitmentService";

/**
 * Hook for fetching and managing HR Recruitment Dashboard Stats
 */
export function useRecruitmentDashboard() {
  const [data, setData] = useState<RecruitmentDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await recruitmentService.getDashboardStats();
      setData(stats);
    } catch (err: any) {
      setError(err?.message || "Failed to load recruitment metrics.");
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
 * Hook for managing Job Vacancies
 */
export function useJobs() {
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await recruitmentService.getAdminJobs();
      setJobs(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load job vacancies.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = async (jobData: JobCreatePayload) => {
    setActionLoading(true);
    try {
      const newJob = await recruitmentService.createJob(jobData);
      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    } finally {
      setActionLoading(false);
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<JobVacancy>) => {
    setActionLoading(true);
    try {
      const updated = await recruitmentService.updateJob(jobId, jobData);
      setJobs((prev) => prev.map((j) => (j.job_id === jobId ? updated : j)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (jobId: string, status: "ACTIVE" | "CLOSED" | "DRAFT") => {
    setActionLoading(true);
    try {
      const updated = await recruitmentService.toggleJobStatus(jobId, status);
      setJobs((prev) => prev.map((j) => (j.job_id === jobId ? updated : j)));
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    jobs,
    isLoading,
    actionLoading,
    error,
    refetch: fetchJobs,
    createJob,
    updateJob,
    toggleStatus,
  };
}

/**
 * Hook for managing Applications and Candidate Stage Transitions
 */
export function useApplications() {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apps, jobs] = await Promise.all([
        recruitmentService.getAdminApplications(),
        recruitmentService.getAdminJobs(),
      ]);

      const jobMap = new Map<number, JobVacancy>();
      jobs.forEach((j) => jobMap.set(j.id, j));

      const enriched = apps.map((app) => {
        const job = jobMap.get(app.job_vacancy);
        return {
          ...app,
          job_title: job?.title || `Position #${app.job_vacancy}`,
          job_department: job?.department || "General",
          job_code: job?.job_id,
        };
      });

      setApplications(enriched);
    } catch (err: any) {
      setError(err?.message || "Failed to load job applications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStage = async (applicationId: number, stage: string) => {
    setActionLoading(true);
    try {
      const updated = await recruitmentService.updateApplicationStage(applicationId, stage);
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, stage: updated.stage } : app))
      );
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    applications,
    isLoading,
    actionLoading,
    error,
    refetch: fetchApplications,
    updateStage,
  };
}

/**
 * Hook for managing Candidate Talent Pool
 */
export function useCandidates() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await recruitmentService.getCandidates();
      setCandidates(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load candidate talent pool.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const updateCandidateStage = async (applicationId: number, stage: string) => {
    try {
      const updated = await recruitmentService.updateApplicationStage(applicationId, stage);
      setCandidates((prev) =>
        prev.map((c) => (c.application_id === applicationId ? { ...c, stage: updated.stage } : c))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    candidates,
    isLoading,
    error,
    refetch: fetchCandidates,
    updateCandidateStage,
  };
}
