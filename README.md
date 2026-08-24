# Aurexion Technologies

Enterprise Software Solutions & Digital Transformation Platform

Aurexion Technologies is an enterprise software and digital transformation platform designed to provide a modern public-facing website together with business management, prospect engagement, client support, content management, careers, and administrative capabilities.

The platform is built with a production-oriented architecture including a Django backend, REST APIs, PostgreSQL persistence, authentication and role-based access control, background processing, security controls, automated testing, and a modern frontend application.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Key Capabilities](#key-capabilities)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [Repository Structure](#repository-structure)
* [Backend](#backend)
* [Frontend](#frontend)
* [Core Modules](#core-modules)
* [Authentication & RBAC](#authentication--rbac)
* [Database](#database)
* [API Documentation](#api-documentation)
* [Security](#security)
* [Testing & Quality Assurance](#testing--quality-assurance)
* [Code Quality](#code-quality)
* [Performance Testing](#performance-testing)
* [Docker](#docker)
* [Environment Configuration](#environment-configuration)
* [Project Documentation](#project-documentation)
* [Engineering Principles](#engineering-principles)
* [Deployment](#deployment)
* [License](#license)

---

## Project Overview

Aurexion Technologies combines enterprise technology services with operational business workflows.

The platform supports:

* Dynamic corporate website
* Service and industry management
* Case studies and knowledge content
* Project estimation
* RFP submission and document handling
* Lead and CRM management
* Client portal
* Support ticket management
* Careers and candidate management
* Administrative control center
* Authentication and authorization
* Role-based access control
* Audit logging
* Background processing
* API-based application integration

The project is designed around real backend processing and persistent data rather than frontend-only demonstrations.

---

## Key Capabilities

### Corporate Website

Provides public-facing enterprise content including:

* Services
* Industries
* Case studies
* Careers
* Knowledge and insights
* Contact and engagement
* Legal content

### Project Estimator

Provides project requirement and scope estimation based on submitted requirements.

### RFP Engine

Supports:

* RFP submission
* Requirement validation
* Document attachments
* NDA indication
* Reference generation
* Persistent RFP records

### CRM

Provides lead-management functionality including:

* Lead creation
* Lead lifecycle management
* Assignment
* Follow-ups
* Notes
* Filtering
* Lead status management
* Export functionality

### Client Portal

Provides authenticated client capabilities for:

* Project tracking
* Client interactions
* Support requests
* Authorized access to client-specific information

### Support

Provides support ticket workflows including:

* Ticket creation
* Priority management
* Status management
* Resolution tracking
* Client visibility

### Careers / ATS

Provides:

* Job listings
* Candidate applications
* Resume uploads
* Candidate tracking
* HR review workflows

### CMS

Provides database-backed content management for services, industries, case studies, blogs, categories, tags, and related content.

### Administration

Provides centralized administration for authorized users and administrators, including:

* Users
* CMS
* Leads
* RFPs
* Support
* Careers
* Files
* Reports
* Settings
* Audit records

---

## Technology Stack

### Backend

* Python
* Django
* Django REST Framework
* Django ORM
* PostgreSQL
* Redis
* Celery
* Gunicorn

### Frontend

* Modern web frontend
* HTML5
* CSS3
* JavaScript
* Responsive UI architecture

### Infrastructure

* Docker
* Docker Compose
* NGINX
* Vercel
* Render

### Testing & Quality

* Pytest
* Django testing
* API testing
* SonarQube
* Ruff
* Black
* OWASP ZAP

---

## System Architecture

The platform follows a layered architecture:

```text
                    ┌─────────────────────────┐
                    │     Web / Clients       │
                    │  Browser / API Clients  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Security / Gateway  │
                    │     HTTPS / NGINX       │
                    │ Rate Limiting / Gateway │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Django Backend     │
                    │       REST APIs         │
                    │ Authentication / RBAC   │
                    │ Business Logic          │
                    └───────┬─────────┬───────┘
                            │         │
                 ┌──────────┘         └──────────┐
                 ▼                               ▼
       ┌──────────────────┐             ┌──────────────────┐
       │    PostgreSQL    │             │   Redis / Celery │
       │   Persistent DB  │             │ Background Tasks │
       └──────────────────┘             └──────────────────┘
```

### Request Flow

```text
Client
  ↓
HTTPS
  ↓
NGINX / Gateway
  ↓
Django / DRF
  ↓
Authentication
  ↓
Authorization / RBAC
  ↓
Validation
  ↓
Business Logic
  ↓
PostgreSQL
  ↓
Response
```

Asynchronous operations can be delegated to Redis/Celery where appropriate.

---

## Repository Structure

```text
Aurexion/
│
├── .github/
│   └── workflows/
│
├── backend/
│   ├── media/
│   │   └── rfps/
│   ├── scripts/
│   ├── src/
│   ├── tests/
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── conftest.py
│   ├── industry_relations.json
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── schema.yml
│
├── docs/
│   ├── ADMINISTRATION/
│   ├── ER_DIAGRAM/
│   ├── API_DOCUMENTATION.md
│   ├── api_verification_report.md
│   ├── ARCHITECTURE.md
│   ├── AUTHENTICATION_DASHBOARD_INTEGRATION_FIX_REPORT.md
│   ├── AUTHENTICATION_INTEGRATION_ROOT_CAUSE.md
│   ├── BDM.md
│   ├── CLIENT_PORTAL.md
│   ├── CRM.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── Cache_Performance_E2E_Report.xlsx
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── webp_images/
│   ├── .env.development
│   ├── .env.example
│   ├── .env.production
│   ├── AUDIT_REPORT.md
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── LICENSE
├── README.md
├── docker-compose.yml
├── sonar-project.properties
└── vercel.json
```

---

# Backend

The backend is implemented using Django and Django REST Framework.

Backend responsibilities include:

* REST API development
* Authentication
* Authorization
* RBAC
* Business logic
* Database operations
* CRM workflows
* RFP workflows
* Client portal operations
* Support workflows
* Careers and candidate operations
* File handling
* Audit logging
* Background processing
* API validation
* Automated testing

### Backend Entry Point

```text
backend/manage.py
```

### Dependencies

Backend dependencies are maintained in:

```text
backend/requirements.txt
```

### Tests

Backend tests are maintained under:

```text
backend/tests/
```

---

# Frontend

The frontend is maintained separately under:

```text
frontend/
```

The frontend provides:

* Public website experience
* Authenticated interfaces
* Administrative interfaces
* CRM interfaces
* Client-facing workflows
* Responsive UI
* API integration

Frontend-specific development information is available in:

```text
frontend/README.md
```

---

# Core Modules

The major Aurexion business modules include:

| Module         | Purpose                                            |
| -------------- | -------------------------------------------------- |
| Authentication | User authentication and identity management        |
| RBAC           | Role and permission enforcement                    |
| CMS            | Dynamic website and content management             |
| Services       | Enterprise service management                      |
| Industries     | Industry-specific solutions                        |
| Case Studies   | Technical case study management                    |
| Estimator      | Project requirement estimation                     |
| RFP            | RFP submission and processing                      |
| CRM            | Lead lifecycle and business-development management |
| Client Portal  | Authenticated client operations                    |
| Support        | Support ticket management                          |
| Careers / ATS  | Job and candidate management                       |
| Files          | Controlled file handling                           |
| Audit          | System and security activity tracking              |
| Administration | Centralized platform administration                |

---

# Authentication & RBAC

Aurexion uses backend-enforced authentication and authorization.

The platform defines role categories including:

* Super Administrator
* Administrator
* Business Development Manager
* BDM
* Sales Executive
* HR Manager
* IT Manager
* Support Executive
* Client User

Authorization is enforced on protected backend operations.

The frontend UI must not be treated as a security boundary.

### Security requirements

Protected operations should:

1. Authenticate the requesting user.
2. Verify the user's role and permissions.
3. Validate resource ownership where required.
4. Prevent horizontal privilege escalation.
5. Prevent vertical privilege escalation.
6. Return appropriate authentication or authorization errors.

---

# Database

PostgreSQL is used as the primary relational database.

Major data domains include:

* Users and roles
* Permissions
* Employees
* Audit logs
* Services
* Industries
* Case studies
* Blogs and knowledge content
* Estimator submissions
* RFPs
* Leads
* Lead activities
* Clients
* Projects
* Support tickets
* Jobs
* Candidates
* Files
* System settings

The database design and ER documentation are available under:

```text
docs/DATABASE.md
docs/ER_DIAGRAM/
```

---

# API Documentation

API documentation is maintained under:

```text
docs/API_DOCUMENTATION.md
```

The backend also provides the API schema through:

```text
backend/schema.yml
```

API verification information is available in:

```text
docs/api_verification_report.md
```

API behavior includes validation, authentication, authorization, persistence, filtering, appropriate HTTP status codes, and structured error handling.

---

# Security

Security is treated as a core part of the platform.

The project follows security practices including:

* Server-side authentication
* Server-side authorization
* RBAC
* Secure password handling
* Environment-based secrets
* HTTPS in production
* CSRF protection where applicable
* ORM/parameterized database operations
* File upload validation
* Controlled file access
* Audit logging
* Rate limiting
* Security testing
* OWASP-aligned security practices

### Security Testing

OWASP ZAP can be used for dynamic security testing of running web/API applications.

SonarQube is used for static code analysis and code-quality assessment.

---

# Testing & Quality Assurance

Testing is performed across multiple levels.

### Unit Testing

Tests core application logic including:

* Models
* Serializers
* Services
* Business logic
* Permissions
* Utilities

### Integration Testing

Tests:

* Database interactions
* Module-to-module workflows
* Authentication flows
* Authorization flows
* Background processing where applicable

### API Testing

API testing covers:

* Successful requests
* Validation failures
* Authentication
* Authorization
* Status codes
* Filtering
* Persistence
* Error handling

### Security Testing

Security testing includes checks related to:

* Authentication
* Authorization
* Privilege escalation
* Authorization bypass
* CSRF
* XSS
* SQL injection
* File upload security

### Regression Testing

Previously fixed defects and critical workflows should be re-tested after major changes.

---

# Code Quality

The project follows established software engineering principles and uses automated quality tools.

### Black

Python code formatter used to maintain consistent Python formatting.

### Ruff

Python linter and formatter used to identify:

* Bugs
* Import issues
* Style issues
* Code-quality problems

### SonarQube

Used for static analysis and code-quality assessment, including:

* Bugs
* Vulnerabilities
* Code smells
* Maintainability issues

### OWASP ZAP

Used for dynamic application security testing against running web/API applications.

---

# Performance Testing

Performance is an important non-functional requirement of the Aurexion platform.

The target is:

* Cached responses: below **200 ms**
* Normal dynamic responses: below **500 ms**

### Performance Test Note

> **Performance testing has been performed in localhost as well as in the deployed environments using Vercel + Render. The proof/results of the performance tests are available at:**
>
> `docs/Cache_Performance_E2E_Report.xlsx`

The performance report should be used as the reference for the recorded end-to-end performance test results.

---

# Docker

Docker configuration is available at the repository root.

### Docker Compose

```text
docker-compose.yml
```

### Backend Dockerfile

```text
backend/Dockerfile
```

Docker can be used to provide a consistent development and deployment environment.

---

# Environment Configuration

Environment-specific configuration should not be hardcoded into the application.

Example configuration files are provided for development and production environments.

Backend:

```text
backend/.env.example
```

Frontend:

```text
frontend/.env.example
frontend/.env.development
frontend/.env.production
```

Sensitive values such as:

* Secret keys
* Database credentials
* API keys
* Authentication secrets
* External service credentials

must not be committed to the repository.

---

# Project Documentation

Detailed project documentation is maintained under:

```text
docs/
```

Important documents include:

| Document                                             | Description                                |
| ---------------------------------------------------- | ------------------------------------------ |
| `ARCHITECTURE.md`                                    | System architecture                        |
| `DATABASE.md`                                        | Database documentation                     |
| `API_DOCUMENTATION.md`                               | API documentation                          |
| `BDM.md`                                             | BDM module documentation                   |
| `CRM.md`                                             | CRM module documentation                   |
| `CLIENT_PORTAL.md`                                   | Client portal documentation                |
| `DEPLOYMENT.md`                                      | Deployment documentation                   |
| `api_verification_report.md`                         | API verification results                   |
| `AUTHENTICATION_INTEGRATION_ROOT_CAUSE.md`           | Authentication integration analysis        |
| `AUTHENTICATION_DASHBOARD_INTEGRATION_FIX_REPORT.md` | Authentication/dashboard integration fixes |
| `Cache_Performance_E2E_Report.xlsx`                  | Performance test evidence                  |

Additional administration and ER-diagram documentation is available in:

```text
docs/ADMINISTRATION/
docs/ER_DIAGRAM/
```

---

# Engineering Principles

Aurexion development follows these engineering principles.

### DRY — Don't Repeat Yourself

Avoid duplicated business logic, utilities, configuration, and unnecessary repeated implementations.

### KISS — Keep It Simple

Prefer simple, readable, maintainable solutions over unnecessary complexity.

### SOLID

Follow appropriate SOLID principles to maintain clear responsibilities and extensible code.

### Separation of Concerns

Keep responsibilities separated between:

```text
API / Views
    ↓
Validation
    ↓
Business Logic
    ↓
Data Access
    ↓
Database
```

### Secure by Default

Protected operations must enforce authentication and authorization on the backend.

### Fail Fast

Invalid input and invalid application states should be detected as early as possible.

### Defensive Programming

Client input, uploaded files, IDs, and external data must be validated before processing.

### Database Integrity

Use appropriate:

* Constraints
* Transactions
* Indexes
* Query optimization
* Relationship rules

### Testability

Business-critical functionality should be covered by appropriate automated tests.

### Observability

Important application and security events should be traceable through appropriate logging and audit mechanisms.

---

# Deployment

The project supports separate development and production configurations.

The production architecture follows the general flow:

```text
User
  ↓
HTTPS
  ↓
NGINX / Gateway
  ↓
Gunicorn
  ↓
Django
  ↓
PostgreSQL
```

Background processing:

```text
Django
  ↓
Redis
  ↓
Celery Worker
  ↓
Background Task
```

Deployment-specific information is available in:

```text
docs/DEPLOYMENT.md
```

---

# Development Guidelines

Before submitting changes:

1. Follow the existing project architecture.
2. Avoid duplicated business logic.
3. Validate user input.
4. Enforce authorization on protected operations.
5. Add or update appropriate tests.
6. Check database/query performance where relevant.
7. Run code-quality checks.
8. Review security implications.
9. Update relevant documentation.
10. Verify that existing functionality has not regressed.

---

# Project Status

Aurexion is being developed as a production-oriented enterprise platform with backend functionality, frontend integration, authentication/RBAC, business modules, testing, security validation, performance testing, and deployment configuration.

Critical and high-severity defects should be resolved before final acceptance.

---

# License

This project is proprietary and confidential.

Copyright © Aurexion Technologies.

Unauthorized copying, distribution, modification, or commercial use is prohibited unless explicitly authorized.
