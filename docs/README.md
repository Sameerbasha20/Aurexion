# Aurexion Enterprise Platform — Documentation Index

This directory contains technical documentation, architecture blueprints, database schemas, module guides, and testing reports for the Aurexion Enterprise Platform.

---

## 📚 Core Application Module Guides

- **[BDM Documentation](BDM.md)** — Business Development Manager workflows, lead triage, team workload balancing, RFP acceptance/decline desk, and two-stage won lead client onboarding.
- **[CRM Documentation](CRM.md)** — B2B Lead Lifecycle State Machine (7 stages), role-based lead scoping, follow-up reminders, internal notes, CSV exports, public form handlers, and database indexing.
- **[Authentication & RBAC Documentation](AUTHENTICATION.md)** — JWT authentication, user profile roles (`super_admin`, `administrator`, `bdm`, `sales_executive`, `hr_manager`, `content_manager`, `support_executive`, `client_user`), and security audit logging.
- **[Administration & RBAC Matrix](ADMINISTRATION/RBAC.md)** — Granular CRUD permissions per module and system lock-out constraints.
- **[CMS Documentation](CMS.md)** — Services, Industry Solutions, Engineering Case Studies (with confidential client masking), and Knowledge Center / Blog engine.
- **[Client Portal Documentation](CLIENT_PORTAL.md)** — Secure client portal tickets, project milestones, and document vault.
- **[Recruitment ATS Documentation](RECRUITMENT.md)** — Job vacancy postings, candidate applications, stage pipelines, and resume file handling.

---

## ⚙️ Architecture & Infrastructure

- **[API Documentation](API_DOCUMENTATION.md)** — Full REST API layout and OpenAPI Swagger endpoints.
- **[Architecture Guide](ARCHITECTURE.md)** — System architecture, Django app structure, React frontend integration, and white-label design system.
- **[Database Specification](DATABASE.md)** — Entity relationships, PostgreSQL Supabase integration, and performance indexes.
- **[Deployment Guide](DEPLOYMENT.md)** — Docker, Gunicorn multi-threading, Vercel frontend, Render backend, and environment setup.
- **[Testing Report](TESTING.md)** — Unit test suite, integration coverage, and performance benchmarks.
