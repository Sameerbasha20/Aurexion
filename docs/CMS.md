# CMS (Content Management System) Module Documentation

The `cms` module implements the database-driven workflows for managing services, industry solutions, engineering case studies, and blog/knowledge center articles on the Aurexion Technologies platform.

---

## 1. Workflows & Domain Models

### 1.1 Services CMS Workflow
Manages core business services.
*   **Model (`Service`)**: Title, unique slug, description, problem statement, target solution, tech stack (JSON list), and status (`draft`, `published`, `archived`).
*   **Aesthetics & Caching**: Public page resolves by slug. Modifying services triggers cache invalidation via database post-save signals.

### 1.2 Industry Solutions Workflow
Aggregates relational context for industry solutions.
*   **Model (`Industry`)**: Name, unique slug, challenges narrative, target solutions, and Many-to-Many associations to `Service` and `CaseStudy`.
*   **Aggregation**: Public route `GET /api/v1/cms/public/industries/{slug}/` dynamically queries relationships and serializes the aggregated challenges, solutions, associated services, and sector case studies.

### 1.3 Case Study CMS Workflow
Narrates technical engineering success stories while guarding confidential client info.
*   **Model (`CaseStudy`)**: Title, unique slug, client name, context, business challenge, proposed architecture & stack, development approach, modules & security integrations, outcomes & performance, confidential flag, and status.
*   **Validation of Confidentiality**: Under standard public endpoints, if `confidential=True`, the `client` name is masked to `"Confidential Client"` to prevent data leaks. Staff roles (Super Admins and Content Managers) get full unmasked details via admin endpoints.

### 1.4 Blog / Knowledge Center Workflow
Knowledge sharing and search index engine.
*   **Model (`Category`)**: Hierarchical article categories (parent self-reference).
*   **Model (`BlogPost`)**: Title, unique slug, category, tags (JSON list), media URL, author, timestamps (published_at), SEO metadata, and status (`draft`, `published`, `scheduled`, `archived`).
*   **Features**:
    *   Keyword search on title/body.
    *   Category and tag filtering.
    *   Related posts suggestions: Auto-suggests up to 3 posts in the same category.

---

## 2. API Endpoint Layout

### 2.1 Admin CRUD ViewSets
Protected by `IsContentManager` permission (accessible only to `super_admin` and `content_manager` roles).

*   `GET/POST/PUT/PATCH/DELETE /api/v1/cms/admin/services/`
*   `GET/POST/PUT/PATCH/DELETE /api/v1/cms/admin/industries/`
*   `GET/POST/PUT/PATCH/DELETE /api/v1/cms/admin/case-studies/`
*   `GET/POST/PUT/PATCH/DELETE /api/v1/cms/admin/categories/`
*   `GET/POST/PUT/PATCH/DELETE /api/v1/cms/admin/blog/`

### 2.2 Public Detail & List Views (Cached)
Cached for 15 minutes to maximize responsiveness.
*   `GET /api/v1/cms/public/services/{slug}/` (Service detail)
*   `GET /api/v1/cms/public/industries/{slug}/` (Aggregated industry data)
*   `GET /api/v1/cms/public/case-studies/` (Filterable portfolio list)
*   `GET /api/v1/cms/public/case-studies/{slug}/` (Case study detail - redacted if confidential)
*   `GET /api/v1/cms/public/blog/` (Searchable/filterable blog posts)
*   `GET /api/v1/cms/public/blog/{slug}/` (Article detail)
*   `GET /api/v1/cms/public/blog/{slug}/related/` (Related posts suggestions)
