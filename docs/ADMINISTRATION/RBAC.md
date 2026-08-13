# Administration & Dynamic RBAC Module Documentation

The `administration` module implements a robust, database-backed Role-Based Access Control (RBAC) system for the Aurexion Technologies platform. All permissions are verified dynamically on the backend to enforce strict, fine-grained access control across all modules and actions.

---

## 1. Database Schema & Domain Model

### 1.1 `Role`
Represents an administrative or operational persona.
*   `code` (CharField, unique): Unique identifier code (e.g., `super_admin`, `administrator`, `hr_manager`).
*   `name` (CharField): User-friendly display name.
*   `description` (TextField): Role description.

### 1.2 `ModulePermission`
Defines CRUD actions mapped to a specific role and platform module.
*   `role` (ForeignKey to `Role`): The role this permission entry belongs to.
*   `module` (CharField): The target platform module. Valid modules are:
    *   `authentication` (User authentication and profile management)
    *   `recruitment` (Applicant Tracking System & Job Vacancies)
    *   `cms` (Content Management System)
    *   `crm` (Customer Relationship Management)
    *   `portal` (Client Portal)
    *   `administration` (Role permissions and dynamic settings)
*   `can_create` (BooleanField): Grant permission to execute write/create actions.
*   `can_read` (BooleanField): Grant permission to view/read details.
*   `can_update` (BooleanField): Grant permission to modify existing records.
*   `can_delete` (BooleanField): Grant permission to destroy/delete records.

*Constraint*: The pair `(role, module)` has a unique index to prevent duplicate rule entries.

---

## 2. API Specifications

All endpoints are hosted under `api/v1/` and are strictly JSON-based.

### 2.1 Role Management ViewSet
*   **Permissions**: Restrict access solely to users holding the `super_admin` role. Non-super-admins will receive a `403 Forbidden` response.
*   **Base URL**: `/api/v1/roles/`

| HTTP Method | Action / Endpoint | Request Body | Description / Response |
|---|---|---|---|
| **GET** | List Roles (`/`) | None | Lists all roles with nested permission mappings. |
| **GET** | Retrieve Role Details (`/{id}/`) | None | Gets details of a specific role and its permission states. |
| **POST** | Create Role (`/`) | Role object + nested permissions | Creates a new database role and inserts mapping rows. |
| **PUT/PATCH** | Update Role permissions (`/{id}/`) | Role/permission updates | Modifies permissions. Implements validations to prevent lockout. |
| **DELETE** | Delete Role (`/{id}/`) | None | Deletes non-system roles. Deleting system roles is rejected. |

---

## 3. Core Constraints & Safety Handlers

To guarantee system stability, the following constraints are executed at the database transaction boundary:

1.  **Lockout Prevention**: Attempts to disable `can_create`, `can_read`, `can_update`, or `can_delete` on the `super_admin` role for critical modules (`administration` and `authentication`) are blocked and return a `400 Bad Request` validation error.
2.  **System Roles Protection**: System-critical roles (`super_admin` and `administrator`) cannot be deleted. Any attempt returns a `400 Bad Request`.
3.  **Privilege Escalation Protection**: During user creation/update in `/api/v1/users/`, non-super-admins cannot assign the `super_admin` role or modify `super_admin` accounts.
4.  **Audit Logs**: Changes to roles and module permissions are automatically serialized (recording the exact `previous_state` and `updated_state`) and saved in the central `AuditLog` table.

---

## 4. Backend Enforcement Helpers

### 4.1 Permission Classes (DRF)
*   `IsSuperAdmin`: Bypasses all module-level validation to allow unrestricted access.
*   `IsAdministrator` / `IsHRManager` / `IsBDM` / etc.: Inherit from `BaseRolePermission`. They dynamically fetch the request method, translate it to an action (`read`, `create`, `update`, `delete`), match the module name, and inspect the database permission flags for the request user's profile role.

### 4.2 Decorators (Django Views)
*   `@role_required(*roles)`: Restricts standard Django template views by dynamically looking up the matching role-module configuration in the database.
