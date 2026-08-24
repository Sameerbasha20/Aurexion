# Aurexion BDM (Business Development Manager) Module

## Overview

The **BDM Module** provides specialized managerial telemetry, sales team workload analytics, inbound lead triage, RFP review & acceptance, and won-lead client onboarding oversight for Business Development Managers and Executive Leadership at Aurexion Technologies.

In simple terms:

> **BDM triages inbound leads → Assigns to Sales Executives → Monitors pipeline workload → Onboards won clients into Portal**

---

## Key Responsibilities

1. **Inbound Lead Triage & Dynamic Assignment**:
   - Monitors inbound leads from public forms (`contact_form`, `rfp_form`, `estimator`, `request_quote`).
   - Fetches active Sales Executives with live workload counts to balance team lead distribution.

2. **Request for Proposal (RFP) Desk**:
   - Reviews technical specs, project scopes, uploaded documents (`.pdf`, `.docx`, `.zip`), and budget ranges.
   - Accepts RFPs (assigning them to Sales Execs) or declines them (capturing reason and emailing client).

3. **Client Onboarding & Credentials Dispatch**:
   - Reviews won deals converted by Sales Executives.
   - Provisions client portal accounts (`client_user` role) and dispatches automated welcome emails with credentials.

4. **Real-Time Managerial Telemetry**:
   - Single-pass high-performance API aggregating total leads, conversion rates, pipeline breakdown, overdue follow-ups, and sales team workload.

---

## Core Endpoints

| Method | Endpoint | Description | Permission Required |
| --- | --- | --- | --- |
| `GET` | `/api/v1/bdm/dashboard/` | BDM Executive Telemetry & Workload Metrics | `super_admin`, `administrator`, `bdm` |
| `POST` | `/api/v1/leads/{id}/assign/` | Assign lead to Sales Executive | `super_admin`, `administrator`, `bdm` |
| `POST` | `/api/v1/leads/{id}/onboard-client/` | Onboard won lead & dispatch client credentials | `super_admin`, `administrator`, `bdm` |
| `POST` | `/api/v1/leads/{id}/lost/` | Decline RFP or mark lead lost with reason | `super_admin`, `administrator`, `bdm` |

---

## Performance & Caching

- **Redis Cache Layer**: Dashboard telemetry is cached under `bdm_dashboard_metrics` (15s TTL).
- **Sub-10ms TTFB**: High-speed metrics return in **< 10ms**, providing instant dashboard loading.
- **Cache Invalidation**: CRM signals automatically flush cached metrics when leads are updated or reassigned.
