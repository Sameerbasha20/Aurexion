# Aurexion Client Portal & Support Helpdesk Module

## Overview

The **Portal Module** powers the enterprise Client Portal, project delivery timeline tracking, milestone management, document repository, and client support ticket helpdesk for Aurexion Technologies.

In simple terms:

> **Onboarded Client logs in → Views project progress & milestones → Communicates with Delivery Lead → Raises Support Tickets**

---

## Key Features

1. **Client Project & Milestone Tracking**:
   - Live project progress percentage, target completion dates, status badges, and senior delivery lead contacts.
   - Project phase milestones (`Architecture & Design`, `Core System Integration`, `UAT & Security Audit`, `Cloud Deployment`).
2. **Support Ticket Helpdesk**:
   - Multi-role ticket management for Clients (`client_user`), Support Executives (`support_executive`), and Administrators (`administrator`).
   - Ticket categories (`technical_issue`, `billing_inquiry`, `feature_request`, `service_outage`, `account_access`).
   - Priority levels (`low`, `medium`, `high`, `critical`) and status states (`open`, `assigned`, `in_progress`, `awaiting_client`, `resolved`, `closed`).
3. **Automated Client Provisioning**:
   - `ensure_client_project_exists(user)` automatically provisions an active enterprise project and delivery timeline when a newly onboarded client logs in.

---

## Core Models (`src/apps/portal/models.py`)

- `ClientProject`: Enterprise project engagement details (`client_user`, `title`, `description`, `status`, `progress_percentage`, `delivery_lead_name`, `start_date`, `target_completion_date`).
- `ProjectMilestone`: Project phases (`project`, `title`, `description`, `status`, `progress_percentage`, `due_date`, `completed_at`).
- `SupportTicket`: Helpdesk ticket (`ticket_id`, `client_user`, `subject`, `category`, `status`, `priority`, `assigned_to`, `resolution_notes`).
- `TicketMessage`: Threaded communication messages attached to a support ticket.
- `ClientDocument`: Secure project documents and deliverables.

---

## API Endpoints

### Client Portal Endpoints (`/api/v1/client/`)
| Method | Endpoint | Description | Permission Required |
| --- | --- | --- | --- |
| `GET` | `/api/v1/client/dashboard/` | Client overview, project progress & active tickets | `client_user` |
| `GET` | `/api/v1/client/projects/` | List active enterprise projects | `client_user` |
| `GET` | `/api/v1/client/tickets/` | List client support tickets | `client_user` |
| `POST` | `/api/v1/client/tickets/` | Create a new support ticket | `client_user` |

### Support Executive & Admin Helpdesk (`/api/v1/support/`)
| Method | Endpoint | Description | Permission Required |
| --- | --- | --- | --- |
| `GET` | `/api/v1/support/tickets/` | Executive ticket queue | `support_executive`, `administrator` |
| `PATCH` | `/api/v1/support/tickets/{id}/` | Update ticket status & resolution notes | `support_executive`, `administrator` |
| `GET` | `/api/v1/support/tickets/stats/` | Helpdesk ticket telemetry & response times | `support_executive`, `administrator` |
