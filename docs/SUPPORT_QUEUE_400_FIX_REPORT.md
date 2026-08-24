# Support Queue 400 Bad Request — Fix Report

**Date:** 2026-08-24
**Scope:** Admin Support Queue (`/admin/support`) and Support Executive queue (`/support/tickets`)
**Reported symptom:** HTTP 400 on `PATCH /api/v1/support/admin/tickets/355/` and `PATCH /api/v1/support/tickets/467/` when changing status / priority / assignment from the admin dashboard.

---

## Root Cause

Empirical diagnosis (read-only serializer dry-runs against the dev database) confirmed **the backend behaved correctly in every case; the frontend was issuing requests that violate the ticket lifecycle contract**:

| # | Defect | Effect |
|---|--------|--------|
| 1 | Both failing tickets (**355, 467**) are `status="closed"`. Serializers (`AdministratorTicketUpdateSerializer` / `SupportExecutiveTicketUpdateSerializer.validate()`) reject **any** modification of a closed ticket ("Cannot modify/reopen a closed ticket."). The UI rendered fully active dropdowns on closed rows. | Every dropdown interaction on a closed row fired a guaranteed-failing PATCH → 400. |
| 2 | Selecting **Closed** sent `{status: "closed"}` without `resolution_notes`. The serializers require non-empty resolution notes to close a ticket. The executive page had an alert guard, but it read `resolution_notes` from *list* data — and `SupportTicketListSerializer` does not expose that field, so the guard always tripped (dead path). The admin page had no guard at all. | Closing from any quick-status dropdown was impossible without a 400. |
| 3 | The assignee dropdown fetched `/users/` **unfiltered**, listing clients, sales, HR, etc., while the backend only accepts assignees with `support_executive` / `administrator` / `super_admin` roles (`validate_assigned_to`) and the model FK declares `limit_choices_to={'profile__role': 'support_executive'}`. | Selecting any non-support user produced a guaranteed 400. |

## Fix (frontend-only contract alignment)

No backend code was changed. All authentication, RBAC, permission classes, serializer validation, CSRF/CORS/JWT behavior remain untouched.

### 1. `frontend/src/features/support/services/supportService.ts`
- `getUsers()` now requests `${ADMIN.USERS}?role=support_executive`, using the existing backend role filter (and its per-role cache). The dropdown can no longer offer users that `validate_assigned_to` will reject.

### 2. `frontend/src/features/administration/pages/Support/index.tsx`
- Closed rows are now read-only: priority, assignee, and status selects get `disabled={savingId === t.id || locked}` plus a "Closed tickets are read-only" tooltip.
- `handleStatusChange` implements the close flow per the API contract: when **Closed** is selected, resolution notes are collected up front and sent as `{status: "closed", resolution_notes}` in a single PATCH; empty/cancelled input aborts locally instead of hitting the API.
- Preserves admins' ability to close tickets (no admin detail page exists today).

### 3. `frontend/src/features/support/pages/Tickets/TicketList.tsx`
- Quick-status select is disabled on closed rows (with tooltip directing to ticket details).
- Removed the permanently-dead "Closed" option from open rows (list payloads never contain `resolution_notes`, so quick-close could never succeed); the option is rendered only for already-closed rows so the disabled control displays the correct value. Closing remains available via the executive Ticket Details page, which has the proper notes editor.

## Security Review

- No permission class, serializer validator, or auth mechanism modified or bypassed.
- Closed-ticket immutability and mandatory resolution notes remain enforced **server-side** (defense in depth); the client changes merely stop issuing requests the server must reject.
- Role-filtering of assignable users narrows the UI list; the backend `validate_assigned_to` check remains authoritative.

## Verification

- `python manage.py test tests.portal.test_support_security --parallel 1` → **OK, 39 tests** (includes closed-ticket rejection, unauthorized-transition, and assignment-role cases).
- `npm run build` → success (pre-existing chunk-size warnings only).
- Read-only DB dry-runs confirmed all previously failing payload shapes now either cannot be triggered from the UI or validate successfully (e.g. close-with-notes, unassign-to-open, status/priority transitions on live tickets).

## Follow-ups (out of scope)

- Consider an administrator ticket-detail view with a proper notes modal (replacing `window.prompt`).
- `SupportTicketListSerializer` could expose `resolution_notes` if quick-close is ever desired in list views.
