# AGENTS.md — Aurexion Technologies Enterprise Platform

> **Document status:** Production Engineering Operating Standard  
> **Source of truth:** HPE Project Requirement Document `HPE-PRD-2026-AUR01 / VER-2.0-FINAL`  
> **Project:** Aurexion Technologies Business Operations & Client Platform  
> **Review Authority:** HPE Team (Hewlett Packard Enterprise)  
> **Development Partner:** VPD Technologies Pvt. Ltd.  
> **Classification:** Proprietary & Confidential  
>
> This file converts the approved PRD into operational instructions for coding agents and engineering automation. The PRD remains authoritative. If an instruction in this file conflicts with the PRD, the PRD takes precedence and the conflict must be surfaced rather than silently resolved.

---

## 1. Mission

You are an engineering agent working on a **critical enterprise software platform**, not a static corporate website.

The system must be a real, database-backed, secure, testable Django/DRF application with:

- Python 3.11+
- Django 4.2+ LTS
- Django REST Framework 3.14+
- PostgreSQL 15+
- Redis 7.x
- Celery 5.x
- REST/OpenAPI APIs
- Django templates / HTML5 / CSS3 / modern ES6+
- Tailwind CSS or Bootstrap 5
- HTMX for dynamic partials where appropriate
- React 18+ only for isolated complex widgets
- Gunicorn behind Nginx
- HTTPS/TLS 1.3
- container-ready deployment

The implementation must demonstrate actual backend execution, PostgreSQL persistence, asynchronous processing, RBAC, audit logging, API functionality, and complete administrative operations.

**Do not optimize for appearance at the expense of real functionality.**

---

# 2. Non-Negotiable Rules

These rules apply to every coding-agent task.

## 2.1 Technology rules

### MUST

- Use Python 3.11+.
- Use Django 4.2+ LTS for the core application.
- Use Django REST Framework 3.14+ for REST APIs.
- Use PostgreSQL 15+ as the relational database.
- Use Redis 7.x for caching and as the Celery broker.
- Use Celery 5.x for asynchronous jobs.
- Use Django ORM for application database access.
- Use RESTful API design and JSON payloads.
- Document APIs with OpenAPI/Swagger, using `drf-spectacular` or the approved equivalent.
- Run Django through Gunicorn behind Nginx.
- Use HTTPS/TLS 1.3 in the deployed architecture.

### MAY

- Use FastAPI **only for isolated microservices**.
- Use React 18+ **only for isolated complex widgets**, such as:
  - Interactive Requirement Estimator
  - Client Portal Dashboard
- Use HTMX for dynamic partial-page interactions.
- Use Tailwind CSS or Bootstrap 5 for UI implementation.

### MUST NOT

- Replace Django/Python with Node.js, PHP, Java, or another backend stack.
- Convert the entire application into a React SPA.
- Introduce a second backend framework without a justified isolated microservice requirement.
- Replace PostgreSQL with SQLite, MongoDB, MySQL, or another primary relational database.
- Replace Redis/Celery with an unapproved queue architecture.

---

# 3. Source-of-Truth and Requirement Discipline

Before implementing a feature:

1. Identify the corresponding PRD requirement.
2. Identify the affected module(s).
3. Identify the data model(s).
4. Identify API and permission requirements.
5. Identify security implications.
6. Identify asynchronous work, if applicable.
7. Identify tests required.
8. Identify documentation required.
9. Verify that the implementation does not introduce a PRD rejection trigger.

When requirements are ambiguous:

- Do not invent business rules silently.
- Preserve the terminology used by the PRD.
- Prefer the explicit PRD requirement over generic framework conventions.
- Mark unresolved assumptions in documentation or task notes.
- Ask for clarification when an implementation decision could materially alter acceptance behavior.

---

# 4. Core Architecture

Use a layered, modular architecture.

Expected logical layers:

```text
Client
  |
  | HTTPS / TLS 1.3
  v
Nginx / Security Gateway
  - SSL termination
  - rate limiting
  - security headers / gateway controls
  |
  v
Gunicorn
  |
  v
Django Application
  |
  +--> Django Views / DRF API Controllers
  |
  +--> Business Logic
  |
  +--> PostgreSQL
  |
  +--> Redis
          |
          v
       Celery Workers
```

Maintain clear separation between:

- presentation
- HTTP/API handling
- business logic
- persistence
- asynchronous processing
- authentication/authorization
- audit logging
- infrastructure configuration

Avoid placing complex business rules directly inside templates.

---

# 5. Repository Structure

The repository should follow the approved structure:

```text
aurexion-platform/
├── .github/
│   ├── workflows/
│   └── pull_request_template.md
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── security/
│   ├── testing/
│   └── deployment/
├── src/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── cms/
│   │   ├── crm/
│   │   ├── portal/
│   │   └── recruitment/
│   ├── config/
│   ├── static/
│   └── templates/
├── .env.example
├── .gitignore
├── Dockerfile
├── manage.py
├── README.md
└── requirements.txt
```

Agents may add supporting modules when required, but must preserve the modular separation and avoid creating an unstructured monolithic app.

---

# 6. Django Application Boundaries

## `authentication`

Own:

- custom authentication
- users
- roles
- permissions
- login controls
- authentication security
- RBAC enforcement
- authentication-related audit events

## `cms`

Own:

- Services
- Industry Solutions
- Case Studies
- Blog / Knowledge Center
- publishing states
- CMS relationships
- SEO-related content metadata

## `crm`

Own:

- RFPs
- Estimator submissions
- Lead records
- lead lifecycle
- lead assignments
- notes
- follow-ups
- contact/engagement intake

## `portal`

Own:

- client accounts / client-facing access
- client dashboard
- project tracking
- document vault
- support tickets
- consultation scheduling
- client notifications

## `recruitment`

Own:

- job vacancies
- public job board
- candidate applications
- resume uploads
- ATS stages
- HR review notes

Do not place unrelated domain logic into a generic catch-all application.

---

# 7. Database Standards

PostgreSQL is mandatory.

## 7.1 Normalization

Design the database using normalized relational principles, targeting **3NF**.

Use:

- foreign keys
- explicit relationships
- unique constraints
- check constraints where appropriate
- indexes for lookup/search fields
- appropriate nullability
- database migrations

Do not duplicate relational data merely to simplify templates.

## 7.2 Required relationships

Preserve the PRD relationships:

```text
User 1 ---- N AuditLog
User 1 ---- N LeadNote
Client User 1 ---- N SupportTicket
Category 1 ---- N BlogPost
Service N ---- M Industry
Service N ---- M CaseStudy
JobVacancy 1 ---- N CandidateApplication
RFPEnquiry 1 ---- 1 LeadRecord
```

Use explicit junction models where required for many-to-many relationships, such as:

- `ServiceIndustry`
- `ServiceCaseStudy`

## 7.3 Query performance

Every database-backed feature must be reviewed for:

- N+1 queries
- missing indexes
- excessive queries
- unnecessary serialization work
- inefficient filtering
- unbounded result sets

Use:

- `select_related()` for appropriate foreign-key / one-to-one relationships.
- `prefetch_related()` for appropriate many-to-many / reverse relationships.
- indexes on foreign keys and search fields as required.
- pagination for large collections.

**Zero N+1 query problems are acceptable.**

---

# 8. Migration Rules

Every schema change must be represented by a Django migration.

MUST:

- create migrations for model changes
- review generated migrations
- ensure migrations apply cleanly from a fresh database
- ensure migrations are reversible where practical
- include migration validation in CI/testing

MUST NOT:

- modify production schema manually without a corresponding migration
- commit a model change without its migration
- use destructive migration behavior without explicit review

---

# 9. Authentication

Use Django's authentication framework.

Password storage must use:

- PBKDF2 or Argon2 through Django authentication.

Password policy:

- minimum 10 characters
- symbols required
- numbers required

Login security:

- maximum 5 failed login attempts before lock/throttle behavior
- implement appropriate login throttling

Do not implement authentication only through frontend state, JavaScript, route hiding, or CSS.

---

# 10. RBAC — Mandatory Backend Enforcement

RBAC is a security control, not a UI feature.

Permissions MUST be enforced at:

1. backend REST API level
2. Django view level
3. object/data-access level where applicable

Frontend hiding is insufficient.

## Required roles

### Super Admin

Full system access:

- all CRUD
- roles
- security settings
- audit logs

### Administrator

Operational access to:

- content
- leads
- tickets
- user accounts

Must not modify system security configuration.

### Business Development Manager (BDM)

Full access to:

- Lead CRM
- RFP submissions
- Estimator entries
- Client accounts

Read-only CMS access.

### Sales Executive

Restricted to assigned leads and client contact forms.

Can:

- update lead status
- add notes

### HR Manager

Full access to:

- Careers
- Job Vacancies
- Candidate Applications
- Resume downloads

### Content Manager

Full access to:

- Services CMS
- Industry Solutions
- Case Studies
- Blog / Knowledge Center

Must not access financial or lead data.

### Support Executive

Access limited to:

- Support Tickets
- Client Ticket Communications

Must not access sales or HR modules.

### Client User

Access only to:

- personal client portal dashboard
- own project status
- linked documents
- own support tickets

## RBAC implementation rule

For every protected endpoint/view, ask:

```text
Who is allowed?
What operation is allowed?
Which records are allowed?
What happens when the user is unauthorized?
```

Return appropriate HTTP authorization responses rather than silently exposing data.

---

# 11. Audit Logging

Every critical administrative and operational transaction must produce an immutable `AuditLog` record.

Required audit fields:

```text
user
action
module
object_id
repr
previous_state
updated_state
ip_address
user_agent
timestamp
```

Required action types include:

- CREATE
- UPDATE
- DELETE
- LOGIN_SUCCESS
- LOGIN_FAILURE
- EXPORT
- TICKET_CLOSE

The audit log must capture:

- who performed the action
- what module was affected
- which object was affected
- previous state where applicable
- resulting state
- origin IP
- browser user-agent
- UTC timestamp

Audit logging is security-sensitive. Do not provide ordinary users with unrestricted ability to modify or delete audit records.

Where asynchronous ingestion is used, use Celery/Redis as specified by the architecture while preserving the required audit semantics.

---

# 12. Security Rules

The security requirements are mandatory.

## 12.1 Secrets

Never commit:

- Django `SECRET_KEY`
- database passwords
- API keys
- private tokens
- production credentials
- confidential database URIs

Use environment variables.

Provide:

```text
.env.example
```

The example file may contain placeholder values only.

## 12.2 HTTPS

Production traffic must use HTTPS.

Architecture requires:

- TLS 1.3
- Nginx SSL termination
- secure transport
- appropriate security headers

## 12.3 CSRF

Use Django's built-in CSRF middleware for form POST operations.

Do not disable CSRF protection merely to make an endpoint work.

## 12.4 SQL Injection

Use Django ORM parameterization.

Do not construct SQL using unsafe string interpolation.

If raw SQL is genuinely required:

- parameterize values
- document the reason
- review the query for injection risk
- test it

## 12.5 XSS

Use Django's automatic HTML escaping.

Treat rich HTML content as untrusted unless it is intentionally sanitized and controlled.

Do not render arbitrary user input as trusted HTML.

## 12.6 API authentication

Use Token/JWT authentication for protected API endpoints as required.

Public endpoints must remain intentionally public only where the PRD says they are public.

## 12.7 Rate limits

Implement the PRD limits:

- public forms: **60 requests/minute**
- authenticated users: **1000 requests/minute**

Apply stricter endpoint-specific protection when needed for security, without weakening the required baseline.

## 12.8 CORS

Use strict origin restrictions.

Do not configure unrestricted CORS such as `*` for protected production APIs.

---

# 13. File Upload Security

File uploads are security-sensitive.

For RFP attachments:

- allowed types: PDF, DOCX, ZIP
- maximum size: 10 MB
- validate extension
- validate MIME type
- sanitize storage paths

For candidate resumes:

- allowed types: PDF, DOCX
- maximum size: 5 MB
- validate extension
- validate MIME type
- sanitize storage paths

Never trust:

- client-provided filename
- extension alone
- MIME type alone
- user-controlled storage paths

Never allow uploaded content to become executable server code.

---

# 14. Public Website Requirements

The public application must be dynamically driven by PostgreSQL-backed Django models.

Mandatory structural areas include:

- Home
- About & Overview
- Why Choose Us
- Services & Solutions
- Industries
- Case Studies / Portfolio
- Careers & Insights
- Engagement & Contact
- Legal & Utilities

The public site must support:

- dynamic content
- responsive UI
- SEO
- forms
- search/filtering where specified
- error handlers
- sitemap
- legal pages

## Absolute prohibition

Do not implement database-backed requirements as static HTML pages.

---

# 15. Services CMS

Service pages must be dynamically backed by a Service model.

Required attributes include:

```text
title
slug
short_description
detailed_description
business_problem
solution_approach
tech_stack
seo_title
seo_desc
is_featured
status
```

Rules:

- `slug` must uniquely identify the service.
- `short_description` is required and capped at 300 characters.
- service publishing must support Draft / Published / Archived.
- SEO metadata must be stored dynamically.
- service pages must be database-driven.

Example routing:

```text
/services/python-development/
```

Do not hardcode service records into templates.

---

# 16. Industry Solutions Engine

Support the PRD's target verticals, including:

- Banking / Financial Services
- Insurance
- Healthcare
- Education
- Manufacturing
- Retail
- Ecommerce
- Logistics & Supply Chain
- Real Estate
- Construction
- Hospitality
- Travel
- Automotive
- Telecommunications
- Professional Services
- Government / Public Sector
- Startups

Industry pages must dynamically aggregate:

- industry challenges
- target solutions
- associated services
- sector case studies

Use relational database relationships rather than copied content.

---

# 17. Case Studies

Case studies must communicate technical engineering narratives, not generic marketing copy.

The model should support:

### Client/context

- title
- client_industry
- client_type
- country

### Technical narrative

- business_challenge
- proposed_architecture
- tech_stack_used
- development_approach

### Execution

- modules_developed
- third_party_integrations
- security_controls

### Results

- performance_gains
- business_outcomes
- metrics_json

Do not disclose restricted/confidential client information.

Avoid invented claims presented as real client facts.

Development builds may use realistic sample/mock data as permitted by the PRD.

---

# 18. Interactive Requirement Estimator

The estimator must support:

### Project Scope

- Web App
- Mobile App
- Enterprise Software
- ERP
- CRM
- AI/ML Platform
- Cloud Migration
- SaaS

### Platform & Scale

- Multi-tenant SaaS
- Internal Enterprise Tool
- Consumer Facing
- Cross-platform Mobile

### User Scale & Integrations

Examples include:

- `<1k`
- `10k+`
- `100k+`
- complex third-party API requirements

### Security & Support

- SOC2
- HIPAA
- GDPR
- 24/7 SLA tiers

The estimator must:

1. calculate estimated engineering effort
2. calculate an indicative budget range
3. collect user details on completion
4. persist an `EstimatorSubmission`
5. trigger internal BDM notification
6. display the required disclaimer:

> "This estimate represents a preliminary requirement assessment and does not constitute a binding legal proposal."

Do not present a preliminary estimate as a legally binding proposal.

---

# 19. RFP Engine

The RFP engine is a real enterprise lead intake workflow.

## Required fields

- `full_name`
- `company_name`
- `work_email`
- `phone`
- `designation`
- `country`
- `project_type`
- `budget_range`
- `project_description`
- `document_attachment`
- `nda_required`

## Validation

- names/company: maximum 150 characters
- email: email validation
- phone: phone-format validation
- designation/country: maximum 100 characters where specified
- country should come from the database country model
- project description: minimum 50 characters
- attachment:
  - PDF/DOCX/ZIP
  - max 10 MB
  - extension validation
  - MIME validation
  - safe storage path

## Submission transaction

After a successful database transaction:

- generate a unique immutable reference
- format:

```text
AUR-RFP-YYYY-XXXXX
```

- email the reference to the client
- index/unify the enquiry in Lead Management

Do not send a fake success response before persistence succeeds.

---

# 20. Lead CRM

All incoming engagement sources must be unified into the database-backed Lead CRM.

Sources include:

- RFP
- Estimator
- Consultation
- Contact forms

The following is explicitly non-compliant:

> Simply emailing forms to an inbox.

## Lead lifecycle

```text
NEW
  ↓
UNDER REVIEW
  ↓
CONTACTED
  ↓
QUALIFIED
  ↓
PROPOSAL SUBMITTED
  ↓
NEGOTIATION
  ↓
WON / LOST
```

Required capabilities:

- assignment
- activity notes/history
- call logs
- email thread history where applicable
- status updates
- follow-up reminders
- administrative email alerts
- filtering
- date-range filtering
- source filtering
- CSV/Excel export

Every sensitive operation must respect RBAC and audit logging.

---

# 21. Client Portal

The portal must be authenticated.

Required areas:

## Dashboard

Display:

- active engagements
- project milestones
- recent ticket statuses
- unread notifications

## Project Tracker

Provide a read-only timeline of:

- project status
- completed sprint deliverables
- upcoming milestones

## Document Vault

Secure access to:

- project requirements
- architecture diagrams
- SOWs
- reports

## Support Tickets

Clients can:

- create support issues
- view their tickets
- track ticket status

## Consultation

Clients can:

- request technical review meetings
- track upcoming meetings
- track status calls

Do not allow a client to access another client's records.

---

# 22. Support Ticket System

Required fields:

```text
ticket_id
client_user
category
priority
status
resolution_notes
```

Ticket identifier example:

```text
TKT-2026-0891
```

Categories:

- Bug
- Enhancement
- Security
- Infrastructure
- General

Priorities:

- Low
- Medium
- High
- Critical

Statuses:

```text
Open
  ↓
Assigned
  ↓
In Progress
  ↓
Awaiting Client
  ↓
Resolved
  ↓
Closed
```

`resolution_notes` are mandatory before closure.

Ticket closure must generate an audit event.

---

# 23. Careers / ATS

## Job Vacancy CMS

Admin must manage:

- Job ID
- Title
- Department
- Location
- Experience
- Skills
- Responsibilities
- Status

Status:

- Active
- Closed

## Public Job Board

Support:

- department filtering
- location filtering
- experience filtering
- keyword search
- full job descriptions

## Candidate Application

Required:

- multi-field application form
- resume upload
- PDF/DOCX only
- max 5 MB

Generate a tracking code such as:

```text
AUR-APP-8812
```

## ATS

Application stages:

```text
Received
  ↓
Shortlisted
  ↓
Interviewed
  ↓
Offered
  ↓
Rejected
```

HR must be able to:

- filter applicants
- download resumes
- update stage
- add internal review notes

All HR access must be RBAC protected.

---

# 24. Blog / Knowledge Center

Support:

- hierarchical categories
- free-form tags
- rich media
- author attribution
- publication timestamps
- Draft
- Published
- Scheduled
- Archived
- custom meta title
- meta description
- focus keywords
- automatic slugs
- XML sitemap updates
- full-text search across titles/bodies
- related post suggestions

The blog must be database-backed.

Do not use static article JSON as the production CMS.

---

# 25. Admin Control Center

The admin area must be a functional enterprise control center.

It must not simply expose default Django admin aesthetics as the entire product.

Required KPI areas include:

- Total Leads
- Unassigned RFPs
- Active Client Accounts
- Open Tickets
- Pending Job Applications
- Monthly Traffic Statistics

Required CRUD/navigation areas:

- Users
- RBAC Roles
- Service CMS
- Case Studies
- Industry Pages
- Lead CRM
- RFPs
- Support Tickets
- Careers
- Blog Posts
- System Settings

Also provide:

- searchable audit events
- login/security events
- data update events
- security alerts

---

# 26. API Standards

Use Django REST Framework.

APIs must be:

- RESTful
- versioned where specified
- validated
- permission-protected
- documented
- consistent in status codes
- backed by real database operations

## Mandatory endpoints

### Services

```http
GET /api/v1/services/
```

Public.

Purpose:

- list published services
- filtering
- search

### Estimator

```http
POST /api/v1/estimator/calculate/
```

Public.

Purpose:

- process requirement payload
- return estimate
- log inquiry

### RFP

```http
POST /api/v1/rfp/submit/
```

Public.

Purpose:

- validate submission
- validate attachment
- persist RFP
- return reference ID

### Leads

```http
GET  /api/v1/leads/
POST /api/v1/leads/
PUT  /api/v1/leads/
```

Staff / BDM protected.

Purpose:

- Lead CRM CRUD
- status/priority filtering

### Client Tickets

```http
GET  /api/v1/client/tickets/
POST /api/v1/client/tickets/
```

Authenticated client.

Purpose:

- retrieve client tickets
- create support issues

### Careers

```http
POST /api/v1/careers/apply/
```

Public.

Purpose:

- candidate application
- resume upload

### API documentation

```http
GET /api/v1/docs/
```

Swagger / OpenAPI interface.

---

# 27. API Status Code Discipline

At minimum, test and correctly use:

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `404 Not Found`

Do not return `200` for failed validation or unauthorized access merely to simplify frontend handling.

---

# 28. Asynchronous Processing

Long-running operations must not block normal HTTP requests.

Target HTTP response performance is:

- cached responses: under 200ms TTFB
- dynamic DB-driven pages: under 500ms TTFB

Use Celery + Redis for:

## Email

- RFP receipt acknowledgments
- candidate confirmations
- support ticket updates
- follow-up alerts

## Document generation

- cost estimation PDF summaries
- RFP exports

## Audit processing

- asynchronous audit ingestion where appropriate

## Cache invalidation

Invalidate relevant service/blog caches after CMS updates.

Do not perform expensive PDF generation or non-critical email processing synchronously inside the request path if it can be delegated to Celery.

---

# 29. Caching

Redis is the caching layer.

Use caching deliberately for appropriate read-heavy content.

When content changes, invalidate the affected cache.

At minimum, the PRD explicitly requires automated clearing of cached service and blog responses after backend CMS updates.

Do not allow stale published content to persist indefinitely after a CMS update.

---

# 30. Performance Engineering

Every feature must be reviewed against the PRD performance requirements.

## Required targets

- cached TTFB: `<200ms`
- dynamic DB-driven page TTFB: `<500ms`
- zero N+1 query problems
- indexed lookup/search fields
- optimized ORM access
- optimized assets

## Asset optimization

Use:

- WebP images
- lazy loading for non-critical media
- CSS/JS bundling
- minification

## Query checklist

Before considering a DB-backed feature complete:

- [ ] Query count inspected where appropriate
- [ ] No N+1 pattern
- [ ] `select_related()` evaluated
- [ ] `prefetch_related()` evaluated
- [ ] filtering fields indexed where appropriate
- [ ] pagination added to potentially large lists
- [ ] unnecessary columns/work avoided where practical

---

# 31. Frontend and Responsive UI

Use semantic HTML5.

Required semantic structure includes:

```html
<header>
<nav>
<main>
<footer>
```

Responsive targets:

| Device | Width | Requirement |
|---|---:|---|
| Large Desktop | 1440px+ | Multi-column layouts, rich tables, dashboard metrics |
| Laptop | 1024–1439px | Responsive grids and readable tables |
| Tablet | 768–1023px | Collapsible navigation, stacked controls, touch targets |
| Mobile | 320–767px | Single-column flow, off-canvas menu, touch-friendly controls, zero horizontal overflow |

Every new page must be tested across these ranges.

Do not ship a desktop-only implementation.

---

# 32. Accessibility

Target **WCAG 2.1 AA**.

Required:

- minimum 4.5:1 contrast for standard text
- visible keyboard focus
- keyboard navigation
- semantic HTML5
- accessible controls
- meaningful labels
- usable forms

Test accessibility as part of QA.

---

# 33. SEO

Implement dynamic:

- `sitemap.xml`
- `robots.txt`
- canonical URLs
- OpenGraph tags
- Twitter Card tags
- JSON-LD structured data for Organization and Services
- page titles
- meta descriptions

SEO values for dynamic CMS pages must come from database-backed fields where the PRD requires them.

---

# 34. Error Handling

Implement:

- custom 404 handler
- custom 500 handler

Do not expose:

- stack traces
- secrets
- database credentials
- internal configuration
- sensitive implementation details

Use structured application logging where appropriate.

---

# 35. Forms

Every production form must have:

1. server-side validation
2. client-side usability validation where helpful
3. CSRF protection where applicable
4. clear validation errors
5. safe persistence
6. correct success/failure handling
7. appropriate audit/event logging where required

Never show:

```text
"Success!"
```

unless the backend operation actually succeeded.

---

# 36. No Fake Functionality

This is one of the most important agent rules.

### NEVER

- fake database records in templates
- hardcode business records into HTML
- return mock JSON from production endpoints
- display fake success messages
- create buttons that do nothing
- create navigation links with no destination/action
- use frontend-only authentication
- use static mock files as a substitute for backend functionality
- claim a module is complete because the UI exists

### ALWAYS

For a feature involving persistent business data:

```text
UI
 ↓
validated request
 ↓
backend authorization
 ↓
business logic
 ↓
PostgreSQL persistence
 ↓
audit/event handling
 ↓
async work where applicable
 ↓
real response
 ↓
UI state update
```

---

# 37. Rejection Triggers

A build must be treated as **not ready for acceptance** if any of these patterns exist:

1. Static-only implementation presented as backend functionality.
2. Hardcoded business records/content instead of DB queries.
3. Forms that show fake success without PostgreSQL persistence.
4. Dummy buttons, navigation links, or controls.
5. Frontend-only authentication or authorization.
6. Exposed credentials/secrets.
7. Active Critical or High defects at checkpoint submission.
8. Lorem Ipsum or copied/unedited boilerplate on key pages.

Do not mark a feature complete while any applicable rejection trigger remains.

---

# 38. Testing Strategy

Testing must be continuous across:

- unit
- integration
- API functional
- UI/responsive
- security
- performance

## Unit / integration

Automate tests for:

- Django models
- serializers
- business estimator logic
- RBAC authorization
- permission decorators/classes
- critical business workflows

## API testing

Use Postman and/or PyTest.

Validate:

- successful responses
- invalid input
- unauthorized requests
- forbidden requests
- not-found requests
- persistence
- state transitions
- file validation

## UI testing

Validate:

- mobile
- tablet
- desktop
- Chrome
- Firefox
- Safari
- Edge

## Security testing

Test:

- CSRF
- privilege escalation
- SQL injection resistance
- authentication controls
- RBAC bypass attempts
- upload validation
- secret exposure

---

# 39. Defect Severity

Use the PRD severity definitions.

## CRITICAL

Examples:

- system crash
- data corruption
- broken authentication/RBAC
- exposed security credentials
- non-functional core submission module

Target:

**Immediate / within 12 hours**

## HIGH

Examples:

- major module failure
- RFP submission failure
- lead CRM status update failure
- no workaround

Target:

**within 24 hours**

## MEDIUM

Examples:

- minor functional defect
- form validation formatting
- mobile misalignment
- non-blocking UI issue

Target:

**within 48 hours**

## LOW

Examples:

- cosmetic typo
- small style inconsistency
- subtle animation issue
- minor documentation discrepancy

Target:

**before final submission**

---

# 40. Checkpoint Awareness

The PRD defines mandatory checkpoint deliverables. Agents should organize work so the repository can support them.

## Checkpoint 1 — Day 2

Expected:

- requirement understanding document
- feature/module list
- team allocation matrix
- technology architecture plan
- DB schema plan
- sitemap
- wireframe plan
- GitHub setup
- branching strategy
- README

## Checkpoint 2 — Day 4

Expected:

- UI/UX design suite
- homepage mockups
- services/industry layouts
- case study design
- RFP/contact forms
- careers layout
- client portal wireframes
- admin dashboard layout
- responsive prototypes

## Checkpoint 3 — Day 7

Expected:

- authentication
- user management
- RBAC
- services CMS
- industry CMS
- blog CMS
- case study CMS
- contact system
- RFP
- DB integration
- base admin dashboard
- staging URL
- Git commits
- test credentials

## Checkpoint 4 — Day 10

Expected:

- Lead CRM
- careers/recruitment
- candidate tracking
- secure client portal
- support tickets
- notifications
- global search
- filtering
- pagination
- document vault
- audit logging
- updated staging URL

## Checkpoint 5 — Day 12

Expected:

- security hardening report
- Swagger API documentation
- DB documentation
- ER diagram
- testing execution report
- responsive UI validation
- performance benchmark report
- security audit checklist
- bug matrix
- updated GitHub repository

## Checkpoint 6 — Day 14

Expected:

- corrected build
- regression evidence
- observation closure matrix
- screenshots
- walkthrough videos
- final technical/deployment documentation
- KT guide

## Final Checkpoint

Expected:

- final source code
- Git commit hash sign-off
- working staging URL
- master admin credentials
- role-based credentials
- database migration scripts
- complete technical/functional docs
- QA bug closure report
- setup/handover guide

**Do not invent an overall project duration.** The PRD explicitly says no overall project duration should be specified.

---

# 41. Git Governance

## Branches

Use:

```text
main
staging
feature/<module-name>
bugfix/<ticket-id>
```

Meaning:

- `main`: production-ready
- `staging`: verification build
- `feature/...`: feature development
- `bugfix/...`: defect fixes

## Main branch protection

Direct commits to `main` are forbidden.

Development must happen on feature/bugfix branches and merge through Pull Requests after code review.

## Commit messages

Use meaningful imperative messages.

Preferred:

```text
feat(crm): implement lead status update endpoint with audit logging
```

Avoid:

```text
bug fix
code update
changes
final
test
```

Generic commit messages can cause checkpoint rejection.

---

# 42. Pull Request Rules

Every PR should clearly state:

- what changed
- why it changed
- affected modules
- database changes
- API changes
- security impact
- RBAC impact
- tests added/run
- migration requirements
- documentation updates
- known limitations

Before merging, verify:

```text
[ ] Tests pass
[ ] No new security issue
[ ] RBAC verified
[ ] Audit logging considered
[ ] Migrations included
[ ] API documentation updated
[ ] No secrets
[ ] No fake/mock production behavior
[ ] No obvious N+1 queries
[ ] Responsive behavior checked
[ ] Relevant docs updated
```

---

# 43. Secret Scanning

Implement automated secret scanning as required by the PRD.

The PRD identifies:

- GitGuardian
- TruffleHog

as examples for automated scanning.

Use a pre-commit and/or CI mechanism appropriate to the repository.

If a secret is detected:

1. stop the change
2. remove it from source
3. rotate/revoke exposed credentials when applicable
4. inspect Git history
5. clean repository history when required
6. prevent recurrence with automated scanning

Never treat a secret scanner failure as a cosmetic warning.

---

# 44. Docker and Deployment Readiness

The project must be container-ready.

The repository includes:

```text
Dockerfile
```

Deployment architecture should support:

```text
Nginx
  ↓
Gunicorn
  ↓
Django
  ↓
PostgreSQL
Redis
Celery workers
```

Staging infrastructure may use managed development resources such as:

- Render
- Vercel
- AWS Free Tier
- managed PostgreSQL

as allowed by the PRD.

Final production enterprise hosting is to be provisioned separately after technical sign-off.

---

# 45. Environment Configuration

Configuration must be environment-driven.

Expected categories include:

```text
DJANGO_SECRET_KEY
DATABASE_URL / database settings
REDIS_URL
ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS
EMAIL configuration
JWT/token configuration
storage configuration
```

Do not hardcode environment-specific infrastructure values into application code.

Keep `.env` out of Git.

Keep `.env.example` committed with safe placeholders.

---

# 46. Documentation Requirements

Maintain documentation under `docs/`.

At minimum, maintain appropriate documentation for:

- architecture
- API
- database
- ER diagrams
- security
- testing
- deployment
- setup
- handover

The README must explain:

- prerequisites
- environment setup
- installation
- migrations
- running locally
- running tests
- API documentation
- development workflow
- deployment basics

Documentation must reflect the actual implementation.

Do not document functionality that does not exist.

---

# 47. Definition of Done

A feature is **not done** merely because code compiles or a page renders.

A feature is done only when applicable items are complete:

### Requirements

- [ ] PRD requirement identified
- [ ] acceptance behavior implemented
- [ ] no conflicting requirement introduced

### Backend

- [ ] Django implementation complete
- [ ] business logic implemented
- [ ] validation implemented
- [ ] persistence implemented
- [ ] error handling implemented

### Database

- [ ] models complete
- [ ] relationships correct
- [ ] constraints/indexes reviewed
- [ ] migration committed
- [ ] migration tested

### API

- [ ] endpoint implemented
- [ ] serializer validation complete
- [ ] authentication checked
- [ ] RBAC checked
- [ ] status codes correct
- [ ] OpenAPI documentation updated

### Security

- [ ] authorization enforced server-side
- [ ] CSRF considered
- [ ] input validation complete
- [ ] upload security complete where relevant
- [ ] no secrets committed
- [ ] rate limiting considered
- [ ] audit logging implemented where required

### Async

- [ ] expensive/background work delegated to Celery where required
- [ ] Redis configuration verified
- [ ] retry/error behavior considered

### Frontend

- [ ] real API/backend integration
- [ ] no fake success state
- [ ] responsive
- [ ] accessible
- [ ] keyboard/focus behavior checked
- [ ] no horizontal overflow on mobile

### Performance

- [ ] N+1 reviewed
- [ ] indexes reviewed
- [ ] pagination reviewed
- [ ] caching reviewed
- [ ] assets optimized where relevant

### Testing

- [ ] unit tests
- [ ] integration tests
- [ ] API tests
- [ ] permission tests
- [ ] responsive tests
- [ ] security tests
- [ ] regression tests where applicable

### Documentation

- [ ] relevant technical docs updated
- [ ] API docs updated
- [ ] DB docs updated if schema changed
- [ ] README updated if setup changed

---

# 48. Agent Workflow

For every requested implementation, follow this sequence.

## Step 1 — Understand

Read the relevant PRD requirements and existing code.

Do not begin by blindly generating files.

## Step 2 — Inspect

Inspect:

- repository structure
- existing models
- URLs
- serializers
- views
- permissions
- templates
- tests
- migrations
- settings
- Celery/Redis configuration

Reuse working patterns where appropriate.

## Step 3 — Plan

Before large changes, identify:

- files to modify
- files to create
- models
- APIs
- permissions
- async tasks
- tests
- documentation

## Step 4 — Implement

Implement in the correct application boundary.

Avoid unrelated refactors unless required for correctness/security.

## Step 5 — Secure

Review:

- authentication
- authorization
- validation
- CSRF
- CORS
- rate limiting
- upload controls
- secret handling
- audit events

## Step 6 — Test

Run the smallest relevant tests first, then broader regression tests.

## Step 7 — Inspect Performance

Review ORM queries and identify N+1 risks.

## Step 8 — Verify UX

Check desktop, tablet, and mobile behavior.

## Step 9 — Document

Update relevant documentation.

## Step 10 — Report

When reporting completion, state:

- what was implemented
- what was tested
- migrations created
- APIs changed
- security controls added
- known limitations
- anything not verified

Never claim a check was performed if it was not actually performed.

---

# 49. Agent Rules for Existing Code

When modifying existing code:

1. Read before changing.
2. Preserve working behavior unless the requirement requires change.
3. Avoid unnecessary rewrites.
4. Follow existing project conventions where they do not conflict with the PRD.
5. Do not silently remove functionality.
6. Do not bypass security controls to make a feature pass.
7. Do not replace real integrations with mocks merely to simplify development.
8. Add or update tests for changed behavior.

---

# 50. Agent Rules for Data

Development may use realistic sample/mock data.

The PRD permits simulated:

- RFPs
- job vacancies
- case studies
- other workflow data

Production client-confidential data is not required during development.

However:

- sample data must be clearly non-production
- do not copy confidential client data into fixtures
- do not expose secrets
- do not present fabricated case-study metrics as verified client outcomes

---

# 51. Search, Filtering and Pagination

Where the PRD requires filtering/searching:

- implement backend filtering
- validate query parameters
- avoid unbounded database responses
- use pagination for potentially large datasets
- enforce RBAC before returning records
- ensure search fields are appropriately indexed

Do not implement filtering only in the browser when the underlying dataset is large or access-controlled.

---

# 52. Export Rules

For CRM exports:

- enforce RBAC before export
- audit export activity
- apply filters correctly
- do not expose unauthorized fields
- use asynchronous processing for expensive exports where appropriate
- do not load an unbounded dataset into a request worker unnecessarily

The audit action `EXPORT` is explicitly defined by the PRD.

---

# 53. Notifications and Email

Email is a background-processing concern where appropriate.

Use Celery for:

- RFP acknowledgment
- candidate confirmation
- support ticket updates
- follow-up reminders
- internal BDM notifications

Do not make the user's request wait unnecessarily for external email delivery.

Record application state based on successful database operations, not merely successful email delivery.

---

# 54. State Machines

When a PRD-defined lifecycle exists, preserve its states and transitions.

## Lead

```text
NEW
UNDER REVIEW
CONTACTED
QUALIFIED
PROPOSAL SUBMITTED
NEGOTIATION
WON / LOST
```

## Support Ticket

```text
Open
Assigned
In Progress
Awaiting Client
Resolved
Closed
```

## Candidate

```text
Received
Shortlisted
Interviewed
Offered
Rejected
```

Do not introduce arbitrary state names that make the implementation inconsistent with the PRD.

If additional internal states are genuinely necessary, document them and ensure the externally visible workflow remains compliant.

---

# 55. API Permission Checklist

For every endpoint, explicitly determine:

```text
Endpoint:
HTTP method:
Public / authenticated:
Allowed roles:
Object-level restriction:
Rate limit:
Input validation:
File validation:
Audit event:
Async task:
Expected status codes:
```

This checklist should be used during implementation and review.

---

# 56. Security Review Checklist

Before a security-sensitive PR is complete:

```text
[ ] Authentication enforced
[ ] Authorization enforced on backend
[ ] Object-level access verified
[ ] CSRF protected where applicable
[ ] CORS restricted
[ ] Rate limiting configured
[ ] Input validation implemented
[ ] SQL injection resistance verified
[ ] XSS protections preserved
[ ] File upload validation verified
[ ] Storage paths sanitized
[ ] Secrets absent from code/history
[ ] Audit logging implemented
[ ] Sensitive data not leaked in responses
[ ] Error responses do not expose internals
```

---

# 57. Performance Review Checklist

```text
[ ] No N+1 queries
[ ] select_related reviewed
[ ] prefetch_related reviewed
[ ] appropriate indexes
[ ] pagination
[ ] caching where appropriate
[ ] cache invalidation
[ ] optimized serializers
[ ] optimized templates
[ ] WebP assets
[ ] lazy loading
[ ] CSS/JS bundling
[ ] minification
[ ] response-time measurements where required
```

---

# 58. UI Review Checklist

```text
[ ] Desktop >= 1440px
[ ] Laptop 1024–1439px
[ ] Tablet 768–1023px
[ ] Mobile 320–767px
[ ] No horizontal overflow
[ ] Touch targets usable
[ ] Keyboard navigation
[ ] Visible focus
[ ] WCAG 2.1 AA considerations
[ ] Forms display validation errors
[ ] Loading states exist where needed
[ ] Empty states exist
[ ] Error states exist
[ ] Buttons perform real actions
[ ] API state reflected correctly
```

---

# 59. Production Readiness Gate

Before recommending a production-ready status, verify all applicable requirements below:

```text
[ ] PostgreSQL-backed persistence
[ ] Django/DRF architecture
[ ] Redis/Celery configured
[ ] RBAC enforced server-side
[ ] Audit logging operational
[ ] Authentication hardened
[ ] Secrets externalized
[ ] HTTPS architecture
[ ] API documentation
[ ] DB migrations
[ ] Automated tests
[ ] Security testing
[ ] Performance testing
[ ] Responsive validation
[ ] No Critical defects
[ ] No High defects
[ ] No fake functionality
[ ] No hardcoded business records
[ ] No exposed credentials
[ ] Documentation complete
[ ] Deployment/handover documentation complete
```

---

# 60. Final Acceptance Mindset

The acceptance standard is **operational software**, not a visual prototype.

The application is acceptable only when:

- submitted modules operate against real PostgreSQL persistence
- RBAC prevents unauthorized backend API/URL access
- Lead CRM works end-to-end
- RFP workflow works end-to-end
- Support Tickets work end-to-end
- Candidate tracking works end-to-end
- no Critical or High defects remain
- source code and commit history are available in GitHub

A staging URL alone does not prove completion.

A screenshot alone does not prove completion.

A frontend control alone does not prove completion.

A mock JSON response does not prove completion.

A successful automated test without real persistence does not prove completion.

---

# 61. Mandatory Agent Response Format

When an implementation task is complete, report using this structure:

```text
## Implementation Summary
- ...

## Files Changed
- ...

## Database Changes
- ...

## API Changes
- ...

## RBAC / Security
- ...

## Async / Celery
- ...

## Tests Executed
- ...

## Performance Checks
- ...

## Documentation
- ...

## Known Limitations / Not Verified
- ...

## Acceptance / Rejection Check
- [ ] No fake functionality
- [ ] No hardcoded business records
- [ ] No frontend-only authorization
- [ ] No exposed secrets
- [ ] No unresolved Critical/High defects introduced
```

Do not state "all tests pass" unless tests were actually run.

Do not state "production ready" unless the production-readiness gate has been evaluated.

---

# 62. Hard Stop Rules

An agent must stop and flag the issue instead of proceeding blindly when:

1. A request requires an unauthorized technology substitution.
2. A request would weaken RBAC.
3. A request would expose secrets.
4. A request would bypass required validation.
5. A request would create fake persistence.
6. A request would make a protected resource publicly accessible.
7. A request would remove required audit logging.
8. A request would bypass migrations for schema changes.
9. A request would knowingly introduce a Critical security defect.
10. The implementation would contradict an explicit PRD requirement.

When blocked, explain:

```text
Requirement:
Conflict:
Risk:
Recommended compliant approach:
```

---

# 63. What Agents Must Never Claim

Never claim:

- "implemented" when only UI exists
- "tested" when tests were not run
- "secure" without security verification
- "RBAC complete" when only frontend hiding exists
- "database integration complete" when records are mocked
- "production ready" without the required gates
- "API complete" without validation and documentation
- "audit logging complete" without actual audit records
- "responsive" without checking target viewport ranges

Accuracy of engineering reporting is mandatory.

---

# 64. Closing Principle

Build the platform as if it will be reviewed by an enterprise architecture, security, QA, and acceptance board.

The implementation should consistently demonstrate:

```text
REAL DATA
+ REAL BACKEND LOGIC
+ REAL API CONTRACTS
+ REAL RBAC
+ REAL AUDITABILITY
+ REAL ASYNC PROCESSING
+ REAL TESTING
+ REAL SECURITY
+ REAL PERFORMANCE ENGINEERING
+ REAL DOCUMENTATION
= ACCEPTABLE ENTERPRISE SOFTWARE
```

Never substitute visual appearance for engineering functionality.

Never substitute mock data for persistence.

Never substitute frontend controls for backend authorization.

Never substitute claims of testing for actual testing.

Never bypass an explicit PRD requirement silently.

**The PRD is the governing specification. This AGENTS.md is the operational execution standard derived from it.**
