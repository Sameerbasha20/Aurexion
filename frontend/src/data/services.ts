export interface ServiceItem {
  id: string;
  slug: string;
  category: string;
  name: string;
  description: string;
  technologies: string[];
  relatedIndustries: string[];
  relatedCaseStudies: string[];
}

export const serviceCategories = [
  {
    id: "01",
    name: "Core Engineering",
    description: "Robust, scalable custom software solutions engineered for complex enterprise operations.",
    iconName: "Code"
  },
  {
    id: "02",
    name: "AI & Data Science",
    description: "Intelligent platforms and data pipelines driving predictive business insights.",
    iconName: "Cpu"
  },
  {
    id: "03",
    name: "Cloud & Infrastructure",
    description: "Modernizing infrastructure for high availability, security, and global scale.",
    iconName: "Cloud"
  },
  {
    id: "04",
    name: "Enterprise Products",
    description: "Custom-built enterprise applications optimizing internal workflows and operations.",
    iconName: "Layout"
  },
  {
    id: "05",
    name: "Digital Platforms",
    description: "Connected ecosystems, APIs, and scalable SaaS product engineering.",
    iconName: "Layers"
  },
  {
    id: "06",
    name: "Quality & Advisory",
    description: "Strategic technology consulting and rigorous quality assurance standards.",
    iconName: "Shield"
  }
];

export const servicesData: ServiceItem[] = [
  // 01 - Core Engineering (5)
  {
    id: "ce-1",
    slug: "custom-software-development",
    category: "Core Engineering",
    name: "Custom Software Development",
    description: "End-to-end engineering of bespoke software systems designed to solve unique, complex enterprise challenges.",
    technologies: ["Python", "Django", "React 18+", "PostgreSQL", "Docker"],
    relatedIndustries: ["Banking", "Healthcare", "Manufacturing", "Insurance", "Financial Services (BFSI)", "Retail", "Real Estate", "Startups"],
    relatedCaseStudies: ["cs-1"]
  },
  {
    id: "ce-2",
    slug: "enterprise-application-engineering",
    category: "Core Engineering",
    name: "Enterprise Application Engineering",
    description: "Scalable, high-performance applications built to unify and streamline large-scale corporate operations.",
    technologies: ["Java", "Spring Boot", "React", "PostgreSQL"],
    relatedIndustries: ["Financial Services (BFSI)", "Logistics & Supply Chain", "Retail", "Professional Services", "Telecommunications", "Government / Public Sector"],
    relatedCaseStudies: ["cs-2"]
  },
  {
    id: "ce-3",
    slug: "python-microservices",
    category: "Core Engineering",
    name: "Python Microservices",
    description: "Decoupled, highly available microservices architectures utilizing modern Python frameworks.",
    technologies: ["Python", "FastAPI", "Django REST Framework", "Redis", "Celery"],
    relatedIndustries: ["Telecommunications", "Banking", "Healthcare", "Insurance", "E-commerce", "Financial Services (BFSI)"],
    relatedCaseStudies: ["cs-3"]
  },
  {
    id: "ce-4",
    slug: "legacy-system-modernization",
    category: "Core Engineering",
    name: "Legacy System Modernization",
    description: "Strategic refactoring and migrating of legacy monolithic applications into modern, cloud-native architectures.",
    technologies: ["Python", "Docker", "Kubernetes", "AWS"],
    relatedIndustries: ["Banking", "Government / Public Sector", "Manufacturing", "Telecommunications", "Insurance", "Financial Services (BFSI)"],
    relatedCaseStudies: ["cs-4"]
  },
  {
    id: "ce-5",
    slug: "microservices-architecture",
    category: "Core Engineering",
    name: "Microservices Architecture",
    description: "Designing and implementing distributed systems that maximize scalability, fault tolerance, and independent deployability.",
    technologies: ["Kubernetes", "Docker", "gRPC", "RabbitMQ"],
    relatedIndustries: ["E-commerce", "Logistics & Supply Chain", "Financial Services (BFSI)", "Banking", "Retail", "Telecommunications"],
    relatedCaseStudies: ["cs-5"]
  },

  // 02 - AI & Data Science (6)
  {
    id: "ai-1",
    slug: "artificial-intelligence-solutions",
    category: "AI & Data Science",
    name: "Artificial Intelligence Solutions",
    description: "Custom AI models and intelligent systems designed to automate decisions and optimize operations.",
    technologies: ["Python", "TensorFlow", "PyTorch"],
    relatedIndustries: ["Healthcare", "Manufacturing", "Retail", "Financial Services (BFSI)", "Insurance", "Logistics & Supply Chain", "Automotive"],
    relatedCaseStudies: ["cs-6"]
  },
  {
    id: "ai-2",
    slug: "machine-learning-engineering",
    category: "AI & Data Science",
    name: "Machine Learning Engineering",
    description: "Productionizing ML models with robust MLOps pipelines for continuous training and scalable inference.",
    technologies: ["Python", "MLflow", "Kubeflow", "AWS SageMaker"],
    relatedIndustries: ["Financial Services (BFSI)", "Logistics & Supply Chain", "E-commerce", "Healthcare", "Automotive", "Telecommunications"],
    relatedCaseStudies: ["cs-7"]
  },
  {
    id: "ai-3",
    slug: "generative-ai-platform-integration",
    category: "AI & Data Science",
    name: "Generative AI Platform Integration",
    description: "Securely integrating enterprise LLMs and generative AI capabilities into existing digital platforms.",
    technologies: ["Python", "LangChain", "OpenAI API", "Vector Databases"],
    relatedIndustries: ["Education", "Professional Services", "Healthcare", "Financial Services (BFSI)", "Retail", "Startups"],
    relatedCaseStudies: ["cs-8"]
  },
  {
    id: "ai-4",
    slug: "data-engineering",
    category: "AI & Data Science",
    name: "Data Engineering",
    description: "Architecting resilient data pipelines, warehouses, and lakes to handle massive enterprise data volumes.",
    technologies: ["Apache Spark", "Airflow", "Snowflake", "dbt"],
    relatedIndustries: ["Telecommunications", "Banking", "Retail", "Manufacturing", "Financial Services (BFSI)", "Logistics & Supply Chain"],
    relatedCaseStudies: ["cs-9"]
  },
  {
    id: "ai-5",
    slug: "data-analytics",
    category: "AI & Data Science",
    name: "Data Analytics",
    description: "Advanced descriptive and prescriptive analytics to drive evidence-based corporate strategy.",
    technologies: ["Python", "Pandas", "SQL"],
    relatedIndustries: ["Retail", "Healthcare", "Logistics & Supply Chain", "Banking", "Manufacturing", "Financial Services (BFSI)"],
    relatedCaseStudies: ["cs-10"]
  },
  {
    id: "ai-6",
    slug: "business-intelligence",
    category: "AI & Data Science",
    name: "Business Intelligence (BI)",
    description: "Interactive dashboards and reporting platforms that democratize data access across the organization.",
    technologies: ["Tableau", "Power BI", "Looker"],
    relatedIndustries: ["Manufacturing", "Financial Services (BFSI)", "Education", "Retail", "Logistics & Supply Chain", "Real Estate"],
    relatedCaseStudies: ["cs-11"]
  },

  // 03 - Cloud & Infrastructure (5)
  {
    id: "ci-1",
    slug: "cloud-architecture-modernization",
    category: "Cloud & Infrastructure",
    name: "Cloud Architecture & Modernization",
    description: "Designing secure, highly available, and cost-optimized cloud architectures for enterprise workloads.",
    technologies: ["AWS", "Azure", "Terraform"],
    relatedIndustries: ["Banking", "Healthcare", "Government / Public Sector", "Financial Services (BFSI)", "Telecommunications", "Insurance"],
    relatedCaseStudies: ["cs-12"]
  },
  {
    id: "ci-2",
    slug: "cloud-migration",
    category: "Cloud & Infrastructure",
    name: "Cloud Migration",
    description: "Seamless, zero-downtime migration strategies moving on-premise infrastructure to modern cloud providers.",
    technologies: ["AWS Migration Hub", "Docker", "Kubernetes"],
    relatedIndustries: ["Manufacturing", "Education", "Logistics & Supply Chain", "Government / Public Sector", "Banking", "Retail"],
    relatedCaseStudies: ["cs-13"]
  },
  {
    id: "ci-3",
    slug: "devops-cicd-automation",
    category: "Cloud & Infrastructure",
    name: "DevOps & CI/CD Automation",
    description: "Automating deployment pipelines to accelerate delivery cycles while enforcing strict quality and security gates.",
    technologies: ["GitHub Actions", "GitLab CI", "Jenkins", "Ansible"],
    relatedIndustries: ["Financial Services (BFSI)", "Healthcare", "E-commerce", "Startups", "Retail", "Banking"],
    relatedCaseStudies: ["cs-14"]
  },
  {
    id: "ci-4",
    slug: "cybersecurity-threat-governance",
    category: "Cloud & Infrastructure",
    name: "Cybersecurity & Threat Governance",
    description: "Implementing enterprise-grade security controls, RBAC, and zero-trust architectures.",
    technologies: ["OWASP", "SIEM", "IAM"],
    relatedIndustries: ["Banking", "Government / Public Sector", "Healthcare", "Financial Services (BFSI)", "Insurance", "Telecommunications"],
    relatedCaseStudies: ["cs-15"]
  },
  {
    id: "ci-5",
    slug: "managed-infrastructure",
    category: "Cloud & Infrastructure",
    name: "Managed Infrastructure",
    description: "24/7 proactive monitoring, maintenance, and optimization of critical enterprise infrastructure.",
    technologies: ["Prometheus", "Grafana", "Datadog"],
    relatedIndustries: ["Retail", "Telecommunications", "Logistics & Supply Chain", "Manufacturing", "Banking"],
    relatedCaseStudies: ["cs-16"]
  },

  // 04 - Enterprise Products (7)
  {
    id: "ep-1",
    slug: "custom-erp-development",
    category: "Enterprise Products",
    name: "Custom ERP Development",
    description: "Bespoke Enterprise Resource Planning systems tailored to unique supply chain, finance, and operational workflows.",
    technologies: ["Python", "Django", "React", "PostgreSQL"],
    relatedIndustries: ["Manufacturing", "Logistics & Supply Chain", "Retail", "Construction", "Real Estate", "Professional Services"],
    relatedCaseStudies: ["cs-17"]
  },
  {
    id: "ep-2",
    slug: "enterprise-crm-solutions",
    category: "Enterprise Products",
    name: "Enterprise CRM Solutions",
    description: "Customer Relationship Management platforms engineered for complex sales cycles and deep integrations.",
    technologies: ["React", "Django REST Framework", "Redis"],
    relatedIndustries: ["Financial Services (BFSI)", "Telecommunications", "Education", "Real Estate", "Hospitality", "Travel"],
    relatedCaseStudies: ["cs-18"]
  },
  {
    id: "ep-3",
    slug: "hrms-platforms",
    category: "Enterprise Products",
    name: "HRMS Platforms",
    description: "Human Resource Management Systems automating payroll, compliance, and talent acquisition.",
    technologies: ["Python", "React", "PostgreSQL"],
    relatedIndustries: ["Healthcare", "Manufacturing", "Retail", "Professional Services", "Government / Public Sector", "Banking"],
    relatedCaseStudies: ["cs-19"]
  },
  {
    id: "ep-4",
    slug: "fintech-solutions",
    category: "Enterprise Products",
    name: "FinTech Solutions",
    description: "Secure, high-throughput financial technology platforms supporting payments, lending, and core banking.",
    technologies: ["Python", "FastAPI", "PostgreSQL", "Redis"],
    relatedIndustries: ["Banking", "Financial Services (BFSI)", "Insurance", "E-commerce", "Retail", "Real Estate"],
    relatedCaseStudies: ["cs-20"]
  },
  {
    id: "ep-5",
    slug: "healthtech-platforms",
    category: "Enterprise Products",
    name: "HealthTech Platforms",
    description: "Compliant, interoperable healthcare platforms managing patient data, telemedicine, and clinical workflows.",
    technologies: ["Python", "Django", "React", "HL7/FHIR"],
    relatedIndustries: ["Healthcare", "Insurance", "Government / Public Sector"],
    relatedCaseStudies: ["cs-21"]
  },
  {
    id: "ep-6",
    slug: "edtech-lms-solutions",
    category: "Enterprise Products",
    name: "EdTech & LMS Solutions",
    description: "Scalable Learning Management Systems facilitating digital education and corporate training.",
    technologies: ["React", "Django", "Video Streaming APIs"],
    relatedIndustries: ["Education", "Government / Public Sector", "Professional Services", "Startups"],
    relatedCaseStudies: ["cs-22"]
  },
  {
    id: "ep-7",
    slug: "logistics-supply-chain-tech",
    category: "Enterprise Products",
    name: "Logistics & Supply Chain Tech",
    description: "Real-time tracking, inventory management, and predictive routing platforms for global logistics.",
    technologies: ["Python", "React", "PostgreSQL", "IoT Protocols"],
    relatedIndustries: ["Logistics & Supply Chain", "Manufacturing", "Retail", "Automotive", "E-commerce", "Construction"],
    relatedCaseStudies: ["cs-23"]
  },

  // 05 - Digital Platforms (5)
  {
    id: "dp-1",
    slug: "ecommerce-platforms",
    category: "Digital Platforms",
    name: "E-commerce Platforms",
    description: "High-conversion, highly scalable digital commerce platforms supporting complex B2B and B2C transactions.",
    technologies: ["React", "Next.js", "Django", "Redis"],
    relatedIndustries: ["Retail", "E-commerce", "Manufacturing", "Hospitality", "Travel", "Real Estate"],
    relatedCaseStudies: ["cs-24"]
  },
  {
    id: "dp-2",
    slug: "cross-platform-mobile-applications",
    category: "Digital Platforms",
    name: "Cross-Platform Mobile Applications",
    description: "Enterprise-grade mobile applications built with React Native for seamless iOS and Android experiences.",
    technologies: ["React Native", "TypeScript", "Redux"],
    relatedIndustries: ["Financial Services (BFSI)", "Healthcare", "Retail", "Logistics & Supply Chain", "Hospitality", "Travel"],
    relatedCaseStudies: ["cs-25"]
  },
  {
    id: "dp-3",
    slug: "rest-api-development-integrations",
    category: "Digital Platforms",
    name: "REST API Development & Integrations",
    description: "Designing robust, versioned REST APIs connecting disparate enterprise systems and third-party services.",
    technologies: ["Django REST Framework", "FastAPI", "OpenAPI/Swagger"],
    relatedIndustries: ["Banking", "Telecommunications", "Logistics & Supply Chain", "Healthcare", "E-commerce", "Travel"],
    relatedCaseStudies: ["cs-26"]
  },
  {
    id: "dp-4",
    slug: "robotic-process-automation",
    category: "Digital Platforms",
    name: "Robotic Process Automation (RPA)",
    description: "Automating repetitive, rule-based corporate workflows to dramatically improve operational efficiency.",
    technologies: ["Python", "Selenium", "RPA Tools"],
    relatedIndustries: ["Financial Services (BFSI)", "Healthcare", "Government / Public Sector", "Insurance", "Manufacturing", "Banking"],
    relatedCaseStudies: ["cs-27"]
  },
  {
    id: "dp-5",
    slug: "saas-product-engineering",
    category: "Digital Platforms",
    name: "SaaS Product Engineering",
    description: "Architecting multi-tenant Software-as-a-Service platforms engineered for global scale and high availability.",
    technologies: ["React", "Django", "PostgreSQL", "AWS"],
    relatedIndustries: ["Education", "Financial Services (BFSI)", "Startups", "Professional Services", "Telecommunications"],
    relatedCaseStudies: ["cs-28"]
  },

  // 06 - Quality & Advisory (5)
  {
    id: "qa-1",
    slug: "software-testing-qa-automation",
    category: "Quality & Advisory",
    name: "Software Testing & QA Automation",
    description: "Rigorous automated testing strategies ensuring enterprise software reliability and zero-defect deployments.",
    technologies: ["Cypress", "Selenium", "PyTest", "Jest"],
    relatedIndustries: ["Banking", "Healthcare", "E-commerce", "Financial Services (BFSI)", "Insurance"],
    relatedCaseStudies: ["cs-29"]
  },
  {
    id: "qa-2",
    slug: "ui-ux-engineering",
    category: "Quality & Advisory",
    name: "UI/UX Engineering",
    description: "Designing intuitive, accessible, and performant user interfaces tailored for complex enterprise workflows.",
    technologies: ["Figma", "React", "Tailwind CSS"],
    relatedIndustries: ["Financial Services (BFSI)", "Healthcare", "Retail", "E-commerce", "Travel", "Hospitality"],
    relatedCaseStudies: ["cs-30"]
  },
  {
    id: "qa-3",
    slug: "strategic-technology-consulting",
    category: "Quality & Advisory",
    name: "Strategic Technology Consulting",
    description: "Executive-level advisory services navigating digital transformation, IT strategy, and architecture.",
    technologies: ["Enterprise Architecture", "Agile Coaching"],
    relatedIndustries: ["Government / Public Sector", "Banking", "Manufacturing", "Professional Services", "Telecommunications"],
    relatedCaseStudies: ["cs-31"]
  },
  {
    id: "qa-4",
    slug: "dedicated-development-team-allocation",
    category: "Quality & Advisory",
    name: "Dedicated Development Team Allocation",
    description: "Providing highly skilled, managed engineering squads to accelerate your internal product development.",
    technologies: ["Agile/Scrum", "Full-Stack Teams"],
    relatedIndustries: ["Financial Services (BFSI)", "E-commerce", "Startups", "Retail", "Education"],
    relatedCaseStudies: ["cs-32"]
  },
  {
    id: "qa-5",
    slug: "managed-application-maintenance",
    category: "Quality & Advisory",
    name: "Managed Application Maintenance",
    description: "Long-term support, performance tuning, and security patching for mission-critical enterprise applications.",
    technologies: ["SLA Monitoring", "CI/CD", "Application Performance Monitoring"],
    relatedIndustries: ["Healthcare", "Financial Services (BFSI)", "Logistics & Supply Chain", "Banking", "Manufacturing"],
    relatedCaseStudies: ["cs-33"]
  }
];

