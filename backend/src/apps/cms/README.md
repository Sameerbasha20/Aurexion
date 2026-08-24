# Aurexion CMS (Content Management System) Module

## Overview

The **CMS Module** powers the public-facing marketing site and enterprise content console for Aurexion Technologies. It manages blog posts, technology services, industry solutions, case studies, team members, testimonials, media assets, and SEO metadata.

In simple terms:

> **Content Managers publish articles & services → Cached public APIs serve marketing website → Enterprise Console tracks content performance**

---

## Key Features

1. **Public Marketing Content APIs**: Unauthenticated, high-performance endpoints for published blogs, services, case studies, industries, and testimonials.
2. **Enterprise CMS Console**: Authenticated CRUD management for Content Managers (`content_manager`), Administrators (`administrator`), and Super Admins (`super_admin`).
3. **Draft & Published Workflow**: Status state machine (`DRAFT`, `PUBLISHED`, `ARCHIVED`) ensuring unpublished content is hidden from public API consumers.
4. **Rich Content & SEO Metadata**: Support for slug generation, meta titles, meta descriptions, canonical URLs, featured images, and reading time calculations.

---

## Core Models (`src/apps/cms/models.py`)

- `BlogPost`: Articles with title, slug, content, excerpt, category, tags, status, publish date, author.
- `Service`: Core technology services (e.g. Cloud Integration, Custom Software, AI Engineering).
- `Industry`: Industry verticals (e.g. Healthcare, Fintech, Logistics, Real Estate).
- `CaseStudy`: Client success stories with metrics, challenges, solution architecture, and outcomes.
- `Category`: Categorization taxonomy for blogs and services.
- `Testimonial`: Client quotes, ratings, and company attributions.
- `TeamMember`: Executive leadership and staff bios.

---

## API Endpoints

### Public Endpoints (Unauthenticated)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/cms/blog/` | List published blog posts |
| `GET` | `/api/v1/cms/blog/{slug}/` | Get single blog post details |
| `GET` | `/api/v1/cms/services/` | List active technology services |
| `GET` | `/api/v1/cms/case-studies/` | List client case studies |
| `GET` | `/api/v1/cms/industry/` | List industry solution pages |

### Admin Console Endpoints (Authenticated)
| Method | Endpoint | Description | Permission Required |
| --- | --- | --- | --- |
| `GET/POST` | `/api/v1/cms/admin/blog/` | Manage blog posts | `content_manager`, `administrator` |
| `GET/POST` | `/api/v1/cms/admin/services/` | Manage technology services | `content_manager`, `administrator` |
| `GET/POST` | `/api/v1/cms/admin/case-studies/` | Manage case studies | `content_manager`, `administrator` |
| `GET/POST` | `/api/v1/cms/admin/categories/` | Manage categories | `content_manager`, `administrator` |
