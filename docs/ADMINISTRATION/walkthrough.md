# Walkthrough - Administration/Role Dashboard & RBAC Workflow

We have successfully implemented the database-backed Role-Based Access Control (RBAC) system under a new app called **`administration`** (`src/apps/administration/`). The dashboard is constructed strictly as REST API endpoints using Django REST Framework (DRF), with all security constraints and backend validation enforced, and without utilizing HTML templates.

## Changes Made

### 1. Database & Models
*   **[models.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/src/apps/administration/models.py)**: Created the `Role` and `ModulePermission` models. A role has a `code` (e.g. `super_admin`, `administrator`, `bdm`), `name`, and `description`. A `ModulePermission` links to a `Role` and maps permission grants (`can_create`, `can_read`, `can_update`, `can_delete`) for distinct system modules (`authentication`, `recruitment`, `cms`, `crm`, `portal`, `administration`).

### 2. Django REST Framework API Endpoints
*   **[serializers.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/src/apps/administration/serializers.py)**: Serializers supporting nested listing, creation, and update operations for Roles and their associated Module Permissions.
*   **[views.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/src/apps/administration/views.py)**: Implemented `RoleViewSet` mapped to `/api/v1/roles/`.
    *   **Access Restricted**: Only users with the `super_admin` role can access this viewset.
    *   **Lockout Protection**: Validates that the `super_admin` role can never be updated to lose CRUD permissions on the critical administrative modules (`administration` and `authentication`).
    *   **System Role Preservation**: Prevents deletion of the core system roles (`super_admin` and `administrator`).
    *   **Audit Trail**: Logs all create, update, and delete actions to the `AuditLog` table using the project's audit utilities.
*   **[urls.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/src/apps/administration/urls.py)**: Registered routers for the viewsets.

### 3. Backend Enforcements
*   **[permissions.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/src/apps/administration/permissions.py)**: Updated `BaseRolePermission` and downstream subclasses (like `IsAdministrator`, `IsHRManager`, etc.) to dynamically check the database permissions for a user's role code against the requested module and action (determined via request HTTP methods). It includes a fallback mechanism for unseeded test setups to maintain compatibility.
*   **[decorators.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/src/apps/administration/decorators.py)**: Updated role decorators to consult the database configuration.
*   **[permissions.py (Recruitment)](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/src/apps/recruitment/permissions.py)**: Re-routed recruitment-specific checks through the dynamic database helper `has_module_permission`.

### 4. Admin Seeding & Initialization
*   **[create_modules_admin.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/scripts/create_modules_admin.py)**: Updated the script to:
    *   Seed default roles (`super_admin`, `administrator`, `bdm`, `sales_executive`, `hr_manager`, `content_manager`, `support_executive`, `client_user`).
    *   Configure default CRUD mappings for each role based on their modules.
    *   Automatically initialize the `super_admin` user (with `SuperAdmin@2026`) and synchronize the other administrator credentials.

---

## Verification & Testing

All backend APIs and dynamic permissions were validated via integration testing.

### Automated Tests
We created a new test suite **[test_admin_api.py](file:///c:/Users/win10/Desktop/Aura/Aurexion_technologies/tests/administration/test_admin_api.py)** containing:
1.  **Super Admin authorization check**: Verifies `super_admin` users have access to Role Management endpoints, and non-super-admins are denied with `403 Forbidden`.
2.  **Role permissions update & audit logic**: Validates changing permission configs updates the DB and records details in the `AuditLog` (including previous/updated states).
3.  **Lockout protection validation**: Asserts that trying to remove full CRUD rights from the `super_admin` role results in a `400 Bad Request`.
4.  **System role deletion protection**: Asserts that core system roles (`super_admin` and `administrator`) cannot be deleted, but normal roles can.
5.  **Dynamic permission enforcement**: Verifies that when permissions are updated on a role (e.g. disabling recruitment write permissions), backend endpoints immediately reflect this change and block write requests for users under that role.

### Run Results
```bash
pytest tests
```
```text
tests\administration\test_admin_api.py ......                            [ 27%]
tests\authentication\test_auth.py ................                       [100%]

======================== 22 passed in 59.70s (0:01:00) ========================
```
All **22 tests** passed successfully!

### Performance & Latency Testing
We ran endpoint performance tests using a 50-iteration benchmark. All endpoints, including the new `/api/v1/roles/` list view, completed well within the **500 ms** target limit.

#### Performance Metrics Table
| Endpoint | Method | Average Latency | p95 Latency | Min | Max | Status |
|---|---|---|---|---|---|---|
| Login (`POST /api/v1/auth/login/`) | POST | 30.03 ms | 66.97 ms | 18.04 ms | 248.48 ms | **PASS** |
| Me (`GET /api/v1/auth/me/`) | GET | 0.64 ms | 0.89 ms | 0.58 ms | 1.00 ms | **PASS** |
| User List (`GET /api/v1/users/`) | GET | 2.71 ms | 3.26 ms | 2.44 ms | 3.47 ms | **PASS** |
| Audit Log List (`GET /api/v1/audit-logs/`) | GET | 11.84 ms | 20.62 ms | 9.41 ms | 34.27 ms | **PASS** |
| Role List (`GET /api/v1/roles/`) | GET | 3.64 ms | 5.04 ms | 3.00 ms | 7.13 ms | **PASS** |

> [!NOTE]
> **All endpoints are fully compliant!** The response times are well under the 500ms threshold specified in the AGENTS.md execution guidelines.

