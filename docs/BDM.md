# BDM (Business Development Manager) Module Documentation

The `bdm` module provides specialized managerial workflows, real-time pipeline telemetry, sales team workload balancing, inbound lead triage, RFP review & acceptance, and won-lead client onboarding operations for Business Development Managers (BDMs) and Executive Leadership at Aurexion Technologies.

---

## 1. Managerial Workflows & Key Responsibilities

### 1.1 Inbound Lead Triage & Dynamic Assignment
- **Inbound Desk**: BDMs monitor all inbound leads coming from the public website, contact forms, RFP requests, and estimator submissions (`source` in `['rfp_form', 'contact_form', 'website_form', 'estimator', 'request_quote']`).
- **Dynamic Sales Executive Roster**: The BDM desk queries `/api/v1/users/?role=sales_executive` dynamically. Newly registered or updated Sales Executives instantly populate the assignment dropdown in the format `Name (Username)` alongside their live active workload count.
- **Assignment Dispatch**: Assigning a lead updates `assigned_to`, sets status to `UNDER_REVIEW` (if previously `NEW`), dispatches an automated notification email to the executive, and invalidates dashboard caches.

---

### 1.2 Request For Proposal (RFP) Desk Operations
- **RFP Inquiries**: Accessible at `/bdm/rfp`. Presents incoming RFPs with uploaded specification documents (`.pdf`, `.docx`, `.zip`), project type, budget range, and NDA status.
- **Accept RFP**: Assigns the RFP to a selected Sales Executive to begin proposal engineering.
- **Decline RFP**: Marks the RFP lead as `LOST` with a captured decline reason and dispatches a polite decline email to the client.

---

### 1.3 Two-Stage Won Lead to Client Onboarding
To maintain strict division of duties between Sales Executives and BDMs:
1. **Stage 1 (Sales Executive)**: When a deal is closed, the Sales Executive marks the lead `WON`, records the agreed project cost ($), and closing notes. The lead status changes to `WON` with `client_onboarded = False`.
2. **Stage 2 (BDM Oversight & Credential Dispatch)**:
   - The BDM Dashboard & Clients Desk (`/bdm/clients`) displays a **"Pending BDM Credential Dispatch"** banner and badge.
   - BDM reviews deal terms, confirms client contact information, sets or approves default welcome password (e.g., `Client@2026`), and clicks **"Send Welcome Credentials & Onboard"**.
   - System provisions the `client_user` account, dispatches the credentials email, marks `client_onboarded = True`, and moves the lead to the Active Clients directory.

---

## 2. BDM Dashboard Telemetry & Metrics

The `/api/v1/bdm/dashboard/` endpoint aggregates real-time business telemetry in a single optimized pass:

- **Total Leads**: Total inbound leads count and breakdown (`assigned_leads`, `unassigned_leads`).
- **Pipeline Breakdown**: Counts of leads by stage (`new`, `under_review`, `contacted`, `qualified`, `proposal_submitted`, `negotiation`, `won`, `lost`).
- **Won Conversion Rate**: Calculated as `(won / (won + lost)) * 100`.
- **Overdue Follow-ups**: Distinct count of open follow-ups where `scheduled_at < current_time`.
- **Sales Team Workload**: Active lead counts per Sales Executive, sorted by workload for intelligent distribution.
- **Won Clients Directory**: Recent won deals awaiting client onboarding credential dispatch.
- **Pending RFP Queue**: Unassigned RFP form submissions requiring immediate review.
- **Recent Activity Feed**: Latest 10 audit log entries across the CRM module.

---

## 3. High-Performance Caching & Optimization

- **Redis / Memory Cache Layer**: Dashboard telemetry is cached under `bdm_dashboard_metrics` (120s TTL).
- **Sub-10ms Response Times**: Cached responses return in **< 10ms**, achieving up to a 500x speedup over unindexed database queries.
- **Instant Signal Invalidation**: `apps.crm.signals` invalidates `bdm_dashboard_metrics` instantly whenever any lead or follow-up is created, updated, or reassigned, ensuring BDMs never see stale metrics.

---

## 4. API Layout

### 4.1 BDM Management Endpoints
- `GET /api/v1/bdm/dashboard/`: Returns complete aggregated BDM metrics dashboard payload.
- `GET /api/v1/users/?role=sales_executive`: Returns active Sales Executives with role & workload counts.
- `POST /api/v1/leads/{id}/assign/`: Assigns lead to a Sales Executive.
- `POST /api/v1/leads/{id}/onboard-client/` (alias `/onboard_client/`): Provisions client portal user and dispatches credentials.
- `POST /api/v1/leads/{id}/lost/`: Declines RFP or marks lead as lost with recorded reason.
