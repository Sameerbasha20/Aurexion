# Authentication & Audit Logging Module

This module handles authentication, role-based access control (RBAC), user profile synchronization, security constraints, and compliance-driven audit logs for the Aurexion platform.

---

## 🛠️ Developed Technologies & Core Design

The authentication module was developed using the following technologies and design patterns:

*   **Framework**: [Django 5.2/6.1](https://www.djangoproject.com/) — The primary backend framework.
*   **REST API Layer**: [Django REST Framework (DRF) 3.18.0](https://www.django-rest-framework.org/) — Provides serializers, viewsets, and custom permissions.
*   **Token Authentication**: [djangorestframework-simplejwt 5.5.1](https://django-rest-framework-simplejwt.readthedocs.io/) — Implements JSON Web Token (JWT) credentials (access/refresh tokens) for secure stateless authentication.
*   **Throttling & Account Lockout**: [Django Cache Engine](https://docs.djangoproject.com/en/stable/topics/cache/) — Locks out users or IP addresses for 15 minutes after 5 consecutive failed login attempts to prevent brute-force attacks.
*   **Signals**: [Django post_save signals](https://docs.djangoproject.com/en/stable/topics/signals/) — Hooks into User object creation/modification to automatically synchronize the related `UserProfile` and role assignments.
*   **Compliance Logging**: Custom JSON serialization for database model states (storing `previous_state` and `updated_state`) to maintain high-integrity histories.

---

## 📁 Module Components

The module code is organized as follows:

| File | Purpose |
| :--- | :--- |
| [`models.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/src/apps/authentication/models.py) | Defines `UserProfile` (role choice) and `AuditLog` structure. |
| [`views.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/src/apps/authentication/views.py) | Implements throttled login, profile retriever, and RBAC viewsets. |
| [`serializers.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/src/apps/authentication/serializers.py) | Serializes User, UserProfile, Login, and AuditLog data. |
| [`validators.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/src/apps/authentication/validators.py) | Enforces custom password requirements (digits, symbols, length). |
| [`audit.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/src/apps/authentication/audit.py) | Custom hooks for logging IP address, User Agent, and model states. |
| [`urls.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/src/apps/authentication/urls.py) | Registers JWT refresh, login, user, and audit API routes. |

---

## 🧪 Testing Suite Overview

A robust testing framework is implemented using `pytest` and Django's testing suite. It runs 35 automated tests verifying unit logic, API integration, role enforcement regressions, and system-wide smoke checks.

> [!NOTE]
> **Test Environment Cleanup**: Due to Supabase/Supavisor connection pooling, the test database `test_postgres` can linger. The custom configuration in [`conftest.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/conftest.py) terminates active pooled sessions and drops the database at the start of every session.

### 1. Pytest Support
The system is configured to run tests smoothly via `pytest` through configuration parameters defined in [`pytest.ini`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/pytest.ini) and setup fixtures in [`conftest.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/conftest.py).

*   **File**: [`pytest.ini`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/pytest.ini)
*   **File**: [`conftest.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/conftest.py)

### 2. Unit Testing
Verifies isolated components of the codebase, ensuring validators and business logic operate as expected under different boundaries without external network requests.

*   **File**: [`test_auth.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/tests/authentication/test_auth.py)
*   **Test Case**: `PasswordValidationTestCase`
*   **Scope**:
    *   `test_compliant_password`: Confirms valid passwords pass checks.
    *   `test_short_password`: Asserts validation error for password length < 10.
    *   `test_missing_number`: Asserts validation error when missing a digit.
    *   `test_missing_symbol`: Asserts validation error when missing a symbol.

### 3. Integration Testing
Validates that multiple layers (Views, Serializers, Cache, Models, and DB transactions) collaborate correctly through simulated HTTP requests.

*   **File**: [`test_auth.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/tests/authentication/test_auth.py)
*   **Test Cases**: `AuthenticationAPITestCase`, `RBACPermissionsAPITestCase`
*   **Scope**:
    *   **JWT Credentials**: Success login returns access/refresh tokens and user metadata.
    *   **Audit Generation**: Valid logins trigger `LOGIN_SUCCESS`; invalid logins trigger `LOGIN_FAILURE`.
    *   **Brute-Force Lockout**: 5 failed login attempts trigger a `429 Too Many Requests` lockout on User/IP for 15 minutes.
    *   **RBAC Boundaries**: Verifies Client Users are forbidden from listing users (403); Admins cannot read audit logs (403); Super Admins can list and read everything.
    *   **Privilege Escalation Protection**: Prevents lower-role administrators from creating, editing, or deleting Super Admin accounts.
    *   **Model Audit Triggers**: User CRUD actions record structured JSON logs containing previous and updated database states in `AuditLog`.

### 4. Regression Testing
Enforces auth policies across all backend services to guarantee new code additions do not introduce authorization vulnerabilities on existing endpoints.

*   **File**: [`test_auth_enforcement.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/tests/authentication/test_auth_enforcement.py)
*   **Test Case**: `JWTAuthenticationEnforcementTestCase`
*   **Scope**:
    *   Tests that all protected routes (CMS, CRM, Careers, Portal, Recruitment) reject requests without token header (401), invalid tokens (401), or expired tokens (401).
    *   Verifies that access tokens can be successfully refreshed using the refresh token endpoint.
    *   Iteratively asserts permission allowances and restrictions for every user role (`super_admin`, `administrator`, `bdm`, `sales_executive`, `hr_manager`, `content_manager`, `support_executive`, `client_user`) against their specific dashboard endpoints.

### 5. Smoke Testing
Performs rapid sanity checks of the authentication system in live/test postgres environments to check that Django boots, system checks pass, and essential auth routes respond correctly.

*   **File**: [`smoke_test.py`](file:///c:/Users/ABC/Desktop/AURA/Aurexion_technologies/tests/smoke_test.py)
*   **Test Case**: `SupportSmokeTestCase`
*   **Scope**:
    *   `test_03_authentication_works`: Authenticates test users via POST to `reverse('login')` to confirm database connectivity, simplejwt token signing, and JSON response compliance during live/staging deployments.

---

## 🏃 Test Invocations

To execute the test suite, run the appropriate command in the root directory:

*   **All Auth Tests (Django Runner)**:
    ```bash
    python manage.py test tests.authentication
    ```
*   **All System Tests (Pytest Runner)**:
    ```bash
    pytest tests
    ```
*   **Specific Auth Enforcement Tests**:
    ```bash
    python manage.py test tests.authentication.test_auth_enforcement
    ```
*   **Smoke Test Suite**:
    ```bash
    python manage.py test tests.smoke_test
    ```
