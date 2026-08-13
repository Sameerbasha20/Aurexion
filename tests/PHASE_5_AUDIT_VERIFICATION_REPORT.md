# PHASE 5 AUDIT VERIFICATION REPORT

Support Ticket Audit Logging Integration

> Tested on: Python 3.14.6, Django 5.2.15, DRF 3.x, pytest 9.1.1
> Database: PostgreSQL (via `config.settings`, test DB auto-created/destroyed)

---

## Scope

Phase 5 wires Support Ticket operations into the **existing** Aurexion
`AuditLog` infrastructure. No second audit system was created. Everything is
reused from the pre-existing audit architecture:

- Model: `AuditLog` (`apps.authentication.models`)
- Utility: `log_audit_event`, `get_model_state`, `get_client_ip`,
  `get_client_user_agent` (`apps.authentication.audit`)
- View endpoint: `AuditLogViewSet` (`apps.authentication.views`) — read-only,
  Super-Admin only

### Files involved

| File | Role |
|---|---|
| `src/apps/authentication/models.py` | Existing `AuditLog` model (unchanged). |
| `src/apps/authentication/audit.py` | Existing audit utility (unchanged, reused). |
| `src/apps/authentication/views.py` | Existing `AuditLogViewSet` (unchanged). |
| `src/apps/portal/views.py` | `AuditAccessDeniedMixin` + audit calls in all view sets' `perform_create` / `perform_update`. |
| `src/apps/portal/services.py` | Service-layer audit hooks reused by views. |
| `tests/portal/test_audit_integration.py` | New: 19 Phase 5 audit tests. |

## Existing Audit Architecture

The project ships a single audit system already used by authentication/RBAC:

- **Model** — `AuditLog` (`authentication/models.py:36`): `user`, `action`,
  `module`, `object_id`, `repr`, `previous_state` (JSON), `updated_state`
  (JSON), `ip_address`, `user_agent`, `timestamp`.
- **Utility** — `log_audit_event(...)` (`authentication/audit.py:25`) is the
  single entry point; it resolves the DB user, extracts IP/User-Agent from the
  request, sanitizes state dicts, and writes one `AuditLog` row.
- **Immutability** — `AuditLogViewSet` is a `ReadOnlyModelViewSet`
  (`authentication/views.py:274`) guarded by `IsSuperAdmin`. There are no
  update/delete methods, and the model is not registered in the Django admin.
- **Existing actions** — `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `CREATE`, `UPDATE`,
  `DELETE` for the authentication module.

Phase 5 only **consumes** this system for the `portal` module; it adds no new
model, no new utility, and no new table.

## Support Audit Integration

Support operations call `log_audit_event` **after** the operation succeeds, so
a failed/denied operation never records a success event.

| Operation | Endpoint(s) | Action | Where audited |
|---|---|---|---|
| Create ticket | `POST /api/v1/tickets/`, `POST /api/v1/support/my-tickets/` | `CREATE` | `TicketViewSet.perform_create`, `ClientTicketViewSet.perform_create` (after `save`) |
| Update ticket | `PATCH /api/v1/tickets/{id}/`, client/support/admin routes | `UPDATE` | each view set's `perform_update` (after `save`), capturing `previous_state` / `updated_state` |
| Status update | `PATCH ... {status}` (support/admin) | `UPDATE` | `SupportExecutiveTicketViewSet` / `AdministratorTicketViewSet` / `TicketViewSet.perform_update` |
| Priority update | `PATCH ... {priority}` | `UPDATE` | same `perform_update` paths |
| Resolution update | `PATCH ... {resolution_notes}` | `UPDATE` | same `perform_update` paths |
| Unauthorized access | any portal endpoint, authenticated | `ACCESS_DENIED` | `AuditAccessDeniedMixin.permission_denied` (view-level RBAC + object-level) |

`AuditAccessDeniedMixin` is mixed into every Support view set. It records an
`ACCESS_DENIED` event (module=`portal`, actor, request method/path, role) when
an **authenticated** user is denied. Unauthenticated requests (401) carry no
user identity and are intentionally **not** audited.

Event ordering guarantee: `log_audit_event` is invoked only after
`serializer.save()` / `SupportTicketService` update completes; `PermissionError`
from the service layer is converted to a 403 **before** any `UPDATE` audit.

## Events Generated

All events use the existing `AuditLog` row structure (module=`portal`):

| Action | Actor | Sample `repr` | State captured |
|---|---|---|---|
| `CREATE` | client_user | `Created ticket TKT-2026-00005: Audited issue` | `updated_state` only (`ticket_id`, `subject`, `category`, `priority`, `status`); `previous_state=None` |
| `UPDATE` | client_user | `Updated ticket ...` | `previous_state` + `updated_state` (subject/category/priority/status/resolution_notes) |
| `UPDATE` | support_executive | `Support updated ticket ...: status open -> in_progress` | previous/new status, priority, `assigned_to_id`, resolution_notes |
| `UPDATE` | administrator | `Administrator updated ticket ...: status ... -> ...` | previous/new status, `assigned_to_id`, `client_user_id`, resolution_notes |
| `ACCESS_DENIED` | any authenticated role | `Unauthorized GET /api/v1/tickets/5/ denied for role: client_user` | no body, no state; `object_id` = attempted ticket pk (where applicable) |

No second audit store is used — every event is an `AuditLog` row queryable
through the existing `/api/v1/audit-logs/` endpoint.

## Audit Data Verified

Verified end-to-end against the existing `AuditLog` table:

- **Identity** — `user` FK set to the acting user for every event.
- **Module** — `module='portal'` on all Support events.
- **Object** — `object_id` matches the created/attempted ticket pk.
- **Timestamp** — set automatically (`auto_now_add`).
- **previous/updated state** — correct diffs verified for subject, status
  (`open -> in_progress`), priority (`medium -> critical`), and resolution notes
  (`'' -> 'Root cause fixed in v2.3'`).
- **Create events** — `previous_state` is `None`, `updated_state.status` is
  `open` for a fresh ticket.
- **No success events on failure** — a 403 update produces zero `UPDATE` rows
  for that ticket (`test_update_audit_after_successful_operation_only`).

## Security Review

- **Single audit system preserved** — no duplicate/second audit model or
  utility was introduced.
- **Audit records are read-only** — `AuditLogViewSet` implements list/retrieve
  only; PATCH/DELETE by any user returns 403 (ordinary) or 405 (super-admin).
- **Ordinary users cannot read or modify audit logs** — list, retrieve, update
  and delete against `/api/v1/audit-logs/` all return 403 for non-super-admin
  roles (verified for `client_user`; administrators likewise denied).
- **No admin back-door** — `AuditLog` is not registered in Django admin, so it
  cannot be edited there either.
- **No sensitive data in audit output** — `ACCESS_DENIED` events store only
  method, path and role; request bodies are never persisted. Verified that a
  secret resolution-note payload sent in a denied request does not appear in
  `repr`, `previous_state` or `updated_state`.
- **401 not audited** — unauthenticated requests produce no audit rows (no
  identity to attribute; avoids log flooding).
- **`get_model_state` excludes secrets** — existing utility skips
  `password`/`last_login`; Support events only serialize ticket fields (no PII
  beyond subject/notes that the actor already supplied).

## Unit Test Results

The existing Support unit suite is unaffected (no logic changed, only audit
hooks added):

```
src/apps/portal/tests.py ..... 37 passed
```

## Integration Test Results

Phase 5 audit integration suite — `tests/portal/test_audit_integration.py`:

```
tests\portal\test_audit_integration.py ...................   [100%]
======================= 19 passed in 113.02s (0:01:53) ========================
```

| Test | Result |
|---|---|
| test_create_ticket_creates_audit_event | **PASS** |
| test_update_subject_creates_audit_event | **PASS** |
| test_status_update_creates_audit_event | **PASS** |
| test_priority_update_creates_audit_event | **PASS** |
| test_resolution_update_creates_audit_event | **PASS** |
| test_cross_client_retrieve_creates_access_denied_audit | **PASS** |
| test_cross_client_update_creates_access_denied_audit | **PASS** |
| test_unauthorized_role_creates_access_denied_audit | **PASS** |
| test_support_executive_create_denied_is_audited | **PASS** |
| test_unauthenticated_request_is_not_audited | **PASS** |
| test_access_denied_audit_does_not_leak_request_body | **PASS** |
| test_ordinary_user_cannot_list_audit_logs | **PASS** |
| test_ordinary_user_cannot_read_audit_detail | **PASS** |
| test_ordinary_user_cannot_modify_audit_records | **PASS** |
| test_ordinary_user_cannot_delete_audit_records | **PASS** |
| test_super_admin_can_read_audit_logs | **PASS** |
| test_audit_logs_are_read_only_even_for_super_admin | **PASS** |
| test_audit_event_captures_actor_and_metadata | **PASS** |
| test_update_audit_after_successful_operation_only | **PASS** |

**19/19 PASS (0 failures, 0 errors).**

## Issues

None found within Phase 5 scope.

- No double-logging: views pass no `request` to service-layer audit hooks when
  the view itself records the event, so each operation writes exactly one
  `AuditLog` row.
- No regression of immutability: the read-only `AuditLogViewSet` and its
  `IsSuperAdmin` guard were left untouched.
- `SupportTicketService.close_ticket` / `assign_ticket` retain their
  service-level audit hooks for future callers; the current API path audits
  through the view layer instead (single event per operation).

## Regression Results

```
python -m pytest -q --ignore=src/apps/recruitment/tests.py
=> 150 passed in 719.08s (0:11:59)
python manage.py check
=> System check identified no issues (0 silenced).
```

Breakdown of the 150 passing tests:

| Suite | Tests | Result |
|---|---|---|
| Phase 5 — `tests/portal/test_audit_integration.py` | 19 | **PASS** |
| Phase 4 — `tests/portal/test_tickets_api.py` | 39 | **PASS** |
| Phase 3 — `tests/portal/test_support_security.py` | 39 | **PASS** |
| Phase 1–2 — `src/apps/portal/tests.py` (model/serializer/service) | 37 | **PASS** |
| Authentication/RBAC — `tests/authentication/test_auth.py` | 16 | **PASS** |

**0 failures, 0 errors.**

> Note: `src/apps/recruitment/tests.py` has a pre-existing pytest collection
> error (`Model class recruitment.models.JobVacancy ... isn't in an application
> in INSTALLED_APPS`) unrelated to Phase 5; excluded via `--ignore` as in
> Phases 3–4 reports.

### Remaining Risks

1. `ACCESS_DENIED` events are written inside `permission_denied`, before DRF
   raises the 403. Under sustained brute-force probing this grows the audit
   table; current DRF user/anon throttling applies (1000/min, 60/min) but no
   per-endpoint tuning was performed.
2. Audit rows are immutable by design and only viewable by Super Admins; there
   is no retention/archival job yet (out of Phase 5 scope).
