# Database

PostgreSQL 15+. 38 tables — 32 for core application modules (Auth, CRM, BDM, Portal, Support, CMS, ATS) and 6 for Django system administration & security auditing.

The conventions below are not aspirational — they are enforced across the Django ORM schema and verified by automated pytest suites (`backend/tests/security/`, `backend/tests/crm/`, `backend/tests/portal/`).

---

## 1. Conventions

| Rule | Rationale |
|---|---|
| **Bigint primary key named `id`** | Standard 8-byte identity key for maximum performance and B-tree index density across high-volume transaction tables. |
| **Human-readable reference identifiers (`reference_id`, `ticket_id`, `tracking_code`, `job_id`)** | Unique string prefixes (`AUR-LEAD-*`, `TCK-*`, `APP-*`, `JOB-*`) for unambiguous external reference without exposing raw database IDs. |
| **`created_at` / `updated_at`, timezone-aware (`timestamptz`), server-defaulted** | Server defaults guarantee identical timestamps regardless of whether inserts originate from DRF API controllers, background tasks, or direct SQL migrations. |
| **`assigned_to_id` / `created_by_id`, `ON DELETE SET NULL`** | Deleting a staff account or sales executive user must never delete their leads, support tickets, or audit logs. Nullable foreign keys preserve historical record integrity. |
| **Every FK declares explicit `ON DELETE` behavior** | Defaulting to unhandled foreign key constraints leads to unexpected constraint violations. Cascade (`CASCADE`) is used for child detail tables (`LeadNote`, `LeadFollowUp`), while Set Null (`SET NULL`) is used for user references. |
| **Booleans use a predicate prefix** | `is_`, `has_`, `can_`, `client_onboarded`, `confidential` — readable as boolean questions at the ORM and API serializer boundaries. |
| **Money and budgets use `NUMERIC`** | Deal values and estimator budgets use `NUMERIC(12,2)`. Floating-point numbers are forbidden due to binary representation drift during aggregate calculations. |

### Composed Bases & Models

Declared across Django models (`src/apps/*/models.py`); models inherit standard abstract structures:

| Model Base / Pattern | Features Supplied |
|---|---|
| `TimeStampedModel` | `created_at`, `updated_at` (timestamptz, auto_now_add / auto_now) |
| `AuditedModel` | `TimeStampedModel` + `created_by_id`, `updated_by_id`, audit logging signal hooks |
| `LeadDetailModel` | `TimeStampedModel` + `lead_id` (`ON DELETE CASCADE`), `created_by_id` |

---

## 2. Multi-tenancy & Role Isolation

Role-level data scoping and RBAC isolation are enforced in four distinct operational layers:

1. **Role Field** — `UserProfile.role` defines the security principal (`SUPER_ADMIN`, `ADMINISTRATOR`, `BDM`, `SALES_EXECUTIVE`, `CLIENT`).
2. **Repository & View Set Filtering** — `LeadViewSet`, `SupportTicketViewSet`, and `ClientProjectViewSet` filter querysets automatically based on `request.user`:
   - Sales Executives only see leads assigned to their user ID (`assigned_to = request.user`).
   - Clients only see projects and support tickets owned by their user ID (`client_user = request.user`).
   - BDM and Super Admins have system-wide visibility.
3. **Compound B-Tree Indexing** — High-traffic endpoints utilize compound indexes (`(assigned_to, status)`, `(source, status)`, `(status, client_onboarded)`) so the query planner never scans unrelated rows.
4. **API Route Guards** — DRF permission classes (`IsSalesExecutive`, `IsBDM`, `IsClientUser`) deny unauthorized endpoint access.

Cross-role unauthorized access surfaces as **404 Not Found (or 403 Forbidden)** to prevent resource enumeration.

---

## 3. Domain Map

| Group | Tables |
|---|---|
| **Identity & Auth** (global) | `auth_user`, `auth_group`, `auth_permission`, `auth_user_groups`, `auth_user_user_permissions`, `authentication_userprofile`, `authentication_auditlog`, `django_session` |
| **Administration & RBAC** | `administration_role`, `administration_modulepermission`, `django_admin_log`, `django_content_type`, `django_migrations` |
| **CRM & Sales** | `crm_lead`, `crm_leadfollowup`, `crm_leadnote`, `crm_rfpenquiry`, `crm_estimatorsubmission` |
| **Client Portal & Support** | `portal_clientproject`, `portal_supportticket`, `portal_clientdocument`, `portal_projectmilestone`, `portal_sprintdeliverable`, `portal_clientnotification`, `portal_consultationrequest`, `portal_clientrequest` |
| **CMS** | `cms_service`, `cms_casestudy`, `cms_category`, `cms_blogpost`, `cms_industry`, `cms_companyinformation`, `cms_industry_case_studies`, `cms_industry_services` |
| **Recruitment & ATS** | `recruitment_jobvacancy`, `recruitment_candidateapplication`, `recruitment_applicationnote` |

---

## 4. Decisions Worth Defending

### 7-Stage Lead Lifecycle State Machine

`crm_lead.status` is managed by a strict state machine:  
`NEW` → `UNDER_REVIEW` → `CONTACTED` → `QUALIFIED` → `PROPOSAL_SUBMITTED` → `NEGOTIATION` → `WON` / `LOST`.

- **State Validation**: Invalid transitions (e.g., jumping from `NEW` directly to `WON` without qualification) are rejected at the service layer.
- **Won Deal Client Onboarding**: Transitioning a lead to `WON` triggers `client_onboarded = True`, automatically creates a `portal_clientproject` record, provisions a `auth_user` account with role `CLIENT`, and dispatches welcome credentials via email.

### BDM Workload Balancing & RFP Desk

- **Automated Workload Distribution**: When new leads arrive via `crm_rfpenquiry` or public forms, BDM desk evaluates active Sales Executives' current `NEW`/`UNDER_REVIEW` load and auto-assigns the lead to the executive with the lightest active pipeline.
- **RFP Acceptance Engine**: RFP acceptances automatically spawn linked `crm_lead` records while preserving original proposal attachments in `crm_rfpenquiry.document_attachment`.

### Client Name Confidentiality Masking in CMS

`cms_casestudy.confidential` (boolean) allows sensitive enterprise client stories to be published publicly. When `confidential = True`, the frontend serializer automatically masks the client's identity (e.g., "Leading Fortune 500 Financial Institution") while keeping tech stack and architecture metrics visible.

### In-Flight Promise Deduplication & Redis Caching

To prevent duplicate API GET requests from React frontend components:
- **Client-Side Deduplication**: In-flight promise maps (`adminPromises` and `supportPromises`) share active HTTP GET promises across simultaneous component renders.
- **Server-Side Redis / Memory Caching**: Role directory endpoints (`users_role_*`) and BDM telemetry (`bdm_dashboard_metrics`) are cached with TTL 120s–300s.
- **Instant Signal Invalidation**: `apps.crm.signals` clears cache keys instantly upon `post_save` or `post_delete` of `Lead`, `LeadFollowUp`, or `UserProfile`.

---

## 5. Indexing Strategy

All hot indexes lead with filtering keys (`assigned_to`, `status`, `role`). Partial and compound indexes ensure that index scans cover only active records.

### Key Production Indexes

| Index Name | Table | Indexed Columns | Serves |
|---|---|---|---|
| `auth_userprofile_role_idx` | `authentication_userprofile` | `(role)` | Accelerates `/api/v1/users/?role=sales_executive` queries |
| `crm_lead_source_idx` | `crm_lead` | `(source)` | Speeds up inbound channel analytics and form submission telemetry |
| `crm_lead_assign_stat_idx` | `crm_lead` | `(assigned_to_id, status)` | Optimizes Sales Executive CRM dashboard lead filtering |
| `crm_lead_src_stat_idx` | `crm_lead` | `(source, status)` | Accelerates BDM Lead Triage & RFP Desk queries |
| `crm_lead_onboard_idx` | `crm_lead` | `(status, client_onboarded)` | Optimizes BDM Won Deal Onboarding Desk queries |
| `portal_supportticket_stat_idx` | `portal_supportticket` | `(assigned_to_id, status)` | Speeds up Support Desk executive ticket queues |

### Uniqueness Constraints

Enforced at the database level via `UNIQUE` constraints and indexes:
- `auth_user.username` & `auth_user.email`
- `authentication_userprofile.user_id` (1-to-1 strict constraint)
- `crm_lead.reference_id` (`AUR-LEAD-*`)
- `portal_supportticket.ticket_id` (`TCK-*`)
- `recruitment_jobvacancy.job_id` (`JOB-*`)
- `recruitment_candidateapplication.tracking_code` (`APP-*`)
- `cms_service.slug`, `cms_casestudy.slug`, `cms_blogpost.slug`, `cms_category.slug`

---

## 6. Schema Specifications & Column References

### 🔑 1. Identity & Security

#### Table `auth_user`
| Column | Type | Constraints | Rationale / Description |
|---|---|---|---|
| `id` | `int4` | Primary Key | System user identifier |
| `username` | `varchar(150)` | UNIQUE | User login name |
| `email` | `varchar(254)` | NOT NULL | User work email |
| `password` | `varchar(128)` | NOT NULL | Argon2 / PBKDF2 hashed password |
| `first_name` | `varchar(150)` | NOT NULL | User first name |
| `last_name` | `varchar(150)` | NOT NULL | User last name |
| `is_staff` | `bool` | Default `false` | Admin panel access flag |
| `is_active` | `bool` | Default `true` | Account active flag |
| `date_joined` | `timestamptz` | NOT NULL | Registration timestamp |

#### Table `authentication_userprofile`
| Column | Type | Constraints | Rationale / Description |
|---|---|---|---|
| `id` | `int8` | Primary Key | Profile record ID |
| `user_id` | `int4` | FK (`auth_user.id`), UNIQUE | One-to-one mapping to system user |
| `role` | `varchar(50)` | Indexed | System role (`SUPER_ADMIN`, `BDM`, `SALES_EXECUTIVE`, `CLIENT`) |

#### Table `authentication_auditlog`
| Column | Type | Constraints | Rationale / Description |
|---|---|---|---|
| `id` | `int8` | Primary Key | Audit log ID |
| `user_id` | `int4` | FK (`auth_user.id`), NULLABLE | Actor triggering operation |
| `action` | `varchar(100)` | NOT NULL | Action code (`LOGIN`, `LEAD_ASSIGNED`, `ONBOARD_CLIENT`) |
| `module` | `varchar(50)` | NOT NULL | Target module (`CRM`, `BDM`, `PORTAL`, `AUTH`) |
| `previous_state` | `jsonb` | NULLABLE | Pre-mutation JSON state snapshot |
| `updated_state` | `jsonb` | NULLABLE | Post-mutation JSON state snapshot |
| `ip_address` | `inet` | NULLABLE | Client IP address |
| `timestamp` | `timestamptz` | NOT NULL | Security event timestamp |

---

### 📊 2. Customer Relationship Management (CRM)

#### Table `crm_lead`
| Column | Type | Constraints | Rationale / Description |
|---|---|---|---|
| `id` | `int8` | Primary Key | Lead record ID |
| `reference_id` | `varchar(50)` | UNIQUE | Reference ID (e.g., `AUR-LEAD-DVGM706D`) |
| `name` | `varchar(255)` | NOT NULL | Client contact name |
| `email` | `varchar(254)` | NOT NULL | Client email address |
| `company` | `varchar(255)` | NOT NULL | Client organization name |
| `industry` | `varchar(100)` | NOT NULL | Business industry sector |
| `source` | `varchar(50)` | Indexed | Channel (`website_form`, `rfp_form`, `estimator`) |
| `status` | `varchar(50)` | Indexed | 7-stage state (`NEW`, `QUALIFIED`, `PROPOSAL_SUBMITTED`, `WON`, `LOST`) |
| `value` | `numeric(12,2)` | NULLABLE | Estimated contract value |
| `assigned_to_id` | `int4` | FK (`auth_user.id`), NULLABLE | Assigned Sales Executive |
| `rfp_enquiry_id` | `int8` | FK (`crm_rfpenquiry.id`), UNIQUE, NULLABLE | Linked RFP submission |
| `client_onboarded` | `bool` | Default `false` | Flag set `true` when welcome credentials dispatched |
| `created_at` | `timestamptz` | NOT NULL | Lead creation timestamp |

#### Table `crm_leadfollowup`
| Column | Type | Constraints | Rationale / Description |
|---|---|---|---|
| `id` | `int8` | Primary Key | Follow-up ID |
| `lead_id` | `int8` | FK (`crm_lead.id`) | Associated lead |
| `follow_up_type` | `varchar(50)` | NOT NULL | Type (`CALL`, `MEETING`, `DEMO`) |
| `scheduled_at` | `timestamptz` | NOT NULL | Scheduled meeting timestamp |
| `status` | `varchar(20)` | Default `'PENDING'` | Status (`PENDING`, `COMPLETED`, `CANCELLED`) |
| `meeting_link` | `varchar(500)` | Default `''` | Video conference link (Google Meet / Zoom) |

---

### 🌐 3. Client Portal & Support Desk

#### Table `portal_clientproject`
| Column | Type | Constraints | Rationale / Description |
|---|---|---|---|
| `id` | `int8` | Primary Key | Project ID |
| `client_user_id` | `int4` | FK (`auth_user.id`) | Client user ID |
| `title` | `varchar(255)` | NOT NULL | Project name |
| `status` | `varchar(50)` | NOT NULL | Status (`PLANNING`, `IN_PROGRESS`, `DELIVERED`) |
| `progress_percentage` | `int4` | Default `0` | Project progress (0-100%) |
| `delivery_lead_name` | `varchar(255)` | NOT NULL | Assigned delivery lead name |

#### Table `portal_supportticket`
| Column | Type | Constraints | Rationale / Description |
|---|---|---|---|
| `id` | `int8` | Primary Key | Support ticket ID |
| `ticket_id` | `varchar(50)` | UNIQUE | Reference code (`TCK-2026-0814`) |
| `client_user_id` | `int4` | FK (`auth_user.id`) | Client user ID |
| `assigned_to_id` | `int4` | FK (`auth_user.id`), NULLABLE | Support executive ID |
| `subject` | `varchar(255)` | NOT NULL | Ticket subject |
| `category` | `varchar(100)` | NOT NULL | Category (`TECHNICAL`, `BILLING`, `FEATURE`) |
| `priority` | `varchar(20)` | NOT NULL | Priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| `status` | `varchar(30)` | NOT NULL | Status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) |

---

## 7. Migrations & Schema Health

```bash
# Navigate to backend directory
cd backend

# Execute database migrations
python manage.py migrate

# Create new schema migration after model updates
python manage.py makemigrations

# Validate Django system and database model integrity
python manage.py check
```

- Migration integrity is validated in automated CI via `python manage.py check`.
- Production deployments run migrations as a single pre-deployment step (`python manage.py migrate --noinput`).

---

## 8. Extensions

PostgreSQL extensions configured in production:
- `pgcrypto`: For cryptographic functions and UUID generation.
- `pg_trgm`: For fast fuzzy trigram searching over names, emails, and ticket subjects (`ILIKE '%...%'`).
- `btree_gist`: Multi-column index support over scalar and range types.
