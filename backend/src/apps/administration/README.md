# Aurexion Administration & RBAC Engine Module

## Overview

The **Administration Module** provides core system administration features, role-based access control (RBAC) permission evaluation, user-role choice metadata endpoints, and executive telemetry metrics for the Aurexion Technologies platform.

In simple terms:

> **System Admin manages roles & permissions → Permission engine enforces RBAC across all modules → Executive dashboard tracks platform metrics**

---

## Key Responsibilities

- **Dynamic Role Management**: View, create, update, and manage system roles (`super_admin`, `administrator`, `bdm`, `sales_executive`, `hr_manager`, `content_manager`, `support_executive`, `client_user`).
- **Module-Level Permission Granularity**: Define per-role CRUD permissions (`can_create`, `can_read`, `can_update`, `can_delete`) across system modules (`crm`, `bdm`, `recruitment`, `cms`, `portal`, etc.).
- **RBAC Permission Class (`BaseRolePermission`)**: Base class that performs fast Redis-cached database permission checks for incoming HTTP requests.
- **Executive Admin Dashboard**: Aggregates real-time telemetry across revenue, total clients, active leads, support ticket counts, recruitment metrics, and audit feeds.
- **Role Choices Metadata**: Provides `/api/v1/users/roles/` for frontend dropdowns and dynamic form building.

---

## Core Models

### `Role` (`src/apps/administration/models.py`)
- **Fields**: `name` (e.g., "Business Development Manager"), `code` (e.g., `bdm`), `description`, `is_system_role` (Boolean).
- **Purpose**: Defines system and custom roles across the organization.

### `ModulePermission` (`src/apps/administration/models.py`)
- **Fields**: `role` (FK to `Role`), `module` (e.g., `crm`, `portal`), `can_create`, `can_read`, `can_update`, `can_delete`.
- **Purpose**: Fine-grained access matrix mapping role capabilities to system modules.

---

## API Endpoints

| Method | Endpoint | Description | Permission Required |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/dashboard/` | Executive Admin Telemetry & Metrics | `super_admin`, `administrator` |
| `GET` | `/api/v1/users/roles/` | List all valid user roles for dropdowns | Authenticated |
| `GET` | `/api/v1/roles/` | List system roles & permissions matrix | `super_admin`, `administrator` |
| `POST` | `/api/v1/roles/` | Create a new system role | `super_admin` |
| `GET` | `/api/v1/roles/{id}/` | Retrieve role & module permissions | `super_admin`, `administrator` |
| `PUT/PATCH` | `/api/v1/roles/{id}/` | Update role permissions matrix | `super_admin` |
| `DELETE` | `/api/v1/roles/{id}/` | Delete a non-system role | `super_admin` |

---

## Security & Caching Layer

- **Cached Permission Lookups**: RBAC permission results are cached in Redis/Memcached (`rbac:{role_code}:{module}:{action}`) for 300 seconds to eliminate DB overhead.
- **Super Admin Bypass**: Super Admins bypass permission checks for instant execution.
- **Detail Action Scoping**: HTTP `POST` requests targeted at detail actions on existing resources automatically deduce `action = 'update'` instead of `'create'`, preventing permission blocks for non-creator roles.
