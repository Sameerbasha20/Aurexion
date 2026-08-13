# PHASE 4 API VERIFICATION REPORT

Support REST API — `/api/v1/tickets/`

> Tested on: Python 3.14.6, Django 5.2.15, DRF 3.x, pytest 9.1.1
> Database: PostgreSQL (via `config.settings`, test DB auto-created/destroyed)

---

## Scope

Phase 4 exposes the existing Support Ticket module as a unified REST resource.
No unrelated modules and no authentication code were modified. Everything is
reused from the existing infrastructure:

- Authentication: `rest_framework_simplejwt` JWT (`apps.authentication`)
- RBAC: `apps.rbac.permissions` role pattern
- Model: `SupportTicket` (`apps.portal.models`)
- Serializers: `apps.portal.serializers` (client / support / admin)
- Service Layer: `SupportTicketService` (`apps.portal.services`)
- API routing: DRF `DefaultRouter` convention (same as `apps.recruitment`/`apps.authentication`)

### Files changed

| File | Change |
|---|---|
| `src/apps/portal/permissions.py` | Added `IsTicketAccessible` (view-level + object-level). |
| `src/apps/portal/views.py` | Added `TicketViewSet` (`PermissionScopedObjectMixin` reused). |
| `src/apps/portal/urls.py` | Registered `tickets` router. |
| `tests/portal/test_tickets_api.py` | New: 39 API integration tests. |

## API Endpoints

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/api/v1/tickets/` | Create a ticket | client_user (super_admin bypasses) |
| `GET` | `/api/v1/tickets/` | List tickets (role-scoped) | client_user, support_executive, administrator, super_admin |
| `GET` | `/api/v1/tickets/{id}/` | Retrieve one ticket | role + object-level authorization |
| `PATCH` | `/api/v1/tickets/{id}/` | Update one ticket (authorized fields) | role + object-level authorization |

These are the implementation operations required by Phase 4. `PUT` and `DELETE`
are intentionally not part of the resource (`http_method_names`), verified by
`test_put_and_delete_are_not_allowed` (405).

## Request Validation

Reuses the existing serializer validation layer:

| Test | Input | Result |
|---|---|---|
| `test_create_validation_missing_subject_returns_400` | no `subject` | **400** |
| `test_create_validation_empty_subject_returns_400` | `subject: "   "` | **400** |
| `test_create_validation_invalid_category_returns_400` | `category: "not-a-category"` | **400** |
| `test_create_validation_invalid_priority_returns_400` | `priority: "urgent"` | **400** |
| `test_client_update_validation_failure_returns_400` | `subject: ""` on PATCH | **400** |
| `test_support_close_requires_resolution_notes` | `status: closed` with empty notes | **400** |

## Authentication

Unchanged JWT authentication (reused). Every endpoint requires a valid token:

| Test | Request | Result |
|---|---|---|
| `test_unauthenticated_create_returns_401` | POST no token | **401** |
| `test_unauthenticated_list_returns_401` | GET no token | **401** |
| `test_unauthenticated_detail_returns_401` | GET detail no token | **401** |
| `test_unauthenticated_update_returns_401` | PATCH no token | **401** |
| `test_jwt_token_login_success` | `POST /api/v1/auth/login/` | **200** with `access` token |

## RBAC

View-level role admission via `IsTicketAccessible` (built on the existing RBAC
role pattern; no new RBAC framework):

| Test | Actor | Result |
|---|---|---|
| `test_unauthorized_role_cannot_list_tickets` | sales_executive GET list | **403** |
| `test_unauthorized_role_cannot_retrieve_ticket` | sales_executive GET detail | **403** |
| `test_unauthorized_role_cannot_update_ticket` | sales_executive PATCH | **403** |
| `test_unauthorized_role_cannot_create_ticket` | sales_executive POST | **403** |
| `test_support_executive_cannot_create_ticket` | support_executive POST | **403** (create is a client operation) |
| `test_admin_lists_all_tickets` | administrator GET list | **200** all tickets |

Role behavior on LIST:
- client_user → only tickets where `client_user == user` (`test_client_lists_only_own_tickets`)
- support_executive → only tickets where `assigned_to == user` (`test_support_lists_only_assigned_tickets`)
- administrator → all tickets (`test_admin_lists_all_tickets`)

## Object-Level Authorization

Server-side enforcement via `PermissionScopedObjectMixin.get_object()` +
`IsTicketAccessible.has_object_permission()`:

| Test | Actor → Object | Result |
|---|---|---|
| `test_client_retrieves_own_ticket` | client_a → ticket_a | **200** |
| `test_support_retrieves_assigned_ticket` | support_a → assigned_to_a | **200** |
| `test_client_a_cannot_retrieve_client_b_ticket` | client_a → ticket_b | **403** |
| `test_client_b_cannot_retrieve_client_a_ticket` | client_b → ticket_a | **403** |
| `test_client_a_cannot_update_client_b_ticket` | client_a PATCH ticket_b | **403** |
| `test_support_a_cannot_retrieve_support_b_ticket` | support_a → assigned_to_b | **403** |
| `test_support_a_cannot_update_support_b_ticket` | support_a PATCH assigned_to_b | **403** |
| `test_support_cannot_update_unassigned_ticket` | support_a PATCH ticket_a (unassigned) | **403** |
| `test_client_cannot_access_support_owned_route_for_another_client` | client_b → assigned_to_a | **403** |

List endpoints never leak records outside the caller's scope (queryset scoped in
`get_queryset`); detail/update resolve the object against the full set and run
the object-level permission so that forbidden objects return **403**.

## HTTP Status Codes

| Code | Used for | Verified by |
|---|---|---|
| 200 | successful list / detail / update | `test_client_retrieves_own_ticket`, `test_support_updates_assigned_ticket_and_persists` |
| 201 | successful create | `test_client_creates_ticket_success` |
| 400 | validation failure | `test_create_validation_*`, `test_support_close_requires_resolution_notes` |
| 401 | unauthenticated request | `test_unauthenticated_*` |
| 403 | wrong role / wrong object | `test_unauthorized_role_*`, `test_client_a_cannot_*` |
| 404 | invalid / non-existent ticket ID | `test_invalid_ticket_id_returns_404`, `test_nonexistent_ticket_returns_404` |
| 405 | unsupported method (PUT/DELETE) | `test_put_and_delete_are_not_allowed` |
| 500 | reserved for unexpected server errors (not triggered by tests) | — |

Error responses use the DRF default format (`{"detail": "..."}` / serializer
field errors) — no stack traces or sensitive information are exposed.

## PostgreSQL Persistence

| Test | Assertion |
|---|---|
| `test_client_create_ticket_persists_to_database` | row exists after POST; `ticket_id` = `TKT-...`, `status` = `open`, owner = caller |
| `test_client_updates_own_ticket_and_persists` | `subject` changed in DB after PATCH |
| `test_support_updates_assigned_ticket_and_persists` | `status` + `resolution_notes` changed in DB after PATCH |
| `test_admin_updates_any_ticket_and_persists` | `status`/`assigned_to` changed in DB after admin PATCH |
| `test_client_cannot_set_status_when_creating` | forbidden fields ignored; DB row kept at `open` |
| `test_client_update_cannot_change_status` | `status` ignored on PATCH; `priority` persisted |
| `test_client_a_cannot_update_client_b_ticket` | DB unchanged after forbidden PATCH |
| `test_create_audit_log_created` | `AuditLog` row created with `action=CREATE`, `module=portal` |

## Swagger/OpenAPI

Regenerated the OpenAPI schema (`python manage.py spectacular --file schema.yml`).
The unified resource is documented:

```
/api/v1/tickets/          -> GET, POST
/api/v1/tickets/{id}/     -> GET, PATCH
```

All operations are tagged `Support Tickets API` with path-parameter annotations.
Remaining schema warnings/errors are **pre-existing** (LoginView/UserProfileView/
ApplyForJobView serializer inference and an enum `status` naming collision) and
are unrelated to this resource.

## Integration Test Results

### Exact test commands

```powershell
# Phase 4 API integration suite (39 tests)
python -m pytest tests/portal/test_tickets_api.py -v

# Full regression suite (all apps except the pre-existing broken collection file)
python -m pytest -q --ignore=src/apps/recruitment/tests.py

# Django system check
python manage.py check

# OpenAPI schema generation
python manage.py spectacular --file schema.yml
```

### Result

```
tests/portal/test_tickets_api.py ..... 39 passed in 238.10s (0:03:58)
```

**39/39 PASS (0 failures, 0 errors).**

| Test | Result |
|---|---|
| test_admin_lists_all_tickets | **PASS** |
| test_admin_updates_any_ticket_and_persists | **PASS** |
| test_client_a_cannot_retrieve_client_b_ticket | **PASS** |
| test_client_a_cannot_update_client_b_ticket | **PASS** |
| test_client_b_cannot_retrieve_client_a_ticket | **PASS** |
| test_client_cannot_access_support_owned_route_for_another_client | **PASS** |
| test_client_cannot_set_status_when_creating | **PASS** |
| test_client_create_ticket_persists_to_database | **PASS** |
| test_client_creates_ticket_success | **PASS** |
| test_client_lists_only_own_tickets | **PASS** |
| test_client_retrieves_own_ticket | **PASS** |
| test_client_update_cannot_change_status | **PASS** |
| test_client_update_validation_failure_returns_400 | **PASS** |
| test_client_updates_own_ticket_and_persists | **PASS** |
| test_create_audit_log_created | **PASS** |
| test_create_validation_empty_subject_returns_400 | **PASS** |
| test_create_validation_invalid_category_returns_400 | **PASS** |
| test_create_validation_invalid_priority_returns_400 | **PASS** |
| test_create_validation_missing_subject_returns_400 | **PASS** |
| test_invalid_ticket_id_returns_404 | **PASS** |
| test_jwt_token_login_success | **PASS** |
| test_nonexistent_ticket_returns_404 | **PASS** |
| test_put_and_delete_are_not_allowed | **PASS** |
| test_support_a_cannot_retrieve_support_b_ticket | **PASS** |
| test_support_a_cannot_update_support_b_ticket | **PASS** |
| test_support_cannot_update_unassigned_ticket | **PASS** |
| test_support_close_requires_resolution_notes | **PASS** |
| test_support_executive_cannot_create_ticket | **PASS** |
| test_support_lists_only_assigned_tickets | **PASS** |
| test_support_retrieves_assigned_ticket | **PASS** |
| test_support_updates_assigned_ticket_and_persists | **PASS** |
| test_unauthenticated_create_returns_401 | **PASS** |
| test_unauthenticated_detail_returns_401 | **PASS** |
| test_unauthenticated_list_returns_401 | **PASS** |
| test_unauthenticated_update_returns_401 | **PASS** |
| test_unauthorized_role_cannot_create_ticket | **PASS** |
| test_unauthorized_role_cannot_list_tickets | **PASS** |
| test_unauthorized_role_cannot_retrieve_ticket | **PASS** |
| test_unauthorized_role_cannot_update_ticket | **PASS** |

## Security Test Results

Re-ran the Phase 3 security suite against the same codebase (unchanged behavior):

```
tests/portal/test_support_security.py ..... 39 passed
```

All 39 security tests still **PASS** — authentication, RBAC, object-level
authorization, horizontal access, privilege escalation, 401 and 403 guarantees
remain intact on the new unified resource.

## Issues

None found within the Phase 4 scope. All 39 integration tests and the full
regression suite pass. PUT/DELETE are correctly rejected (405) and protected
fields are never writable by clients.

## Regression Results

```
python -m pytest -q --ignore=src/apps/recruitment/tests.py
=> 131 passed in 630.87s (0:10:30)
```

Breakdown of the 131 passing tests:

| Suite | Tests | Result |
|---|---|---|
| Phase 4 — `tests/portal/test_tickets_api.py` | 39 | **PASS** |
| Phase 3 — `tests/portal/test_support_security.py` | 39 | **PASS** |
| Phase 1–2 — `src/apps/portal/tests.py` (model/serializer/service) | 37 | **PASS** |
| Authentication/RBAC — `tests/authentication/test_auth.py` | 16 | **PASS** |

**0 failures, 0 errors.**

> Note: `src/apps/recruitment/tests.py` has a pre-existing pytest collection error
> (`Model class recruitment.models.JobVacancy ... isn't in an application in
> INSTALLED_APPS`) unrelated to Phase 4; it is excluded via `--ignore` as in the
> Phase 3 report.

### Remaining Risks

1. Create is restricted to `client_user` (plus super-admin bypass); there is no
   support-executive "create on behalf of client" path in the current
   serializers/service layer. If required by the product, a dedicated serializer
   with an explicit `client_user` field would need to be added.
2. The DRF default throttle rates apply (anon 60/min, user 1000/min); no
   per-endpoint tuning was performed.
3. Pre-existing schema warnings/errors in auth/recruitment views and the enum
   `status` naming collision remain; they do not affect the tickets resource.
