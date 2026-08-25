export const industriesData = [
  {
    id: "01",
    slug: "banking",
    name: "Banking",
    shortDescription: "Secure, highly available core banking solutions and digital modernization for global financial institutions.",
    icon: "Landmark",
    challenges: {
      operational: [
        { title: "Legacy System Bottlenecks", description: "Inability to launch new digital products quickly due to monolithic core banking systems." },
        { title: "Customer Experience", description: "Fragmented omnichannel experiences leading to high customer churn." }
      ],
      regulatory: [
        { title: "Compliance Data Silos", description: "Difficulty aggregating reporting data for strict regional financial regulations." },
        { title: "Fraud Detection", description: "Identifying sophisticated transaction fraud in real-time." }
      ],
      technical: [
        { title: "Scalability Limitations", description: "On-premise infrastructure struggling with digital transaction volume spikes." },
        { title: "API Integration", description: "Complex, insecure integrations with third-party FinTech ecosystems." }
      ]
    },
    solutions: [
      "Custom Banking Platforms",
      "Microservices Migration",
      "AI-Driven Fraud Detection",
      "Secure API Gateways"
    ],
    relatedServices: ["custom-software-development", "python-microservices", "legacy-system-modernization", "cybersecurity-threat-governance"],
    technologies: ["Python", "Java", "PostgreSQL", "Kafka", "AWS"],
    relatedCaseStudies: ["banking-modernization"],
    outcomes: ["Security", "Scalability", "Digital Experience"]
  },
  {
    id: "02",
    slug: "financial-services",
    name: "Financial Services (BFSI)",
    shortDescription: "High-frequency, scalable engineering for trading, wealth management, and enterprise finance.",
    icon: "LineChart",
    challenges: {
      operational: [
        { title: "Process Automation", description: "High volume of manual reconciliation in middle and back-office operations." },
        { title: "Market Volatility", description: "Systems incapable of scaling instantly during massive market fluctuations." }
      ],
      regulatory: [
        { title: "Auditability", description: "Lack of immutable, unified audit trails across disparate trading platforms." }
      ],
      technical: [
        { title: "Latency", description: "Sub-optimal data pipeline speeds impacting algorithmic trading performance." },
        { title: "Data Governance", description: "Scattered data lakes leading to insecure data access and poor analytics." }
      ]
    },
    solutions: [
      "Algorithmic Trading Infrastructure",
      "Automated Reconciliation Engines",
      "Data Warehouse Modernization"
    ],
    relatedServices: ["fintech-solutions", "data-engineering", "microservices-architecture"],
    technologies: ["C++", "Python", "Redis", "Snowflake"],
    relatedCaseStudies: ["bfsi-data-platform"],
    outcomes: ["Performance", "Operational Efficiency", "Security"]
  },
  {
    id: "03",
    slug: "insurance",
    name: "Insurance",
    shortDescription: "Intelligent platforms streamlining claims processing, underwriting, and policy management.",
    icon: "ShieldCheck",
    challenges: {
      operational: [
        { title: "Claims Processing", description: "Slow, manual claims adjudication leading to poor customer satisfaction." }
      ],
      regulatory: [
        { title: "Data Privacy", description: "Strict requirements for securing PII and health-related policyholder data." }
      ],
      technical: [
        { title: "Predictive Analytics", description: "Inability to leverage historical data for accurate dynamic pricing and risk assessment." }
      ]
    },
    solutions: [
      "AI Underwriting Models",
      "Automated Claims Workflows",
      "Policy Management Portals"
    ],
    relatedServices: ["enterprise-application-engineering", "artificial-intelligence-solutions", "robotic-process-automation"],
    technologies: ["Python", "React", "PostgreSQL", "TensorFlow"],
    relatedCaseStudies: ["insurance-claims-automation"],
    outcomes: ["Automation", "Digital Experience", "Security"]
  },
  {
    id: "04",
    slug: "healthcare",
    name: "Healthcare",
    shortDescription: "Compliant, interoperable technology platforms for patient care, telehealth, and clinical data.",
    icon: "Activity",
    challenges: {
      operational: [
        { title: "Care Coordination", description: "Fragmented patient data across multiple disconnected EHR systems." },
        { title: "Telehealth Scaling", description: "Inability to provide seamless, high-quality remote care." }
      ],
      regulatory: [
        { title: "HIPAA/GDPR Compliance", description: "Strict mandates on patient data privacy, encryption, and access control." }
      ],
      technical: [
        { title: "Interoperability", description: "Difficulty implementing HL7/FHIR standards across legacy hospital systems." }
      ]
    },
    solutions: [
      "Interoperable EHR Integrations",
      "Telemedicine Platforms",
      "Predictive Patient Analytics"
    ],
    relatedServices: ["healthtech-platforms", "rest-api-development-integrations", "data-analytics", "cybersecurity-threat-governance"],
    technologies: ["Python", "Django", "React", "HL7/FHIR", "AWS"],
    relatedCaseStudies: ["healthcare-interoperability"],
    outcomes: ["Security", "Scalability", "Operational Efficiency"]
  },
  {
    id: "05",
    slug: "education",
    name: "Education",
    shortDescription: "Scalable Learning Management Systems and digital platforms for institutions and EdTech startups.",
    icon: "GraduationCap",
    challenges: {
      operational: [
        { title: "Remote Learning Delivery", description: "Inconsistent student engagement in digital-only or hybrid environments." }
      ],
      regulatory: [
        { title: "Student Data Privacy", description: "Compliance with FERPA and international student data protection laws." }
      ],
      technical: [
        { title: "Video Streaming Scale", description: "Infrastructure buckling under high concurrent video streaming loads." }
      ]
    },
    solutions: [
      "Custom LMS Platforms",
      "High-Concurrency Video Architecture",
      "AI-Powered Tutoring"
    ],
    relatedServices: ["edtech-lms-solutions", "cloud-architecture-modernization", "generative-ai-platform-integration"],
    technologies: ["React", "Django", "WebRTC", "PostgreSQL"],
    relatedCaseStudies: ["edtech-global-scale"],
    outcomes: ["Scalability", "Digital Experience", "Performance"]
  },
  {
    id: "06",
    slug: "manufacturing",
    name: "Manufacturing",
    shortDescription: "Industry 4.0 solutions, IoT integrations, and intelligent supply chain platforms.",
    icon: "Factory",
    challenges: {
      operational: [
        { title: "Supply Chain Visibility", description: "Lack of real-time insights into inventory and production bottlenecks." },
        { title: "Predictive Maintenance", description: "Costly unplanned equipment downtime due to reactive maintenance." }
      ],
      regulatory: [
        { title: "Quality Assurance", description: "Strict traceability and reporting requirements for manufactured goods." }
      ],
      technical: [
        { title: "IoT Data Ingestion", description: "Inability to process massive volumes of telemetry data from factory floor sensors." }
      ]
    },
    solutions: [
      "Custom ERP Platforms",
      "IoT Telemetry Dashboards",
      "AI Predictive Maintenance Models"
    ],
    relatedServices: ["custom-erp-development", "data-engineering", "machine-learning-engineering"],
    technologies: ["Python", "Kafka", "TimescaleDB", "React"],
    relatedCaseStudies: ["manufacturing-iot-platform"],
    outcomes: ["Operational Efficiency", "Automation", "Scalability"]
  },
  {
    id: "07",
    slug: "retail",
    name: "Retail",
    shortDescription: "Omnichannel retail platforms, inventory optimization, and digital customer experiences.",
    icon: "ShoppingBag",
    challenges: {
      operational: [
        { title: "Omnichannel Sync", description: "Discrepancies between physical store inventory and digital storefronts." }
      ],
      regulatory: [
        { title: "PCI DSS Compliance", description: "Maintaining strict security standards for high-volume payment processing." }
      ],
      technical: [
        { title: "High-Traffic Events", description: "E-commerce platforms crashing during Black Friday and flash sales." }
      ]
    },
    solutions: [
      "Headless Commerce Architecture",
      "Real-Time Inventory Systems",
      "AI Personalization Engines"
    ],
    relatedServices: ["ecommerce-platforms", "business-intelligence", "microservices-architecture"],
    technologies: ["React", "Next.js", "Redis", "Elasticsearch"],
    relatedCaseStudies: ["retail-omnichannel-scale"],
    outcomes: ["Digital Experience", "Scalability", "Performance"]
  },
  {
    id: "08",
    slug: "e-commerce",
    name: "E-commerce",
    shortDescription: "High-conversion, scalable digital commerce architectures and customized transactional platforms.",
    icon: "ShoppingCart",
    challenges: {
      operational: [
        { title: "Conversion Optimization", description: "Cart abandonment due to slow load times and friction in checkout." }
      ],
      regulatory: [
        { title: "Global Taxation", description: "Complex cross-border tax compliance and currency handling." }
      ],
      technical: [
        { title: "Microservices Fragmentation", description: "Poor orchestration between payment, inventory, and shipping services." }
      ]
    },
    solutions: [
      "Custom B2B/B2C Marketplaces",
      "High-Availability Checkout Microservices",
      "Automated CI/CD for Zero Downtime"
    ],
    relatedServices: ["ecommerce-platforms", "devops-cicd-automation", "ui-ux-engineering"],
    technologies: ["React", "Django", "PostgreSQL", "Kubernetes"],
    relatedCaseStudies: ["ecommerce-marketplace-launch"],
    outcomes: ["Performance", "Digital Experience", "Scalability"]
  },
  {
    id: "09",
    slug: "logistics-supply-chain",
    name: "Logistics & Supply Chain",
    shortDescription: "Real-time tracking, intelligent routing, and global fleet management platforms.",
    icon: "Truck",
    challenges: {
      operational: [
        { title: "Fleet Utilization", description: "Inefficient routing leading to high fuel costs and delayed deliveries." }
      ],
      regulatory: [
        { title: "Cross-Border Compliance", description: "Complex customs documentation and international transport regulations." }
      ],
      technical: [
        { title: "Real-Time Tracking", description: "High latency in updating GPS telemetry data across thousands of vehicles." }
      ]
    },
    solutions: [
      "Predictive Routing Algorithms",
      "Real-Time GPS Telemetry Pipelines",
      "Warehouse Management Systems"
    ],
    relatedServices: ["logistics-supply-chain-tech", "data-engineering", "cross-platform-mobile-applications"],
    technologies: ["Python", "React Native", "PostGIS", "Redis"],
    relatedCaseStudies: ["logistics-fleet-optimization"],
    outcomes: ["Operational Efficiency", "Performance", "Automation"]
  },
  {
    id: "10",
    slug: "real-estate",
    name: "Real Estate",
    shortDescription: "PropTech solutions for property management, virtual tours, and real estate investments.",
    icon: "Building",
    challenges: {
      operational: [
        { title: "Tenant Management", description: "Manual, fragmented processes for lease agreements and maintenance requests." }
      ],
      regulatory: [
        { title: "Data Security", description: "Protecting sensitive financial and personal data of tenants and investors." }
      ],
      technical: [
        { title: "Data Aggregation", description: "Difficulty aggregating MLS data and market analytics in real-time." }
      ]
    },
    solutions: [
      "Custom Property Management Portals",
      "Automated Valuation Models",
      "Secure Document Management"
    ],
    relatedServices: ["enterprise-crm-solutions", "data-analytics", "custom-software-development"],
    technologies: ["Django", "React", "AWS S3", "PostgreSQL"],
    relatedCaseStudies: ["proptech-platform"],
    outcomes: ["Operational Efficiency", "Digital Experience", "Security"]
  },
  {
    id: "11",
    slug: "construction",
    name: "Construction",
    shortDescription: "Digital tools for project management, resource allocation, and site safety compliance.",
    icon: "HardHat",
    challenges: {
      operational: [
        { title: "Project Delays", description: "Poor communication between on-site teams and back-office procurement." }
      ],
      regulatory: [
        { title: "Safety Compliance", description: "Strict adherence to OSHA reporting and site incident tracking." }
      ],
      technical: [
        { title: "Offline Capabilities", description: "Software failing in remote construction sites without reliable internet." }
      ]
    },
    solutions: [
      "Offline-First Mobile Apps",
      "Resource Allocation ERPs",
      "Drone Data Integration"
    ],
    relatedServices: ["cross-platform-mobile-applications", "custom-erp-development", "cloud-architecture-modernization"],
    technologies: ["React Native", "SQLite", "Django", "AWS"],
    relatedCaseStudies: ["construction-management-app"],
    outcomes: ["Operational Efficiency", "Modernization", "Performance"]
  },
  {
    id: "12",
    slug: "hospitality",
    name: "Hospitality",
    shortDescription: "Enhancing guest experiences through integrated booking systems and operational automation.",
    icon: "Utensils",
    challenges: {
      operational: [
        { title: "Guest Experience", description: "Fragmented booking, dining, and loyalty systems frustrating guests." }
      ],
      regulatory: [
        { title: "Payment Security", description: "Securing global transactional data across multiple properties." }
      ],
      technical: [
        { title: "System Integration", description: "Connecting modern web portals to legacy Property Management Systems (PMS)." }
      ]
    },
    solutions: [
      "Unified Guest Portals",
      "Legacy PMS API Wrappers",
      "Dynamic Pricing Engines"
    ],
    relatedServices: ["rest-api-development-integrations", "enterprise-application-engineering", "data-analytics"],
    technologies: ["Python", "FastAPI", "React", "Redis"],
    relatedCaseStudies: ["hospitality-guest-platform"],
    outcomes: ["Digital Experience", "Operational Efficiency", "Modernization"]
  },
  {
    id: "13",
    slug: "travel",
    name: "Travel",
    shortDescription: "Scalable booking engines, dynamic pricing algorithms, and travel management platforms.",
    icon: "Plane",
    challenges: {
      operational: [
        { title: "Inventory Sync", description: "Overbooking due to slow synchronization with global distribution systems (GDS)." }
      ],
      regulatory: [
        { title: "International Data Transfer", description: "Complying with complex data sovereignty laws across borders." }
      ],
      technical: [
        { title: "Search Latency", description: "High latency when querying millions of flight/hotel combinations." }
      ]
    },
    solutions: [
      "High-Performance Search APIs",
      "GDS Integration Architecture",
      "Personalized Recommendation Engines"
    ],
    relatedServices: ["rest-api-development-integrations", "machine-learning-engineering", "cloud-architecture-modernization"],
    technologies: ["Elasticsearch", "Go", "Python", "Redis"],
    relatedCaseStudies: ["travel-booking-engine"],
    outcomes: ["Performance", "Scalability", "Digital Experience"]
  },
  {
    id: "14",
    slug: "automotive",
    name: "Automotive",
    shortDescription: "Connected car integrations, dealership management, and automotive supply chain tech.",
    icon: "Car",
    challenges: {
      operational: [
        { title: "Dealership Silos", description: "Fragmented CRM and inventory systems across franchised networks." }
      ],
      regulatory: [
        { title: "Telematics Privacy", description: "Securing connected-vehicle data according to regional privacy laws." }
      ],
      technical: [
        { title: "IoT Scalability", description: "Ingesting and processing real-time telemetry from millions of connected cars." }
      ]
    },
    solutions: [
      "Unified Dealership CRMs",
      "High-Throughput IoT Pipelines",
      "Predictive Maintenance AI"
    ],
    relatedServices: ["enterprise-crm-solutions", "data-engineering", "artificial-intelligence-solutions"],
    technologies: ["Kafka", "Python", "React", "PostgreSQL"],
    relatedCaseStudies: ["automotive-telematics-platform"],
    outcomes: ["Scalability", "Automation", "Operational Efficiency"]
  },
  {
    id: "15",
    slug: "telecommunications",
    name: "Telecommunications",
    shortDescription: "High-throughput billing systems, network analytics, and customer support platforms.",
    icon: "Signal",
    challenges: {
      operational: [
        { title: "Customer Churn", description: "Inability to proactively identify and retain dissatisfied subscribers." }
      ],
      regulatory: [
        { title: "Data Retention", description: "Strict mandates for securely storing petabytes of call data records (CDRs)." }
      ],
      technical: [
        { title: "Billing Architecture", description: "Legacy monolithic billing systems unable to support modern 5G micro-transactions." }
      ]
    },
    solutions: [
      "Microservices Billing Architectures",
      "AI Churn Prediction Models",
      "Scalable Data Lakes"
    ],
    relatedServices: ["microservices-architecture", "data-engineering", "machine-learning-engineering"],
    technologies: ["Java", "Python", "Kubernetes", "Snowflake"],
    relatedCaseStudies: ["telecom-billing-modernization"],
    outcomes: ["Scalability", "Performance", "Modernization"]
  },
  {
    id: "16",
    slug: "professional-services",
    name: "Professional Services",
    shortDescription: "Resource management, secure client portals, and workflow automation for consultancies and law firms.",
    icon: "Briefcase",
    challenges: {
      operational: [
        { title: "Resource Utilization", description: "Sub-optimal deployment of consultants leading to lost billable hours." }
      ],
      regulatory: [
        { title: "Confidentiality", description: "Absolute requirements for client data segregation and secure document sharing." }
      ],
      technical: [
        { title: "Workflow Fragmentation", description: "Disconnect between time-tracking, billing, and project management tools." }
      ]
    },
    solutions: [
      "Integrated Resource ERPs",
      "Secure Client Portals",
      "Automated Billing Workflows"
    ],
    relatedServices: ["custom-erp-development", "saas-product-engineering", "robotic-process-automation"],
    technologies: ["Django", "React", "PostgreSQL", "AWS KMS"],
    relatedCaseStudies: ["consulting-erp-platform"],
    outcomes: ["Operational Efficiency", "Security", "Automation"]
  },
  {
    id: "17",
    slug: "government",
    name: "Government / Public Sector",
    shortDescription: "Secure, compliant digital citizen services and modernized legacy public infrastructure.",
    icon: "Landmark",
    challenges: {
      operational: [
        { title: "Citizen Experience", description: "Clunky, slow digital portals resulting in low adoption and high support costs." }
      ],
      regulatory: [
        { title: "Strict Compliance", description: "Mandatory adherence to FedRAMP, accessibility (WCAG), and strict security protocols." }
      ],
      technical: [
        { title: "Legacy Debt", description: "Decades-old mainframe architectures that are expensive to maintain and impossible to scale." }
      ]
    },
    solutions: [
      "Accessible Citizen Portals",
      "Mainframe-to-Cloud Migration",
      "Zero-Trust Security Architectures"
    ],
    relatedServices: ["legacy-system-modernization", "cloud-migration", "ui-ux-engineering"],
    technologies: ["Python", "React", "AWS GovCloud", "Docker"],
    relatedCaseStudies: ["government-digital-modernization"],
    outcomes: ["Modernization", "Security", "Digital Experience"]
  },
  {
    id: "18",
    slug: "startups",
    name: "Startups",
    shortDescription: "Rapid SaaS product engineering and scalable architectures for high-growth technology companies.",
    icon: "Rocket",
    challenges: {
      operational: [
        { title: "Time to Market", description: "Need to launch Minimum Viable Products quickly without sacrificing future scale." }
      ],
      regulatory: [
        { title: "Compliance from Day One", description: "Building in SOC2/GDPR compliance to ensure enterprise readiness." }
      ],
      technical: [
        { title: "Scalable Foundations", description: "Avoiding technical debt while iterating rapidly on product-market fit." }
      ]
    },
    solutions: [
      "SaaS Product Engineering",
      "Agile MVP Development",
      "Scalable Cloud Architectures"
    ],
    relatedServices: ["saas-product-engineering", "custom-software-development", "devops-cicd-automation"],
    technologies: ["React", "Next.js", "Django", "PostgreSQL", "AWS"],
    relatedCaseStudies: ["startup-saas-scale"],
    outcomes: ["Scalability", "Digital Experience", "Performance"]
  }
];
