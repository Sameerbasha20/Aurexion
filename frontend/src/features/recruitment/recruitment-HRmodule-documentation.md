# Recruitment Module Documentation

## Module Structure

```text
recruitment/
├── hooks/
│   └── useRecruitment.ts
├── pages/
│   ├── Applications/
│   │   ├── ApplicationsPage.tsx
│   │   └── index.tsx
│   ├── Candidates/
│   │   └── index.tsx
│   ├── Jobs/
│   │   └── index.tsx
│   └── Dashboard.tsx
└── services/
    └── recruitmentService.ts
```

## Service Layer

## File

```text
frontend/src/features/recruitment/services/recruitmentService.ts
```

The service is the API boundary for the recruitment feature.

It imports:

```text
axiosClient
API_ENDPOINTS
APP_CONFIG
```

`axiosClient` performs the HTTP requests and `API_ENDPOINTS.RECRUITMENT` supplies the recruitment endpoint paths.

---

## 5.1 `JobVacancy` Interface

```text
id: number
job_id: string
title: string
department: string
location: string
experience: string
skills: string
responsibilities: string
status: string
created_at: string
updated_at: string
applications_count?: number
```

---

## 5.2 `JobCreatePayload` Interface

Used when creating a vacancy:

```text
job_id: string
title: string
department: string
location: string
experience: string
skills: string
responsibilities: string
status: string
```

The Jobs page initializes the new vacancy status as:

```text
ACTIVE
```

---

## 5.3 `CandidateApplication` Interface

```text
id: number
tracking_code: string
first_name: string
last_name: string
email: string
phone: string
resume_storage_path: string
stage: string
created_at: string
updated_at: string
job_vacancy: number
job_title?: string
job_department?: string
job_code?: string
```

---

## 5.4 `CandidateItem` Interface

```text
id: number
application_id: number
name: string
email: string
phone: string
job_id: number
job_code?: string
job_title?: string
job_department?: string
stage: string
applied_date: string
resume_url: string
tracking_code: string
```

---

## 5.5 `RecruitmentDashboardStats` Interface

The dashboard receives:

```text
active_vacancies
closed_vacancies
total_jobs
total_applications

applied_count
screening_count
shortlisted_count
interview_count
offer_count
hired_count
rejected_count

pipeline_stages
recent_applications
active_jobs
department_distribution
```

### `pipeline_stages`

Each stage contains:

```text
stage
label
count
color
```

### `recent_applications`

Contains candidate application records enriched with job information.

The service returns the first 10 enriched applications as the recent application stream.

### `active_jobs`

Contains jobs whose status is `ACTIVE`.

### `department_distribution`

Each department contains:

```text
department
jobs_count
applications_count
```

---

### Service Methods

## 6.1 `getAdminJobs()`

Fetches all administrator job vacancies, including vacancies that are closed.

```text
GET /careers/admin/jobs/
```

The service supports both:

```text
Array response
```

and paginated-style:

```text
{ results: [...] }
```

If the response itself is an array, it is returned directly. Otherwise `results` is used.

---

## 6.2 `getPublicJobs()`

Fetches the public Careers job listing. The backend returns only ACTIVE vacancies.

```text
GET /careers/jobs/
```

This method is available from the recruitment service for public job listing use.

---

## 6.3 `getJobDetail(jobId)`

Fetches one public ACTIVE vacancy by job ID.

```text
GET /careers/jobs/{jobId}/
```

Returns one `JobVacancy`.

---

## 6.4 `createJob(jobData)`

Creates a new vacancy through the administrator recruitment API.

```text
POST /careers/admin/jobs/
```

Payload:

```text
JobCreatePayload
```

Returns the created `JobVacancy`.

---

## 6.5 `updateJob(jobId, jobData)`

Updates a vacancy by its `job_id`.

```text
PATCH /careers/admin/jobs/{jobId}/
```

The payload is a partial `JobVacancy`.

---

## 6.6 `toggleJobStatus(jobId, status)`

Updates a vacancy status.

Allowed backend status values:

```text
ACTIVE
CLOSED
```

Request:

```text
PATCH /careers/admin/jobs/{jobId}/
```

Body:

```text
{
  "status": "ACTIVE | CLOSED | DRAFT"
}
```

---

## 6.7 `getAdminApplications()`

Fetches all candidate applications.

```text
GET /careers/admin/applications/
```

Supports both array and `results` response formats.

---

## 6.8 `getApplication(trackingCode)`

Fetches a single application.

```text
GET /careers/admin/applications/{trackingCode}/
```

---

## 6.9 `updateApplicationStage(trackingCode, stage)`

Updates a candidate application stage.

```text
PATCH /careers/admin/applications/{trackingCode}/stage/
```

Body:

```text
{
  "stage": "APPLIED | SCREENING | SHORTLISTED | INTERVIEW | OFFER | HIRED | REJECTED"
}
```

---

## 6.10 `getApplicationResumeUrl(trackingCode)`

Gets the resume download URL.

```text
GET /careers/admin/applications/{trackingCode}/resume/
```

Expected return shape:

```text
{
  download_url: string
}
```

The Candidates page and the older Applications page use this method.

---

## 6.11 `getCandidates()`

Builds the candidate talent pool from two API calls:

```text
getAdminApplications()
getAdminJobs()
```

Both calls are made in parallel.

The jobs are converted into a map using:

```text
job.id → JobVacancy
```

Each application is then enriched with its related job.

Candidate name is created from:

```text
first_name + last_name
```

If no name is available:

```text
Candidate
```

is used.

If the related job is not found:

```text
Position #{job_vacancy}
```

is used for the position title.

If the department is unavailable:

```text
General
```

is used.

The candidate `resume_url` is initially populated from:

```text
application.resume_storage_path
```

---

## 6.12 `getDashboardStats()`

Builds all dashboard metrics from:

```text
getAdminJobs()
getAdminApplications()
```

Both requests run in parallel.

### Job calculations

Active vacancies:

```text
status === ACTIVE
```

Closed vacancies:

```text
status === CLOSED
```

Total jobs:

```text
jobs.length
```

### Application stage calculations

The service counts applications for:

```text
APPLIED
SCREENING
SHORTLISTED
INTERVIEW
OFFER
HIRED
REJECTED
```

If an application has no stage, it is treated as:

```text
APPLIED
```

### Pipeline stages

The service creates seven pipeline entries:

```text
APPLIED      → Applied
SCREENING    → Screening
SHORTLISTED  → Shortlisted
INTERVIEW    → Interview
OFFER        → Offer
HIRED        → Hired
REJECTED     → Rejected
```

### Application enrichment

Applications are enriched using the job map:

```text
job.id → job
```

The enriched application receives:

```text
job_title
job_department
job_code
```

### Department distribution

The service creates a department map.

For every job:

```text
jobs_count += 1
```

For every application:

```text
applications_count += 1
```

If no department is available:

```text
General
```

is used.

### Recent applications

Only the first 10 enriched applications are returned:

```text
enrichedApps.slice(0, 10)
```

### Active jobs

Only jobs with an active status are returned.

---

## 6.13 `getResumeUrl(trackingCode)`

This is a second resume URL helper.

It calls the same resume endpoint:

```text
GET /careers/admin/applications/{trackingCode}/resume/
```

Expected successful data is normalized to:

```text
{
  resume_url: string
}
```

If the response contains a nested `data` object, the nested value is used.

If the request fails, the method does not rethrow the error. It returns:

```text
{
  resume_url: ""
}
```

The active `ApplicationsPage.tsx` uses this helper.

---

## Recruitment Hooks

## File

```text
frontend/src/features/recruitment/hooks/useRecruitment.ts
```

This file contains four hooks:

```text
useRecruitmentDashboard
useJobs
useApplications
useCandidates
```

---

## `useRecruitmentDashboard`

Purpose:

- Load dashboard metrics.
- Maintain loading state.
- Maintain error state.
- Provide a refresh function.

State:

```text
data
isLoading
error
```

On mount:

```text
fetchStats()
```

is executed.

The hook calls:

```text
recruitmentService.getDashboardStats()
```

On success:

```text
data = returned dashboard stats
```

On failure:

```text
error = error message
```

The returned API is:

```text
{
  data,
  isLoading,
  error,
  refetch
}
```

---

## `useJobs`

Purpose:

- Load vacancies.
- Create vacancies.
- Edit vacancies.
- Toggle vacancy status.
- Refresh the job list.

State:

```text
jobs
isLoading
error
actionLoading
```

### Initial loading

Calls:

```text
recruitmentService.getAdminJobs()
```

### Create

Calls:

```text
recruitmentService.createJob(jobData)
```

The new job is added to the beginning of the local list.

### Update

Calls:

```text
recruitmentService.updateJob(jobId, jobData)
```

The matching job is replaced by comparing:

```text
job.job_id === jobId
```

### Toggle status

Calls:

```text
recruitmentService.toggleJobStatus(jobId, status)
```

The matching job is replaced in local state.

### Returned values

```text
{
  jobs,
  isLoading,
  actionLoading,
  error,
  refetch,
  createJob,
  updateJob,
  toggleStatus
}
```

`actionLoading` is used while create/update/status operations are executing.

---

## `useApplications`

Purpose:

- Load applications.
- Load jobs at the same time.
- Enrich applications with job information.
- Update application stages.
- Refresh the application list.

State:

```text
applications
isLoading
error
actionLoading
```

### Initial loading

The hook simultaneously requests:

```text
getAdminApplications()
getAdminJobs()
```

The job list is converted to:

```text
Map<job.id, JobVacancy>
```

Each application is enriched with:

```text
job_title
job_department
job_code
```

Fallback values:

```text
job_title → Position #{job_vacancy}
job_department → General
```

### Stage update

Calls:

```text
recruitmentService.updateApplicationStage(trackingCode, stage)
```

The matching application is updated locally using:

```text
app.tracking_code === trackingCode
```

Only the returned stage is replaced in the local application record.

### Returned values

```text
{
  applications,
  isLoading,
  actionLoading,
  error,
  refetch,
  updateStage
}
```

---

## `useCandidates`

Purpose:

- Load the talent pool.
- Update candidate stages.
- Refresh candidates.

State:

```text
candidates
isLoading
error
```

Initial loading calls:

```text
recruitmentService.getCandidates()
```

Stage update calls:

```text
recruitmentService.updateApplicationStage(trackingCode, stage)
```

The matching candidate is updated locally using its tracking code.

Returned values:

```text
{
  candidates,
  isLoading,
  error,
  refetch,
  updateCandidateStage
}
```

---

## Dashboard

## File

```text
frontend/src/features/recruitment/pages/Dashboard.tsx
```

Component:

```text
Dashboard
```

Hook used:

```text
useRecruitmentDashboard()
```

Direct service used:

```text
recruitmentService.updateApplicationStage()
```

---

### Loading State

While metrics are loading, the page displays:

```text
HR Recruiter Desk
```

and six loading KPI cards.

The loading cards use a pulsing placeholder presentation.

---

### Error State

If the dashboard API fails, the page displays:

```text
Unable to load HR Dashboard Metrics
```

The API error message is shown.

A:

```text
Retry Connection
```

button calls:

```text
refetch()
```

---

### Header

The main dashboard title is:

```text
Recruitment & Talent Console
```

The header displays:

```text
HR RECRUITER DESK
API LIVE
```

Actions:

```text
Refresh
Applications ({total_applications})
Manage Vacancies
```

Navigation:

```text
Applications → /recruitment/applications
Manage Vacancies → /recruitment/jobs
```

---

### Primary KPI Cards

The dashboard displays four primary metrics.

### Active Vacancies

Shows:

```text
stats.active_vacancies
```

and the total number of positions:

```text
stats.total_jobs
```

### Total Candidates

Shows:

```text
stats.total_applications
```

and the number currently in screening:

```text
stats.screening_count
```

### Interviews & Shortlist

Shows:

```text
stats.shortlisted_count + stats.interview_count
```

and the active interview count.

### Offers & Hired

Shows:

```text
stats.hired_count + stats.offer_count
```

and separately shows hired and pending-offer counts.

---

### Recruitment Pipeline Funnel

Displays every entry in:

```text
stats.pipeline_stages
```

For each stage:

```text
stage label
count
percentage
```

Percentage is calculated as:

```text
round((stage.count / total_applications) * 100)
```

If there are no applications, percentage is:

```text
0
```

The funnel contains:

```text
Applied
Screening
Shortlisted
Interview
Offer
Hired
Rejected
```

A:

```text
Full Map
```

link opens:

```text
/recruitment/applications
```

---

### Active Job Openings Panel

Shows active vacancies from:

```text
stats.active_jobs
```

Only the first four are displayed:

```text
stats.active_jobs.slice(0, 4)
```

Each item shows:

```text
job_id
title
department
location
experience
```

Each item has:

```text
Manage
```

which opens:

```text
/recruitment/jobs
```

If there are no active jobs, the page shows:

```text
No active job openings published.
```

and a:

```text
Create Job Vacancy
```

button.

---

### Recent Candidate Applications

Uses:

```text
stats.recent_applications
```

Each record shows:

```text
candidate name
application stage
role
email
application date
```

The list is scrollable and comes from the first 10 applications returned by the service.

### Quick stage advancement

If the current stage is:

```text
APPLIED
```

the dashboard shows:

```text
Screen Candidate
```

which changes the stage to:

```text
SCREENING
```

If the current stage is:

```text
SCREENING
```

the dashboard shows:

```text
Shortlist
```

which changes the stage to:

```text
SHORTLISTED
```

The action calls:

```text
recruitmentService.updateApplicationStage()
```

After success, the dashboard refreshes its metrics.

### Review Application

Every recent application has:

```text
Review Application →
```

The link opens:

```text
/recruitment/applications?search={tracking_code}
```

---

## Jobs

## File

```text
frontend/src/features/recruitment/pages/Jobs/index.tsx
```

Component:

```text
Jobs
```

Hook:

```text
useJobs()
```

---

## 13.1 Jobs Page State

The page maintains:

```text
searchTerm
statusFilter
departmentFilter
isCreateOpen
isEditOpen
editingJob
actionSuccess
createForm
createError
editForm
editError
```

---

## 13.2 Job Search

The search field searches against:

```text
title
job_id
department
location
skills
```

Search is case-insensitive.

---

## 13.3 Job Filters

### Status filter

Available options:

```text
All Statuses
ACTIVE
CLOSED
```

### Department filter

Departments are generated dynamically from the loaded job list.

Only unique non-empty department values are displayed.

---

## 13.4 Job KPI Cards

The page displays:

### Active Vacancies

```text
jobs.filter(status === ACTIVE).length
```

### Closed Positions

```text
jobs.filter(status === CLOSED).length
```

### Departments

```text
unique department count
```

---

## 13.5 Jobs Table

The jobs list displays:

```text
JOB CODE / DATE
POSITION & DEPARTMENT
LOCATION & EXPERIENCE
KEY SKILLS
STATUS
ACTIONS
```

For each job:

- Job code is displayed.
- Created date is formatted with `toLocaleDateString()`.
- Title and department are shown.
- Location and experience are shown.
- Skills are displayed with ellipsis when the text is too long.
- Status is displayed as a badge.
- Actions are available for status, editing and applications.

### Job status action

If current status is:

```text
ACTIVE
```

the action is:

```text
Close
```

and changes status to:

```text
CLOSED
```

For any other status, the action is:

```text
Publish
```

and changes status to:

```text
ACTIVE
```

### Edit action

Opens the Edit Job Vacancy modal.

### Applications action

Navigates to:

```text
/recruitment/applications?job={job.title}
```

The active Applications page reads this URL parameter and applies the vacancy filter.

---

## Create Job Vacancy

The Jobs page provides a Create Vacancy action.

Initial form values:

```text
job_id: ""
title: ""
department: ""
location: ""
experience: ""
skills: ""
responsibilities: ""
status: "ACTIVE"
```

Fields:

```text
Job ID
Job Title
Department
Location
Experience
Status
Required Skills
Responsibilities
```

The create form requires:

```text
Job ID
Job Title
```

If either is missing:

```text
Job ID and Job Title are required.
```

is displayed.

On submit:

```text
createJob(createForm)
```

is called.

On success:

- Modal closes.
- Form resets.
- Success message is displayed for 3 seconds.
- New job is already inserted into local hook state.

The submit button displays:

```text
Publishing...
```

while the action is running.

---

## Edit Job Vacancy

Selecting Edit opens the update modal.

The edit form is populated from the selected vacancy:

```text
title
department
location
experience
skills
responsibilities
status
```

`job_id` is used as the identifier but is not edited in the form.

On submit:

```text
updateJob(editingJob.job_id, editForm)
```

is called.

On success:

- Modal closes.
- Selected job is cleared.
- Success message is displayed for 3 seconds.
- Local job state is updated.

The submit button displays:

```text
Saving...
```

while the action is running.

---

## Candidates

## File

```text
frontend/src/features/recruitment/pages/Candidates/index.tsx
```

Component:

```text
Candidates
```

Hook:

```text
useCandidates()
```

---

## 16.1 Candidate Page State

The page maintains:

```text
searchTerm
stageFilter
selectedCandidate
isStageModalOpen
newStage
actionSuccess
actionLoading
```

---

## 16.2 Candidate Search

Search checks:

```text
name
email
phone
job_title
tracking_code
```

Search is case-insensitive for text fields.

---

## 16.3 Candidate Stage Filter

Options:

```text
All Candidate Stages
APPLIED
SCREENING
SHORTLISTED
INTERVIEW
OFFER
HIRED
REJECTED
```

---

## 16.4 Candidate Table

The table displays:

```text
CANDIDATE NAME / CODE
CONTACT REACH
APPLIED POSITION
CURRENT STAGE
RESUME
ACTIONS
```

Candidate information includes:

- Candidate name.
- Tracking/reference code.
- Applied date.
- Email.
- Phone.
- Job title.
- Department.
- Current recruitment stage.

---

## 16.5 Candidate Contact Actions

The email address is rendered as:

```text
mailto:{candidate.email}
```

If a phone number exists, it is rendered as:

```text
tel:{candidate.phone}
```

---

## 16.6 Candidate Resume

If the candidate has a resume reference, the page displays:

```text
View Resume
```

Clicking it calls:

```text
recruitmentService.getApplicationResumeUrl(trackingCode)
```

If a `download_url` is returned, it is opened in a new browser tab.

If the API call fails, the page displays:

```text
Failed to load resume URL
```

---

## Candidate Stage Update

Selecting:

```text
Update Stage
```

opens the Candidate Stage Progression modal.

The selected candidate's current stage is initially loaded into the selector.

Available stage choices:

```text
APPLIED (Initial Intake)
SCREENING (Resume Evaluation)
SHORTLISTED (Selected for Interview)
INTERVIEW (Active Interview Round)
OFFER (Formal Offer Extended)
HIRED (Candidate Accepted)
REJECTED (Candidate Not Selected)
```

Submitting the form calls:

```text
updateCandidateStage(
  selectedCandidate.tracking_code,
  newStage
)
```

On success:

- Modal closes.
- Candidate selection is cleared.
- Success notification is displayed.
- Candidate list is refreshed.

The submit button changes to:

```text
Updating...
```

while the operation is active.

---

## 17.1 Candidate Review Navigation

Each candidate has:

```text
Review →
```

The link opens:

```text
/recruitment/applications?search={tracking_code or candidate.name}
```

This transfers the candidate into the Applications review page.

---

## Applications

## Active File

```text
frontend/src/features/recruitment/pages/Applications/ApplicationsPage.tsx
```

This is the applications implementation currently used by the recruitment route.

The page uses:

```text
useApplications()
useJobs()
```

and directly uses:

```text
recruitmentService.getResumeUrl()
```

---

## Applications URL Filters

The active Applications page reads URL query parameters when it loads and whenever browser history changes.

Supported job parameters:

```text
job
job_title
job_id
vacancy
```

Supported stage parameter:

```text
stage
```

Supported search parameters:

```text
search
q
```

Examples:

```text
/recruitment/applications?job=Software%20Engineer
```

```text
/recruitment/applications?stage=INTERVIEW
```

```text
/recruitment/applications?search=APP-001
```

The page also listens to:

```text
popstate
```

so browser history navigation can update the filters.

---

## Applications Filters

## Search

Search checks:

```text
first_name
last_name
email
tracking_code
job_title
```

The active implementation does not include phone in its search expression.

## Stage

The stage filter supports:

```text
APPLIED
SCREENING
SHORTLISTED
INTERVIEW
OFFER
HIRED
REJECTED
```

## Vacancy

The vacancy filter is built from both:

```text
application job titles
loaded job titles
```

The filter can match:

```text
job title
job code
numeric job vacancy ID
job title case-insensitively
job code case-insensitively
```

---

## Applications KPI Cards

The active Applications page displays counters for:

```text
APPLIED
SCREENING
SHORTLISTED
INTERVIEW
HIRED
```

Clicking a stage card toggles that stage filter.

For example:

```text
APPLIED → filter APPLIED
APPLIED again → clear APPLIED filter
```

The selected stage card receives an active visual border.

---

## Applications Table

The active page displays:

```text
TRACKING REF / DATE
CANDIDATE
APPLIED ROLE & DEPT
STAGE
RESUME
ACTION
```

Each application row contains:

- Tracking code.
- Application date.
- Candidate name.
- Email.
- Phone.
- Job title.
- Department.
- Current stage.
- Resume availability.
- Review action.

---

## Resume Flow

The active Applications page uses:

```text
recruitmentService.getResumeUrl(trackingCode)
```

If a `resume_url` is returned:

```text
window.open(resume_url, "_blank")
```

If the URL is empty:

```text
Resume file unavailable.
```

If the request throws an error:

```text
Unable to open resume file: {error message}
```

---

## Application Review

Selecting:

```text
Inspect Desk
```

opens the candidate application review modal.

The review modal displays:

```text
Candidate name
Tracking code
Application date
Email address
Phone
Position vacancy
Resume attachment
Current stage
```

If a resume exists:

```text
Open Resume
```

is available.

---

## Application Stage Transition

The active application review modal provides direct stage transition actions:

```text
→ Screening
→ Shortlist
→ Interview
→ Offer
→ Hired
× Reject
```

Each action calls:

```text
updateStage(trackingCode, nextStage)
```

The stage is then updated in the selected application.

The page displays a success message such as:

```text
Application candidate moved to INTERVIEW stage.
```

The success message is cleared after 3 seconds.

---

## Alternate Applications File

## File

```text
frontend/src/features/recruitment/pages/Applications/index.tsx
```

This file is also present in the recruitment module.

It exports:

```text
Applications
```

and implements an earlier/alternate version of the applications review screen.

It uses:

```text
useApplications()
```

but does not use `useJobs()`.

---

## 26.1 Differences from the Active Applications Page

The alternate implementation:

- Uses application-derived job titles for its vacancy filter.
- Searches candidate full name, email, phone, tracking code and job title.
- Matches the vacancy filter only against `app.job_title`.
- Uses `getApplicationResumeUrl()` and expects `download_url`.
- Calls `refetch()` after stage updates.
- Uses the title:
  `Job Applications Review Desk`
- Labels the page:
  `APPLICATIONS AUDIT TRAIL`
- Uses the label:
  `Submissions`
- Provides the same recruitment stage values.
- Provides an application review modal and stage transition controls.

The active implementation is:

```text
Applications/ApplicationsPage.tsx
```

because the recruitment routing imports that file.

The presence of `Applications/index.tsx` does not make it the current routed Applications page.

---

## Application Stage Lifecycle

The recruitment module uses this common stage set:

```text
APPLIED
   │
   ▼
SCREENING
   │
   ▼
SHORTLISTED
   │
   ▼
INTERVIEW
   │
   ▼
OFFER
   │
   ▼
HIRED
```

A candidate can also be moved to:

```text
REJECTED
```

The UI provides stage updates from the candidate page, applications page, and selected dashboard quick actions.

The backend is responsible for accepting the stage update through the stage endpoint; the frontend sends the requested stage.

---

## Recruitment Navigation

The recruitment pages use `wouter` links.

Main navigation paths used by the feature:

```text
/recruitment/dashboard
/recruitment/jobs
/recruitment/candidates
/recruitment/applications
```

Cross-page navigation includes:

```text
Dashboard
   ├── Applications
   └── Jobs

Jobs
   └── Applications?job={job title}

Candidates
   └── Applications?search={tracking code or candidate name}

Applications
   └── Jobs
```

The applications page is therefore able to receive context from the Jobs and Candidates pages through URL query parameters.

---

## API Endpoint Map

The recruitment service maps to these API paths:

| Operation | HTTP | Endpoint |
|---|---|---|
| Public jobs | GET | `/careers/jobs/` |
| Public job detail | GET | `/careers/jobs/{jobId}/` |
| Create admin job | POST | `/careers/admin/jobs/` |
| Admin jobs | GET | `/careers/admin/jobs/` |
| Update admin job | PATCH | `/careers/admin/jobs/{jobId}/` |
| Admin applications | GET | `/careers/admin/applications/` |
| Application detail | GET | `/careers/admin/applications/{id}/` |
| Application stage | PATCH | `/careers/admin/applications/{id}/stage/` |
| Application resume | GET | `/careers/admin/applications/{id}/resume/` |

The service uses the tracking code as the application identifier for application-detail, stage and resume operations.

---

## Loading, Error and Refresh Behavior

## Dashboard

Loading:

```text
Skeleton KPI cards
```

Error:

```text
Unable to load HR Dashboard Metrics
Retry Connection
```

Refresh:

```text
refetch()
```

## Jobs

Loading:

```text
SYNCING JOBS BOARD...
```

Error:

```text
error message
Retry
```

Refresh calls:

```text
refetch()
```

Create/update errors are shown inside their respective forms.

## Candidates

Loading displays a candidate synchronization state.

Error displays the hook error with:

```text
Retry
```

Refresh calls:

```text
refetch()
```

Stage update failures use an alert.

## Applications

Loading displays:

```text
Syncing candidates pipeline stream...
```

Error displays the error with:

```text
Retry
```

Refresh calls:

```text
refetch()
```

Resume and stage failures use alerts.

---
