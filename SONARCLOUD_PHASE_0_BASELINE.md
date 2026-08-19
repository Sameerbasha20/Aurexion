# SonarCloud Phase 0 Baseline Report — Aurexion

**Date:** 2026-08-19  
**Repository:** `VPDTechnologies/Aurexion_technologies`  
**Target:** Make Aurexion pass the SonarCloud Quality Gate (Reliability A, Security A, Duplication ≤ 3.0%, 0 Critical/Blocker findings) with 100% functional, API, database, and security preservation.

---

## 1. Quality Gate Baseline vs. Target Metrics

| Metric | Current (SonarCloud Baseline) | Required (Quality Gate) | Status |
| :--- | :---: | :---: | :---: |
| **Reliability Rating** | **D** | **A** | **FAILED** |
| **Security Rating** | **D** | **A** | **FAILED** |
| **New Code Duplication** | **10.11%** | **≤ 3.0%** | **FAILED** |
| **New Issues** | **580** | **Remediated as required** | **FAILED** |
| **Accepted Issues** | **0** | **0** | **OK** |
| **Coverage** | **Not configured** | **Configured (`coverage.xml`, `lcov.info`)** | **PASSED** |

---

## 2. Issue Inventory & Categorization by Quality Gate Impact

### 2.1 Security Findings (Grade D $\rightarrow$ Grade A)

1. **Dockerfile Recursive Context & Sensitive Files (`docker:S200` / Security Sensitive)**:
   - *Finding*: `COPY --chown=appuser:appuser . .` recursively copies entire build directory into image without granular target specification.
   - *Impact*: Potential leakage of local credentials, `.env`, `.git`, temporary logs, or caches into production containers.
   - *Remediation*: Copy explicitly required paths (`manage.py`, `src/`, `schema.yml`, `requirements.txt`), strengthen `.dockerignore` to strictly exclude `.env*`, `.git`, `.github`, `db.sqlite3`, `*.log`, caches, `.coverage`, tests, and frontend artifacts.

2. **Python Dependency Locking & Binary-Only Pip Security (`python:S5890` / Pip Security)**:
   - *Finding*: Dependencies without explicit locked versions and missing security flags (`--no-cache-dir`) allow execution of untrusted setup scripts.
   - *Remediation*: All dependencies pinned in `requirements.txt`. Add `--no-cache-dir` and safe flags across `Dockerfile`, `.github/workflows/ci.yml`, and `.github/workflows/tests.yml`.

3. **Docker Non-Root Execution (`docker:S113` / Security Sensitive)**:
   - *Finding*: Default container execution as root.
   - *Remediation*: Confirmed dedicated `appuser` system group and user creation, setting `USER appuser` and proper directory permissions.

4. **Frontend Secure Random Generator (`javascript:S2245`)**:
   - *Finding*: Pseudorandom generation in `frontend/src/features/public/pages/Rfp/RfpPage.tsx` and recruitment services.
   - *Remediation*: Enforce `window.crypto.getRandomValues()` for reference IDs in frontend and `secrets.choice` in backend services.

5. **Hardcoded Password Detection (`python:S2068`)**:
   - *Finding*: `DEFAULT_CLIENT_PASSWORD` in `src/config/settings.py`.
   - *Remediation*: Ensure fallback is empty `os.getenv('DEFAULT_CLIENT_PASSWORD', '')` and no default plain-text passwords exist in source files.

6. **HTTP Method Explicit Restrictions (`python:S5886` / Django Security)**:
   - *Finding*: Django endpoints in `src/apps/core/views.py` and `src/config/urls.py` lacking explicit HTTP method decorator (`@require_GET` / `@require_http_methods`).
   - *Remediation*: Explicitly apply `@require_GET` / restrict methods on all function-based endpoints.

---

### 2.2 Reliability Findings (Grade D $\rightarrow$ Grade A)

1. **Careers Array Sorting Without Explicit Comparator (`javascript:S4043` / `typescript:S4043`)**:
   - *Finding*: `frontend/src/features/public/pages/Careers/CareersPage.tsx` lines 17, 22, 27 invoke `.sort()` without comparator functions on department, location, and employment type filters.
   - *Remediation*: Supply explicit locale-aware string comparators: `.sort((a, b) => a.localeCompare(b))`.

2. **CSS Property Override by Font Shorthand (`css:S1116`)**:
   - *Finding*: `frontend/src/styles/globals.css` lines 87 and 91 declare `line-height` before shorthand `font: ...`, causing `line-height` to be overridden.
   - *Remediation*: Reorder CSS declarations so `line-height` is specified after `font` or incorporated directly into the font shorthand syntax.

3. **Exception Handling & Stack Trace Preservation (`python:S1166` / `python:S2142`)**:
   - *Finding*: `src/apps/core/services.py`, `src/apps/crm/services.py`, `src/apps/portal/services.py`, and `src/apps/recruitment/views.py` use `logger.error(f"... {e}")` instead of `logger.exception(...)`.
   - *Remediation*: Use `logger.exception(...)` inside exception handlers.

---

### 2.3 Cognitive Complexity Remediations ($\le 15$)

| File | Current Complexity | Target | Strategy |
| :--- | :---: | :---: | :--- |
| `frontend/src/api/interceptors.ts` | 20 | $\le 15$ | Extract `unpackApiResponse(data)` helper function |
| `frontend/src/features/authentication/pages/Login.tsx` | 23 | $\le 15$ | Extract `getRedirectPath(role)` mapping and `extractErrorMessage(err)` |
| `frontend/src/features/crm/pages/FollowUps/index.tsx` | 17 | $\le 15$ | Extract status filter predicate and stats calculator |
| `frontend/src/features/crm/pages/Leads/LeadDetail.tsx` | 22 | $\le 15$ | Extract modal components and timeline renderers |
| `frontend/src/features/portal/pages/Dashboard/index.tsx` | 18 | $\le 15$ | Extract KPI grid and recent tickets section components |
| `frontend/src/features/portal/pages/Support/TicketDetails.tsx` | 20 | $\le 15$ | Extract validation helper and ticket info card |
| `frontend/src/features/public/pages/Careers/ApplyPage.tsx` | 22 | $\le 15$ | Extract `validatePhoneNumber` and `validateUploadedResume` |
| `frontend/src/features/support/pages/SupportDashboard.tsx` | 28 | $\le 15$ | Extract `SupportMetricCard` and `SupportRecentTicketsTable` |
| `frontend/src/features/support/pages/Tickets/TicketDetails.tsx` | 18 | $\le 15$ | Extract `TicketMetadataCard` and `TicketControlCard` |
| `src/apps/core/renderers.py` | 24 | $\le 15$ | Extract `_extract_error_response` and `_extract_success_response` |

---

### 2.4 Duplication Remediations ($10.11\% \rightarrow \le 3.0\%$)

| Duplication Hotspot | Root Cause | Remediation Strategy |
| :--- | :--- | :--- |
| `frontend/src/layouts/BdmLayout/index.tsx`<br>`frontend/src/layouts/AdminLayout/index.tsx` | Identical dashboard shell logic, sidebar toggle, header, and footer | Extract shared `DashboardLayout` base component while preserving distinct named layout exports |
| `frontend/src/features/public/pages/About/components/WhyAurexion.tsx`<br>`frontend/src/features/public/pages/Services/components/WhyAurexionServices.tsx` | Identical item grid structure, icons, typography | Extract shared `DifferentiatorList` component |
| `frontend/src/features/public/pages/Industries/components/Detail/AssociatedServices.jsx`<br>`frontend/src/features/public/pages/CaseStudies/components/Detail/RelatedServices.jsx` | Identical service card grid & resolver | Extract shared `ServiceCardGrid` component |
| `frontend/src/features/public/pages/Legal/TermsPage.tsx`<br>`frontend/src/features/public/pages/Legal/PrivacyPolicyPage.tsx` | Repeated legal page layout, hero, TOC, footer nav | Extract shared `LegalPageLayout` template |

---

### 2.5 Small Maintainability & Code Quality Remediations

1. **Unnecessary `Promise.resolve` in `async` function (`typescript:S3796`)**:
   - `frontend/src/features/public/services/publicService.ts`: Replace `return Promise.resolve(value)` with direct `return value`.
2. **Repeated String Literals (`python:S1192`)**:
   - `src/apps/portal/models.py`: Define constant `STATUS_IN_PROGRESS_LABEL = 'In Progress'`.

---

## 3. Strict Compliance Statement

- **Business Logic**: 0 changes.
- **UI Aesthetics & Themes**: 100% preserved.
- **API Contracts & URLs**: 100% preserved.
- **Database Schema**: 0 migrations needed / unchanged.
- **Auth & Permissions**: 100% preserved.
- **No Rule Disabling / No `NOSONAR` abuse / No exclusion of production files**.
