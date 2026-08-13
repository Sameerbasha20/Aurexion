# Aurexion HR / Careers & ATS Module — Development Specification

**Document type:** Developer implementation reference  
**Source of truth:** Aurexion Production-Ready SRS v1.0 + the current Aurexion repository  
**Module:** Careers & Applicant Tracking System (ATS)  
**Django app:** `src/apps/recruitment/`  
**Status of current repository:** Recruitment app exists as a scaffold/placeholder and must be implemented.

> **Important:** This document intentionally separates requirements that are explicitly stated in the SRS from implementation choices. Do not add generic HR/ATS functionality merely because it is common in other systems. If a behavior is not specified here or in the approved project requirements, do not silently invent it.

---

## 1. HR Module Scope

The Aurexion HR module is officially the **Careers & Applicant Tracking System (ATS)**.

It contains exactly these four functional areas:

1. **Job Vacancy CMS**
2. **Public Job Board**
3. **Candidate Application Portal**
4. **Admin ATS Board**

The complete business flow is:

```text
HR creates vacancy
        |
        v
Vacancy becomes Active
        |
        v
Candidate browses public jobs
        |
        +--> Search / Department / Location / Experience filters
        |
        v
Candidate opens complete job description
        |
        v
Candidate submits application + resume
        |
        v
Backend validates application and resume
        |
        v
Application is persisted in PostgreSQL
        |
        v
Unique tracking code generated
        |
        v
Candidate acknowledgement queued
        |
        v
HR views application in ATS
        |
        +--> Update application stage
        +--> Add internal notes
        +--> Download resume
```

### Official application stages

The SRS specifies:

```text
Received
Shortlisted
Interviewed
Offered
Rejected
```

Do **not** introduce extra lifecycle states such as:

- Screening
- Interview Scheduled
- Selected
- Hired
- On Hold
- Withdrawn
- Offer Accepted

unless the requirements are formally changed.

---

# 2. Source-of-Truth Rules

When implementing this module, use this priority:

```text
Approved SRS / PRD
       |
       v
Existing Aurexion architecture
       |
       v
Approved UI / API contracts
       |
       v
Implementation details
```

### Never replace SRS requirements with generic assumptions

Examples:

| Do this | Do not do this |
|---|---|
| Use `JobVacancy` + `CandidateApplication` | Invent a large generic ATS domain |
| Use `ACTIVE/CLOSED` for vacancy status | Add DRAFT/PUBLISHED/ARCHIVED without approval |
| Use the five SRS application stages | Add SELECTED/HOLD/etc. |
| Keep `POST /api/v1/careers/apply/` | Replace it with an unrelated endpoint |
| Restrict resume access by backend RBAC | Only hide download buttons in frontend |
| Validate PDF/DOCX + MIME + size | Only check filename extension |
| Persist data in PostgreSQL | Use hardcoded/mock records in production flows |

---

# 3. Functional Requirements

## 3.1 Job Vacancy CMS

HR/Admin must be able to manage vacancies.

### Required vacancy information

The SRS explicitly requires:

- Job ID
- Title
- Department
- Location
- Experience
- Skills
- Responsibilities
- Status

### Vacancy status

Only:

```text
ACTIVE
CLOSED
```

are required by the SRS.

### Required operations

The HR role needs operational access to vacancy management:

- Create vacancy
- View vacancy
- Update vacancy
- Change Active/Closed status
- Delete vacancy where permitted by the final admin policy

### Business rules

1. A vacancy must be database-backed.
2. A vacancy must have a unique job identifier.
3. Public job browsing must expose active vacancies.
4. Closed vacancies must not accept new applications.
5. Job data must persist in PostgreSQL.
6. Changes must be auditable because administrative actions are required to be logged.
7. The public API must never expose staff-only vacancy management operations.

---

# 4. Public Job Board

The public Careers page must provide a real database-backed job board.

## Required filters

Candidates must be able to filter by:

- Department
- Location
- Experience

## Required search

Candidates must be able to search by keyword.

The search should cover the job information that is relevant to the vacancy listing, such as title and other approved searchable fields.

## Job details

A candidate must be able to open a vacancy and view the **complete job description**, including the SRS-defined vacancy information.

## Public behavior

Public users do not need staff authentication to:

- Browse active jobs
- Search jobs
- Filter jobs
- View job details
- Submit an application

Protected HR operations must still require backend authorization.

---

# 5. Candidate Application Portal

Candidates submit an application for a vacancy.

## Mandatory requirements

The application must:

- Be multi-field
- Require a resume
- Accept PDF or DOCX
- Enforce a maximum resume size of 5 MB
- Persist the application
- Generate a tracking code
- Provide candidate acknowledgement asynchronously

### Resume constraints

```text
Allowed:
    .pdf
    .docx

Maximum:
    5 MB

Required:
    Yes
```

The backend must validate all of:

1. File extension
2. MIME/content type
3. File size
4. Safe storage path/name
5. File content policy so arbitrary executable content is not accepted

Do not rely on:

```python
filename.endswith(".pdf")
```

alone.

A file renamed from an executable to `resume.pdf` must not automatically pass validation.

---

# 6. Mandatory Application API

The SRS explicitly identifies:

```http
POST /api/v1/careers/apply/
```

### Authentication

```text
Public
```

### Purpose

Submit:

- Candidate application data
- Vacancy reference
- Resume

### Expected backend flow

```text
HTTP request
    |
    v
Request size/rate-limit checks
    |
    v
Serializer validation
    |
    +--> candidate/application validation
    |
    +--> vacancy validation
    |
    +--> resume validation
    |
    v
Check vacancy is Active
    |
    v
Database transaction
    |
    +--> create CandidateApplication
    |
    +--> generate unique tracking code
    |
    v
Commit
    |
    v
Queue candidate acknowledgement
    |
    v
Return success + tracking code
```

The API should not wait for external email delivery before returning a successful application response.

---

# 7. Tracking Code

Every successfully created candidate application requires a unique tracking code.

The SRS example is:

```text
AUR-APP-8812
```

Therefore the implementation should produce an Aurexion-style identifier such as:

```text
AUR-APP-XXXX
```

where `XXXX` represents a unique generated component.

## Rules

- Generated by backend
- Unique
- Immutable after creation
- Never supplied by the candidate
- Never generated solely by the frontend
- Returned in the application response
- Included in candidate acknowledgement

### Recommended database protection

Add a database-level uniqueness constraint/index to `tracking_code`.

Application-level uniqueness checks alone are insufficient under concurrency.

---

# 8. CandidateApplication Data Model

The SRS explicitly identifies:

```text
JobVacancy → CandidateApplication
1 : N
```

A vacancy can therefore have many applications.

## Required core fields

At minimum, the model needs:

| Field | Purpose |
|---|---|
| `id` | Internal primary key |
| `tracking_code` | Candidate-facing immutable tracking reference |
| `job_vacancy` | FK to JobVacancy |
| Candidate information | Fields required by the approved multi-field application form |
| `resume` | Stored candidate resume |
| `stage` | ATS application stage |
| `created_at` | Application timestamp |
| `updated_at` | Last update timestamp |

### Important

The SRS says the application is **multi-field**, but the supplied SRS does not enumerate every candidate form field.

Therefore:

> Use the approved Careers UI/PRD form fields for the exact candidate information. Do not invent additional candidate fields just because they are common in ATS systems.

---

# 9. JobVacancy Data Model

Recommended normalized structure:

```text
JobVacancy
├── id
├── job_id
├── title
├── department
├── location
├── experience
├── skills
├── responsibilities
├── status
├── created_at
└── updated_at
```

## Required constraints

### `job_id`

- Required
- Unique
- Indexed

### `title`

- Required

### `department`

- Required

### `location`

- Required

### `experience`

- Required according to approved vacancy form

### `skills`

- Required according to approved vacancy form

### `responsibilities`

- Required according to approved vacancy form

### `status`

Allowed values:

```text
ACTIVE
CLOSED
```

### Timestamps

Use timezone-aware timestamps.

---

# 10. Internal ATS Notes

HR must be able to add internal review notes to an application.

The SRS states:

> Internal notes are retained.

Recommended entity:

```text
ApplicationNote
├── id
├── application
├── author
├── note
└── created_at
```

## Rules

- Notes are staff-only.
- Candidate/public APIs must never return internal notes.
- The author must be authenticated.
- Creation should be auditable.
- Notes should not contain unnecessary secrets or credentials.
- Do not expose notes through public application endpoints.

---

# 11. Admin ATS Board

The HR ATS board must support:

### Filtering

At minimum:

```text
Filter by position/job vacancy
```

The implementation should use pagination for potentially large application collections.

### Application actions

HR must be able to:

- View applications
- Filter applications by position
- Open application details
- Download resumes
- Update application stage
- Add internal notes
- View internal notes

---

# 12. ATS Application Stages

Use exactly these values:

```text
RECEIVED
SHORTLISTED
INTERVIEWED
OFFERED
REJECTED
```

Display labels:

```text
Received
Shortlisted
Interviewed
Offered
Rejected
```

## Important implementation rule

The SRS specifies the allowed stages but does not provide a complete transition matrix.

Therefore:

- Validate that a stage is one of the approved values.
- Do not silently invent extra stages.
- If strict transition rules are required by the product/UI, document and approve the transition matrix before enforcing additional restrictions.

A rejected application must not be represented as a separate unrelated boolean such as:

```text
is_rejected = true
```

The authoritative lifecycle field is the application stage.

---

# 13. Resume Download Security

Resume files contain candidate personal information.

The SRS explicitly requires:

> Access to resumes shall be restricted by role/object ownership.

For this module:

```text
HR Manager
    |
    +--> Authorized resume access

Super Admin
    |
    +--> Authorized resume access

Public Candidate
    |
    X--> No resume access

Other staff roles
    |
    X--> No HR resume access unless explicitly authorized
```

## Never use public resume URLs

Avoid:

```text
/media/resumes/resume.pdf
```

where anyone with the URL can download the file.

Preferred flow:

```text
Authenticated HR request
        |
        v
Authentication
        |
        v
Role permission
        |
        v
Object-level authorization
        |
        v
Audit download event
        |
        v
Secure file response
```

Production should use controlled private file/object storage with authorized retrieval.

---

# 14. File Upload Security

The SRS requires:

- Extension validation
- MIME validation
- Maximum upload size
- Safe sanitized storage paths
- No arbitrary executable content

## Validation layers

### Layer 1 — Extension

Allowed:

```text
.pdf
.docx
```

### Layer 2 — MIME/content validation

Do not trust only the client-supplied MIME type.

Validate the actual uploaded content as far as the selected file-validation library/storage pipeline supports.

### Layer 3 — Size

Reject:

```text
> 5 MB
```

### Layer 4 — Storage name

Do not use the candidate-supplied filename directly as the storage path.

Generate a safe server-side storage name.

### Layer 5 — Storage location

Keep candidate resumes outside public static assets.

---

# 15. Recommended Storage Structure

The exact production storage provider is an implementation decision because the SRS does not mandate local filesystem vs object storage.

The project uses **Supabase as the database and file-storage layer**.

Therefore:

```text
Supabase PostgreSQL
        +
Supabase Storage
```

are the persistence components for the HR module.

### Resume storage architecture

Candidate resumes must be stored in a **private Supabase Storage bucket**, not in Django's local filesystem and not as public static/media files.

Recommended bucket:

```text
candidate-resumes
```

Recommended logical object path:

```text
applications/
    <application-id>/
        <generated-safe-filename>
```

Example:

```text
applications/
    8f2c1a4e/
        resume_7c91d2.pdf
```

Do not use the candidate's original filename as the complete storage path.

### Required Supabase Storage behavior

```text
Candidate
    |
    v
POST /api/v1/careers/apply/
    |
    v
Django/DRF validates file
    |
    +--> PDF/DOCX
    +--> <= 5 MB
    +--> content/MIME validation
    |
    v
Upload to PRIVATE Supabase Storage bucket
    |
    v
Store only the storage reference/path in CandidateApplication
    |
    v
Commit application in Supabase PostgreSQL
```

The database should store a storage reference such as:

```text
resume_storage_path
```

rather than storing the complete resume binary inside the PostgreSQL row.

### Resume download

Resume files must never be publicly accessible.

Use:

```text
HR request
    |
    v
Django authentication
    |
    v
HR/Super Admin permission check
    |
    v
Application object-level authorization
    |
    v
Generate a short-lived Supabase signed URL
OR securely stream the file through the backend
    |
    v
Authorized HR user receives resume
```

The frontend must **not** receive or permanently store a public Supabase service-role credential.

The Supabase **service-role key must remain server-side only** and must never be exposed to the browser.

### Supabase Storage security

The bucket should be private.

Do not configure:

```text
Public bucket = true
```

for candidate resumes.

Access should be controlled through Supabase Storage policies and/or the Django backend's authorization layer.

Because HR authorization is already enforced by Django/DRF, the recommended application architecture is:

```text
Browser
   |
   | authenticated HR request
   v
Django / DRF
   |
   +--> Authentication
   +--> RBAC
   +--> Object-level authorization
   +--> Audit logging
   |
   v
Supabase Storage
   |
   v
Private resume
```

### Important separation

Supabase Storage authorization does **not** replace Django HR authorization.

The backend must first establish:

```text
Is the user authenticated?
Is the user allowed to access HR recruitment data?
Is this user allowed to access this application?
```

Only then should the backend generate a signed URL or retrieve the object.

### Supabase database

The HR relational data is stored in Supabase PostgreSQL:

```text
Supabase PostgreSQL
│
├── JobVacancy
├── CandidateApplication
├── ApplicationNote
└── Audit records / platform records
```

Use Django ORM and migrations against the Supabase PostgreSQL database according to the project's existing database architecture.

### Supabase environment variables

Never commit Supabase credentials.

Use server-side environment variables such as:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
```

Use the project's established naming convention if these variables already exist.

The service-role key is sensitive and must only be available to trusted backend processes.

---

# 16. RBAC

The SRS defines the following relevant roles.

## HR Manager

Full access to:

- Careers
- Job vacancy management
- Candidate applications
- Resume downloads
- Recruitment workflow

## Super Admin

Full system access, including HR.

## Administrator

Operational access to content, leads, tickets and users.

Do not automatically treat Administrator as equivalent to HR Manager for HR-sensitive data unless the project's permission matrix explicitly grants it.

## Other roles

### BDM

No HR ATS management.

### Sales Executive

No HR ATS management.

### Content Manager

No HR ATS management.

### Support Executive

No HR ATS management.

### Client User

No HR ATS management.

---

# 17. Backend Authorization Is Mandatory

The SRS explicitly says frontend visibility is not security.

This is not sufficient:

```text
if user.role == "HR":
    show ATS button
```

The backend must enforce:

```text
Authentication
    +
Permission
    +
Object-level authorization
```

For example:

```http
GET /api/v1/careers/admin/applications/
```

from an unauthorized role must return an appropriate denial response.

Do not leak unnecessary information about protected objects.

---

# 18. Suggested Permission Boundaries

Use centrally managed permissions.

Logical permissions:

```text
careers.view_job
careers.create_job
careers.update_job
careers.delete_job

careers.view_application
careers.update_application_stage
careers.add_application_note
careers.view_application_note
careers.download_resume
```

These names are implementation guidance, not additional SRS requirements. If the existing authentication/RBAC app uses another permission naming convention, integrate with it rather than creating a second RBAC system.

---

# 19. Public vs Protected API Surface

## Public

```http
GET  /api/v1/careers/jobs/
GET  /api/v1/careers/jobs/{id}/
POST /api/v1/careers/apply/
```

These support:

- Public job browsing
- Job details
- Candidate application

## Protected HR APIs

Logical operations:

```http
GET    /api/v1/careers/admin/jobs/
POST   /api/v1/careers/admin/jobs/
GET    /api/v1/careers/admin/jobs/{id}/
PATCH  /api/v1/careers/admin/jobs/{id}/
DELETE /api/v1/careers/admin/jobs/{id}/

GET    /api/v1/careers/admin/applications/
GET    /api/v1/careers/admin/applications/{id}/
PATCH  /api/v1/careers/admin/applications/{id}/stage/
GET    /api/v1/careers/admin/applications/{id}/resume/
GET    /api/v1/careers/admin/applications/{id}/notes/
POST   /api/v1/careers/admin/applications/{id}/notes/
```

> The only HR endpoint explicitly named as mandatory in the SRS is `POST /api/v1/careers/apply/`. The remaining endpoints above are the logical REST surface needed to make the four required HR capabilities functional. Keep URL conventions consistent with the existing API architecture.

---

# 20. API Standards

The SRS requires Django REST Framework.

All HR APIs must:

- Use JSON where appropriate
- Use consistent HTTP status codes
- Return machine-readable errors
- Validate incoming data at serializer/schema and business-logic layers
- Apply authentication/permission checks before protected object access
- Use pagination for potentially large collections
- Be documented in OpenAPI/Swagger
- Prevent object-level authorization bypass

## Example success

```json
{
  "tracking_code": "AUR-APP-8812",
  "message": "Application submitted successfully."
}
```

The exact response schema should be standardized in the API implementation and OpenAPI documentation.

## Example validation response

Use the project's standard DRF error format rather than inventing a different error structure for recruitment.

---

# 21. HTTP Status Expectations

Use normal REST semantics.

Examples:

```text
200 OK
    Successful read/update operation

201 Created
    Vacancy/application/note created

204 No Content
    Successful deletion where applicable

400 Bad Request
    Invalid payload/file/business validation

401 Unauthorized
    Missing/invalid authentication for protected endpoints

403 Forbidden
    Authenticated but not permitted

404 Not Found
    Resource does not exist or is intentionally hidden by policy

413 Payload Too Large
    If the deployed API stack uses this for oversized uploads

429 Too Many Requests
    Rate limit exceeded
```

Do not expose stack traces or internal exceptions to clients.

---

# 22. Public Job Filtering

The public jobs endpoint should support:

```text
department
location
experience
search
```

Example:

```http
GET /api/v1/careers/jobs/?department=Engineering
```

```http
GET /api/v1/careers/jobs/?location=Hyderabad
```

```http
GET /api/v1/careers/jobs/?experience=3
```

```http
GET /api/v1/careers/jobs/?search=python
```

Combined:

```http
GET /api/v1/careers/jobs/?department=Engineering&location=Hyderabad&search=python
```

Only active vacancies should appear on the public job board.

---

# 23. Query and Performance Requirements

The SRS requires:

- PostgreSQL 15+
- Normalized relational schema
- Target 3NF
- Foreign keys
- Indexes on foreign keys and common search/lookup fields
- Versioned Django migrations
- No N+1 query problems

## HR-specific indexes

At minimum, consider indexes for:

```text
JobVacancy.job_id
JobVacancy.status
JobVacancy.department
JobVacancy.location
JobVacancy.experience
CandidateApplication.tracking_code
CandidateApplication.job_vacancy
CandidateApplication.stage
CandidateApplication.created_at
ApplicationNote.application
```

Use database constraints for uniqueness where appropriate.

## ORM optimization

For application lists:

- Use `select_related()` for single-valued relationships.
- Use `prefetch_related()` for collections such as notes where needed.
- Avoid querying the vacancy, user, or other related object once per application.

Target:

```text
1 list request
+
small fixed number of queries
```

not:

```text
1 + N + N queries
```

---

# 24. PostgreSQL Requirement

The project uses **Supabase PostgreSQL** as the system of record.

Architecture:

```text
Django / DRF
      |
      v
Supabase PostgreSQL
```

Do not design HR around SQLite.

The HR database models, relationships, indexes and migrations must be compatible with the project's Supabase PostgreSQL database.

In addition to database persistence, Supabase Storage is the authoritative storage location for candidate resumes.

---

# 25. Django Migrations

Every schema change must be represented by a Django migration.

Typical flow:

```bash
python manage.py makemigrations recruitment
python manage.py migrate
```

Do not manually edit production database tables.

Migration files must be committed.

---

# 26. Current Repository State

The current repository already contains:

```text
src/
└── apps/
    └── recruitment/
        ├── __init__.py
        ├── admin.py
        ├── apps.py
        ├── forms.py
        ├── migrations/
        │   └── __init__.py
        ├── models.py
        ├── services.py
        ├── static/
        │   └── recruitment/
        │       ├── css/
        │       ├── images/
        │       └── js/
        ├── templates/
        │   └── recruitment/
        │       └── dashboard.html
        ├── tests.py
        ├── urls.py
        └── views.py
```

However, the scaffold is currently largely empty.

Current state observed in the repository:

### `models.py`

```python
from django.db import models
```

No HR models are implemented yet.

### `services.py`

Contains only a placeholder recruitment services module.

### `views.py`

Contains only the Django `render` import.

### `urls.py`

Contains an empty `urlpatterns`.

### `tests.py`

Contains only the test scaffold.

Therefore, the HR module should be treated as **not yet functionally implemented**.

---

# 27. Required HR Code Structure

Use the existing Django app boundary rather than creating a second recruitment app.

A scalable structure is:

```text
src/apps/recruitment/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── permissions.py
├── services.py
├── validators.py
├── selectors.py
├── tasks.py
├── urls.py
├── views.py
├── filters.py
├── migrations/
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_serializers.py
│   ├── test_services.py
│   ├── test_permissions.py
│   ├── test_api_public.py
│   ├── test_api_admin.py
│   ├── test_file_uploads.py
│   ├── test_tasks.py
│   └── test_workflows.py
├── templates/
└── static/
```

If the existing project prefers a smaller structure, keep the same logical separation without unnecessarily overengineering the app.

---

# 28. Recommended Responsibility of Each Layer

## Models

Responsible for:

- Database structure
- Relationships
- Field constraints
- Database indexes
- Database uniqueness
- Simple model-level validation where appropriate

Do not put large workflows inside models.

## Serializers

Responsible for:

- API input validation
- API output representation
- File validation integration
- Request-specific validation

## Validators

Responsible for reusable rules such as:

- Resume extension
- Resume MIME/content
- Resume size
- Job status
- Application stage
- Job ID validation

## Services

Responsible for business operations such as:

```text
create_vacancy()
update_vacancy()
close_vacancy()
submit_application()
generate_tracking_code()
update_application_stage()
add_application_note()
```

This keeps business logic out of views.

## Selectors

Responsible for read/query logic such as:

```text
get_active_jobs()
search_jobs()
get_application_list()
get_application_detail()
```

## Permissions

Responsible for:

- HR Manager access
- Super Admin access
- Protected resume access
- Protected notes
- Protected ATS operations

## Tasks

Responsible for:

- Candidate acknowledgement
- Other approved asynchronous HR notifications

## Views

Responsible for:

- HTTP request/response handling
- Calling serializers/services/selectors
- Permission integration
- Pagination/filtering

Views should not contain large business workflows.

---

# 29. Candidate Application Transaction

Application creation should be atomic.

Conceptually:

```python
transaction.atomic()
    |
    +-- validate active vacancy
    +-- validate candidate data
    +-- validate resume
    +-- generate tracking code
    +-- create CandidateApplication
    +-- persist file reference
    +-- commit
```

Only after successful persistence should the acknowledgement task be queued.

Do not send an email that references an application that failed to commit.

---

# 30. Tracking Code Concurrency

A safe design should handle two candidates submitting simultaneously.

Do not rely only on:

```python
while CandidateApplication.objects.filter(tracking_code=code).exists():
    code = generate_code()
```

Use a database uniqueness constraint as the final protection.

If a generated code collides, retry generation safely.

---

# 31. Closed Vacancy Protection

The following must fail:

```text
Candidate
    |
    v
POST /api/v1/careers/apply/
    |
    v
Job status = CLOSED
    |
    v
Reject application
```

The backend must enforce this.

Do not depend on the frontend removing the Apply button.

A malicious client can directly call the API.

---

# 32. Duplicate Applications

The supplied SRS does not define a complete duplicate-application policy.

Therefore:

- Do not invent a strict duplicate rule without approval.
- If the existing approved product/UI defines duplicate behavior, implement that rule.
- If duplicate prevention is introduced, it must be explicitly documented and tested.

Do not accidentally prevent legitimate applications merely by making an arbitrary uniqueness constraint on email + job.

---

# 33. Candidate Data Privacy

Candidate information and resumes are sensitive.

Rules:

- Public job APIs must not return private candidate data.
- Public application responses should expose only information necessary for acknowledgement/tracking.
- Internal notes are never public.
- Resume URLs must not be exposed to unauthorized users.
- Logs must not contain passwords, secrets, full resume contents, or unnecessary sensitive information.
- Database and storage access must follow the project's security controls.

---

# 34. Audit Logging

The SRS requires immutable audit records for critical transactions.

Relevant HR events include:

```text
Job vacancy created
Job vacancy updated
Job vacancy closed
Job vacancy deleted

Candidate application created

Application stage changed

Internal note created

Resume downloaded
```

The SRS audit schema includes concepts such as:

```text
user
action
module
object_id / repr
previous_state
updated_state
ip_address
user_agent
timestamp
```

Use the project's centralized audit system if one exists.

Do not create an isolated HR audit mechanism that bypasses the platform-wide audit log.

---

# 35. Audit Action Values

The SRS examples include:

```text
CREATE
UPDATE
DELETE
LOGIN_SUCCESS
LOGIN_FAILURE
EXPORT
TICKET_CLOSE
```

For recruitment, map HR events to the existing audit action conventions.

If new action values are necessary, add them centrally rather than creating an HR-only audit format.

---

# 36. Resume Download Auditing

A resume download is particularly important.

Recommended sequence:

```text
HR requests resume
        |
        v
Authentication
        |
        v
Permission
        |
        v
Object access
        |
        v
Audit event
        |
        v
Secure file response
```

Audit should identify:

- Actor
- Application
- Action
- Timestamp
- Request metadata according to the central audit policy

Do not store the resume itself in the audit log.

---

# 37. Celery / Redis

The SRS requires Redis/Celery background processing.

### Mandatory HR asynchronous job

Candidate acknowledgement.

Flow:

```text
Application accepted
        |
        v
Application committed
        |
        v
Celery task queued
        |
        v
Acknowledgement sent
```

The task must be:

- Retryable
- Observable
- Idempotent where practical

Do not let email provider failure roll back the candidate's already-successful application.

---

# 38. Email / Notification Boundary

The exact production email provider is an implementation decision.

The SRS requires:

- Candidate acknowledgement
- Asynchronous notification capability

The implementation should use the project's centralized email/notification service if one exists.

Do not hardcode:

- SMTP usernames
- SMTP passwords
- API keys
- sender secrets
- production credentials

Use environment variables.

---

# 39. Rate Limiting

The SRS specifies:

```text
Public form endpoints:
60 requests/minute

Authenticated endpoints:
1000 requests/minute
```

unless an approved exception exists.

The application endpoint:

```text
POST /api/v1/careers/apply/
```

is a public form endpoint and therefore must be protected by the public rate limit.

Rate limiting must be enforced server-side.

---

# 40. Authentication and Password Security

The broader platform requires:

- Django authentication
- PBKDF2 or Argon2
- Minimum 10-character passwords with symbols/numbers
- Login throttling after a maximum of 5 failures before lockout
- Token/JWT authentication for APIs where applicable

The HR module should reuse the platform authentication system.

Do not create a separate candidate authentication system unless explicitly required.

Candidates use the public application flow defined by the SRS.

---

# 41. CSRF / SQL Injection / XSS

Follow the platform security baseline:

### CSRF

Use Django CSRF protection for browser form POSTs.

### SQL injection

Use Django ORM / parameterized queries.

Never construct SQL using raw user input.

### XSS

Use Django's escaping behavior and safe handling of any rich text.

Do not mark candidate or vacancy input as safe HTML unless it has been deliberately sanitized.

---

# 42. CORS

Use strict CORS according to the deployment architecture.

Do not use unrestricted:

```text
Allow-Origin: *
```

for protected credential-bearing APIs unless the security architecture explicitly permits it.

---

# 43. Environment Configuration

The SRS requires production/staging configuration to be environment-driven.

HR-related configuration may include:

```text
DATABASE_URL
REDIS_URL
CELERY_BROKER_URL
CELERY_RESULT_BACKEND
EMAIL_HOST
EMAIL_PORT
EMAIL_HOST_USER
EMAIL_HOST_PASSWORD
DEFAULT_FROM_EMAIL
MEDIA_STORAGE_CONFIG
SECRET_KEY
```

Exact variable names should match the existing project convention.

Never commit actual values.

---

# 44. OpenAPI / Swagger

The SRS requires interactive API documentation.

Document:

- Public job list
- Job detail
- Application submission
- HR vacancy APIs
- HR application APIs
- Stage update
- Notes
- Resume retrieval
- Authentication requirements
- Permission requirements
- Validation errors
- File constraints
- Examples

The required documentation endpoint in the SRS is:

```http
GET /api/v1/docs/
```

---

# 45. API Documentation Checklist

For `POST /api/v1/careers/apply/`, document:

### Request

- Candidate fields
- Job vacancy identifier
- Resume
- Content type
- Maximum file size
- Accepted formats

### Success

- Tracking code
- Success message

### Errors

```text
400 validation error
404 invalid/inaccessible vacancy where appropriate
413 oversized upload where applicable
429 rate limit
```

For HR APIs, document:

- Required authentication
- Required role/permission
- Query filters
- Pagination
- Stage values
- Error responses

---

# 46. Testing Strategy

The SRS requires multiple testing layers.

## Unit tests

Test:

- Model validation
- Tracking-code generation
- Resume validators
- Stage validation
- Service functions
- Permission classes
- Utility functions

## Integration tests

Test:

- PostgreSQL persistence
- Application creation
- Job/application relationship
- Resume storage
- Celery tasks
- Notification dispatch
- Audit creation

## API tests

Test:

- Authentication
- Authorization
- Validation
- Status codes
- Filtering
- Search
- Pagination
- File upload
- Error handling

## Functional/UI tests

Test:

- Job creation
- Public browsing
- Filtering
- Application submission
- ATS workflow
- Resume download
- Internal notes
- Responsive behavior

## Security tests

Test:

- RBAC bypass
- IDOR/object access
- CSRF
- XSS
- SQL injection
- File upload abuse
- Rate limiting
- Secret exposure

## Regression tests

Run the entire accepted platform test suite before final acceptance.

---

# 47. Mandatory Negative Tests

The SRS explicitly requires negative testing.

For HR, include at least:

### Vacancy

- Missing required fields
- Invalid status
- Duplicate job ID
- Unauthorized create
- Unauthorized update
- Unauthorized delete
- Invalid job ID lookup

### Application

- Missing required candidate field
- Missing resume
- Unsupported extension
- Incorrect MIME type
- Spoofed MIME type
- Resume > 5 MB
- Empty/corrupt file
- Invalid vacancy
- Application to closed vacancy
- Invalid stage
- Unauthorized stage update

### ATS

- Non-HR access
- Resume download by unauthorized user
- Internal note access by public user
- Internal note creation by unauthorized role
- Invalid application ID
- Cross-object access attempt

### Security

- Expired token
- Invalid token
- Rate-limit threshold exceeded
- Oversized request
- Malformed JSON
- Attempted role escalation
- IDOR using another application's ID

---

# 48. Positive End-to-End Tests

At minimum:

## Test 1 — Create vacancy

```text
HR login
    ↓
Create Active vacancy
    ↓
201 Created
    ↓
Verify PostgreSQL record
```

## Test 2 — Public job board

```text
GET active jobs
    ↓
Vacancy appears
```

## Test 3 — Search

```text
search=Python
    ↓
Relevant vacancy returned
```

## Test 4 — Filter

```text
department=Engineering
location=Hyderabad
experience=<approved value>
    ↓
Correct vacancies returned
```

## Test 5 — Application

```text
Candidate
    ↓
POST application + valid PDF
    ↓
201
    ↓
Tracking code generated
    ↓
Application persisted
```

## Test 6 — DOCX

```text
Valid DOCX ≤ 5 MB
    ↓
Accepted
```

## Test 7 — Invalid file

```text
EXE renamed to PDF
    ↓
Rejected
```

## Test 8 — Oversized resume

```text
> 5 MB
    ↓
Rejected
```

## Test 9 — Closed vacancy

```text
Closed vacancy
    ↓
Candidate attempts apply
    ↓
Rejected
```

## Test 10 — ATS

```text
HR
    ↓
View application
    ↓
Update stage
    ↓
Stage persisted
```

## Test 11 — Internal note

```text
HR
    ↓
Add note
    ↓
Note persisted
    ↓
Public API cannot see it
```

## Test 12 — Resume download

```text
HR
    ↓
Authorized request
    ↓
Resume returned
    ↓
Audit event created
```

## Test 13 — RBAC

```text
Sales Executive
    ↓
Attempt ATS API
    ↓
403
```

## Test 14 — Candidate acknowledgement

```text
Application persisted
    ↓
Celery task queued
    ↓
Acknowledgement processed
```

---

# 49. Performance Requirements

The platform SRS specifies:

```text
Cached response TTFB:
< 200 ms

Dynamic DB-driven page TTFB:
< 500 ms

N+1 queries:
0

Lighthouse:
90+ desktop
80+ mobile
```

For HR specifically:

- Avoid N+1 application queries.
- Index common filters.
- Paginate ATS application lists.
- Avoid loading large resume files during normal application list queries.
- Do not serialize unnecessary nested data.
- Use `select_related()`/`prefetch_related()` where required.

---

# 50. Pagination

Potentially large collections must be paginated.

Apply pagination to:

```text
Public job list
HR vacancy list
ATS application list
Application notes
```

Do not return thousands of applications in one response.

Use the project's standard DRF pagination configuration.

---

# 51. Search and Filtering Design

Keep filtering database-backed.

Do not:

```python
jobs = list(all_jobs)
jobs = [j for j in jobs if ...]
```

for large datasets.

Prefer queryset filtering.

Example logical query:

```python
JobVacancy.objects.filter(
    status=JobVacancy.Status.ACTIVE
)
```

then apply:

```text
department
location
experience
search
```

using database operations.

---

# 52. Serializer Separation

Prefer separate serializers for different contexts.

For example:

```text
PublicJobListSerializer
PublicJobDetailSerializer

CandidateApplicationCreateSerializer

AdminJobSerializer
AdminApplicationListSerializer
AdminApplicationDetailSerializer

ApplicationStageUpdateSerializer
ApplicationNoteCreateSerializer
```

This prevents accidentally exposing HR-only information through public endpoints.

---

# 53. Never Reuse Admin Serializers Publicly

Bad:

```text
GET /careers/jobs/
    ↓
AdminApplicationSerializer
```

This can expose:

- internal fields
- staff information
- notes
- storage paths
- audit metadata

Public and staff representations must be intentionally separated.

---

# 54. Resume API Design

The resume endpoint should not return raw storage metadata to unauthorized users.

Preferred behavior:

```text
HR authorized request
        |
        v
Secure file retrieval
```

Depending on storage architecture, this can be:

- streamed response, or
- short-lived authorized/signed retrieval mechanism

The SRS does not mandate the exact storage mechanism; it mandates secure controlled access.

---

# 55. Vacancy Delete vs Close

Do not confuse:

```text
Close vacancy
```

with:

```text
Delete vacancy
```

### Close

Means:

```text
Vacancy remains in database
Status = CLOSED
No new public applications
```

This preserves historical relationship with applications.

### Delete

Should be treated as an administrative/destructive operation and should follow the project's retention/audit policy.

If applications exist, do not casually cascade-delete recruitment history without an approved retention policy.

---

# 56. Data Integrity

Use foreign keys.

Primary relationship:

```text
JobVacancy
    |
    | 1:N
    v
CandidateApplication
    |
    | 1:N
    v
ApplicationNote
```

Recommended behavior:

- Application must reference an existing vacancy.
- Note must reference an existing application.
- Note author must reference an authenticated user.
- Do not allow application to exist without a vacancy unless explicitly approved.

---

# 57. Deletion Policy

Be careful with:

```text
JobVacancy → CandidateApplication
```

Because applications are historical recruitment records.

A safe implementation should avoid accidental cascading deletion of candidate applications when a vacancy is removed.

Use the project's approved retention policy and Django `on_delete` strategy accordingly.

If no deletion policy has been formally approved, favor preserving application history and using `CLOSED` for operational closure.

---

# 58. Admin Django Integration

The Django admin can be useful for development and emergency administration, but it is not a substitute for the required HR API/ATS functionality.

Register:

```text
JobVacancy
CandidateApplication
ApplicationNote
```

with useful:

- List displays
- Search
- Filters
- Read-only timestamps
- Tracking-code lookup

Do not use Django admin as the only implementation of the Careers UI/API.

---

# 59. Frontend Expectations Relevant to Backend

The backend must support the UI states required by the SRS:

```text
Loading
Success
Empty
Validation Error
Server Error
```

For the Careers UI:

### Public job board

```text
Loading jobs
No active jobs
Jobs loaded
Search/filter result empty
Server failure
```

### Application

```text
Submitting
Validation errors
Invalid resume
Resume too large
Server failure
Success + tracking code
```

### ATS

```text
Loading applications
No applications
Application loaded
Stage update success
Stage update failure
Resume download failure
```

Buttons must perform real backend actions.

---

# 60. Accessibility

The overall SRS requires WCAG 2.1 AA.

For HR forms and ATS UI:

- Labels must be associated with inputs.
- Validation errors must be visible.
- Keyboard focus must be visible.
- Interactive controls must be keyboard operable.
- Tables must remain usable on smaller screens.
- File upload controls must have accessible labels.
- Stage controls must have meaningful accessible names.
- Do not rely on color alone to indicate application stage.

Minimum standard text contrast:

```text
4.5 : 1
```

---

# 61. Responsive Requirements

Required viewport classes:

```text
1440px+       Large desktop
1024–1439px   Laptop
768–1023px    Tablet
320–767px     Mobile
```

ATS tables must not introduce horizontal overflow that makes the application unusable on mobile.

Use responsive layouts, drawers, stacked forms, and touch-friendly controls as appropriate.

---

# 62. SEO for Public Careers

The public Careers/job pages are part of the public website.

The broader SRS requires:

- Dynamic XML sitemap
- Clean robots.txt
- Canonical URLs
- Dynamic titles/descriptions where applicable
- OpenGraph/Twitter metadata where applicable
- Indexable public pages unless intentionally excluded

Job URLs should be clean and stable.

Do not expose database implementation details in public URLs unnecessarily.

---

# 63. Logging Rules

Application logs must not contain:

```text
Passwords
API keys
JWT secrets
Database passwords
Resume contents
Unnecessary candidate PII
```

Do not log:

```python
print(request.data)
```

for the application endpoint if that would expose candidate information or file metadata unnecessarily.

Use structured logging according to the platform's logging convention.

---

# 64. Error Handling

Never expose:

```text
Traceback
SECRET_KEY
Database connection string
File system paths
Internal exception details
```

to candidates or normal users.

Return controlled error responses.

Example:

```json
{
  "detail": "The uploaded resume is not supported."
}
```

rather than:

```json
{
  "error": "ValueError in recruitment.validators.py line 47..."
}
```

---

# 65. Current Repository Gaps That Must Be Addressed

The current repository contains an HR scaffold, but the following are not yet implemented:

- Recruitment models
- Recruitment migrations
- DRF serializers
- Public job APIs
- Application submission API
- Resume validation
- Secure resume storage/retrieval
- Tracking-code generation
- ATS APIs
- Stage management
- Internal notes
- HR permissions
- Audit integration
- Celery acknowledgement task
- API documentation
- Recruitment test suite
- PostgreSQL-ready integration

The existing scaffold should be extended rather than replaced with an unrelated architecture.

---

# 66. Repository-Level Gaps Affecting HR

The current repository also contains broader infrastructure that is not yet aligned with the SRS.

The observed repository includes:

```text
requirements.txt
    Django>=4.2
    config
    python-dotenv
```

The SRS requires the platform stack to include:

```text
Django
Django REST Framework
PostgreSQL 15+
Redis
Celery
REST APIs
OpenAPI/Swagger
```

The current repository settings also contain development-only values such as:

```text
DEBUG = True
SECRET_KEY = 'replace-me'
```

and the project URL configuration currently exposes only:

```text
/admin/
```

Therefore HR development should be integrated with the platform infrastructure work, not treated as an isolated standalone Django app.

---

# 67. Do Not Implement a Second Authentication System

Use:

```text
src/apps/authentication/
```

and the project's centralized RBAC implementation when available.

Do not create:

```text
recruitment/auth.py
recruitment/login.py
recruitment/roles.py
```

that duplicate platform authentication.

HR should consume the central identity/permission system.

---

# 68. Recommended Development Order

Implement in this order to reduce rework.

## Phase 1 — Infrastructure

Confirm:

- Django REST Framework
- PostgreSQL
- Authentication
- RBAC
- Redis
- Celery
- File storage
- API documentation

## Phase 2 — Models

Implement:

```text
JobVacancy
CandidateApplication
ApplicationNote
```

Then migrations.

## Phase 3 — Validation

Implement:

- Vacancy validation
- Resume validation
- Candidate application validation
- Tracking code generation
- Stage validation

## Phase 4 — Public APIs

Implement:

```text
GET jobs
GET job detail
POST application
```

## Phase 5 — HR APIs

Implement:

```text
Vacancy CRUD
Application listing/detail
Stage update
Notes
Resume retrieval
```

## Phase 6 — RBAC

Protect every staff endpoint.

## Phase 7 — Audit

Integrate all critical HR actions.

## Phase 8 — Celery

Implement candidate acknowledgement.

## Phase 9 — OpenAPI

Document every endpoint.

## Phase 10 — Tests

Unit → integration → API → security → functional → regression.

## Phase 11 — Performance

Check:

- Query counts
- N+1
- Indexes
- Pagination
- API response time

## Phase 12 — Final Acceptance

Verify the full workflow end-to-end.

---

# 69. Definition of Done — Job Vacancy

A vacancy feature is complete only when:

- [ ] HR can create a vacancy.
- [ ] Required fields are validated.
- [ ] Job ID is unique.
- [ ] Active/Closed status works.
- [ ] Data persists in PostgreSQL.
- [ ] Public API returns active jobs.
- [ ] Search works.
- [ ] Department filter works.
- [ ] Location filter works.
- [ ] Experience filter works.
- [ ] Complete details can be viewed.
- [ ] Closed vacancies cannot receive applications.
- [ ] Unauthorized staff cannot manage vacancies.
- [ ] Changes are audited.
- [ ] Tests exist.
- [ ] OpenAPI documentation exists.

---

# 70. Definition of Done — Candidate Application

- [ ] Public candidate can submit application.
- [ ] Required fields are validated.
- [ ] Resume is mandatory.
- [ ] PDF accepted.
- [ ] DOCX accepted.
- [ ] Other extensions rejected.
- [ ] MIME/content validation is performed.
- [ ] Resume >5 MB rejected.
- [ ] Unsafe/spoofed files rejected.
- [ ] Closed vacancy cannot receive applications.
- [ ] Application persists in PostgreSQL.
- [ ] Tracking code generated by backend.
- [ ] Tracking code is unique.
- [ ] Tracking code is immutable.
- [ ] Candidate acknowledgement is queued.
- [ ] Application appears in ATS.
- [ ] Audit record is created where required.
- [ ] Tests cover positive and negative cases.

---

# 71. Definition of Done — ATS

- [ ] HR can list applications.
- [ ] Applications can be filtered by position.
- [ ] Pagination works.
- [ ] Application details work.
- [ ] Stage can be updated.
- [ ] Only approved stages are accepted.
- [ ] Internal notes can be added.
- [ ] Internal notes are retained.
- [ ] Internal notes are never exposed publicly.
- [ ] Authorized HR users can download resumes.
- [ ] Unauthorized users cannot download resumes.
- [ ] Resume downloads are auditable.
- [ ] No N+1 queries.
- [ ] Tests cover RBAC and object access.

---

# 72. Definition of Done — Security

- [ ] HTTPS in deployed environments.
- [ ] Secrets are environment-driven.
- [ ] No secrets committed to Git.
- [ ] CSRF protection is enabled where applicable.
- [ ] ORM/parameterized queries are used.
- [ ] XSS protections are maintained.
- [ ] Strict CORS is configured.
- [ ] Public API rate limiting is configured.
- [ ] Authenticated API rate limiting is configured.
- [ ] Resume extension validation exists.
- [ ] Resume MIME/content validation exists.
- [ ] Resume size validation exists.
- [ ] Private storage is used.
- [ ] Resume access is permission-protected.
- [ ] Object-level authorization is enforced.
- [ ] Audit logging is enabled.
- [ ] Sensitive information is not unnecessarily logged.

---

# 73. Definition of Done — Quality

- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] API tests pass.
- [ ] Functional tests pass.
- [ ] Security tests pass.
- [ ] Regression tests pass.
- [ ] No Critical/High defects remain.
- [ ] OpenAPI documentation is complete.
- [ ] PostgreSQL persistence is verified.
- [ ] N+1 query issues are absent.
- [ ] Responsive UI is validated.
- [ ] Accessibility requirements are checked.
- [ ] Git contains no credentials/secrets.

---

# 74. Complete HR Acceptance Flow

The final system should be demonstrable using this exact scenario:

```text
1. HR logs in
       |
2. HR creates a vacancy
       |
3. Vacancy is Active
       |
4. Candidate opens Careers
       |
5. Candidate searches/filters jobs
       |
6. Candidate opens vacancy
       |
7. Candidate submits application
       |
8. Candidate uploads valid PDF/DOCX <= 5 MB
       |
9. Backend validates everything
       |
10. Application saved in PostgreSQL
       |
11. Tracking code generated
       |
12. Candidate acknowledgement queued
       |
13. HR opens ATS
       |
14. HR filters by position
       |
15. HR opens application
       |
16. HR downloads resume
       |
17. Resume access is authorized + audited
       |
18. HR adds internal note
       |
19. HR updates application stage
       |
20. Stage persists
       |
21. Unauthorized user attempts same operation
       |
22. Backend returns denial
       |
23. All relevant actions are auditable
```

---

# 75. Out-of-Scope Unless Explicitly Approved

Do **not** add these as part of the baseline HR module:

- Candidate login/account system
- Candidate dashboard
- Candidate withdrawal
- Interview calendar
- Interview scheduling
- Offer letter management
- Employee onboarding
- Payroll
- Leave management
- Performance management
- Recruitment agency management
- Candidate scoring engine
- AI resume screening
- Automated resume ranking
- Video interviews
- Background verification
- Hiring/employee conversion workflow
- Extra ATS stages
- Generic HRMS modules

These may be future extensions, but they are not part of the SRS-defined HR/ATS baseline.

---

# 76. Final HR Architecture

The intended architecture is:

```text
                         PUBLIC
                           |
                +----------+----------+
                |                     |
                v                     v
        Public Job Board       Application Portal
                |                     |
                |                     v
                |             POST /careers/apply/
                |                     |
                +----------+----------+
                           |
                           v
                    Recruitment API
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
       Vacancy        Application        Notes
        Service          Service          Service
          |                |                |
          v                v                v
      JobVacancy    CandidateApplication  AppNote
          |                |
          +--------+-------+
                   |
                   v
               PostgreSQL
                   |
       +-----------+-----------+
       |                       |
       v                       v
     Audit                  Celery
       |                       |
       v                       v
  AuditLog               Notification
                               |
                               v
                           Candidate
                         acknowledgement


                         STAFF / HR
                            |
                            v
                       HR ATS Board
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
         Applications      Notes         Resumes
             |              |              |
             +--------------+--------------+
                            |
                            v
                    Central RBAC / Auth
                            |
                            v
                       HR Manager
                       Super Admin
```

---

# 77. Final Implementation Principles

Keep these rules visible while coding:

1. **SRS first.**
2. **Do not invent extra ATS functionality.**
3. **Use the existing `recruitment` Django app.**
4. **Use PostgreSQL as the system of record.**
5. **Use DRF for the API layer.**
6. **Keep public and staff serializers separate.**
7. **Validate every input on the backend.**
8. **Resume validation must include extension, MIME/content and 5 MB size.**
9. **Never expose resumes publicly.**
10. **Use backend RBAC, not frontend hiding.**
11. **Use object-level authorization for protected application data.**
12. **Generate tracking codes on the backend.**
13. **Keep tracking codes unique and immutable.**
14. **Use only the five SRS application stages.**
15. **Keep internal notes private.**
16. **Use Celery/Redis for candidate acknowledgement.**
17. **Audit critical HR operations.**
18. **Paginate ATS/application collections.**
19. **Prevent N+1 queries.**
20. **Document every API in OpenAPI/Swagger.**
21. **Test both positive and negative paths.**
22. **Never commit credentials or production secrets.**
23. **Do not treat Django admin as a replacement for the required ATS.**
24. **Do not implement generic HRMS features outside the approved scope.**

---

# 78. Developer Quick Reference

## Core entities

```text
JobVacancy
CandidateApplication
ApplicationNote
```

## Vacancy status

```text
ACTIVE
CLOSED
```

## Application stages

```text
RECEIVED
SHORTLISTED
INTERVIEWED
OFFERED
REJECTED
```

## Mandatory public application endpoint

```http
POST /api/v1/careers/apply/
```

## Resume

```text
Required: Yes
Formats: PDF / DOCX
Maximum: 5 MB
Access: Private / authorized
```

## Public capabilities

```text
Browse jobs
Search
Filter
View job details
Apply
```

## HR capabilities

```text
Manage vacancies
View applications
Filter applications by position
Update stage
Add internal notes
Download resumes
```

## Background processing

```text
Redis
Celery
Candidate acknowledgement
```

## Security

```text
Backend RBAC
Object-level authorization
Rate limiting
CSRF
SQLi protection
XSS protection
Secure file validation
Private Supabase Storage bucket
Signed URL / secure backend retrieval
Supabase service-role key server-side only
Audit logging
No secrets in Git
```

## Database & File Storage

```text
Supabase PostgreSQL
Supabase Storage
Private candidate-resumes bucket
Django migrations
3NF-oriented normalized schema
Foreign keys
Indexes
```

Resume files:

```text
Supabase Storage
    ↓
Private bucket
    ↓
Authorized backend access
    ↓
Short-lived signed URL / secure stream
```

## API

```text
Django REST Framework
JSON
Pagination
Consistent status codes
Machine-readable errors
OpenAPI/Swagger
```

## Testing

```text
Unit
Integration
API
Functional/UI
Security
Performance
Regression
```

---

## 79. Source Traceability

This HR specification is derived primarily from these SRS areas:

| SRS Area | HR Relevance |
|---|---|
| Careers & ATS | Core HR scope |
| Recruitment Workflow | End-to-end business process |
| Database Requirements | PostgreSQL, relationships, normalization |
| API Requirements | DRF, validation, permissions, pagination, OpenAPI |
| Security Requirements | Resume protection, file validation, RBAC, audit |
| RBAC | HR Manager permissions |
| Background Processing | Candidate acknowledgement |
| Testing | Negative, security, integration and regression testing |
| Repository Requirements | `src/apps/recruitment/` structure and Git rules |
| Acceptance Criteria | PostgreSQL persistence, RBAC, end-to-end ATS, no dummy functionality |

---

# 80. Supabase HR Architecture

Supabase is part of the HR module's core persistence architecture.

```text
                         AUREXION HR
                              |
                +-------------+-------------+
                |                           |
                v                           v
        Supabase PostgreSQL          Supabase Storage
                |                           |
                |                           |
        +-------+--------+                  |
        |       |        |                  |
        v       v        v                  v
      Jobs  Applications Notes       Private Resume Files
        |       |        |
        +-------+--------+
                |
                v
          Django / DRF
                |
      +---------+---------+
      |         |         |
      v         v         v
     RBAC     Celery    Audit
      |
      v
  HR Manager
```

## Database responsibility

Supabase PostgreSQL stores structured HR data:

```text
JobVacancy
CandidateApplication
ApplicationNote
```

Django remains responsible for:

- ORM models
- migrations
- serializers
- validation
- business logic
- API endpoints
- authentication
- authorization
- audit integration

## Storage responsibility

Supabase Storage stores:

```text
Candidate resumes
```

Django should store the **Supabase Storage object path/reference** in the application record, not the binary resume itself.

Example:

```text
CandidateApplication
    |
    +-- resume_storage_path
            |
            v
    Supabase Storage
            |
            v
    candidate-resumes/applications/<id>/resume_xxx.pdf
```

## Recommended upload sequence

For the candidate application endpoint:

```text
1. Receive multipart/form-data
2. Validate candidate fields
3. Validate vacancy
4. Confirm vacancy = ACTIVE
5. Validate resume extension
6. Validate resume MIME/content
7. Validate resume <= 5 MB
8. Generate application/tracking information
9. Upload resume to private Supabase Storage
10. Create CandidateApplication in Supabase PostgreSQL
11. Store the Supabase storage path/reference
12. Commit transaction/consistent application state
13. Queue acknowledgement task
14. Return tracking code
```

### Failure handling

If the database operation fails after a storage upload, the implementation must clean up the orphaned storage object.

Conceptually:

```text
Upload succeeds
      |
      v
Database save fails
      |
      v
Delete uploaded Supabase object
      |
      v
Return controlled error
```

Likewise, do not create a database application record pointing to a resume that was never successfully uploaded.

Where strict cross-system atomicity is not possible, implement compensating cleanup/retry logic.

## Recommended download sequence

```text
HR clicks Download Resume
          |
          v
GET protected resume endpoint
          |
          v
Django authentication
          |
          v
RBAC permission
          |
          v
Application object-level authorization
          |
          v
Audit resume download
          |
          v
Generate short-lived Supabase signed URL
          |
          v
Return controlled download response
```

A signed URL should be short-lived and scoped to the requested object.

Do not save signed URLs permanently in the database.

## Supabase credentials

There are two fundamentally different credential contexts:

### Browser/client

Only expose credentials that are explicitly safe for the browser according to the project's Supabase architecture.

### Django/backend

The Supabase service-role credential, if used, is backend-only:

```text
Browser X
        |
        X SUPABASE_SERVICE_ROLE_KEY

Django Backend ✓
        |
        v
SUPABASE_SERVICE_ROLE_KEY
```

Never:

- commit it to Git
- put it in frontend environment variables
- return it through an API
- include it in logs
- embed it in generated signed URLs

## Supabase Storage bucket policy

Recommended:

```text
Bucket: candidate-resumes
Public: false
```

The bucket should contain only recruitment resume objects.

Do not mix candidate resumes with:

```text
public website images
avatars
CMS media
general documents
```

unless the project's storage architecture explicitly requires it.

## Storage path naming

Use generated identifiers rather than user-controlled filenames:

```text
applications/<application-id>/<generated-safe-name>.<ext>
```

Good:

```text
applications/8f2c1a4e/resume_7c91d2.pdf
```

Avoid:

```text
applications/8f2c1a4e/John Doe Final Resume!!.pdf
```

The original filename may be retained as metadata if the product needs to display it, but it must not become the security boundary or object identity.


# 81. Final Rule

When a future implementation decision conflicts with this document, do not simply choose the more feature-rich option.

Use this decision process:

```text
Is it explicitly required by the SRS?
        |
       YES
        |
        v
     Implement

        NO
        |
        v
Is it required to technically support an SRS feature?
        |
       YES
        |
        v
 Implement the minimum necessary solution

        NO
        |
        v
Is it an approved project-level decision?
        |
       YES
        |
        v
     Implement

        NO
        |
        v
Do not add it to the HR baseline.
```

**The goal is not to build a generic ATS. The goal is to build the Aurexion HR/Careers module exactly to the approved requirements, with production-quality Django/DRF implementation, PostgreSQL persistence, secure resume handling, RBAC, auditability, asynchronous acknowledgement, and complete automated test coverage.**
