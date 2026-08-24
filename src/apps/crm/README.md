# Aurexion CRM (Customer Relationship Management) Module

## Overview

The **CRM Module** implements the end-to-end B2B Lead Lifecycle Engine, contact form submission handling, lead assignment, status transitions, follow-up scheduling, internal notes, CSV exports, and client onboarding workflows for Aurexion Technologies.

In simple terms:

> **Inbound Lead / Contact Form → BDM Triage & Assign → Sales Exec Lead Nurturing & Follow-ups → Won Deal & Client Onboarding**

---

## 1. Domain Models & Lifecycle Architecture

### 1.1 Lead Lifecycle State Machine
Leads transition through a 7-stage state machine (`apps.crm.models.LeadStatus`):

```text
NEW → UNDER_REVIEW → CONTACTED → QUALIFIED → PROPOSAL_SUBMITTED / NEGOTIATION → WON / LOST
```

- **Opportunity Stages**: `QUALIFIED`, `PROPOSAL_SUBMITTED`, and `NEGOTIATION` are classified as active pipeline opportunities.
- **Terminal Stages**: `WON` and `LOST` end the lead pipeline lifecycle.

---

### 1.2 Core Models (`src/apps/crm/models.py`)

- `Lead`: Unique reference (`AUR-LEAD-YYYY-XXXXX`), contact details, company, industry, source (`website`, `contact_form`, `rfp_form`, `estimator`, `request_quote`), status, priority, agreed value ($), `assigned_to`, `created_by`, `client_onboarded` (Boolean).
- `LeadFollowUp`: Activity reminders with `follow_up_type` (`phone`, `email`, `meeting`, `whatsapp`), `scheduled_at`, `status` (`pending`, `completed`), notes, meeting link.
- `LeadNote`: Internal notes attached to a lead.
- `RFPEnquiry`: RFP inquiry specifications with uploaded PDF/DOCX/ZIP attachments and NDA status.

---

## 2. API Endpoints

### Authenticated CRM Endpoints (`/api/v1/leads/`)
| Method | Endpoint | Description | Permission Required |
| --- | --- | --- | --- |
| `GET` | `/api/v1/leads/` | Paginated leads directory with filters (`status`, `search`, `priority`) | `administrator`, `bdm`, `sales_executive` |
| `POST` | `/api/v1/leads/` | Create a new lead (auto-assigned if Sales Exec) | `administrator`, `bdm`, `sales_executive` |
| `GET` | `/api/v1/leads/{id}/` | Get single lead with notes, follow-ups & RFP details | `administrator`, `bdm`, `sales_executive` |
| `POST` | `/api/v1/leads/{id}/assign/` | Assign lead to Sales Executive | `administrator`, `bdm` |
| `POST` | `/api/v1/leads/{id}/won/` | Mark lead as WON with agreed deal value ($) | `administrator`, `bdm`, `sales_executive` |
| `POST` | `/api/v1/leads/{id}/lost/` | Mark lead as LOST with mandatory reason | `administrator`, `bdm`, `sales_executive` |
| `POST` | `/api/v1/leads/{id}/onboard-client/` | Onboard won lead & dispatch client portal credentials | `administrator`, `bdm` |
| `GET` | `/api/v1/leads/export/` | Export leads dataset as CSV download | `administrator`, `bdm` |

---

## 3. Security & Data Scoping

- **Sales Executive Isolation**: `LeadViewSet.get_queryset()` filters leads so Sales Executives strictly view and manage **only leads assigned to their user ID** (`assigned_to = request.user`).
- **Signal Cache Invalidation (`apps.crm.signals`)**: Post-save signals invalidate Redis telemetry caches (`bdm_dashboard_metrics`, `admin_dashboard_metrics`) instantly upon lead update or reassignment.
