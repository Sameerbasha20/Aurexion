export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  features?: string[];
  benefits?: string[];
  imageUrl?: string;
  isActive: boolean;
}

export interface Industry {
  id: number;
  slug: string;
  name: string;
  description: string;
  solutions?: string[];
  imageUrl?: string;
  isActive: boolean;
}

export interface CaseStudy {
  id: number;
  slug: string;
  title: string;
  client?: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  technologies?: string[];
  imageUrl?: string;
  isActive: boolean;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  publishedDate: string;
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Job {
  id: number;        // numeric DB primary key
  job_id: string;   // human-readable code e.g. AUR-001
  title: string;
  department: string;
  location: string;
  experience: string;
  skills: string;          // stored as plain text in DB
  responsibilities: string; // stored as plain text in DB
  status: string;
  created_at: string;
  // legacy / optional fields
  employmentType?: string;
  description?: string;
  deadline?: string;
  isActive?: boolean;
}

export interface JobApplication {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resume?: File;
  coverLetter?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  requirements: string;
  budget?: string;
  timeline?: string;
}

export interface PublicLeadData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  website?: string;
  industry?: string;
  source: string;
  description: string;
  priority?: string;
}
