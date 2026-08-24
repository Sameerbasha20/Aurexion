# Authentication Integration Root Cause Analysis

**Project**: Aurexion Technologies  
**Date**: August 2026  
**Document**: `docs/AUTHENTICATION_INTEGRATION_ROOT_CAUSE.md`

---

## 1. Executive Summary

During system testing following security hardening, all authenticated frontend dashboards (BDM Dashboard, Support Dashboard, Client Portal, CMS Admin, CRM Leads, etc.) experienced `HTTP 401 Unauthorized` ("Authentication credentials were not provided.") errors immediately after a successful login (`POST /api/v1/auth/login/` returning 200). Subsequent automatic token refresh calls returned `HTTP 400 Bad Request` ("Refresh token is missing.").

This investigation determined the exact root causes across frontend transport, cookie host/domain alignment, CSRF token handling, and Swagger OpenAPI schema generation.

---

## 2. Current Authentication Architecture

The application uses an HttpOnly cookie-based JWT authentication model designed to prevent token leakage via JavaScript (XSS mitigation):

```
+-------------------------------------------------------------------------+
|                               FRONTEND                                  |
|  - Runs on: http://localhost:3000                                       |
|  - Client: Axios (withCredentials: true, xsrfCookieName: "csrftoken")   |
|  - Storage: User profile metadata in localStorage (No tokens stored)   |
+-------------------------------------------------------------------------+
                                    │
                         HTTP Request (Credentials)
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                                BACKEND                                  |
|  - Runs on: http://127.0.0.1:8000 / http://localhost:8000              |
|  - Middleware: CorsMiddleware -> CsrfViewMiddleware -> AuthMiddleware  |
|  - Auth Class: CookieJWTAuthentication                                  |
|  - Primary Credential: 'access_token' HttpOnly Cookie                   |
|  - Fallback Credential: 'Authorization: Bearer <token>' Header          |
|  - RBAC: BaseRolePermission + ModulePermission / Database Roles         |
+-------------------------------------------------------------------------+
```

---

## 3. Detailed Request & Token Flow Analysis

### A. Login Flow
1. User enters username and password on `http://localhost:3000/login`.
2. Frontend `authService.login()` sends `POST http://127.0.0.1:8000/api/v1/auth/login/` (via `VITE_API_URL`).
3. Backend `LoginView` validates credentials, creates JWT `RefreshToken`, and returns:
   - Status: `200 OK`
   - Body: `{"user": {"id": ..., "username": ..., "email": ..., "role": ...}}`
   - Response Headers:
     - `Set-Cookie: access_token=<JWT>; Max-Age=3600; Path=/; SameSite=Lax; HttpOnly`
     - `Set-Cookie: refresh_token=<JWT>; Max-Age=86400; Path=/; SameSite=Lax; HttpOnly`

### B. Subsequent Protected Request Flow (The Failure)
1. Frontend updates `AuthContext` and redirects to the role dashboard (e.g., `/bdm` or `/portal`).
2. Dashboard queries (e.g., `GET /api/v1/bdm/dashboard/`, `GET /api/v1/auth/me/`, `GET /api/v1/support/my-tickets/`) are dispatched by `axiosClient` to `http://127.0.0.1:8000/api/v1/...`.
3. **The Browser Interception**:
   - The browser's active origin is `http://localhost:3000` (hostname `localhost`).
   - The target API origin is `http://127.0.0.1:8000` (IP address `127.0.0.1`).
   - In modern web browsers (Chromium, Firefox, Safari), `localhost` (hostname) and `127.0.0.1` (IP address) are **DIFFERENT SITES** (cross-site).
   - Under standard cookie security policies, cookies with `SameSite=Lax` are **NEVER sent on cross-site subresource (AJAX / Fetch / XHR) requests**.
   - As a result, the browser omits the `access_token` and `refresh_token` cookies from the request.
4. **Backend Rejection**:
   - The backend `CookieJWTAuthentication.authenticate(request)` checks `request.COOKIES.get('access_token')` -> `None`.
   - Checks `request.META.get('HTTP_AUTHORIZATION')` -> `None`.
   - Returns `None` (unauthenticated).
   - DRF permission classes reject the request with `401 Unauthorized: Authentication credentials were not provided.`.
5. **Axios Response Interceptor Refresh Attempt**:
   - Interceptor catches 401 and calls `POST http://127.0.0.1:8000/api/v1/auth/token/refresh/`.
   - Because this request is also cross-site, the browser omits `refresh_token` cookie.
   - Backend `CookieTokenRefreshView` finds `request.COOKIES.get('refresh_token')` -> `None`.
   - Backend returns `400 Bad Request: Refresh token is missing.`.
   - Interceptor clears user session and redirects to `/login`.

---

## 4. Exact Root Causes Identified

1. **Origin / Host Mismatch in Local Development (`localhost` vs `127.0.0.1`)**:
   - Frontend is served on `http://localhost:3000`.
   - `frontend/.env.development` configured `VITE_API_URL=http://127.0.0.1:8000/api/v1/`.
   - In `axiosClient.ts`, default fallback was `http://127.0.0.1:8000/api/v1/`.
   - Browsers treat `localhost` and `127.0.0.1` as cross-site; therefore, `SameSite=Lax` cookies set by `127.0.0.1` are blocked from requests originating at `localhost:3000`.

2. **CSRF Token Initialization on Login**:
   - In `LoginView`, `django_login` rotates session and resets CSRF tokens. Calling `get_token(request)` explicitly guarantees that the `csrftoken` cookie is refreshed and present in response headers for subsequent state-changing HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`).

3. **OpenAPI / Swagger Documentation Schema Extension**:
   - DRF Spectacular emitted warnings because `CookieJWTAuthentication` was missing an `OpenApiAuthenticationExtension`. Registering this extension ensures Swagger UI displays the `jwtAuth` (Bearer) and cookie authentication scheme correctly.

4. **Token Refresh View Fallback for Non-Browser API Testing**:
   - `CookieTokenRefreshView` only inspected `request.COOKIES['refresh_token']`. To support both browser cookies and external Swagger/API clients, it should also accept `request.data.get('refresh')` and return token data in response payload when invoked outside a browser cookie context.

---

## 5. Affected Modules

All authenticated dashboards and module APIs were affected by the cookie transport block:
- **BDM**: `/api/v1/bdm/dashboard/`, `/api/v1/leads/`
- **CMS**: `/api/v1/cms/admin/*`
- **CRM**: `/api/v1/leads/`, `/api/v1/leads/export/`
- **HR / Recruitment**: `/api/v1/careers/admin/*`
- **Portal / Client**: `/api/v1/projects/`, `/api/v1/milestones/`, `/api/v1/support/my-tickets/`, `/api/v1/notifications/`
- **Support**: `/api/v1/support/tickets/`, `/api/v1/support/tickets/stats/`
- **Administration**: `/api/v1/admin/dashboard/`, `/api/v1/users/`, `/api/v1/roles/`, `/api/v1/audit-logs/`
- **Auth**: `/api/v1/auth/me/`, `/api/v1/auth/token/refresh/`

---

## 6. Proposed Minimal Fix (Zero Security Degradation)

1. **Frontend Environment & API Client Alignment**:
   - Update `frontend/.env.development` to use `http://localhost:8000/api/v1/`.
   - In `frontend/src/api/axiosClient.ts`, dynamically resolve `baseURL` during local development based on `window.location.hostname` (supporting both `localhost` and `127.0.0.1` consistently when loaded from either address).
   - In `frontend/vite.config.ts`, ensure Vite dev server proxy is optionally configured for `/api` to provide seamless same-origin communication.

2. **Backend CSRF & Cookie Integrity**:
   - In `src/apps/authentication/views.py`:
     - In `LoginView`, invoke `get_token(request)` to guarantee `csrftoken` cookie dispatch.
     - In `CookieTokenRefreshView`, support `request.COOKIES.get('refresh_token') or request.data.get('refresh')` and return appropriate payload for Swagger/API clients.

3. **Spectacular Swagger Authentication Extension**:
   - In `src/apps/authentication/authentication.py`, register `CookieJWTAuthenticationScheme` with DRF Spectacular to properly expose `jwtAuth` (Bearer token) scheme in Swagger UI.

4. **Security Invariants Preserved**:
   - No tokens in localStorage/sessionStorage.
   - HttpOnly flag retained on `access_token` and `refresh_token`.
   - CORS explicit whitelist maintained (`CORS_ALLOW_ALL_ORIGINS = False`).
   - CSRF validation on cookie-authenticated unsafe requests maintained.
   - RBAC and permission classes untouched.
