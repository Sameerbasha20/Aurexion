# SonarCloud Phase 0 Baseline Report — Aurexion

**Date:** 2026-08-18  
**Repository:** `VPDTechnologies/Aurexion_technologies`  
**Target:** Make Aurexion pass the SonarCloud Quality Gate with 0 functional, API, database, or security regressions.

---

## 1. Quality Gate Current vs. Target Metrics

| Metric | Current Status | Target Status |
| :--- | :--- | :--- |
| **Security Rating** | **Grade D** (18 Open Issues) | **Grade A** (0 Open Issues) |
| **Reliability Rating** | **Grade D** (268 Open Issues) | **Grade A** (0 Open Issues) |
| **Maintainability Rating** | **Grade A** (459 Open Issues) | **Grade A** (Reduced Debt) |
| **Duplications** | **7.5%** | **< 3.0%** |
| **Coverage** | **Not Configured** | **Configured (`coverage.xml`, `lcov.info`)** |
| **Accepted Issues** | **0** | **0** |

---

## 2. Inventory of Specific Sonar Findings by Phase

### Phase 1 & 2: Dependency Locking & Pip Binary Security
- **Findings**:
  - `requirements.txt` contained unpinned dependencies (`coverage>=7.0.0`).
  - `.github/workflows/ci.yml` and `.github/workflows/tests.yml` invoked pip install without pinned pip or wheel flags.
  - `Dockerfile` lacked `--no-cache-dir` wheel security flags.

### Phase 3: Docker Security
- **Findings**:
  - `Dockerfile` runs as `root` user by default.
  - `Dockerfile` uses recursive `COPY . .` without a `.dockerignore` file, risking inclusion of `.env`, `db.sqlite3`, `.git`, or cache files.

### Phase 4: Frontend Random Number Generator
- **Finding**: `frontend/src/features/public/pages/Rfp/RfpPage.tsx` uses `Math.random()` in `generateRef()`.

### Phase 5: Django HTTP Method Constraints
- **Findings**:
  - `src/apps/core/views.py` (`health_check` endpoint).
  - `src/config/urls.py` (`devtools_empty_view` endpoint).
  - Neither view explicitly restricted acceptable HTTP methods with `@require_GET` / `@require_http_methods`.

### Phase 6: Hardcoded Password Detection
- **Finding**: `src/config/settings.py` L266 contained `DEFAULT_CLIENT_PASSWORD = os.getenv('DEFAULT_CLIENT_PASSWORD', 'Aurexion@123')`.

### Phase 7: Promise Rejection Error Object
- **Finding**: `frontend/src/api/interceptors.ts` and `frontend/src/api/apiErrorHandler.ts` rejected promises with a plain object instead of an `Error` instance.

### Phase 8: React Button Type Attributes
- **Finding**: 74 `<button>` elements across the frontend lacked explicit `type="button"` / `type="submit"` attributes.

### Phase 9: Accessibility Mouse & Focus Events
- **Finding**: 24 `onMouseOver` / `onMouseOut` event handlers lacked corresponding `onFocus` / `onBlur` handlers.

### Phase 10: Form Label Associations
- **Finding**: `<label>` elements across Administration, BDM, CMS, and CRM forms lacked `htmlFor` associations.

### Phase 11: Non-Native Interactive Elements
- **Finding**: Clickable `div` elements without keyboard handlers (`onKeyDown`) and ARIA roles.

### Phase 12: JavaScript Number / String Quality
- **Finding**: `parseInt(...)` used without `Number.parseInt(...)` in Estimator pages.

### Phase 13: Duplication Hotspots
- **Findings**:
  - Structured content data files (`industries.js`, `blogPosts.js`, `services.ts`).
  - Shared UI layouts (search bars, status alerts, filter toolbars).

---

## 3. Remediation Execution Plan

1. **Lock dependencies & update Dockerfile + .dockerignore**.
2. **Secure PRNG in `RfpPage.tsx`**.
3. **Add `@require_GET` on Django health endpoints**.
4. **Remove hardcoded default password in `settings.py`**.
5. **Convert `ApiError` to subclass `Error` in API interceptors**.
6. **Add explicit `type="button"` / `type="submit"` to all button elements**.
7. **Add accessibility focus/blur pairings for mouse events**.
8. **Add `htmlFor` / `id` associations to form labels**.
9. **Update `parseInt` to `Number.parseInt`**.
10. **Refactor duplicated UI components into shared modules**.
11. **Run full verification suite (319 Django tests + frontend check)**.
