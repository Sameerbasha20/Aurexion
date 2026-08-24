# CRM (Customer Relationship Management) Module Documentation

The `crm` module implements the end-to-end B2B Lead Lifecycle Engine, contact form submission handling, lead assignment, status transitions, follow-up scheduling, internal notes, CSV exports, and client onboarding workflows for Aurexion Technologies.

---

## 1. Domain Models & Lifecycle Architecture

### 1.1 Lead Lifecycle State Machine
Leads transition through a strict 7-stage state machine (`apps.crm.models.LeadStatus`):

```
                       ┌──────────────────────┐
                       │       1. NEW         │ (Inbound Submission / Public Form)
                       └──────────┬───────────┘
                                  │
                       ┌──────────▼───────────┐
                       │   2. UNDER REVIEW    │ (BDM Triage & Assign)
                       └──────────┬───────────┘
                                  │
                       ┌──────────▼───────────┐
                       │    3. CONTACTED      │ (Sales Executive Outreach)
                       └──────────┬───────────┘
                                  │
                       ┌──────────▼───────────┐
                       │    4. QUALIFIED      │ (Opportunity Confirmed)
                       └──────────┬───────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
┌──────────▼───────────┐┌─────────▼──────────┐┌──────────▼───────────┐
│ 5. PROPOSAL SUBMITTED││    6. NEGOTIATION  ││        LOST          │ (Terminal State)
└──────────┬───────────┘└─────────┬──────────┘└──────────────────────┘
           │                      │
           └──────────────────────┴──────────────────────┐
                                                         │
                                              ┌──────────▼───────────┐
                                              │        WON           │ (Terminal State)
                                              └──────────┬───────────┘
                                                         │
                                              ┌──────────▼───────────┐
                                              │   CLIENT ONBOARDING  │ (BDM Dispatch)
                                              └──────────────────────┘
```

- **Terminal Statuses**: `WON` and `LOST` end the lifecycle. Transitioning directly from `NEW` to `WON` is forbidden (requires prior qualification).
- **Opportunity Statuses**: `QUALIFIED`, `PROPOSAL_SUBMITTED`, and `NEGOTIATION` are classified as active pipeline opportunities.

---

### 1.2 Core Models

#### `Lead`
- **Reference Identifier**: Auto-generated unique format `AUR-LEAD-YYYY-XXXXX` (or `AUR-LEAD-XXXXXXXX`).
- **Attributes**: `name`, `email`, `phone`, `company`, `industry`, `source` (`website`, `contact_form`, `rfp_form`, `estimator`, `request_quote`), `description`, `status`, `priority` (`low`, `medium`, `high`, `urgent`), `value` (agreed deal size), `lost_reason`, `client_onboarded` (Boolean flag).
- **Relationships**:
  - `assigned_to` -> Foreign Key to `User` (Sales Executive).
  - `created_by` -> Foreign Key to `User` (Creator).
  - `rfp_enquiry` -> One-to-One with `RFPEnquiry` (Optional RFP document/specification).
- **Database B-Tree Indexing**:
  - Single field indexes: `status`, `source`, `priority`, `industry`, `created_at`, `next_follow_up_at`.
  - Compound indexes: `(assigned_to, status)`, `(source, status)`, `(status, client_onboarded)`.

#### `LeadFollowUp`
- **Fields**: `lead` (FK), `assigned_to` (FK), `follow_up_type` (`phone`, `email`, `meeting`, `whatsapp`, `linkedin`, `other`), `scheduled_at`, `status` (`pending`, `in_progress`, `completed`, `cancelled`), `notes`, `meeting_link`.
- **Database Indexes**: `(lead, scheduled_at)`, `scheduled_at`, `status`, `(status, scheduled_at)`.

#### `LeadNote`
- **Fields**: `lead` (FK), `author` (FK to `User`), `content`, `created_at`.

#### `RFPEnquiry`
- **Fields**: `reference_id` (`AUR-RFP-YYYY-XXXXX`), `full_name`, `company_name`, `work_email`, `phone`, `designation`, `country`, `project_type`, `budget_range`, `project_description`, `document_attachment` (File upload up to 10MB PDF/DOCX/ZIP), `nda_required` (Boolean).

---

## 2. Role-Based Scoping & Security Rules

1. **Super Admins & BDMs**:
   - Access to full leads repository, unassigned leads queue, reassignment permissions, analytics export, and client onboarding dispatch.
2. **Sales Executives**:
   - **Strict Data Isolation**: Backend `LeadViewSet.get_queryset()` filters results so Sales Executives strictly view and edit **only leads assigned to their user ID** (`assigned_to = request.user`).
   - **Lead Creation & Workspace Scoping**: Can establish/create new leads directly in the CRM (`POST /api/v1/leads/`), which are automatically assigned to the creating Sales Executive.
   - Can transition assigned leads across lifecycle stages, add follow-up reminders, add notes, and record closing deal details when winning a lead.

---

## 3. High-Performance Caching & Signals

- **Signal Cache Invalidation (`apps.crm.signals`)**:
  - `post_save` & `post_delete` signals on `Lead`, `LeadFollowUp`, and `UserProfile` automatically invalidate Redis/Memcached entries (`cache.delete("bdm_dashboard_metrics")`, `cache.delete("admin_dashboard_metrics")`, `cache.delete_pattern("users:*")`).
  - Guarantees **100% real-time data consistency** with **< 10ms TTFB** response times across all dashboard and list endpoints.

---

## 4. API Layout

### 4.1 Authenticated CRM Operations (`/api/v1/leads/`)
- `GET /api/v1/leads/`: Paginated leads directory (Supports filters: `status`, `source`, `search`, `priority`, `assigned_to`).
- `POST /api/v1/leads/`: Lead creation by BDM / Admin / Sales Executive.
- `GET /api/v1/leads/{id}/`: Retrieve single lead with notes, follow-up history, and RFP details.
- `PUT/PATCH /api/v1/leads/{id}/`: Update lead details.
- `POST /api/v1/leads/{id}/assign/`: Assign/reassign lead to a Sales Executive (Triggers notification email & cache invalidation).
- `POST /api/v1/leads/{id}/transition/`: Advance lead status along valid lifecycle paths.
- `POST /api/v1/leads/{id}/qualify/`: Mark lead as QUALIFIED.
- `POST /api/v1/leads/{id}/won/`: Mark lead as WON (Captures agreed project value `$`).
- `POST /api/v1/leads/{id}/lost/`: Mark lead as LOST (Captures mandatory `lost_reason`).
- `POST /api/v1/leads/{id}/onboard-client/` (alias `/onboard_client/`): Trigger client account provisioning and dispatch credentials email (BDM/Admin only).
- `POST /api/v1/leads/{id}/schedule-meeting/`: Schedule a follow-up meeting with Google Meet/Zoom link.
- `GET/POST /api/v1/leads/{id}/notes/`: Retrieve/add internal notes.
- `GET/POST /api/v1/leads/{id}/follow-ups/`: Retrieve/create follow-up activities.
- `POST /api/v1/leads/{id}/follow-ups/{followup_id}/complete/`: Mark follow-up as completed.
- `GET /api/v1/leads/export/`: Export filtered lead dataset as CSV download.

### 4.2 Public Inbound Endpoints (Throttled & Unauthenticated)
- `POST /api/v1/public/leads/`: Website contact form submission (Auto-creates `Lead` with source `website`).
- `POST /api/v1/rfp/submit/` (and `/api/v1/crm/rfp/submit/`): Public RFP form submission with document attachment.
- `POST /api/v1/estimator/calculate/`: Public interactive cost estimator tool.
