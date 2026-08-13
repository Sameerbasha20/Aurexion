# PHASE 7 DEFECT FIX REPORT

- **Scope (per Phase 7 mandate):** defects identified in the previous verification report
  (`tests/PHASE_6_FINAL_VERIFICATION_REPORT.md`).
- **Constraints honored:** no new features, no refactoring of unrelated modules, no Authentication
  changes (no Support integration regression was found in Authentication), no test suppression,
  no timeouts raised to hide issues, no RBAC weakening, no validation removal, no DB mocking.
- **Result:** 1 defect fixed (test-infrastructure reliability). No other failures remained; the
  two Category A/B code defects found during Phase 6 (write-path N+1, OpenAPI JWT scheme) were
  already resolved inline during Phase 6 and are restated here for completeness.

---

## Defect

**6-PERF-1 — Support ticket write path exceeds the 500 ms target (regression).**
- Category: Performance / Code (A).
- Status in Phase 6 report: **Fixed**.
- Reproduced in Phase 6: `POST /api/v1/tickets/` averaged **576 ms** (FAIL vs <500 ms target).

**6-SCHEMA-1 — Support endpoints lost JWT bearer security documentation after the auth change.**
- Category: API Contract / Documentation (B).
- Status in Phase 6 report: **Fixed**.
- Reproduced in Phase 6: after wiring `ProfileJWTAuthentication`, `GET /api/v1/tickets/` in the
  generated OpenAPI schema showed only `security: [{cookieAuth: []}]` (JWT bearer silently dropped).

**6-INFRA-1 — Repeated regression runs fail with `database "test_postgres" already exists`.**
- Category: Test-infrastructure reliability (B).
- Status in Phase 6 report: **Mitigated** (manual drop before runs). **Chosen as the Phase 7 fix.**
- This is the only item that was a *reproducible failure* rather than an already-fixed code defect.

---

## Root Cause

- **6-PERF-1:** RBAC permission checks in `src/apps/portal/views.py` read `request.user.profile`
  on every request. The default `JWTAuthentication.get_user` loads only `auth_user`; the
  `UserProfile` is then fetched in a *second* query. Against the remote Supabase PostgreSQL
  (pooler `aws-0-ap-southeast-1.pooler.supabase.com`) each query costs ~110–115 ms, so the write
  path did: auth_user SELECT + profile SELECT + COUNT(ticket_id) + INSERT ticket + INSERT auditlog
  = **5 queries / ~576 ms** (N+1 on the user+profile pair).
- **6-SCHEMA-1:** drf-spectacular could not resolve the `ProfileJWTAuthentication` subclass
  (its built-in SimpleJWT extension sets `match_subclasses = False` and matches only the exact
  base class), so the Support viewsets' JWT scheme fell back to the other registered authenticator
  (`SessionAuthentication` → `cookieAuth`), silently dropping the documented JWT requirement.
- **6-INFRA-1 (the Phase 7 fix):** The PostgreSQL test DB is a Supabase managed instance reached
  through the **Supavisor connection pooler** (`application_name='Supavisor'`). Django's test
  runner creates `test_postgres` per session and drops it on teardown. Supavisor keeps a pooled
  server connection alive to `test_postgres`, so the teardown `DROP DATABASE "test_postgres"`
  raises `OperationalError('database "test_postgres" is being accessed by other users')` and
  leaves the database behind. The *next* session then fails at setup with
  `SystemExit(2): database "test_postgres" already exists` — i.e. **the second consecutive run
  of the documented regression command failed before running a single test.** This exact
  failure was reproduced twice during verification (Section "Test Before Fix"). It is not
  caused by any Support-module application code; it is a pooler/teardown interaction.

---

## Files Changed

| File | Change |
|---|---|
| `tests/PHASE_7_DEFECT_FIX_REPORT.md` | This report. |
| `conftest.py` (repo root) | **NEW.** Session-scoped autouse fixture that terminates lingering sessions on and drops `test_postgres` before pytest-django creates it, so the documented `python -m pytest` command runs reliably across consecutive runs under the Supabase pooler. |
| *(Phase 6 already-fixed files, restated for completeness)* | `src/apps/portal/authentication.py` (`ProfileJWTAuthentication` + `ProfileJWTExtension`); `src/apps/portal/views.py` (auth wiring on the 4 Support viewsets); `tests/smoke_test.py`, `tests/support_performance_test.py`, `tests/support_performance_report.md`. |

The Phase 7 change touches **only test infrastructure** (`conftest.py`). No Authentication,
views, serializers, models, or settings were modified in Phase 7.

---

## Fix

- **6-PERF-1 (Phase 6, restated):** `ProfileJWTAuthentication.get_user`
  (`src/apps/portal/authentication.py:19`) loads the user with
  `self.user_model.objects.select_related('profile').get(...)`, consolidating the user+profile
  fetch into one round trip. Semantically identical to base `JWTAuthentication`. Wired onto
  `ClientTicketViewSet`, `SupportExecutiveTicketViewSet`, `AdministratorTicketViewSet`,
  `TicketViewSet` (`src/apps/portal/views.py:115,209,282,355`).
  - Writes: 5 queries → 4; POST avg 576 ms → ~217 ms. Reads: 3 → 2.
- **6-SCHEMA-1 (Phase 6, restated):** Registered `ProfileJWTExtension`
  (`src/apps/portal/authentication.py:38`) with `target_class = ProfileJWTAuthentication` and
  security scheme `{type: http, scheme: bearer, bearerFormat: JWT}`, restoring the JWT bearer
  requirement on all Support endpoints.
- **6-INFRA-1 (Phase 7 — the active fix):** Added `conftest.py` at the repo root. A session-scoped
  autouse fixture `_clean_test_database` runs *before* pytest-django's `django_db_setup`
  (which only triggers on the first DB-using test) and drops any leftover `test_postgres` using
  the same proven `pg_terminate_backend` + `DROP DATABASE IF EXISTS` retry loop that the Phase 6
  manual drop used. It only runs for the postgres backend and only touches `test_postgres`, so
  the real database is never affected. The fixture is session-scoped so it runs once per session.
  The harmless teardown warning (Supavisor holding a session at DROP) remains, but it no longer
  blocks subsequent runs because each run cleans up first.

---

## Test Before Fix

- Full regression run **2** (immediately after run 1) failed at setup:
  `SystemExit: 2` — `database "test_postgres" already exists` (pytest-django cannot `CREATE
  DATABASE` because the prior session's teardown `DROP` was blocked by the pooler).
  This was reproduced twice during the session, matching the Phase 6 investigation
  (Section 6.1: "the next session's `CREATE DATABASE` collided").
- Baseline reference (Phase 6, after the PERF fix): full suite `150 passed`.
- Pre-PERF-fix baseline (Phase 6): `POST /api/v1/tickets/` avg **576 ms** (FAIL >500 ms).

---

## Test After Fix

- **Two consecutive runs of the documented command, no manual intervention:**
  - Run 1: `python -m pytest -q --ignore=src/apps/recruitment/tests.py --no-header`
    → **150 passed, 1 warning** (892.00 s). The warning is the harmless teardown DROP.
  - Run 2 (immediately after, no manual drop): same command → **150 passed, 1 warning**
    (806.31 s).
  - Previously run 2 failed with `SystemExit(2): database "test_postgres" already exists`; it
    now passes because `conftest.py` removes the leftover DB before pytest-django creates it.
- Collection sanity: `python -m pytest --collect-only -q --ignore=src/apps/recruitment/tests.py`
  → 150 tests collected; conftest imports cleanly (no errors).
- `python manage.py check` → **System check identified no issues (0 silenced).**

### Test-by-test re-run of the related Support suites (final code state)
| Suite | Command | Result |
|---|---|---|
| Unit (portal) | `pytest src/apps/portal/tests.py` | 37 passed |
| Integration/API | `pytest tests/portal/test_tickets_api.py` | 39 passed |
| Audit integration | `pytest tests/portal/test_audit_integration.py` | 19 passed |
| Security (RBAC) | `pytest tests/portal/test_support_security.py` | 39 passed |
| Auth regression | `pytest tests/authentication/test_auth.py` (part of the 150) | 16 of 150 passed |

### Authentication regression (explicit)
- Authentication tests are included in the full suite (150 passed) and were additionally
  validated via the smoke JWT round-trip and the performance script's real-JWT login.
  No Authentication code was changed in Phase 7. Result: **PASS** (no auth regression).

### Security impact of the fix
- The `ProfileJWTAuthentication` change was already verified in Phase 6 (39 security tests
  pass; no RBAC weakening; clients still cannot set `status`/`assigned_to`). The `conftest.py`
  fix is **test-infrastructure only** and changes nothing in request handling, authentication,
  authorization, serialization, or the database schema. It therefore has **no security impact**.
- No RBAC rules, permission classes, serializer field sets, or validation were touched.

---

## Performance Before

| Endpoint | Avg (before PERF fix) | Verdict |
|---|---|---|
| `POST /api/v1/tickets/` | **576 ms** | FAIL (>500 ms) — N+1 user+profile |
| `GET /api/v1/tickets/` | 349 ms | PASS |
| `GET /api/v1/tickets/{id}/` | 341 ms | PASS |
| `PATCH /api/v1/tickets/{id}/` | 567 ms | FAIL (>500 ms) |

---

## Performance After

| Endpoint | Avg | Max | P95 | P99 | Queries | Verdict |
|---|---|---|---|---|---|---|
| `POST /api/v1/tickets/` | 217.10 ms | 225.91 | 222.03 | 224.54 | 4 | PASS |
| `GET /api/v1/tickets/` | 120.51 ms | 167.54 | 128.00 | 148.84 | 2 | PASS |
| `GET /api/v1/tickets/{id}/` | 117.38 ms | 366.99 | 116.72 | 247.57 | 2 | PASS |
| `PATCH /api/v1/tickets/{id}/` | 220.83 ms | 230.88 | 224.35 | 230.45 | 4 | PASS |

- N+1 check on `GET /api/v1/tickets/`: query count constant at `{1: 2, 5: 2, 15: 2}` → **NO N+1**.
- Measured against real Supabase PostgreSQL 17.6 via the pooler with a real JWT; 50 iterations/endpoint.
- The Phase 7 `conftest.py` fix is test-infrastructure only and does **not** change any measured
  code path, so performance numbers are unchanged from Phase 6 (see
  `tests/support_performance_report.md`). The performance defect (6-PERF-1) was resolved in
  Phase 6 and is not re-introduced here.

---

## Security Impact

- **6-PERF-1 (Phase 6, applied):** the new `ProfileJWTAuthentication` performs the same token
  validation, `is_active` check, and `DoesNotExist` → 401 handling as the base class; it only
  adds `select_related('profile')`. Authz (role-based permission checks in views) is unchanged.
  Verified by `test_support_security.py` (39 passed) and `test_audit_integration.py` (19 passed).
- **6-INFRA-1 (Phase 7, applied):** `conftest.py` runs **only during pytest** and **only** to drop
  the disposable `test_postgres` before creation. It never connects to or modifies the real
  `postgres` database, never authenticates as a Support user, and never affects request handling,
  tokens, permissions, or data. **No security impact.**

---

## Remaining Issues

1. **6-INFRA-1 (partially addressed).** The teardown `PytestWarning`
   (`database "test_postgres" is being accessed by other users`) still appears at the end of
   each session — it is now harmless because the next session self-cleans. Fully eliminating it
   would require configuring the pooler in session mode or using a non-pooled test connection,
   which is outside the application layer and out of Phase 7 scope.
2. **6-INFRA-2 — smoke/performance files not auto-collected.** `tests/smoke_test.py` and
   `tests/support_performance_test.py` do not match the `python_files` globs
   (`tests.py test_*.py *_tests.py`) in `pytest.ini`, so the documented full-suite command runs
   only the 150 unit/integration/security/registration tests; the smoke and performance suites are
   invoked explicitly. This is intentional (the performance script hits the real database and
   issues a real JWT login, which would make the fast regression suite slow/flaky), so it is left
   as a known limitation rather than changed.
3. **Pre-existing / out of scope.** `src/apps/recruitment/tests.py` still has a collection
   error (excluded via `--ignore`); `server/` and `frontend/` are out of scope; 11 pre-existing
  OpenAPI generation warnings (3 unique errors in `LoginView`, `UserProfileView`,
  `ApplyForJobView`, plus `status` enum-name collisions) remain and none originate in the Support
  module. None of these are Support-module regressions.

---

## Final Regression Status

- **150/150 regression** passes on final code (two consecutive clean runs via the documented
  command, no manual DB drop required).
- **Performance 4/4 endpoints PASS** (avg/p95/p99 < 500 ms, no N+1).
- **API contract:** OpenAPI schema generated; all Support endpoints document JWT bearer auth
  and correct request/response schemas and validation rules.
- **Security 39/39 passed.**
- **No defects remain against the Support module.** Phase 7 complete.
