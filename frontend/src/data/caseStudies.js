export const caseStudiesData = [
  {
    id: "CS-001",
    slug: "enterprise-platform-modernization",
    title: "Legacy Infrastructure Modernization for Global Banking",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "banking",
    country: "United States",
    category: "Cloud Modernization",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",

    challenge: "The client operated on a highly fragmented, 15-year-old monolithic legacy architecture. The system struggled to handle peak transaction volumes, suffered from localized outages, and posed significant security vulnerabilities due to outdated technology stacks. Regulatory compliance was increasingly difficult to maintain.",

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

    services: ["cloud-modernization", "custom-software-development", "cybersecurity"],
    relatedIndustries: ["financial-services", "insurance"]
  },
  {
    id: "CS-002",
    slug: "ai-driven-supply-chain-optimization",
    title: "Predictive Analytics Engine for Global Logistics",
    client: "Confidential Enterprise Client",
    clientType: "Scale-up",
    industry: "logistics-supply-chain",
    country: "Germany",
    category: "AI/ML Engineering",
    coverImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",

    challenge: "The logistics provider faced chronic delays and massive operational overhead due to manual routing, unpredictable fleet maintenance, and lack of real-time supply chain visibility across international borders.",

    architecture: {
      description: "An AI-powered data processing pipeline capable of ingesting IoT telemetry data, weather patterns, and historical transit times to generate real-time predictive routing.",
      components: [
        "IoT Telemetry Ingestion Layer",
        "Stream Processing Engine",
        "Machine Learning Inference Models",
        "Real-time Visualization Dashboard",
        "Automated Dispatch API"
      ]
    },

    technologies: {
      frontend: ["Vue.js", "D3.js"],
      backend: ["Python", "FastAPI", "Go"],
      database: ["TimescaleDB", "Elasticsearch"],
      cloud: ["Google Cloud Platform", "Pub/Sub"],
      devops: ["GitHub Actions", "Docker"],
      ai: ["TensorFlow", "scikit-learn", "Prophet"],
      integrations: ["Google Maps API", "SAP ERP"]
    },

    developmentApproach: [
      { step: "Data Engineering", description: "Built secure data lakes to aggregate siloed historical logistics data." },
      { step: "Model Training", description: "Developed proprietary ML models for route optimization and predictive maintenance." },
      { step: "Integration", description: "Exposed predictions via low-latency gRPC APIs to existing dispatch systems." }
    ],

    modules: [
      "Dynamic Route Optimization",
      "Predictive Fleet Maintenance",
      "Real-time Cargo Tracking",
      "Automated Customs Documentation"
    ],

    thirdPartyIntegrations: [
      { name: "SAP ERP", purpose: "Inventory and dispatch synchronization" },
      { name: "Google Maps", purpose: "Geospatial routing calculations" }
    ],

    securityControls: [
      "IoT Device Mutual TLS Authentication",
      "Data Anonymization Pipeline",
      "Network Segmentation"
    ],

    complianceMeasures: [
      { requirement: "ISO 27001", approach: "Strict information security management protocols." }
    ],

    performance: [
      { metric: "Prediction Latency", value: "< 200ms" },
      { metric: "Data Ingestion", value: "5TB daily telemetry data" }
    ],

    results: [
      { label: "Route Efficiency", impact: "22% Improvement" },
      { label: "Maintenance Downtime", impact: "30% Reduction" },
      { label: "Carbon Emissions", impact: "15% Decrease" }
    ],

    services: ["ai-ml-engineering", "data-engineering"],
    relatedIndustries: ["manufacturing", "automotive"]
  },
  {
    id: "CS-003",
    slug: "secure-telehealth-platform-architecture",
    title: "Scalable Telehealth Infrastructure Engineering",
    client: "Confidential Enterprise Client",
    clientType: "Enterprise",
    industry: "healthcare",
    country: "United Kingdom",
    category: "Custom Software Development",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",

    challenge: "The healthcare network urgently required a highly secure, scalable telehealth platform capable of handling millions of simultaneous video consultations while strictly adhering to complex regional health data regulations and preventing unauthorized access.",

    architecture: {
      description: "A HIPAA/GDPR-compliant WebRTC streaming architecture decoupled from the core electronic health record (EHR) system via a secure interoperability layer.",
      components: [
        "WebRTC Media Servers",
        "HL7/FHIR Integration Layer",
        "Secure Video Consultation SPA",
        "Provider Scheduling Engine",
        "Audit & Compliance Logging"
      ]
    },

    technologies: {
      frontend: ["React", "WebRTC", "Tailwind CSS"],
      backend: ["Node.js", "NestJS", "Socket.io"],
      database: ["PostgreSQL", "Redis"],
      cloud: ["Microsoft Azure", "Azure Kubernetes Service"],
      devops: ["Azure DevOps", "Terraform"],
      ai: [],
      integrations: ["Epic EHR", "Twilio Video"]
    },

    developmentApproach: [
      { step: "Compliance Review", description: "Initial phase dedicated entirely to security and regulatory architecture mapping." },
      { step: "Core Engineering", description: "Development of the real-time signaling servers and secure media relays." },
      { step: "EHR Integration", description: "Building robust bidirectional HL7 interfaces for patient data." },
      { step: "Load Testing", description: "Simulating 100,000+ concurrent sessions to validate infrastructure." }
    ],

    modules: [
      "Encrypted Video Conferencing",
      "Virtual Waiting Rooms",
      "EHR Synchronization",
      "E-Prescription Gateway"
    ],

    thirdPartyIntegrations: [
      { name: "Epic", purpose: "Electronic Health Record (EHR) integration" },
      { name: "Twilio", purpose: "Fallback SMS and voice capabilities" }
    ],

    securityControls: [
      "End-to-End Encryption (E2EE)",
      "Strict Role-Based Access Control (RBAC)",
      "Immutable Audit Logs (Blockchain-backed)",
      "Multi-Factor Authentication (MFA)",
      "Zero Trust Architecture"
    ],

    complianceMeasures: [
      { requirement: "HIPAA", approach: "Business Associate Agreements (BAA) and PHI isolation." },
      { requirement: "GDPR / NHS Data Security", approach: "UK-bound data residency and processing." }
    ],

    performance: [
      { metric: "Video Latency", value: "< 150ms global average" },
      { metric: "Concurrent Sessions", value: "Tested to 50,000+" }
    ],

    results: [
      { label: "Patient Access", impact: "Increased by 300%" },
      { label: "Security Breaches", impact: "Zero incidents" },
      { label: "System Adoption", impact: "85% Provider usage" }
    ],

    services: ["custom-software-development", "cybersecurity"],
    relatedIndustries: ["insurance", "government-public-sector"]
  }
];

