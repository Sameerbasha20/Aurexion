# Authentication Test Module

## Role of This Module

This directory contains automated tests for the Aurexion authentication and authorization flow. It verifies that users can authenticate securely, receive JWT credentials through protected cookies, access their own profile, and reach only the modules allowed by their role.

The tests also protect security boundaries around:

- Password strength validation.
- JWT authentication and token expiry.
- HttpOnly, Secure, and SameSite cookie attributes.
- CSRF protection for cookie-authenticated state-changing requests.
- Login failure auditing and brute-force lockout.
- Logout, cookie clearing, and session invalidation.
- Role-based access control (RBAC) and privilege-escalation prevention.
- CORS behavior for credentialed requests.
- Avoiding access and refresh token values in JSON responses and audit logs.
- Authentication enforcement across CMS, CRM, BDM, support, portal, and recruitment endpoints.

This is a test module. The authentication implementation is located in `src/apps/authentication`.

## Test Files

| File | Coverage |
| --- | --- |
| `test_auth.py` | Password validation, login success/failure, audit events, lockout, profile access, user management, and RBAC boundaries. |
| `test_auth_enforcement.py` | Missing, invalid, and expired JWT handling plus role-based access checks across protected API endpoints. |
| `test_cookie_security.py` | Cookie security attributes, cookie-based authentication, logout, refresh, CSRF, CORS, token isolation, and RBAC regression checks. |
| `test_dashboard_integration.py` | End-to-end login-to-dashboard flows, role dashboard access, logout behavior, and cookie-based token refresh. |

## Observed Authentication Endpoints

The authentication URL configuration is mounted under `/api/v1/`. Routes accept an optional trailing slash.

| Method | Endpoint | Observed purpose | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login/` | Authenticate by username or email and set `access_token` and `refresh_token` HttpOnly cookies. | Public |
| `POST` | `/api/v1/auth/logout/` | Log out the current user, clear authentication cookies, and invalidate the session/tokens. | Required |
| `POST` | `/api/v1/auth/token/refresh/` | Issue a new access token using the refresh token cookie. | Refresh cookie |
| `GET` | `/api/v1/auth/me/` | Return the current user's identity and role. | Required |
| `GET` | `/api/v1/users/` | List users. Used to verify administrator and super-admin permissions. | Required; role restricted |
| `POST` | `/api/v1/users/` | Create a user. | Required; role restricted |
| `PUT` | `/api/v1/users/<id>/` | Update a user. | Required; role restricted |
| `DELETE` | `/api/v1/users/<id>/` | Delete a user. | Required; role restricted |
| `GET` | `/api/v1/audit-logs/` | Read authentication and system audit logs. | Required; super-admin restricted |

The URL configuration also defines the following routes, although the attached tests do not currently exercise their complete behavior:

- `POST /api/v1/auth/forgot-password/`
- `POST /api/v1/auth/reset-password/`
- `POST /api/v1/auth/change-password/`
- `GET /api/v1/users/roles/`

## Protected Endpoints Observed in Enforcement Tests

These downstream routes are used to confirm that authentication is enforced consistently outside the authentication app:

- `GET /api/v1/admin/dashboard/`
- `GET /api/v1/bdm/dashboard/`
- `GET /api/v1/leads/`
- `GET /api/v1/cms/admin/service/`
- `GET /api/v1/cms/admin/services/`
- `GET /api/v1/cms/admin/case-studies/`
- `GET /api/v1/cms/admin/industry/`
- `GET /api/v1/cms/admin/categories/`
- `GET /api/v1/cms/admin/blog/`
- `GET /api/v1/roles/`
- `GET /api/v1/support/tickets/`
- `GET /api/v1/support/tickets/stats/`
- `GET /api/v1/support/my-tickets/`
- `GET /api/v1/support/admin/tickets/`
- `GET /api/v1/tickets/`
- `GET /api/v1/projects/`
- `GET /api/v1/milestones/`
- `GET /api/v1/notifications/`
- `GET /api/v1/careers/admin/jobs/`
- `GET /api/v1/careers/admin/applications/`

Unauthenticated requests are expected to return `401`. Authenticated users without the required role are expected to return `403`.

## Roles Covered

The test data includes these roles:

- `super_admin`
- `administrator`
- `bdm`
- `sales_executive`
- `hr_manager`
- `content_manager`
- `support_executive`
- `client_user`

The tests currently verify representative permissions such as:

- `super_admin`: access to user management, audit logs, and protected module examples.
- `administrator`: access to user management, but not audit logs or super-admin account operations.
- `bdm`: access to CRM leads and the BDM dashboard.
- `sales_executive`: access to leads, but not the BDM dashboard.
- `hr_manager`: access to recruitment jobs.
- `content_manager`: access to CMS administration examples.
- `support_executive`: access to support ticket statistics.
- `client_user`: access to personal tickets and projects, but not administrative dashboards or user management.

## Security Expectations Verified

- Successful login returns `200` and user metadata, but not JWT values in the JSON body.
- Access and refresh JWTs are set as HttpOnly cookies.
- Cookie `SameSite` is expected to be `Lax`; the `Secure` flag follows the project setting.
- Five failed login attempts trigger a 15-minute user/IP lockout and the next attempt returns `429` with `Retry-After`.
- Failed and successful login events are written to `AuditLog`.
- User create, update, and delete actions produce audit records with model state changes.
- Missing, invalid, or expired credentials return `401`.
- Valid credentials with insufficient permissions return `403`.
- Cookie-authenticated unsafe requests require a valid CSRF token.
- Credentialed CORS requests allow configured origins and reject arbitrary origins.
- Token values must not appear in audit log data.

## Running the Tests

From the repository root:

```powershell
python manage.py test tests.authentication
```

Run an individual test file:

```powershell
python manage.py test tests.authentication.test_auth
python manage.py test tests.authentication.test_auth_enforcement
python manage.py test tests.authentication.test_cookie_security
pytest tests/authentication/test_dashboard_integration.py
```

The project-wide test command is:

```powershell
pytest tests
```

## Remaining Work

The following work is still recommended based on the current tests and the routes defined by the authentication app:

1. Add focused tests for forgot-password, reset-password, and change-password flows, including invalid tokens, expired tokens, password validation, and unauthorized requests.
2. Add tests for the user-role choices endpoint and confirm its access policy for each relevant role.
3. Expand CRUD coverage to include validation failures, duplicate usernames or emails, partial updates, inactive users, and missing user IDs.
4. Complete the role-by-endpoint matrix for every protected endpoint and every supported role, including negative cases.
5. Add explicit assertions that previously issued access and refresh tokens cannot be reused after logout or blacklisting, rather than checking only cookie deletion and a cleared client.
6. Add refresh-token failure cases for missing, invalid, expired, and rotated tokens.
7. Run the suite against the deployment-specific HTTPS and CORS settings to verify production cookie behavior, allowed origins, and `Secure` attributes.
8. Keep the endpoint lists synchronized with URL configuration as new protected modules or routes are added.

## Related Implementation

- `src/apps/authentication/urls.py` - Authentication route definitions.
- `src/apps/authentication/views.py` - Authentication, logout, refresh, profile, user, and audit views.
- `src/apps/authentication/models.py` - User profile and audit log models.
- `src/apps/authentication/serializers.py` - Authentication and user data validation/serialization.
- `src/apps/authentication/audit.py` - Audit event helpers.
- `src/apps/authentication/validators.py` - Password validation rules.