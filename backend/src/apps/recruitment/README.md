# Aurexion HR Module

## Overview

The **Aurexion HR Module** is the platform's **Careers and Applicant
Tracking System (ATS)**.

Its purpose is to manage the recruitment journey from the moment HR
creates a job vacancy to the point where HR reviews and manages
candidate applications.

In simple terms:

> **HR creates a job → Candidates discover the job → Candidates apply →
> Applications are tracked → HR reviews and manages candidates**

The module is focused specifically on **recruitment and careers**. It is
not a complete HRMS covering payroll, leave management, employee
onboarding, or other general employee-management functions.

------------------------------------------------------------------------

## What Does the HR Module Do?

The HR module provides a centralized recruitment process for Aurexion.

It allows:

-   HR to create and manage job vacancies.
-   Candidates to view available job opportunities.
-   Candidates to search and filter jobs.
-   Candidates to view complete job descriptions.
-   Candidates to submit applications with their resumes.
-   The system to validate and securely store applications and resumes.
-   Each successful application to receive a unique tracking code.
-   HR to view and manage applications through an ATS.
-   HR to move applications through recruitment stages.
-   HR to add private notes to applications.
-   Authorized HR users to securely access candidate resumes.
-   The system to send candidate acknowledgements through background
    processing.

------------------------------------------------------------------------

# HR Module Pages

The HR module contains **4 main functional areas**.

## 1. Job Vacancy Management

This is the HR-facing area where HR creates and manages job openings.

HR can manage information such as:

-   Job ID
-   Job title
-   Department
-   Location
-   Experience requirement
-   Skills
-   Responsibilities
-   Vacancy status

A vacancy can have two statuses:

-   **ACTIVE** -- The job is available to candidates.
-   **CLOSED** -- The job is no longer available and cannot receive new
    applications.

Only active vacancies are displayed on the public Careers page.

------------------------------------------------------------------------

## 2. Public Careers / Job Board

This is the candidate-facing side of the HR module.

Candidates can:

-   Browse available jobs.
-   Search for jobs.
-   Filter jobs by department.
-   Filter jobs by location.
-   Filter jobs by experience.
-   Open a job to view its complete details.
-   Start the application process.

Candidates do not need staff/HR access to browse the public job board.

------------------------------------------------------------------------

## 3. Candidate Application Portal

Once a candidate finds a suitable vacancy, they can submit an
application.

The application includes:

-   Candidate/application information.
-   Vacancy reference.
-   Resume upload.

The resume is:

-   Required.
-   Accepted in **PDF or DOCX** format.
-   Limited to **5 MB**.
-   Validated before being accepted.
-   Stored securely.

After a successful application, the system generates a unique tracking
code in the format:

`AUR-APP-XXXX`

This allows the application to be uniquely identified.

The candidate acknowledgement is processed asynchronously after
submission.

------------------------------------------------------------------------

## 4. Admin ATS Board

The ATS Board is the main working area for HR after candidates start
applying.

HR can:

-   View applications.
-   Filter applications by position.
-   Open application details.
-   Review candidate information.
-   Update the recruitment stage.
-   Add internal/private notes.
-   View internal notes.
-   Securely access candidate resumes.

### Application Stages

The module uses five approved recruitment stages:

1.  **RECEIVED** -- The application has been submitted.
2.  **SHORTLISTED** -- HR has shortlisted the candidate.
3.  **INTERVIEWED** -- The candidate has reached the interviewed stage.
4.  **OFFERED** -- An offer stage has been reached.
5.  **REJECTED** -- The application has been rejected.

------------------------------------------------------------------------

# Complete Recruitment Flow

``` text
HR creates vacancy
        ↓
Vacancy becomes ACTIVE
        ↓
Candidate visits Careers page
        ↓
Candidate searches / filters jobs
        ↓
Candidate opens job details
        ↓
Candidate submits application + resume
        ↓
Application is validated
        ↓
Application is stored
        ↓
Unique tracking code is generated
        ↓
Candidate acknowledgement is queued
        ↓
HR views application in ATS
        ↓
HR reviews candidate
        ↓
HR updates recruitment stage
        ↓
HR can add internal notes
        ↓
Authorized HR user can access resume
```

------------------------------------------------------------------------

# Public Side vs HR Side

The easiest way to understand the module is to divide it into two sides.

  Candidate / Public Side   HR Side
  ------------------------- ---------------------------------
  View available jobs       Create and manage jobs
  Search jobs               View applications
  Filter jobs               Filter applications by position
  View job details          Review candidate details
  Submit application        Update application stage
  Upload resume             Add internal notes
  Receive tracking code     Securely access resumes

Both sides use the same recruitment system, but they have different
levels of access.

Public users can access only public recruitment information.

HR users access protected recruitment information through the authorized
HR side of the system.

------------------------------------------------------------------------

# How the HR Module Connects to the Rest of Aurexion

The HR module is part of the larger Aurexion platform rather than being
a standalone system.

### Authentication

HR operations are protected by the platform's authentication system.

### Role-Based Access

Protected HR functionality is available to authorized HR users such as
**HR Manager** and **Super Admin**.

Unauthorized users cannot access protected HR operations.

### Database

Recruitment information is stored in **Supabase PostgreSQL**.

The main HR data includes:

-   Job vacancies
-   Candidate applications
-   Application notes

### Resume Storage

Candidate resumes are stored securely using private storage.

They are not exposed as publicly accessible files.

### Background Processing

Candidate acknowledgement is handled through the platform's
background-processing system using **Celery and Redis**.

### Careers Experience

The public Careers page uses the recruitment functionality to display
active vacancies and allow candidates to apply.

### HR / Recruitment Dashboard

The HR dashboard uses the protected recruitment functionality to manage
vacancies and applications.

------------------------------------------------------------------------

# Main HR Data

The module is centered around three main types of information.

## Job Vacancy

Represents a job opportunity created by HR.

Example:

``` text
Job ID: AUR-ENG-001
Title: Software Engineer
Department: Engineering
Location: Hyderabad
Experience: 2–4 Years
Status: ACTIVE
```

## Candidate Application

Represents a candidate's application for a particular vacancy.

It contains the candidate's application information, resume reference,
tracking code and recruitment stage.

## Application Note

Represents an internal note added by HR while reviewing an application.

These notes are private and are not exposed through the public Careers
experience.

------------------------------------------------------------------------

# HR Module APIs

The module provides APIs for both public candidates and authorized HR
users.

### Public functionality

Public APIs support:

-   Viewing active jobs.
-   Viewing job details.
-   Submitting applications.

### HR functionality

Protected APIs support:

-   Managing vacancies.
-   Viewing applications.
-   Viewing application details.
-   Updating application stages.
-   Accessing resumes.
-   Viewing internal notes.
-   Creating internal notes.

The API layer allows the Careers frontend and HR dashboard to
communicate with the recruitment system.

------------------------------------------------------------------------

# Security and Privacy

Candidate information and resumes are treated as protected data.

The module includes controls for:

-   HR authentication.
-   Role-based access.
-   Object-level authorization.
-   Resume validation.
-   Private resume storage.
-   Protection of internal HR notes.
-   Rate limiting for public application functionality.
-   Protection against invalid or unsafe uploaded files.
-   Secure resume retrieval.

A public user should never be able to access another candidate's resume
or HR's internal notes.

------------------------------------------------------------------------

# Testing and Verification

The HR module was tested across multiple areas, including:

-   Unit testing.
-   API testing.
-   Recruitment workflow testing.
-   Role and permission testing.
-   Resume security testing.
-   Notes privacy testing.
-   Database integrity testing.
-   Pagination and filtering.
-   Performance testing.
-   Regression/smoke testing.

The final QA result recorded:

> **104 / 104 PASS**

The testing report recorded **103 automated tests with 0 failures and 0
errors**, along with a separate PostgreSQL foreign-key integrity
verification.

Additional verified behaviors included:

-   Active jobs are publicly available.
-   Closed jobs are not publicly available.
-   Search and filters work.
-   Valid PDF/DOCX resumes are accepted.
-   Invalid and unsafe resume uploads are rejected.
-   Applications are persisted.
-   Tracking codes are unique.
-   Unauthorized users are blocked from protected HR functionality.
-   Approved HR roles can access protected functionality.
-   Internal notes remain private.
-   Authorized HR users can access resumes securely.
-   Tested API response-time benchmarks were below 500 ms.

------------------------------------------------------------------------

# What the HR Module Provides to Aurexion

The HR module gives Aurexion a structured recruitment process instead of
handling hiring through disconnected job posts, forms and manual
tracking.

It connects:

**Job Creation**

↓

**Public Careers**

↓

**Candidate Applications**

↓

**Application Tracking**

↓

**HR Review**

↓

**Recruitment Stage Management**

↓

**Candidate Information & Resume Management**

This gives both candidates and HR a centralized recruitment experience.

------------------------------------------------------------------------

# Quick Summary

  Area                     HR Module Capability
  ------------------------ -------------------------------------------
  Module Type              Careers & Applicant Tracking System (ATS)
  Main Users               Candidates, HR Manager, Super Admin
  Functional Areas         4
  Vacancy Management       Yes
  Public Job Board         Yes
  Candidate Applications   Yes
  Resume Upload            PDF / DOCX, up to 5 MB
  Application Tracking     Yes
  ATS                      Yes
  Recruitment Stages       5
  Internal HR Notes        Yes
  Secure Resume Access     Yes
  Database                 Supabase PostgreSQL
  Resume Storage           Private Supabase Storage
  Background Processing    Celery / Redis
  API Layer                Django REST Framework
  Final QA Result          **104/104 PASS**

------------------------------------------------------------------------

# In One Sentence

> **The Aurexion HR Module is a recruitment and applicant-tracking
> system that allows HR to create vacancies, candidates to discover and
> apply for jobs, and HR teams to securely review, track and manage
> those applications from one centralized platform.**
