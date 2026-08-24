# Aurexion RBAC (Role-Based Access Control) Module

## Overview

The **RBAC Module** contains database migrations and legacy schema extensions for Aurexion's Role-Based Access Control system.

In simple terms:

> **Database Schema & Migrations for System Roles & Permissions**

---

## Architecture & Integration

- Role management models and permission evaluation logic are implemented in `src/apps/administration/`.
- `apps.rbac` maintains database compatibility and migration historical states for role-permission schema evolution across platform releases.
