export const caseStudiesData = [
  // ─── 01 BANKING ──────────────────────────────────────────────────────────────
  {
    id: "CS-001",
    slug: "banking-modernization",
    title: "Legacy Core Banking Modernization for Global Financial Institution",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "banking",
    country: "United States",
    category: "Cloud Modernization",
    coverImage: "/webp_images/unsplash_1563986768609-32.webp",

    challenge: "The client operated on a highly fragmented, 15-year-old monolithic core banking architecture. The system struggled to handle peak transaction volumes, suffered from localized outages, and posed significant security vulnerabilities due to outdated technology stacks. Regulatory compliance across PCI DSS and GDPR was increasingly difficult to maintain.",

    architecture: {
      description: "Aurexion architected a highly decoupled, cloud-native microservices ecosystem utilizing a zero-trust security framework and an event-driven data layer.",
      components: [
        "API Gateway (Kong)",
        "Microservices (Spring Boot / Node.js)",
        "Event Bus (Apache Kafka)",
        "Data Lake & Warehouse",
        "Identity & Access Management (IAM)",
        "Kubernetes Clusters"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "Redux"],
      backend: ["Node.js", "Java Spring Boot", "GraphQL"],
      database: ["PostgreSQL", "MongoDB", "Redis"],
      cloud: ["AWS", "Kubernetes", "Docker"],
      devops: ["GitLab CI", "Terraform", "ArgoCD"],
      ai: [],
      integrations: ["Stripe", "Salesforce", "Twilio"]
    },

    developmentApproach: [
      { step: "Discover", description: "Comprehensive audit of the monolithic codebase and identification of critical business domains." },
      { step: "Architect", description: "Design of a scalable, domain-driven microservices architecture on AWS." },
      { step: "Develop", description: "Iterative strangler-fig pattern migration ensuring zero downtime." },
      { step: "Secure", description: "Implementation of OWASP standards and automated penetration testing." },
      { step: "Deploy", description: "Automated CI/CD pipelines deploying to scalable Kubernetes clusters." }
    ],

    modules: [
      "Core Transaction Processing",
      "Real-time Fraud Detection System",
      "Customer Identity Management",
      "Regulatory Reporting Engine"
    ],

    thirdPartyIntegrations: [
      { name: "Salesforce", purpose: "CRM synchronization" },
      { name: "Okta", purpose: "Enterprise Single Sign-On" },
      { name: "Datadog", purpose: "System observability and alerting" }
    ],

    securityControls: [
      "OWASP Top 10 Compliance",
      "Role-Based Access Control (RBAC)",
      "AES-256 Data Encryption at Rest",
      "TLS 1.3 Data Encryption in Transit",
      "Automated Vulnerability Scanning"
    ],

    complianceMeasures: [
      { requirement: "PCI DSS v4.0", approach: "Secure enclave processing for payment data." },
      { requirement: "GDPR", approach: "Automated PII obfuscation and data residency controls." }
    ],

    performance: [
      { metric: "API Response Time", value: "< 50ms average" },
      { metric: "System Availability", value: "99.999% SLA achieved" },
      { metric: "Throughput", value: "10,000 TPS peak load handling" }
    ],

    results: [
      { label: "Infrastructure Cost", impact: "40% Reduction" },
      { label: "Deployment Frequency", impact: "From Monthly to Daily" },
      { label: "System Uptime", impact: "99.999%" }
    ],

    services: ["custom-software-development", "legacy-system-modernization", "cybersecurity-threat-governance"],
    relatedIndustries: ["financial-services", "insurance"]
  },

  // ─── 02 FINANCIAL SERVICES (BFSI) ────────────────────────────────────────────
  {
    id: "CS-002",
    slug: "bfsi-data-platform",
    title: "Unified Data Platform for High-Frequency Trading Infrastructure",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "financial-services",
    country: "United Kingdom",
    category: "Data Engineering",
    coverImage: "/webp_images/unsplash_1611974789855-9c.webp",

    challenge: "A leading investment management firm faced mounting operational overhead from manual reconciliation across disparate trading platforms. Latency in data pipelines was degrading algorithmic trading performance, and fragmented data lakes created serious auditability and governance risks ahead of upcoming regulatory inspections.",

    architecture: {
      description: "A real-time streaming data platform capable of ingesting tick data, order book events, and settlement records, unified into a single governed data lake with sub-millisecond query capability.",
      components: [
        "Real-time Kafka Streaming Layer",
        "Snowflake Data Warehouse",
        "dbt Transformation Layer",
        "Apache Airflow Orchestration",
        "Role-Based Data Access Control",
        "Immutable Audit Log System"
      ]
    },

    technologies: {
      frontend: ["React", "D3.js", "TypeScript"],
      backend: ["Python", "FastAPI", "C++"],
      database: ["Snowflake", "Redis", "TimescaleDB"],
      cloud: ["AWS", "Kafka", "Docker"],
      devops: ["GitHub Actions", "Terraform"],
      ai: ["scikit-learn"],
      integrations: ["Bloomberg API", "Refinitiv", "SWIFT"]
    },

    developmentApproach: [
      { step: "Data Audit", description: "Complete mapping of all data flows across 14 disparate systems." },
      { step: "Pipeline Engineering", description: "Built low-latency Kafka pipelines for real-time order event streaming." },
      { step: "Warehouse Design", description: "Architected Snowflake schemas optimized for analytical and compliance queries." },
      { step: "Reconciliation Automation", description: "Automated end-of-day reconciliation replacing 12 manual analyst workflows." }
    ],

    modules: [
      "Real-time Trade Reconciliation Engine",
      "Regulatory Reporting Dashboard",
      "Algorithmic Performance Analytics",
      "Risk Exposure Monitor"
    ],

    thirdPartyIntegrations: [
      { name: "Bloomberg", purpose: "Market data feed ingestion" },
      { name: "SWIFT", purpose: "Interbank settlement messaging" },
      { name: "Refinitiv", purpose: "Reference data enrichment" }
    ],

    securityControls: [
      "Column-level Encryption on PII",
      "Immutable Audit Trails (WORM Storage)",
      "Multi-Factor Authentication (MFA)",
      "Network-level Zero Trust Segmentation"
    ],

    complianceMeasures: [
      { requirement: "MiFID II", approach: "Complete audit trail retention for 7 years with tamper-proof logging." },
      { requirement: "SOX", approach: "Segregated data access by function with automated attestation reports." }
    ],

    performance: [
      { metric: "Pipeline Latency", value: "< 5ms end-to-end" },
      { metric: "Daily Data Volume", value: "3TB processed per day" },
      { metric: "Query Speed", value: "10x faster than previous system" }
    ],

    results: [
      { label: "Reconciliation Time", impact: "From 8 hours to 12 minutes" },
      { label: "Operational Headcount", impact: "Reduced by 40%" },
      { label: "Regulatory Audit", impact: "Zero findings in first inspection" }
    ],

    services: ["data-engineering", "microservices-architecture", "business-intelligence"],
    relatedIndustries: ["banking", "insurance"]
  },

  // ─── 03 INSURANCE ────────────────────────────────────────────────────────────
  {
    id: "CS-003",
    slug: "insurance-claims-automation",
    title: "AI-Powered Claims Processing & Underwriting Platform",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "insurance",
    country: "Australia",
    category: "AI/ML Engineering",
    coverImage: "/webp_images/unsplash_1554224155-6726b.webp",

    challenge: "A major general insurer was processing claims through a largely manual, paper-based workflow averaging 14 business days per claim. Underwriters had no predictive tooling, leading to mispriced risk. Customer satisfaction scores were falling, and escalating operational costs made the legacy model unsustainable.",

    architecture: {
      description: "An end-to-end intelligent claims platform combining document AI, predictive underwriting models, and a modern policy management portal — all integrated with the existing mainframe policy ledger.",
      components: [
        "Document Intelligence Layer (OCR + NLP)",
        "Claims Triage Routing Engine",
        "ML Underwriting Risk Scorer",
        "Policy Management Portal (React SPA)",
        "Mainframe Integration Adapter",
        "Real-time Fraud Scoring API"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "Tailwind CSS"],
      backend: ["Python", "Django", "FastAPI"],
      database: ["PostgreSQL", "Redis", "Elasticsearch"],
      cloud: ["AWS", "Lambda", "S3", "Textract"],
      devops: ["GitHub Actions", "Docker", "Kubernetes"],
      ai: ["TensorFlow", "scikit-learn", "AWS Textract", "spaCy"],
      integrations: ["Salesforce", "Twilio", "IBM Mainframe"]
    },

    developmentApproach: [
      { step: "Process Mining", description: "Mapped existing claims workflow across 6 departments to identify bottlenecks." },
      { step: "Document AI", description: "Trained OCR and NLP models on 500,000 historical claim forms." },
      { step: "Underwriting Models", description: "Developed actuarial ML models improving risk pricing accuracy by 28%." },
      { step: "Portal Development", description: "Built customer and adjuster-facing React portal with real-time claim status." }
    ],

    modules: [
      "Automated Claims Intake & Classification",
      "Intelligent Document Extraction",
      "Fraud Detection Scoring Engine",
      "Dynamic Underwriting Risk Assessment",
      "Customer Self-Service Portal"
    ],

    thirdPartyIntegrations: [
      { name: "Salesforce", purpose: "Agent CRM and policy management" },
      { name: "Twilio", purpose: "Customer SMS and voice notifications" },
      { name: "LexisNexis Risk", purpose: "External risk data enrichment" }
    ],

    securityControls: [
      "PII Data Masking & Anonymization",
      "RBAC with Field-Level Security",
      "SOC 2 Type II Compliant Infrastructure",
      "Encrypted Document Storage (AES-256)"
    ],

    complianceMeasures: [
      { requirement: "GDPR / Australian Privacy Act", approach: "Right-to-erasure workflows and consent management built in." },
      { requirement: "ASIC RG 271", approach: "Dispute resolution workflows with 45-day SLA enforcement." }
    ],

    performance: [
      { metric: "Claims Processing Time", value: "From 14 days to 2 hours average" },
      { metric: "Fraud Detection Accuracy", value: "94% precision" },
      { metric: "Underwriting Speed", value: "Real-time automated decisions for 73% of cases" }
    ],

    results: [
      { label: "Claims Cycle Time", impact: "Reduced by 86%" },
      { label: "Operational Cost", impact: "35% Reduction" },
      { label: "Customer Satisfaction (NPS)", impact: "+42 Points" }
    ],

    services: ["artificial-intelligence-solutions", "enterprise-application-engineering", "robotic-process-automation"],
    relatedIndustries: ["banking", "financial-services"]
  },

  // ─── 04 HEALTHCARE ───────────────────────────────────────────────────────────
  {
    id: "CS-004",
    slug: "healthcare-interoperability",
    title: "FHIR-Compliant Healthcare Interoperability & Telehealth Platform",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "healthcare",
    country: "United Kingdom",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1576091160399-11.webp",

    challenge: "A national healthcare network urgently needed a HIPAA and NHS-compliant interoperability layer connecting 27 disconnected EHR systems. Simultaneously, rising demand for telemedicine required a secure, scalable video consultation platform capable of supporting 100,000+ concurrent sessions without compromising patient data security.",

    architecture: {
      description: "A HIPAA/GDPR-compliant WebRTC streaming architecture decoupled from the core electronic health record (EHR) system via an HL7/FHIR interoperability layer.",
      components: [
        "HL7/FHIR Integration Bus",
        "WebRTC Media Server Cluster",
        "Secure Video Consultation SPA",
        "Provider Scheduling Engine",
        "Patient Identity Registry",
        "Immutable Audit & Compliance Log"
      ]
    },

    technologies: {
      frontend: ["React", "WebRTC", "TypeScript"],
      backend: ["Node.js", "NestJS", "Python", "Django"],
      database: ["PostgreSQL", "Redis", "FHIR R4 Store"],
      cloud: ["Microsoft Azure", "Azure Kubernetes Service", "Azure Health Data Services"],
      devops: ["Azure DevOps", "Terraform", "Helm"],
      ai: [],
      integrations: ["Epic EHR", "Cerner", "Twilio Video", "NHS Spine"]
    },

    developmentApproach: [
      { step: "Compliance Architecture", description: "Dedicated phase for HIPAA/NHS DSP Toolkit security architecture mapping." },
      { step: "FHIR Integration", description: "Built bidirectional HL7 FHIR R4 interfaces for 27 EHR systems." },
      { step: "Real-time Engineering", description: "Developed WebRTC signaling servers and TURN/STUN media relay infrastructure." },
      { step: "Load Testing", description: "Validated infrastructure under 100,000+ concurrent simulated sessions." }
    ],

    modules: [
      "Encrypted Video Consultation Engine",
      "Virtual Waiting Room",
      "Multi-EHR Record Aggregator",
      "E-Prescription Gateway",
      "Appointment Scheduling System"
    ],

    thirdPartyIntegrations: [
      { name: "Epic EHR", purpose: "Primary patient record access" },
      { name: "NHS Spine", purpose: "National patient demographics and summary care records" },
      { name: "Twilio", purpose: "Fallback SMS and voice capabilities" }
    ],

    securityControls: [
      "End-to-End Encryption (E2EE) for all video sessions",
      "Zero Trust Network Architecture",
      "Multi-Factor Authentication (MFA)",
      "Immutable Blockchain-backed Audit Logs",
      "Strict RBAC with Field-Level Data Isolation"
    ],

    complianceMeasures: [
      { requirement: "HIPAA", approach: "Business Associate Agreements (BAA) and PHI isolation per tenant." },
      { requirement: "NHS DSP Toolkit / GDPR", approach: "UK-bound data residency with automated data subject request handling." }
    ],

    performance: [
      { metric: "Video Session Latency", value: "< 150ms global average" },
      { metric: "Concurrent Sessions", value: "Tested to 100,000+" },
      { metric: "EHR Query Response", value: "< 200ms federated search" }
    ],

    results: [
      { label: "Patient Access to Care", impact: "Increased by 300%" },
      { label: "Security Incidents", impact: "Zero breaches since launch" },
      { label: "EHR Integration Time", impact: "Reduced from 6 months to 3 weeks per system" }
    ],

    services: ["healthtech-platforms", "rest-api-development-integrations", "cybersecurity-threat-governance"],
    relatedIndustries: ["insurance", "government"]
  },

  // ─── 05 EDUCATION ────────────────────────────────────────────────────────────
  {
    id: "CS-005",
    slug: "edtech-global-scale",
    title: "Global-Scale Learning Management System for 5M+ Students",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "education",
    country: "India",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1519389950473-47.webp",

    challenge: "A pan-Asian EdTech provider serving 5 million students across 14 countries needed a unified LMS platform that could handle massive concurrent video streaming, support multilingual content, and deliver an adaptive learning experience — all while complying with local student data privacy laws including FERPA and PDPA.",

    architecture: {
      description: "A multi-tenant, cloud-native LMS platform with adaptive content delivery, high-concurrency WebRTC-based classrooms, and a recommendation engine tailored to individual learner progress.",
      components: [
        "Multi-tenant Application Core",
        "Video CDN & Live Streaming Layer",
        "Adaptive Learning Recommendation Engine",
        "Multilingual Content Management System",
        "Student Analytics Dashboard",
        "Assessments & Proctoring Module"
      ]
    },

    technologies: {
      frontend: ["React", "Next.js", "TypeScript"],
      backend: ["Python", "Django", "FastAPI"],
      database: ["PostgreSQL", "Redis", "Elasticsearch"],
      cloud: ["AWS", "CloudFront CDN", "S3", "EC2 Auto Scaling"],
      devops: ["GitHub Actions", "Docker", "Kubernetes", "Terraform"],
      ai: ["Python ML", "Recommendation Algorithms", "NLP"],
      integrations: ["Zoom SDK", "Stripe", "Google Classroom", "Canvas LTI"]
    },

    developmentApproach: [
      { step: "Multi-tenancy Design", description: "Architected schema-per-tenant isolation supporting 200+ institutional accounts." },
      { step: "Video Infrastructure", description: "Deployed adaptive bitrate streaming via AWS CloudFront with sub-3-second start time." },
      { step: "Recommendation Engine", description: "Built collaborative filtering model improving content engagement by 47%." },
      { step: "Proctoring Module", description: "Integrated AI-based exam integrity monitoring with facial recognition." }
    ],

    modules: [
      "Live Virtual Classroom",
      "On-demand Video Library",
      "AI-Powered Course Recommendations",
      "Online Assessments & Proctoring",
      "Institutional Admin Portal",
      "Student Progress Analytics"
    ],

    thirdPartyIntegrations: [
      { name: "Zoom SDK", purpose: "Live classroom fallback and webinar integration" },
      { name: "Stripe", purpose: "Course subscription and payment processing" },
      { name: "Canvas LTI", purpose: "Existing university LMS interoperability" }
    ],

    securityControls: [
      "FERPA-compliant Data Segregation",
      "Content Watermarking & DRM",
      "Role-Based Access Control (Student/Instructor/Admin)",
      "Encrypted Assessment Data Transmission"
    ],

    complianceMeasures: [
      { requirement: "FERPA", approach: "Strict student data access controls with audit logs." },
      { requirement: "PDPA (Thailand/India)", approach: "Consent management and localized data residency per country." }
    ],

    performance: [
      { metric: "Peak Concurrent Users", value: "450,000 simultaneously" },
      { metric: "Video Start Time", value: "< 3 seconds globally" },
      { metric: "Platform Uptime", value: "99.98% SLA" }
    ],

    results: [
      { label: "Student Engagement", impact: "Course completion rate up 65%" },
      { label: "Infrastructure Cost", impact: "Reduced by 30% vs. previous vendor" },
      { label: "Revenue Growth", impact: "Platform revenue 2.8x in 18 months" }
    ],

    services: ["edtech-lms-solutions", "cloud-architecture-modernization", "generative-ai-platform-integration"],
    relatedIndustries: ["government", "professional-services"]
  },

  // ─── 06 MANUFACTURING ────────────────────────────────────────────────────────
  {
    id: "CS-006",
    slug: "manufacturing-iot-platform",
    title: "Industry 4.0 IoT Platform for Predictive Maintenance & OEE",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "manufacturing",
    country: "Germany",
    category: "Data Engineering",
    coverImage: "/webp_images/unsplash_1504917595217-d4.webp",

    challenge: "A European automotive components manufacturer was suffering $18M annually in unplanned downtime across 9 production facilities. Factory floor IoT sensors generated terabytes of telemetry data that was never properly ingested or analyzed. Quality traceability across the supply chain was insufficient for ISO and OEM audit requirements.",

    architecture: {
      description: "A real-time industrial IoT data platform capable of ingesting telemetry from 12,000 factory floor sensors, running predictive maintenance ML models, and delivering live OEE dashboards to plant managers.",
      components: [
        "MQTT/OPC-UA IoT Ingestion Gateway",
        "Apache Kafka Streaming Bus",
        "TimescaleDB Time-Series Store",
        "ML Predictive Maintenance Models",
        "Real-time OEE Dashboard",
        "Quality Traceability Module"
      ]
    },

    technologies: {
      frontend: ["React", "D3.js", "Recharts"],
      backend: ["Python", "FastAPI", "Go"],
      database: ["TimescaleDB", "PostgreSQL", "InfluxDB"],
      cloud: ["AWS IoT Core", "Kafka", "Docker"],
      devops: ["GitLab CI", "Terraform", "Ansible"],
      ai: ["TensorFlow", "scikit-learn", "Prophet"],
      integrations: ["SAP ERP", "Siemens MES", "AWS IoT"]
    },

    developmentApproach: [
      { step: "Sensor Audit", description: "Catalogued and normalized data from 12,000 sensors across 9 facilities." },
      { step: "Streaming Pipeline", description: "Deployed Kafka pipeline processing 2M events/minute with < 100ms latency." },
      { step: "ML Models", description: "Trained equipment failure prediction models with 91% recall on holdout data." },
      { step: "Dashboard Delivery", description: "Deployed real-time OEE dashboards accessible on plant-floor tablets." }
    ],

    modules: [
      "Real-time Sensor Telemetry Dashboard",
      "Predictive Maintenance Alert System",
      "Production OEE Analytics",
      "Quality & Traceability Records",
      "Maintenance Work Order Integration"
    ],

    thirdPartyIntegrations: [
      { name: "SAP ERP", purpose: "Production order and inventory synchronization" },
      { name: "Siemens MES", purpose: "Factory floor execution system integration" },
      { name: "AWS IoT Core", purpose: "Secure device management and certificate provisioning" }
    ],

    securityControls: [
      "IoT Device Mutual TLS Authentication",
      "Network Segmentation (OT/IT Segregation)",
      "Role-Based Dashboard Access",
      "Encrypted Data Transit and Storage"
    ],

    complianceMeasures: [
      { requirement: "ISO 27001", approach: "Strict information security management protocols for OT systems." },
      { requirement: "IATF 16949", approach: "Full production traceability records for automotive OEM audits." }
    ],

    performance: [
      { metric: "Sensor Ingestion Rate", value: "2M events/minute" },
      { metric: "Failure Prediction Lead Time", value: "72 hours in advance" },
      { metric: "Dashboard Refresh Rate", value: "Real-time (< 1s)" }
    ],

    results: [
      { label: "Unplanned Downtime", impact: "Reduced by 62%" },
      { label: "Annual Savings", impact: "$11.2M in downtime costs recovered" },
      { label: "OEE Improvement", impact: "From 71% to 89%" }
    ],

    services: ["data-engineering", "machine-learning-engineering", "custom-erp-development"],
    relatedIndustries: ["logistics-supply-chain", "automotive"]
  },

  // ─── 07 RETAIL ───────────────────────────────────────────────────────────────
  {
    id: "CS-007",
    slug: "retail-omnichannel-scale",
    title: "Omnichannel Retail Platform with Real-Time Inventory Sync",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "retail",
    country: "United States",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1441986300917-64.webp",

    challenge: "A major US retail chain with 800+ stores and a growing e-commerce presence was experiencing chronic inventory discrepancies between digital and physical channels — leading to overselling, stockouts, and customer dissatisfaction. Their monolithic e-commerce platform routinely crashed during high-traffic events like Black Friday.",

    architecture: {
      description: "A headless commerce architecture with a decoupled inventory sync engine, a real-time product catalog, and a personalization layer — all supported by auto-scaling Kubernetes infrastructure.",
      components: [
        "Headless Commerce API Layer",
        "Real-time Inventory Sync Engine",
        "Product Catalog Microservice",
        "AI Personalization Engine",
        "Order Management System (OMS)",
        "Event-Driven Notifications"
      ]
    },

    technologies: {
      frontend: ["React", "Next.js", "TypeScript"],
      backend: ["Node.js", "Python", "FastAPI"],
      database: ["PostgreSQL", "Redis", "Elasticsearch"],
      cloud: ["AWS", "Kubernetes", "CloudFront", "SQS"],
      devops: ["GitHub Actions", "Terraform", "Helm"],
      ai: ["Recommendation Algorithms", "PyTorch"],
      integrations: ["Shopify", "Magento", "SAP", "POS Systems"]
    },

    developmentApproach: [
      { step: "Architecture Design", description: "Designed event-driven inventory sync using AWS SQS to decouple store POS from e-commerce." },
      { step: "Strangler Migration", description: "Migrated from monolithic Magento to headless commerce with zero downtime." },
      { step: "Personalization", description: "Deployed collaborative filtering recommendation engine serving real-time product suggestions." },
      { step: "Load Testing", description: "Validated platform at 500,000 concurrent users — 3x Black Friday peak." }
    ],

    modules: [
      "Omnichannel Inventory Engine",
      "Headless Storefront API",
      "AI Product Recommendation Engine",
      "Unified Order Management",
      "Customer Loyalty Program Engine",
      "Store-level Analytics Dashboard"
    ],

    thirdPartyIntegrations: [
      { name: "SAP S/4HANA", purpose: "ERP inventory and procurement synchronization" },
      { name: "Stripe", purpose: "Payment processing" },
      { name: "Salesforce Commerce Cloud", purpose: "Marketing and promotions" }
    ],

    securityControls: [
      "PCI DSS Level 1 Compliance",
      "OWASP Top 10 Hardening",
      "Encrypted Payment Token Storage",
      "API Rate Limiting & DDoS Protection"
    ],

    complianceMeasures: [
      { requirement: "PCI DSS v4.0", approach: "Tokenized payment processing with no raw card data storage." },
      { requirement: "CCPA", approach: "Consumer data deletion workflows and consent management." }
    ],

    performance: [
      { metric: "Inventory Sync Latency", value: "< 2 seconds from POS to online" },
      { metric: "Peak Load Tested", value: "500,000 concurrent users" },
      { metric: "Page Load Time", value: "< 1.2s (Core Web Vitals: Good)" }
    ],

    results: [
      { label: "Inventory Discrepancy", impact: "Reduced from 12% to 0.3%" },
      { label: "Black Friday Revenue", impact: "38% increase vs. prior year" },
      { label: "Cart Abandonment", impact: "Reduced by 22%" }
    ],

    services: ["ecommerce-platforms", "microservices-architecture", "business-intelligence"],
    relatedIndustries: ["e-commerce", "logistics-supply-chain"]
  },

  // ─── 08 E-COMMERCE ───────────────────────────────────────────────────────────
  {
    id: "CS-008",
    slug: "ecommerce-marketplace-launch",
    title: "B2B Marketplace Platform Launch for Industrial Procurement",
    client: "Confidential Enterprise Client",
    clientType: "Scale-up",
    industry: "e-commerce",
    country: "Singapore",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1557821552-17105.webp",

    challenge: "An industrial procurement startup needed to launch a B2B marketplace connecting 5,000+ suppliers to enterprise buyers across Southeast Asia — with complex multi-currency support, automated RFQ workflows, and enterprise-grade compliance — all within a 6-month timeline to market.",

    architecture: {
      description: "A multi-sided marketplace platform with separate buyer and seller portals, a centralized order orchestration service, automated RFQ workflows, and a real-time product catalog with Elasticsearch-powered search.",
      components: [
        "Buyer & Seller Portal (React SPA)",
        "Product Catalog Microservice",
        "RFQ & Quotation Engine",
        "Order Orchestration Service",
        "Multi-Currency Payment Gateway",
        "Analytics & Reporting Dashboard"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "Redux Toolkit"],
      backend: ["Python", "Django", "FastAPI"],
      database: ["PostgreSQL", "Redis", "Elasticsearch"],
      cloud: ["AWS", "Kubernetes", "S3", "SES"],
      devops: ["GitHub Actions", "Docker", "Terraform"],
      ai: [],
      integrations: ["Stripe Connect", "PayPal", "DHL API", "Xero"]
    },

    developmentApproach: [
      { step: "MVP Scoping", description: "Defined 12-week MVP scope with prioritized feature backlog." },
      { step: "Multi-tenancy", description: "Built isolated seller storefronts with custom domain support." },
      { step: "RFQ Engine", description: "Automated RFQ lifecycle from request to negotiated purchase order." },
      { step: "Launch & Scale", description: "Onboarded 500 suppliers in launch week with zero critical incidents." }
    ],

    modules: [
      "Supplier Onboarding & Verification",
      "Product Catalog & Bulk Listing",
      "RFQ / Quotation Workflow",
      "Order Management & Tracking",
      "Multi-Currency Invoicing",
      "Analytics Dashboard for Buyers & Sellers"
    ],

    thirdPartyIntegrations: [
      { name: "Stripe Connect", purpose: "Multi-party payment processing and marketplace payouts" },
      { name: "DHL API", purpose: "Shipping rate calculation and label generation" },
      { name: "Xero", purpose: "Automated accounting and invoice synchronization" }
    ],

    securityControls: [
      "PCI DSS Payment Processing Compliance",
      "Supplier Identity Verification",
      "API Key Management & Rate Limiting",
      "Encrypted Document Storage"
    ],

    complianceMeasures: [
      { requirement: "PDPA (Singapore)", approach: "Buyer/seller consent workflows and data localization." },
      { requirement: "GST/Tax Compliance", approach: "Automated cross-border tax calculation engine." }
    ],

    performance: [
      { metric: "Product Search Latency", value: "< 80ms p99" },
      { metric: "Order Processing", value: "< 500ms end-to-end" },
      { metric: "Uptime at Launch", value: "99.97%" }
    ],

    results: [
      { label: "Suppliers Onboarded", impact: "5,200 in 6 months" },
      { label: "GMV (Gross Merchandise Value)", impact: "$14M in first quarter" },
      { label: "Time to Market", impact: "Launched in 18 weeks" }
    ],

    services: ["ecommerce-platforms", "devops-cicd-automation", "saas-product-engineering"],
    relatedIndustries: ["retail", "logistics-supply-chain"]
  },

  // ─── 09 LOGISTICS & SUPPLY CHAIN ─────────────────────────────────────────────
  {
    id: "CS-009",
    slug: "logistics-fleet-optimization",
    title: "AI-Powered Fleet Optimization & Real-Time Tracking Platform",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "logistics-supply-chain",
    country: "Germany",
    category: "AI/ML Engineering",
    coverImage: "/webp_images/unsplash_1586528116311-ad.webp",

    challenge: "A leading European logistics provider with 8,000 vehicles was suffering from chronic delivery delays, inefficient routing, and rising fuel costs due to manual dispatch operations. Real-time fleet visibility was non-existent, and predictive maintenance was entirely reactive — resulting in costly roadside breakdowns.",

    architecture: {
      description: "An AI-powered logistics intelligence platform ingesting GPS telemetry, weather, and traffic data to generate optimal routes in real-time, while predicting vehicle maintenance needs before failures occur.",
      components: [
        "GPS Telemetry Ingestion Layer",
        "Real-time Route Optimization Engine",
        "Predictive Maintenance ML Models",
        "Dispatcher Operations Dashboard",
        "Driver Mobile Application (React Native)",
        "Automated Customs Documentation"
      ]
    },

    technologies: {
      frontend: ["React", "D3.js", "Mapbox GL"],
      backend: ["Python", "FastAPI", "Go"],
      database: ["TimescaleDB", "PostGIS", "Redis"],
      cloud: ["Google Cloud Platform", "Pub/Sub", "BigQuery"],
      devops: ["GitHub Actions", "Docker", "Terraform"],
      ai: ["TensorFlow", "scikit-learn", "Prophet", "OR-Tools"],
      integrations: ["SAP ERP", "Google Maps API", "TomTom Traffic"]
    },

    developmentApproach: [
      { step: "Data Engineering", description: "Built secure data lakes aggregating 3 years of historical logistics data." },
      { step: "Route Optimization", description: "Implemented Google OR-Tools based routing, updated every 5 minutes." },
      { step: "Predictive Maintenance", description: "Trained vehicle failure prediction models on 2M service records." },
      { step: "Mobile App", description: "Deployed React Native driver app with offline-first route navigation." }
    ],

    modules: [
      "Real-Time Fleet Tracking Map",
      "Dynamic Route Optimization",
      "Predictive Maintenance Alerts",
      "Automated Dispatch Assignment",
      "Driver Performance Analytics",
      "Customs & Documentation Automation"
    ],

    thirdPartyIntegrations: [
      { name: "SAP ERP", purpose: "Inventory and dispatch synchronization" },
      { name: "Google Maps Platform", purpose: "Geospatial routing and traffic" },
      { name: "TomTom Traffic", purpose: "Real-time traffic condition feeds" }
    ],

    securityControls: [
      "IoT Device Mutual TLS Authentication",
      "Driver Data Anonymization Pipeline",
      "GDPR-compliant Location Data Handling",
      "Network Segmentation"
    ],

    complianceMeasures: [
      { requirement: "GDPR", approach: "Driver location data anonymized after 30 days." },
      { requirement: "EU Road Transport Regulations", approach: "Automated Hours of Service (HoS) compliance tracking." }
    ],

    performance: [
      { metric: "Route Recalculation Speed", value: "< 500ms for 500+ vehicle fleet" },
      { metric: "Telemetry Ingestion", value: "5TB daily GPS data processed" },
      { metric: "Prediction Lead Time", value: "Failures predicted 48+ hours in advance" }
    ],

    results: [
      { label: "Fuel Cost", impact: "22% Reduction" },
      { label: "Maintenance Downtime", impact: "Reduced by 38%" },
      { label: "On-time Delivery Rate", impact: "From 74% to 96%" }
    ],

    services: ["logistics-supply-chain-tech", "data-engineering", "machine-learning-engineering"],
    relatedIndustries: ["manufacturing", "automotive"]
  },

  // ─── 10 REAL ESTATE ──────────────────────────────────────────────────────────
  {
    id: "CS-010",
    slug: "proptech-platform",
    title: "PropTech Property Management & Investment Analytics Platform",
    client: "Confidential Enterprise Client",
    clientType: "Scale-up",
    industry: "real-estate",
    country: "United Arab Emirates",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1560518883-ce090.webp",

    challenge: "A UAE-based real estate investment firm managing 12,000 residential units and $2.4B in assets was relying on disconnected spreadsheets for lease management, maintenance tracking, and investor reporting. Tenant onboarding took 3 weeks, and investors had no real-time visibility into portfolio performance.",

    architecture: {
      description: "A unified PropTech platform combining a tenant self-service portal, maintenance management workflows, automated valuation models, and an investor analytics dashboard — all built on a secure multi-tenant architecture.",
      components: [
        "Tenant Self-Service Portal",
        "Property Management Backend",
        "Automated Valuation Model (AVM)",
        "Investor Analytics Dashboard",
        "Document Management System",
        "Maintenance Workflow Engine"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "Recharts"],
      backend: ["Python", "Django", "FastAPI"],
      database: ["PostgreSQL", "Redis", "AWS S3"],
      cloud: ["AWS", "CloudFront", "Lambda"],
      devops: ["GitHub Actions", "Docker", "Terraform"],
      ai: ["scikit-learn", "Regression Models"],
      integrations: ["Stripe", "DocuSign", "Twilio", "Plaid"]
    },

    developmentApproach: [
      { step: "Data Migration", description: "Migrated 12,000 unit records from legacy spreadsheets with zero data loss." },
      { step: "Tenant Portal", description: "Built self-service portal covering lease signing, rent payment, and maintenance requests." },
      { step: "AVM Development", description: "Trained automated valuation model on 5-year Dubai transaction data." },
      { step: "Investor Dashboard", description: "Delivered real-time portfolio performance, NOI, and occupancy dashboards." }
    ],

    modules: [
      "Tenant Onboarding & Digital Lease Signing",
      "Online Rent Payment & Receipts",
      "Maintenance Request Tracking",
      "Automated Property Valuation",
      "Investor Portfolio Dashboard",
      "Expense & NOI Reporting"
    ],

    thirdPartyIntegrations: [
      { name: "DocuSign", purpose: "Digital lease agreement signing" },
      { name: "Stripe", purpose: "Automated rent collection and refunds" },
      { name: "Twilio", purpose: "Maintenance alert SMS notifications" }
    ],

    securityControls: [
      "End-to-End Encryption for Financial Data",
      "RBAC with Tenant/Manager/Owner Roles",
      "Document Watermarking",
      "SOC 2 Type I Infrastructure"
    ],

    complianceMeasures: [
      { requirement: "UAE PDPL (Personal Data Protection Law)", approach: "Consent management and data subject rights portal." },
      { requirement: "RERA Dubai", approach: "RERA-compliant lease templates and mandatory disclosure automation." }
    ],

    performance: [
      { metric: "Tenant Onboarding Time", value: "From 3 weeks to 24 hours" },
      { metric: "Dashboard Load Time", value: "< 1.5s with 12,000 units" },
      { metric: "System Availability", value: "99.95% uptime" }
    ],

    results: [
      { label: "Tenant Onboarding Time", impact: "Reduced by 93%" },
      { label: "Rent Collection Delays", impact: "Reduced by 71%" },
      { label: "Investor Reporting Time", impact: "From 4 days to Real-time" }
    ],

    services: ["enterprise-crm-solutions", "data-analytics", "custom-software-development"],
    relatedIndustries: ["banking", "professional-services"]
  },

  // ─── 11 CONSTRUCTION ─────────────────────────────────────────────────────────
  {
    id: "CS-011",
    slug: "construction-management-app",
    title: "Offline-First Construction Project Management & Safety Platform",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "construction",
    country: "Saudi Arabia",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1504307651254-35.webp",

    challenge: "A major GCC-based construction contractor managing $3B worth of infrastructure projects across 35 active sites faced critical challenges: field teams used WhatsApp for project communication, safety incidents went unreported for days, and resource allocation across sites was entirely manual. Many sites had limited or no internet connectivity.",

    architecture: {
      description: "An offline-first, mobile-first project management platform with field-to-office data sync, safety incident reporting, OSHA-compliant logging, and drone survey data integration.",
      components: [
        "React Native Mobile App (Offline-First)",
        "SQLite Local Data Store",
        "Background Sync Engine",
        "Project Management Web Dashboard",
        "Safety Incident Reporting Module",
        "Resource Allocation ERP"
      ]
    },

    technologies: {
      frontend: ["React Native", "TypeScript", "React Navigation"],
      backend: ["Python", "Django", "FastAPI"],
      database: ["PostgreSQL", "SQLite (mobile)", "Redis"],
      cloud: ["AWS", "S3", "Lambda", "EC2"],
      devops: ["GitHub Actions", "Docker", "Expo EAS"],
      ai: [],
      integrations: ["Autodesk BIM 360", "DJI Drone SDK", "Procore"]
    },

    developmentApproach: [
      { step: "Field Research", description: "Embedded with site teams across 5 projects to document actual workflows." },
      { step: "Offline Architecture", description: "Built conflict-free replicated data structures for offline-first sync." },
      { step: "Mobile App", description: "Developed iOS/Android app with camera-based incident reporting and BIM viewer." },
      { step: "Dashboard", description: "Built web dashboard for project managers with cross-site portfolio view." }
    ],

    modules: [
      "Daily Progress Reporting",
      "Safety Incident & Near-Miss Logging",
      "Resource & Equipment Allocation",
      "Subcontractor Management",
      "BIM Model Viewer (offline)",
      "Drone Survey Image Management"
    ],

    thirdPartyIntegrations: [
      { name: "Autodesk BIM 360", purpose: "BIM model access and markup on mobile" },
      { name: "DJI SDK", purpose: "Drone survey data ingestion and site mapping" },
      { name: "Procore", purpose: "RFI and submittal workflow integration" }
    ],

    securityControls: [
      "Device-level Encryption for Offline Data",
      "Role-Based Site Access Control",
      "Audit Log for All Safety Reports",
      "Biometric App Authentication"
    ],

    complianceMeasures: [
      { requirement: "OSHA Reporting", approach: "Automated OSHA 300/300A form generation from incident records." },
      { requirement: "Saudi Aramco HSEMS", approach: "Custom safety workflows aligned to client HSE Management System." }
    ],

    performance: [
      { metric: "Offline Capability", value: "Fully functional for 30+ days without connectivity" },
      { metric: "Sync Speed", value: "Full sync in < 45 seconds on reconnection" },
      { metric: "App Crash Rate", value: "< 0.1% across 2,000+ active devices" }
    ],

    results: [
      { label: "Safety Incident Reporting Time", impact: "From 3 days to Real-time" },
      { label: "Project Delay Reduction", impact: "27% fewer schedule overruns" },
      { label: "Resource Utilization", impact: "Improved by 34%" }
    ],

    services: ["cross-platform-mobile-applications", "custom-erp-development", "cloud-architecture-modernization"],
    relatedIndustries: ["real-estate", "manufacturing"]
  },

  // ─── 12 HOSPITALITY ──────────────────────────────────────────────────────────
  {
    id: "CS-012",
    slug: "hospitality-guest-platform",
    title: "Unified Guest Experience Platform for Luxury Hotel Group",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "hospitality",
    country: "Thailand",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1566073771259-6a.webp",

    challenge: "A Southeast Asian luxury hotel group operating 22 properties struggled with fragmented guest data across legacy PMS, separate loyalty systems, and disconnected dining and spa booking. Guests expected seamless digital-first experiences; the technology stack was delivering the opposite.",

    architecture: {
      description: "A unified guest experience layer integrating existing Opera PMS, loyalty, dining, and spa systems — delivered through a branded mobile app, a web concierge portal, and a real-time operational dashboard.",
      components: [
        "Guest Mobile App (React Native)",
        "Web Concierge Portal",
        "PMS Integration Adapter (Opera)",
        "Unified Guest Profile Store",
        "Dynamic Pricing & Availability Engine",
        "Loyalty Points Management"
      ]
    },

    technologies: {
      frontend: ["React Native", "React", "TypeScript"],
      backend: ["Python", "FastAPI", "Node.js"],
      database: ["PostgreSQL", "Redis", "MongoDB"],
      cloud: ["AWS", "CloudFront", "ElastiCache"],
      devops: ["GitHub Actions", "Docker", "Kubernetes"],
      ai: ["Recommendation Algorithms"],
      integrations: ["Opera PMS", "Stripe", "WhatsApp Business API", "Booking.com"]
    },

    developmentApproach: [
      { step: "PMS Integration", description: "Built secure API wrappers around legacy Opera PMS across all 22 properties." },
      { step: "Unified Profiles", description: "Merged fragmented guest data into a single golden record per guest." },
      { step: "Mobile App", description: "Developed branded iOS/Android guest app with digital key, dining reservations, and spa booking." },
      { step: "Dynamic Pricing", description: "Implemented ML-based pricing engine increasing RevPAR by 19%." }
    ],

    modules: [
      "Digital Room Key & Check-in",
      "In-App Dining & Spa Reservations",
      "Guest Messaging (WhatsApp/In-App)",
      "Loyalty Points & Redemption",
      "Real-time Housekeeping Status",
      "Revenue Management Dashboard"
    ],

    thirdPartyIntegrations: [
      { name: "Opera PMS", purpose: "Core reservation and billing system integration" },
      { name: "WhatsApp Business API", purpose: "Pre-arrival and in-stay guest messaging" },
      { name: "Stripe", purpose: "Secure in-app payment processing" }
    ],

    securityControls: [
      "PCI DSS Compliant Payment Handling",
      "Guest PII Encryption at Rest",
      "RBAC for Hotel Operations Staff",
      "Secure API Gateway with Rate Limiting"
    ],

    complianceMeasures: [
      { requirement: "PDPA (Thailand)", approach: "Guest consent management and data retention automation." },
      { requirement: "PCI DSS", approach: "Tokenized card storage with no raw card data on platform." }
    ],

    performance: [
      { metric: "Mobile App Rating", value: "4.8★ (15,000+ reviews)" },
      { metric: "Check-in Time", value: "Reduced from 8 minutes to 90 seconds" },
      { metric: "API Availability", value: "99.99% SLA across all properties" }
    ],

    results: [
      { label: "Guest Satisfaction (NPS)", impact: "+38 Points" },
      { label: "RevPAR", impact: "Increased 19% through dynamic pricing" },
      { label: "Direct Booking Revenue", impact: "41% increase, reducing OTA dependency" }
    ],

    services: ["rest-api-development-integrations", "enterprise-application-engineering", "data-analytics"],
    relatedIndustries: ["travel", "retail"]
  },

  // ─── 13 TRAVEL ───────────────────────────────────────────────────────────────
  {
    id: "CS-013",
    slug: "travel-booking-engine",
    title: "High-Performance Multi-Modal Travel Booking Engine",
    client: "Confidential Enterprise Client",
    clientType: "Scale-up",
    industry: "travel",
    country: "India",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1436491865332-7a.webp",

    challenge: "An Indian online travel agency needed to rebuild its legacy booking engine that was timing out under moderate load, showing stale availability, and offering no personalization. The system queried Global Distribution Systems (GDS) synchronously, creating 8-12 second search latencies that drove users to competitors.",

    architecture: {
      description: "A high-performance, async travel search platform with intelligent caching of GDS responses, a personalization recommendation engine, and a real-time pricing service — all designed to deliver search results in under 1 second.",
      components: [
        "Async GDS Query Aggregator",
        "Intelligent Availability Cache (Redis)",
        "Dynamic Pricing Microservice",
        "Personalization Recommendation Engine",
        "Booking Orchestration Service",
        "Multi-currency Payment Gateway"
      ]
    },

    technologies: {
      frontend: ["React", "Next.js", "TypeScript"],
      backend: ["Go", "Python", "FastAPI"],
      database: ["PostgreSQL", "Redis", "Elasticsearch"],
      cloud: ["AWS", "ElastiCache", "CloudFront"],
      devops: ["GitHub Actions", "Docker", "Kubernetes", "Terraform"],
      ai: ["Collaborative Filtering", "Price Prediction Models"],
      integrations: ["Amadeus GDS", "Sabre GDS", "Stripe", "Razorpay"]
    },

    developmentApproach: [
      { step: "GDS Integration", description: "Built async parallel query layer across Amadeus and Sabre with intelligent response merging." },
      { step: "Caching Strategy", description: "Implemented multi-tier Redis caching reducing GDS calls by 73%." },
      { step: "Search Engine", description: "Built Elasticsearch-powered faceted search with sub-100ms filter response." },
      { step: "Personalization", description: "Deployed ML recommendation engine boosting ancillary revenue by 34%." }
    ],

    modules: [
      "Flight & Hotel Search Engine",
      "Real-time Price Tracking & Alerts",
      "AI-Powered Travel Recommendations",
      "Booking & PNR Management",
      "Itinerary Builder",
      "Corporate Travel Policy Compliance Engine"
    ],

    thirdPartyIntegrations: [
      { name: "Amadeus GDS", purpose: "Flight availability and booking" },
      { name: "Sabre GDS", purpose: "Hotel and car rental inventory" },
      { name: "Razorpay", purpose: "India-market payment processing" }
    ],

    securityControls: [
      "PCI DSS Compliant Payment Flow",
      "PNR Data Encryption",
      "API Authentication with JWT & Refresh Tokens",
      "Fraud Scoring on Booking Transactions"
    ],

    complianceMeasures: [
      { requirement: "IATA NDC", approach: "New Distribution Capability (NDC) API compliance for airline retailing." },
      { requirement: "IT Act 2000 (India)", approach: "Localized data storage and breach notification workflows." }
    ],

    performance: [
      { metric: "Search Response Time", value: "< 900ms p95 (down from 10s)" },
      { metric: "GDS Cost Reduction", value: "73% fewer live queries via caching" },
      { metric: "Concurrent Users at Peak", value: "180,000 simultaneous" }
    ],

    results: [
      { label: "Search-to-Booking Conversion", impact: "Improved by 41%" },
      { label: "Infrastructure Cost", impact: "Reduced by 45%" },
      { label: "Customer Retention", impact: "Repeat bookings up 28%" }
    ],

    services: ["rest-api-development-integrations", "machine-learning-engineering", "cloud-architecture-modernization"],
    relatedIndustries: ["hospitality", "e-commerce"]
  },

  // ─── 14 AUTOMOTIVE ───────────────────────────────────────────────────────────
  {
    id: "CS-014",
    slug: "automotive-telematics-platform",
    title: "Connected Vehicle Telematics & Dealership Intelligence Platform",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "automotive",
    country: "Japan",
    category: "Data Engineering",
    coverImage: "/webp_images/unsplash_1492144534655-ae.webp",

    challenge: "A major Japanese automotive OEM was collecting telematics data from 4 million connected vehicles but had no infrastructure to process it at scale. Dealership networks operated on disconnected CRM and inventory systems, preventing cross-selling and proactive service outreach. Vehicle recall alerts took weeks to reach owners.",

    architecture: {
      description: "A high-throughput IoT telematics platform ingesting real-time vehicle data from 4M connected cars, combined with a unified dealership CRM and intelligence layer for proactive service and sales orchestration.",
      components: [
        "Vehicle Telemetry Ingestion Gateway",
        "Apache Kafka Streaming Layer",
        "Predictive Service Recommendation Engine",
        "Unified Dealership CRM",
        "Recall & Campaign Notification Engine",
        "Owner Mobile Application"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "D3.js"],
      backend: ["Python", "FastAPI", "Java"],
      database: ["Kafka", "PostgreSQL", "InfluxDB", "Redis"],
      cloud: ["AWS IoT Core", "Kinesis", "Lambda", "RDS"],
      devops: ["Jenkins", "Terraform", "Docker"],
      ai: ["TensorFlow", "Anomaly Detection Models"],
      integrations: ["Salesforce", "Twilio", "CARIAD (VW Automotive Cloud)"]
    },

    developmentApproach: [
      { step: "IoT Ingestion", description: "Built Kafka pipeline processing 80M telematics events per day at < 200ms latency." },
      { step: "Predictive Models", description: "Trained service recommendation models on 3 years of warranty claims data." },
      { step: "CRM Unification", description: "Unified 2,400 dealership accounts into a single CRM with centralized lead management." },
      { step: "Recall Engine", description: "Deployed recall notification engine reaching all affected owners within 4 hours." }
    ],

    modules: [
      "Real-time Vehicle Health Monitoring",
      "Predictive Service Scheduling",
      "Unified Dealership CRM",
      "Owner Mobile App & Notifications",
      "Recall & Campaign Management",
      "Fleet Intelligence Dashboard"
    ],

    thirdPartyIntegrations: [
      { name: "Salesforce", purpose: "Dealership CRM integration and lead synchronization" },
      { name: "Twilio", purpose: "Owner SMS and voice recall notifications" },
      { name: "HERE Maps", purpose: "Geofencing and dealer proximity routing" }
    ],

    securityControls: [
      "Vehicle Data Anonymization (GDPR)",
      "Mutual TLS for Vehicle-to-Cloud Communication",
      "RBAC for Dealership vs. OEM Data Access",
      "HSM-based Certificate Management"
    ],

    complianceMeasures: [
      { requirement: "GDPR", approach: "Vehicle location and behavior data anonymized and consent-gated." },
      { requirement: "UN-R155 (Automotive Cybersecurity)", approach: "Penetration testing and CSMS framework implemented." }
    ],

    performance: [
      { metric: "Telemetry Events Processed", value: "80M events/day" },
      { metric: "Recall Notification Speed", value: "100% of owners reached in < 4 hours" },
      { metric: "Pipeline Latency", value: "< 200ms from vehicle to dashboard" }
    ],

    results: [
      { label: "Service Revenue per Vehicle", impact: "Increased by 31%" },
      { label: "Recall Response Rate", impact: "Improved from 34% to 89%" },
      { label: "Dealership Lead Conversion", impact: "Up 44%" }
    ],

    services: ["data-engineering", "enterprise-crm-solutions", "artificial-intelligence-solutions"],
    relatedIndustries: ["manufacturing", "logistics-supply-chain"]
  },

  // ─── 15 TELECOMMUNICATIONS ───────────────────────────────────────────────────
  {
    id: "CS-015",
    slug: "telecom-billing-modernization",
    title: "5G-Ready Microservices Billing Platform for National Telco",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "telecommunications",
    country: "Brazil",
    category: "Cloud Modernization",
    coverImage: "/webp_images/unsplash_1588600878108-57.webp",

    challenge: "Brazil's second-largest mobile operator was locked into a 20-year-old monolithic billing system incapable of supporting 5G micro-transaction billing models. The system processed nightly batch billing runs with a 16-hour window, making real-time charging impossible. Subscriber churn was accelerating due to billing errors and poor self-service tooling.",

    architecture: {
      description: "A cloud-native, event-driven charging and billing platform built on microservices, capable of real-time online charging (OCS), offline billing (OFCS), and supporting the operator's 5G standalone rollout.",
      components: [
        "Online Charging System (OCS)",
        "Mediation & Rating Engine",
        "Invoice Generation Microservice",
        "Subscriber Self-Service Portal",
        "AI Churn Prediction Service",
        "Regulatory Reporting Module"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "Redux"],
      backend: ["Java", "Spring Boot", "Python"],
      database: ["PostgreSQL", "Cassandra", "Redis", "Snowflake"],
      cloud: ["AWS", "Kubernetes", "Kafka"],
      devops: ["GitLab CI", "Terraform", "Helm", "ArgoCD"],
      ai: ["scikit-learn", "Churn Prediction Models"],
      integrations: ["3GPP Diameter Protocol", "Salesforce", "ANATEL Regulatory API"]
    },

    developmentApproach: [
      { step: "Strangler Migration", description: "Decomposed monolith into 23 bounded microservices over 18 months." },
      { step: "Real-time Charging", description: "Implemented 3GPP Diameter-compliant online charging with < 50ms decision latency." },
      { step: "Data Lake", description: "Built CDR (Call Detail Record) data lake for compliance and BI." },
      { step: "Self-Service Portal", description: "Launched subscriber portal reducing call centre volume by 38%." }
    ],

    modules: [
      "Real-time Online Charging (OCS)",
      "Mediation & CDR Processing",
      "Invoice & Statement Generation",
      "Subscriber Self-Service Portal",
      "AI Churn Prediction Engine",
      "ANATEL Regulatory Reporting"
    ],

    thirdPartyIntegrations: [
      { name: "3GPP Diameter", purpose: "Real-time network charging protocol" },
      { name: "Salesforce", purpose: "Customer account and plan management" },
      { name: "ANATEL API", purpose: "Brazilian telecom regulatory reporting" }
    ],

    securityControls: [
      "LGPD (Brazil GDPR) Compliant Data Handling",
      "CDR Encrypted Storage (WORM)",
      "API Gateway with OAuth 2.0",
      "SIEM-based Threat Monitoring"
    ],

    complianceMeasures: [
      { requirement: "LGPD", approach: "Data subject rights portal and automated consent management." },
      { requirement: "ANATEL Resolution 740", approach: "Automated monthly CDR submission and QoS reporting." }
    ],

    performance: [
      { metric: "Charging Decision Latency", value: "< 50ms p99" },
      { metric: "CDRs Processed", value: "2 Billion per day" },
      { metric: "Billing Run Time", value: "From 16-hour batch to real-time" }
    ],

    results: [
      { label: "Billing Errors", impact: "Reduced by 94%" },
      { label: "Subscriber Churn", impact: "Reduced by 18% in 12 months" },
      { label: "Call Centre Volume", impact: "Down 38% via self-service portal" }
    ],

    services: ["microservices-architecture", "data-engineering", "cloud-architecture-modernization"],
    relatedIndustries: ["banking", "government"]
  },

  // ─── 16 PROFESSIONAL SERVICES ─────────────────────────────────────────────────
  {
    id: "CS-016",
    slug: "consulting-erp-platform",
    title: "Integrated Resource & Practice Management ERP for Global Consultancy",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "professional-services",
    country: "Netherlands",
    category: "Custom Software Development",
    coverImage: "/webp_images/unsplash_1454165804606-c3.webp",

    challenge: "A 2,000-person management consulting firm across 12 European offices was managing consultant utilization, billing, and project delivery through a patchwork of spreadsheets and generic project tools. Sub-optimal resource deployment was costing an estimated €8M in lost billable hours annually. Client billing disputes were frequent due to lack of granular timesheet transparency.",

    architecture: {
      description: "A purpose-built consulting operations platform unifying resource allocation, time tracking, project delivery, client billing, and financial reporting — with a secure client portal for real-time engagement transparency.",
      components: [
        "Resource Allocation & Capacity Engine",
        "Project & Delivery Management Module",
        "Timesheet & Expense Management",
        "Automated Billing & Invoicing",
        "Client Portal (Secure)",
        "Practice Analytics Dashboard"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "Recharts", "TanStack Table"],
      backend: ["Python", "Django", "FastAPI"],
      database: ["PostgreSQL", "Redis"],
      cloud: ["AWS", "S3", "CloudFront", "RDS"],
      devops: ["GitHub Actions", "Docker", "Terraform"],
      ai: ["Resource Optimization Algorithms"],
      integrations: ["Xero", "Salesforce", "Microsoft Teams", "DocuSign"]
    },

    developmentApproach: [
      { step: "Process Workshop", description: "Ran 6-week discovery with 14 practice leads across all offices." },
      { step: "Resource Engine", description: "Built constraint-based resource matching algorithm across skills, availability, and client conflicts." },
      { step: "Billing Automation", description: "Automated time-to-invoice cycle, reducing billing cycle from 21 days to 3 days." },
      { step: "Client Portal", description: "Delivered secure client portal with real-time project status and approved spend view." }
    ],

    modules: [
      "Consultant Skills & Availability Registry",
      "Project Staffing & Conflict Detection",
      "Timesheet & Expense Submission",
      "Automated SOW Billing",
      "Client Engagement Portal",
      "Practice Performance Analytics"
    ],

    thirdPartyIntegrations: [
      { name: "Xero", purpose: "Automated invoice generation and financial sync" },
      { name: "Salesforce", purpose: "Opportunity-to-project pipeline integration" },
      { name: "Microsoft Teams", purpose: "Project room notifications and approvals" }
    ],

    securityControls: [
      "Client Data Segregation per Engagement",
      "End-to-End Encryption for Confidential Documents",
      "ISO 27001 Infrastructure",
      "Multi-Factor Authentication (MFA)"
    ],

    complianceMeasures: [
      { requirement: "GDPR", approach: "Consultant and client PII handled under DPA frameworks." },
      { requirement: "Financial Reporting (IFRS 15)", approach: "Revenue recognition workflows aligned to milestone-based contracts." }
    ],

    performance: [
      { metric: "Resource Matching Speed", value: "< 3 seconds for 2,000 consultants" },
      { metric: "Billing Cycle Time", value: "From 21 days to 3 days" },
      { metric: "Dashboard Load", value: "< 1s for full portfolio view" }
    ],

    results: [
      { label: "Billable Utilization", impact: "Increased from 67% to 82%" },
      { label: "Annual Revenue Recovery", impact: "€6.2M additional billable hours captured" },
      { label: "Billing Disputes", impact: "Reduced by 91%" }
    ],

    services: ["custom-erp-development", "saas-product-engineering", "robotic-process-automation"],
    relatedIndustries: ["banking", "government"]
  },

  // ─── 17 GOVERNMENT / PUBLIC SECTOR ────────────────────────────────────────────
  {
    id: "CS-017",
    slug: "government-digital-modernization",
    title: "Accessible Digital Citizen Services Portal & Mainframe Migration",
    client: "Confidential Government Client",
    clientType: "Enterprise",
    industry: "government",
    country: "Canada",
    category: "Cloud Modernization",
    coverImage: "/webp_images/unsplash_1529107386315-e1.webp",

    challenge: "A Canadian federal agency operating 14 critical citizen-facing services on IBM mainframe infrastructure from the 1990s faced increasing public criticism over slow, inaccessible digital services. Services required in-person visits for processes that should have been online. The aging COBOL codebase had no developers available for maintenance.",

    architecture: {
      description: "A phased mainframe-to-cloud migration using an API strangler pattern — wrapping existing COBOL services behind modern APIs while progressively replacing them with cloud-native services — all delivered through an accessible, bilingual citizen portal.",
      components: [
        "COBOL API Wrapper Layer",
        "Cloud-Native Service Replacements",
        "Bilingual Citizen Portal (React)",
        "Identity Verification Service",
        "Case Management System",
        "Accessibility (WCAG 2.1 AA) Engine"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "GC Design System"],
      backend: ["Python", "FastAPI", "Java (COBOL Bridge)"],
      database: ["PostgreSQL", "AWS Aurora", "DynamoDB"],
      cloud: ["AWS GovCloud", "Kubernetes", "CloudFront"],
      devops: ["GitHub Actions", "Terraform", "AWS CodePipeline"],
      ai: [],
      integrations: ["Canada Post API", "CRA (Revenue Agency) API", "GCKey Identity Provider"]
    },

    developmentApproach: [
      { step: "COBOL Audit", description: "Reverse-engineered 2.3M lines of COBOL to document business rules." },
      { step: "API Strangler", description: "Wrapped legacy services with REST APIs enabling incremental replacement." },
      { step: "Accessibility", description: "Built all interfaces to WCAG 2.1 AA with bilingual (EN/FR) support from day one." },
      { step: "Phased Migration", description: "Migrated 14 services over 24 months with zero citizen-facing downtime." }
    ],

    modules: [
      "Citizen Account & Identity Portal",
      "Online Benefits Applications",
      "Document Upload & Verification",
      "Case Status Tracking",
      "Bilingual Accessibility Interface",
      "Agency Case Worker Dashboard"
    ],

    thirdPartyIntegrations: [
      { name: "GCKey", purpose: "Government of Canada identity and authentication provider" },
      { name: "Canada Post", purpose: "Address verification and correspondence tracking" },
      { name: "CRA API", purpose: "Tax record and income verification" }
    ],

    securityControls: [
      "FedRAMP/PBMM (Protected B) Cloud Controls",
      "Zero Trust Network Architecture",
      "MFA with GCKey Identity Provider",
      "End-to-End Encryption (TLS 1.3)",
      "Automated SIEM-based Threat Detection"
    ],

    complianceMeasures: [
      { requirement: "PIPEDA (Canada Privacy Act)", approach: "Consent-based data collection with automated retention expiry." },
      { requirement: "WCAG 2.1 AA", approach: "Third-party accessibility audit completed prior to each service launch." },
      { requirement: "Treasury Board of Canada Secretariat", approach: "Full compliance with TBS Directive on Service and Digital." }
    ],

    performance: [
      { metric: "Page Accessibility Score", value: "WCAG 2.1 AA — 100%" },
      { metric: "Service Availability", value: "99.99% for all 14 services" },
      { metric: "Average Service Completion Time", value: "From 3 weeks (in-person) to 12 minutes (online)" }
    ],

    results: [
      { label: "In-person Service Visits", impact: "Reduced by 78%" },
      { label: "Citizen Satisfaction", impact: "Government survey score up from 42% to 81%" },
      { label: "Legacy Maintenance Cost", impact: "Reduced by $9.4M annually" }
    ],

    services: ["legacy-system-modernization", "cloud-migration", "ui-ux-engineering"],
    relatedIndustries: ["healthcare", "education"]
  },

  // ─── 18 STARTUPS ─────────────────────────────────────────────────────────────
  {
    id: "CS-018",
    slug: "startup-saas-scale",
    title: "Enterprise-Ready SaaS Platform from MVP to Series B Scale",
    client: "Confidential Startup Client",
    clientType: "Startup",
    industry: "startups",
    country: "United States",
    category: "SaaS Product Engineering",
    coverImage: "/webp_images/unsplash_1559136555-9303b.webp",

    challenge: "An early-stage B2B SaaS startup in the HR-tech space had successfully validated their product with 40 paying customers but faced a critical inflection point: their MVP codebase — built for speed — was buckling under growth, their security posture wasn't enterprise-ready for Fortune 500 procurement reviews, and they had 6 months of runway to close a Series B.",

    architecture: {
      description: "A full architectural overhaul from a monolithic MVP to a scalable, SOC 2-ready multi-tenant SaaS platform — without disrupting existing customers — while simultaneously delivering the enterprise features required to close key enterprise deals.",
      components: [
        "Multi-tenant Application Core",
        "Enterprise SSO (SAML/OIDC)",
        "Role-Based Permissions Engine",
        "Audit Log & Compliance Module",
        "Usage Analytics & Metering",
        "Admin & Billing Management Console"
      ]
    },

    technologies: {
      frontend: ["React", "TypeScript", "Radix UI"],
      backend: ["Python", "FastAPI", "Celery"],
      database: ["PostgreSQL", "Redis", "Elasticsearch"],
      cloud: ["AWS", "ECS Fargate", "RDS", "S3"],
      devops: ["GitHub Actions", "Terraform", "Datadog"],
      ai: ["OpenAI API", "LangChain"],
      integrations: ["Okta SAML", "Stripe", "Segment", "Intercom"]
    },

    developmentApproach: [
      { step: "Architecture Review", description: "Comprehensive audit of existing codebase with technical debt scoring." },
      { step: "Multi-tenancy Migration", description: "Zero-downtime migration from single-tenant to row-level multi-tenant architecture." },
      { step: "Enterprise Features", description: "Delivered SSO, audit logs, RBAC, and custom data retention in 8 weeks." },
      { step: "SOC 2 Readiness", description: "Implemented controls framework achieving SOC 2 Type II readiness in 4 months." }
    ],

    modules: [
      "Multi-tenant Data Isolation",
      "Enterprise SSO (SAML 2.0 / OIDC)",
      "Granular RBAC Permissions",
      "Immutable Audit Logging",
      "API Key & Webhook Management",
      "Usage Metering & Stripe Billing"
    ],

    thirdPartyIntegrations: [
      { name: "Okta", purpose: "Enterprise SAML SSO authentication" },
      { name: "Stripe", purpose: "Subscription billing, usage metering, and invoicing" },
      { name: "Segment", purpose: "Product analytics and customer data platform" }
    ],

    securityControls: [
      "SOC 2 Type II Controls Framework",
      "RBAC with Attribute-Level Permissions",
      "Immutable Audit Logs (WORM Storage)",
      "Automated OWASP Top 10 Scanning",
      "Customer Data Encryption (AES-256)"
    ],

    complianceMeasures: [
      { requirement: "SOC 2 Type II", approach: "Full controls implementation across Security, Availability, and Confidentiality trust principles." },
      { requirement: "GDPR / CCPA", approach: "Data processing agreements, right-to-erasure workflows, and consent management." }
    ],

    performance: [
      { metric: "API Response Time", value: "< 120ms p95" },
      { metric: "Multi-tenant Isolation", value: "Zero cross-tenant data access in security audit" },
      { metric: "Uptime SLA", value: "99.9% (enterprise contractual)" }
    ],

    results: [
      { label: "Series B Closed", impact: "$24M raised within 5 months of engagement" },
      { label: "Enterprise Customers Won", impact: "12 Fortune 500 deals closed post-SOC 2" },
      { label: "MRR Growth", impact: "3.8x in 9 months" }
    ],

    services: ["saas-product-engineering", "custom-software-development", "devops-cicd-automation"],
    relatedIndustries: ["financial-services", "education"]
  }
];
