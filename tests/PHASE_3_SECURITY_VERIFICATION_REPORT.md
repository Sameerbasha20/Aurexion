# PHASE 3 SECURITY VERIFICATION REPORT

Support Ticket Module — Authentication Integration, RBAC and Object-Level Authorization.

> Tested on: Python 3.14.6, Django 5.2.15, DRF 3.x, pytest 9.1.1
> Database: PostgreSQL (via `config.settings`, test DB auto-created/destroyed)

---

## Scope

Phase 3 wires the existing Support Ticket model, serializers and service layer
(Phases 1–2, in `apps.portal`) into the existing Aurexion authentication and RBAC
infrastructure. No authentication code was rewritten, no new User model, token
system or RBAC framework was introduced. All existing infrastructure is reused:

- Authentication: `rest_framework_simplejwt` JWT + `apps.authentication` (`LoginView`, `UserProfileView`, `UserViewSet`)
- RBAC: `apps.rbac.permissions` (`BaseRolePermission`, `IsClientUser`, `IsSupportExecutive`, `IsAdministrator`, `IsSuperAdmin`)
- Audit: `apps.authentication.audit.log_audit_event`

### Files added/changed

| File | Change |
|---|---|
| `src/apps/portal/permissions.py` | **New.** Object-level permission classes (`IsClientTicketOwner`, `IsSupportTicketAssignee`) built on the existing RBAC permission classes. |
| `src/apps/portal/views.py` | **Changed.** `ClientTicketViewSet`, `SupportExecutiveTicketViewSet`, `AdministratorTicketViewSet` + `PermissionScopedObjectMixin`. |
| `src/apps/portal/urls.py` | **Changed.** Router registration under `/api/v1/support/...`. |
| `src/config/urls.py` | **Changed.** Included `apps.portal.urls`. |
| `tests/portal/test_support_security.py` | **New.** 39 security tests (authentication, RBAC, object-level, 401/403, escalation, regression). |

### API surface

| Endpoint | Role | Permissions enforced |
|---|---|---|
| `POST/GET /api/v1/support/my-tickets/` | Client User | `IsClientUser` + owner scoping |
| `GET/PATCH /api/v1/support/my-tickets/{id}/` | Client User | `IsClientUser` + `IsClientTicketOwner` |
| `GET /api/v1/support/tickets/` | Support Executive | `IsSupportExecutive` + assignee scoping |
| `GET/PATCH /api/v1/support/tickets/{id}/` | Support Executive | `IsSupportExecutive` + `IsSupportTicketAssignee` |
| `GET /api/v1/support/admin/tickets/` | Administrator / Super Admin | `IsAdministrator` |
| `GET/PATCH /api/v1/support/admin/tickets/{id}/` | Administrator / Super Admin | `IsAdministrator` |

All authorization is enforced server-side. Frontend filtering is irrelevant to
the guarantees below. List querysets are scoped to the caller, and detail/update
requests resolve the object against the full set and then run the object-level
permission, so an authorized-but-unpermitted object returns **403** (never a
leaked record). Non-existent tickets return **404**.

---

## Authentication Integration

Authentication is **unchanged**. The Support APIs simply rely on the existing
DRF `JWTAuthentication` / `SessionAuthentication` defaults and the existing
`apps.authentication.LoginView` JWT issuance.

- `POST /api/v1/auth/login/` → issues `access` + `refresh` JWT tokens, role-aware.
- Support endpoints require a valid JWT (`Authorization: Bearer <token>`).
- No credentials → **401** (see 401 Tests).
- Verified with real login flow (`test_login_returns_access_and_refresh_tokens`) and
  with `force_authenticate` for the remaining tests.

## RBAC Integration

Reuses `apps.rbac.permissions.BaseRolePermission` hierarchy (which also always
allows Super Admin). `apps/portal/permissions.py` extends two existing classes
with object-level checks instead of introducing a new framework:

```python
class IsClientTicketOwner(IsClientUser):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        return obj.client_user_id == request.user.id

class IsSupportTicketAssignee(IsSupportExecutive):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        return obj.assigned_to_id == request.user.id
```

- View-level RBAC: `IsClientUser`, `IsSupportExecutive`, `IsAdministrator`.
- Object-level: enforced in `PermissionScopedObjectMixin.get_object()` via
  `check_object_permissions`.
- Role cross-access: Client → Support API **403**, Support → Admin API **403**.

## Client User Permissions

- `client_user` may create, list, retrieve and update **only their own** tickets.
- `status`, `assigned_to`, `ticket_id`, `closed_at` are read-only in the client
  serializer — the client cannot escalate status or reassign.
- List endpoint returns **only** tickets where `client_user == request.user`.
- Result: **ALLOWED for own tickets, DENIED (403) for any other ticket.**

## Support Executive Permissions

- `support_executive` may list, retrieve and update **only tickets assigned to them**.
- Closing a ticket requires resolution notes (business rule, verified `400`).
- List endpoint returns **only** tickets where `assigned_to == request.user`.
- Result: **ALLOWED for assigned tickets, DENIED (403) for others' tickets.**

## Object-Level Authorization

Backend-only. Verified object matrix (as executed by the test suite):

| Caller | Object | Result | Test |
|---|---|---|---|
| Client A | Ticket A (owned by A) | **ALLOWED** (200) | `test_client_can_retrieve_own_ticket` / `test_client_can_update_own_ticket` |
| Client A | Ticket B (owned by B) | **DENIED** (403) | `test_client_a_cannot_retrieve_client_b_ticket` / `test_client_a_cannot_update_client_b_ticket` |
| Client B | Ticket B (owned by B) | **ALLOWED** (200) | `test_client_can_retrieve_own_ticket` / `test_client_can_update_own_ticket` |
| Client B | Ticket A (owned by A) | **DENIED** (403) | `test_client_b_cannot_retrieve_client_a_ticket` / `test_client_b_cannot_update_client_a_ticket` |
| Support A | Ticket assigned to A | **ALLOWED** (200) | `test_support_can_retrieve_assigned_ticket` / `test_support_can_update_assigned_ticket` |
| Support A | Ticket assigned to B | **DENIED** (403) | `test_support_cannot_retrieve_other_executives_ticket` / `test_support_cannot_update_other_executives_ticket` |

## Horizontal Access Test

Guards against one user reaching another user's records (vertical + horizontal).

| Test | Result |
|---|---|
| `test_client_list_never_exposes_other_clients_tickets` | **PASS** — Client B list contains only B's tickets. |
| `test_support_list_never_exposes_other_executives_tickets` | **PASS** — Support B list contains only tickets assigned to B. |
| `test_support_cannot_update_unassigned_ticket` | **PASS** — 403 for a ticket not assigned to the caller. |
| `test_client_cannot_use_support_update_on_own_unassigned_ticket` | **PASS** — 403, role mismatch on the Support route. |

## Privilege Escalation Test

| Test | Result |
|---|---|
| `test_client_cannot_access_support_executive_api` | **PASS** — 403 |
| `test_client_cannot_access_administrator_api` | **PASS** — 403 |
| `test_support_executive_cannot_access_administrator_api` | **PASS** — 403 |
| `test_unauthorized_role_cannot_access_support_api` | **PASS** — Sales Executive → 403 |
| `test_support_executive_cannot_use_client_create_api` | **PASS** — 403 |
| `test_client_cannot_elevate_status_when_creating_ticket` | **PASS** — submitted `status=closed` ignored; ticket persisted as `open`. |
| `test_client_cannot_elevate_status_when_updating_ticket` | **PASS** — submitted `status=closed` ignored; DB status remains `open`. |

## 401 Tests

All requests sent **without** credentials must be rejected with `401`.

| Test | Result |
|---|---|
| `test_unauthenticated_list_returns_401` | **PASS** |
| `test_unauthenticated_support_list_returns_401` | **PASS** |
| `test_unauthenticated_admin_list_returns_401` | **PASS** |
| `test_unauthenticated_create_returns_401` | **PASS** |
| `test_unauthenticated_retrieve_returns_401` | **PASS** |
| `test_unauthenticated_update_returns_401` | **PASS** |
| `test_login_invalid_credentials_rejected` | **PASS** — 400 for bad credentials |
| `test_authenticated_authorized_operation_allowed` | **PASS** — authenticated user with authorization → 200 |

## 403 Tests

Authenticated users with the wrong role, or the right role but the wrong object,
must receive `403`.

| Test | Result |
|---|---|
| `test_client_a_cannot_retrieve_client_b_ticket` | **PASS** |
| `test_client_a_cannot_update_client_b_ticket` | **PASS** |
| `test_client_b_cannot_retrieve_client_a_ticket` | **PASS** |
| `test_client_b_cannot_update_client_a_ticket` | **PASS** |
| `test_client_cannot_access_support_executive_api` | **PASS** |
| `test_client_cannot_access_administrator_api` | **PASS** |
| `test_support_executive_cannot_access_administrator_api` | **PASS** |
| `test_unauthorized_role_cannot_access_support_api` | **PASS** |
| `test_unauthorized_role_cannot_retrieve_ticket` | **PASS** |
| `test_unauthorized_role_cannot_update_ticket` | **PASS** |
| `test_support_cannot_retrieve_other_executives_ticket` | **PASS** |
| `test_support_cannot_update_other_executives_ticket` | **PASS** |
| `test_support_cannot_update_unassigned_ticket` | **PASS** |

## Security Test Results

### Exact test commands

```powershell
# Phase 3 security suite (39 tests)
python -m pytest tests/portal/test_support_security.py -v

# Full regression suite (all apps except the pre-existing broken collection file)
python -m pytest -q --ignore=src/apps/recruitment/tests.py

# Django system check
python manage.py check
```

### Security suite result

```
tests/portal/test_support_security.py ............ 39 passed in 237.98s (0:03:57)
```

All 39 security tests **PASS** (0 failures, 0 errors). Individual results:

| Test | Result |
|---|---|
| test_admin_can_list_all_tickets | **PASS** |
| test_admin_can_retrieve_any_ticket | **PASS** |
| test_admin_can_update_any_ticket | **PASS** |
| test_authenticated_authorized_operation_allowed | **PASS** |
| test_client_a_cannot_retrieve_client_b_ticket | **PASS** |
| test_client_a_cannot_update_client_b_ticket | **PASS** |
| test_client_b_cannot_retrieve_client_a_ticket | **PASS** |
| test_client_b_cannot_update_client_a_ticket | **PASS** |
| test_client_can_create_ticket | **PASS** |
| test_client_can_list_own_tickets | **PASS** |
| test_client_can_retrieve_own_ticket | **PASS** |
| test_client_can_update_own_ticket | **PASS** |
| test_client_cannot_access_administrator_api | **PASS** |
| test_client_cannot_access_support_executive_api | **PASS** |
| test_client_cannot_elevate_status_when_creating_ticket | **PASS** |
| test_client_cannot_elevate_status_when_updating_ticket | **PASS** |
| test_client_cannot_use_support_update_on_own_unassigned_ticket | **PASS** |
| test_client_list_never_exposes_other_clients_tickets | **PASS** |
| test_login_invalid_credentials_rejected | **PASS** |
| test_login_returns_access_and_refresh_tokens | **PASS** |
| test_support_can_list_assigned_tickets | **PASS** |
| test_support_can_retrieve_assigned_ticket | **PASS** |
| test_support_can_update_assigned_ticket | **PASS** |
| test_support_cannot_retrieve_other_executives_ticket | **PASS** |
| test_support_cannot_update_other_executives_ticket | **PASS** |
| test_support_cannot_update_unassigned_ticket | **PASS** |
| test_support_closing_ticket_requires_resolution_notes | **PASS** |
| test_support_executive_cannot_access_administrator_api | **PASS** |
| test_support_executive_cannot_use_client_create_api | **PASS** |
| test_support_list_never_exposes_other_executives_tickets | **PASS** |
| test_unauthenticated_admin_list_returns_401 | **PASS** |
| test_unauthenticated_create_returns_401 | **PASS** |
| test_unauthenticated_list_returns_401 | **PASS** |
| test_unauthenticated_retrieve_returns_401 | **PASS** |
| test_unauthenticated_support_list_returns_401 | **PASS** |
| test_unauthenticated_update_returns_401 | **PASS** |
| test_unauthorized_role_cannot_access_support_api | **PASS** |
| test_unauthorized_role_cannot_retrieve_ticket | **PASS** |
| test_unauthorized_role_cannot_update_ticket | **PASS** |

### Full regression result

```
python -m pytest -q --ignore=src/apps/recruitment/tests.py
=> 92 passed in 397.67s (0:06:37)
```

Breakdown: 39 security tests + 37 Phase 1–2 portal tests (`src/apps/portal/tests.py`)
+ 16 authentication/RBAC tests (`tests/authentication/test_auth.py`). **0 failures.**

## Authentication Regression Tests

Authentication itself was not modified. Existing suite re-ran green:

```
tests/authentication/test_auth.py ......... 16 passed
```

Covering password validation, successful/failed login, lockout throttling (429),
`/auth/me/` auth requirement, RBAC on user/audit endpoints, and privilege
escalation protections in user management.

## Security Issues

None found in the Phase 3 scope. All attempted violations (unauthenticated,
wrong role, wrong object, escalation) were correctly rejected with 401/403/400.

## Remaining Risks

1. **Pre-existing collection error (out of scope):** `src/apps/recruitment/tests.py`
   fails to collect under pytest (`Model class recruitment.models.JobVacancy ... isn't in
   an application in INSTALLED_APPS`). This predates Phase 3 and does not affect the
   Support module; the full-suite command above uses `--ignore` for that file.
2. **401 vs 403 ambiguity on object access:** DRF returns `403` for cross-object
   access (chosen intentionally to satisfy "Authenticated but unauthorized → 403").
   This discloses that a ticket with that ID exists. If an existence oracle is a
   concern, `PermissionScopedObjectMixin` can be changed to return `404` for
   unauthorized objects (one-line change, tests would need updating accordingly).
3. **Support list scoping is assignee-only:** Support Executives can only list
   tickets assigned to them. If unassigned ("open") ticket triage is required, a
   separate read-only queue endpoint scoped by status would need to be added.
4. **Rate limiting / throttling** relies on the global DRF defaults (`anon 60/min`,
   `user 1000/min`); no per-support-API throttle tuning was performed.
5. **No write audit for client updates** beyond the existing `AuditLog` entries
   emitted in `perform_create`/`perform_update`; delete is intentionally not exposed.
