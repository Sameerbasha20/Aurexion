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

/** Raw shape of a service returned by the backend CMS API (ServiceSerializer) */
export interface ServiceApiDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Normalized service detail shape consumed by ServiceDetailsPage and its sections */
export interface ServiceDetail {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  problem: string;
  solution: string;
  technologies: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  relatedIndustries: string[];
  relatedCaseStudies: string[];
}

export interface Industry {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  solutions?: any;
  imageUrl?: string;
  isActive?: boolean;
  challenges?: any;
  target_solutions?: any;
  services?: any[];
  case_studies?: any[];
  relatedServices?: any[];
  technologies?: any[];
  relatedCaseStudies?: any[];
  outcomes?: any[];
}

export interface CaseStudy {
  id: number | string;
  slug: string;
  title: string;
  client?: string;
  clientType?: string;
  country?: string;
  category?: string;
  coverImage?: string;
  cover_image?: string;
  coverimage?: string;
  industry: string;
  challenge: string;
  solution?: string;
  results?: string | any;
  technologies?: string[] | any;
  imageUrl?: string;
  isActive?: boolean;
  confidential?: boolean;
  media?: any[];
  business_challenge?: string;
  proposed_architecture?: string;
  tech_stack?: string[];
  development_approach?: any[];
  modules_integration_security?: any;
  architecture?: any;
  developmentApproach?: any[];
  modules?: any[];
  outcomes_performance?: any[];
  outcomes_business?: any[];
  compliance_security?: any[];
  integrations?: any[];
  relatedCaseStudySlugs?: string[];
  services?: any[];
  security_governance?: any[];
}

export interface BlogPost {
  id: number | string;
  slug: string;
  title: string;
  summary?: string;
  excerpt?: string;
  content: string;
  author?: string;
  authorId?: string;
  publishedDate?: string;
  publishedAt?: string;
  published_at?: string;
  created_at?: string;
  updatedAt?: string;
  readingTime?: string;
  featured?: boolean;
  category: string | any;
  category_name?: string;
  tags?: string[] | any;
  imageUrl?: string;
  coverImage?: string;
  cover_image?: string;
  coverimage?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string | string[];
  media?: any[];
  isActive?: boolean;
  relatedServices?: string[] | any;
  relatedIndustries?: string[] | any;
  relatedCaseStudies?: string[] | any;
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
