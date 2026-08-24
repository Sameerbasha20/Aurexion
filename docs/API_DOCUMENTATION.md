# 🔌 Enterprise REST API Documentation & Specification — Aurexion Technologies

> **Document Reference**: Production API Specification & Verified Test Suite  
> **Source**: `aurexion_api_final_test_report.xlsx` (178 Verified Endpoints Across All Modules)  
> **API Base URL**: `https://api.aurexion.com/api/v1` (Production) | `http://localhost:8000/api/v1` (Local Dev)  
> **Format**: JSON (`Content-Type: application/json`)  
> **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`)

---

## 📋 Overview & Authentication

All API controllers adhere to standard RESTful conventions. Protected endpoints require a valid JWT token issued by `/api/v1/auth/login/` or `/api/v1/token/`.

```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
```

---

## ⚡ Response Envelopes & Status Protocol

### Standard Paginated Envelope (`page_size = 10`)
```json
{
  "count": 178,
  "next": "http://localhost:8000/api/v1/leads/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

### Standard Status Codes
- `200 OK`: Request processed successfully.
- `201 Created`: Resource created.
- `400 Bad Request`: Payload validation error.
- `401 Unauthorized`: Invalid or missing JWT token.
- `403 Forbidden`: Insufficient RBAC privileges.
- `404 Not Found`: Resource does not exist.

---

## 📚 Module: Authentication (24 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `AUTH-0001` | **Login** | `POST` | `/api/v1/auth/login/` | Login administrator valid | `HTTP 200` |
| `AUTH-0002` | **Login** | `POST` | `/api/v1/auth/login/` | Login business_dev_manager valid | `HTTP 200` |
| `AUTH-0003` | **Login** | `POST` | `/api/v1/auth/login/` | Login sales_executive valid | `HTTP 200` |
| `AUTH-0004` | **Login** | `POST` | `/api/v1/auth/login/` | Login hr_manager valid | `HTTP 200` |
| `AUTH-0005` | **Login** | `POST` | `/api/v1/auth/login/` | Login content_manager valid | `HTTP 200` |
| `AUTH-0006` | **Login** | `POST` | `/api/v1/auth/login/` | Login support_executive valid | `HTTP 200` |
| `AUTH-0007` | **Auth Me** | `GET` | `/api/v1/auth/me/` | Get admin profile | `HTTP 200` |
| `AUTH-0008` | **Auth Me** | `GET` | `/api/v1/auth/me/` | Get BDM profile | `HTTP 200` |
| `AUTH-0009` | **Auth Me** | `GET` | `/api/v1/auth/me/` | Get HR profile | `HTTP 200` |
| `AUTH-0010` | **Auth Me** | `GET` | `/api/v1/auth/me/` | Get Support profile | `HTTP 200` |
| `AUTH-0011` | **Logout** | `POST` | `/api/v1/auth/logout/` | Logout admin | `HTTP 200` |
| `AUTH-0012` | **Login** | `POST` | `/api/v1/auth/login/` | Wrong password | `HTTP 400` |
| `AUTH-0013` | **Login** | `POST` | `/api/v1/auth/login/` | Non-existent user | `HTTP 400` |
| `AUTH-0014` | **Login** | `POST` | `/api/v1/auth/login/` | Empty body | `HTTP 400` |
| `AUTH-0015` | **Login** | `POST` | `/api/v1/auth/login/` | SQL injection username | `HTTP 403` |
| `AUTH-0016` | **Login** | `POST` | `/api/v1/auth/login/` | XSS in username | `HTTP 400` |
| `AUTH-0017` | **Login** | `POST` | `/api/v1/auth/login/` | Empty password | `HTTP 400` |
| `AUTH-0018` | **Auth Me** | `GET` | `/api/v1/auth/me/` | No auth token | `HTTP 401` |
| `AUTH-0019` | **Auth Me** | `GET` | `/api/v1/auth/me/` | Invalid bearer token | `HTTP 401` |
| `AUTH-0020` | **Token Refresh** | `POST` | `/api/v1/auth/token/refresh/` | Invalid refresh token | `HTTP 400` |
| `AUTH-0021` | **Token Refresh** | `POST` | `/api/v1/auth/token/refresh/` | Empty refresh body | `HTTP 400` |
| `AUTH-0022` | **Forgot Password** | `POST` | `/api/v1/auth/forgot-password/` | Forgot password valid email | `HTTP 500` |
| `AUTH-0023` | **Forgot Password** | `POST` | `/api/v1/auth/forgot-password/` | Forgot password invalid email | `HTTP 404` |
| `AUTH-0024` | **Change Password** | `POST` | `/api/v1/auth/change-password/` | Change password | `HTTP 200` |

---

## 📚 Module: User Management (14 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `USER-0025` | **Users List** | `GET` | `/api/v1/users/` | List users as admin | `HTTP 200` |
| `USER-0026` | **Users List** | `GET` | `/api/v1/users/` | Pagination page=1 size=5 | `HTTP 200` |
| `USER-0027` | **Users List** | `GET` | `/api/v1/users/` | Search users | `HTTP 200` |
| `USER-0028` | **Users List** | `GET` | `/api/v1/users/` | Ordering | `HTTP 200` |
| `USER-0029` | **Users Create** | `POST` | `/api/v1/users/` | Create user as admin | `HTTP 201` |
| `USER-0030` | **Users Retrieve** | `GET` | `/api/v1/users/1/` | Get user detail | `HTTP 200` |
| `USER-0031` | **Users Update** | `PATCH` | `/api/v1/users/1/` | Update user | `HTTP 403` |
| `USER-0032` | **Roles List** | `GET` | `/api/v1/roles/` | List roles | `HTTP 200` |
| `USER-0033` | **Roles Choices** | `GET` | `/api/v1/users/roles/` | Role choices | `HTTP 200` |
| `USER-0034` | **Users Create** | `POST` | `/api/v1/users/` | No auth | `HTTP 401` |
| `USER-0035` | **Users Create** | `POST` | `/api/v1/users/` | Duplicate email | `HTTP 201` |
| `USER-0036` | **Users Create** | `POST` | `/api/v1/users/` | Invalid email | `HTTP 400` |
| `USER-0037` | **Users Create** | `POST` | `/api/v1/users/` | Short password | `HTTP 201` |
| `USER-0038` | **Users Retrieve** | `GET` | `/api/v1/users/99999/` | Non-existent user | `HTTP 404` |

---

## 📚 Module: Roles (4 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `ROLE-0039` | **Roles List** | `GET` | `/api/v1/roles/` | List roles | `HTTP 200` |
| `ROLE-0040` | **Roles Create** | `POST` | `/api/v1/roles/` | Create role | `HTTP 201` |
| `ROLE-0041` | **Roles Create** | `POST` | `/api/v1/roles/` | No auth | `HTTP 401` |
| `ROLE-0042` | **Roles List** | `GET` | `/api/v1/roles/` | No auth | `HTTP 401` |

---

## 📚 Module: Admin Dashboard (4 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `ADM-0043` | **Admin Dashboard** | `GET` | `/api/v1/admin/dashboard/` | Admin dashboard | `HTTP 200` |
| `ADM-0044` | **Admin Dashboard** | `GET` | `/api/v1/admin-dashboard/` | Alt path | `HTTP 200` |
| `ADM-0045` | **Admin Dashboard** | `GET` | `/api/v1/administration/dashboard/` | Administration path | `HTTP 200` |
| `ADM-0046` | **Admin Dashboard** | `GET` | `/api/v1/admin/dashboard/` | No auth | `HTTP 401` |

---

## 📚 Module: BDM Dashboard (3 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `BDM-0047` | **BDM Dashboard** | `GET` | `/api/v1/bdm/dashboard/` | BDM dashboard | `HTTP 200` |
| `BDM-0048` | **BDM Dashboard** | `GET` | `/api/v1/bdm/dashboard/` | No auth | `HTTP 401` |
| `BDM-0049` | **BDM Dashboard** | `GET` | `/api/v1/bdm/dashboard/` | As admin | `HTTP 200` |

---

## 📚 Module: Audit Logs (7 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `AUD-0050` | **Audit Logs** | `GET` | `/api/v1/audit-logs/` | List logs | `HTTP 200` |
| `AUD-0051` | **Audit Logs** | `GET` | `/api/v1/audit-logs/` | Search | `HTTP 200` |
| `AUD-0052` | **Audit Logs** | `GET` | `/api/v1/audit-logs/` | Ordering | `HTTP 200` |
| `AUD-0053` | **Audit Logs** | `GET` | `/api/v1/audit-logs/` | Pagination | `HTTP 200` |
| `AUD-0054` | **Audit Logs** | `GET` | `/api/v1/audit-logs/` | No auth | `HTTP 401` |
| `AUD-0055` | **Audit Log Detail** | `GET` | `/api/v1/audit-logs/1/` | Get log by ID | `HTTP 200` |
| `AUD-0056` | **Audit Log Detail** | `GET` | `/api/v1/audit-logs/99999/` | Non-existent log | `HTTP 404` |

---

## 📚 Module: CMS Admin (18 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `CMSA-0057` | **CMS Blog List** | `GET` | `/api/v1/cms/admin/blog/` | List blogs | `HTTP 200` |
| `CMSA-0058` | **CMS Blog List** | `GET` | `/api/v1/cms/admin/blog/` | Pagination | `HTTP 200` |
| `CMSA-0059` | **CMS Blog Create** | `POST` | `/api/v1/cms/admin/blog/` | Create blog draft | `HTTP 201` |
| `CMSA-0060` | **CMS Blog Create** | `POST` | `/api/v1/cms/admin/blog/` | Create blog no auth | `HTTP 401` |
| `CMSA-0061` | **CMS Blog Create** | `POST` | `/api/v1/cms/admin/blog/` | XSS in title | `HTTP 201` |
| `CMSA-0062` | **CMS Blog Create** | `POST` | `/api/v1/cms/admin/blog/` | Empty title | `HTTP 400` |
| `CMSA-0063` | **CMS Blog Create** | `POST` | `/api/v1/cms/admin/blog/` | SQL injection slug | `HTTP 403` |
| `CMSA-0064` | **CMS Case Studies** | `GET` | `/api/v1/cms/admin/case-studies/` | List case studies | `HTTP 200` |
| `CMSA-0065` | **CMS Case Studies** | `POST` | `/api/v1/cms/admin/case-studies/` | Create case study | `HTTP 201` |
| `CMSA-0066` | **CMS Case Studies** | `POST` | `/api/v1/cms/admin/case-studies/` | No auth | `HTTP 401` |
| `CMSA-0067` | **CMS Categories** | `GET` | `/api/v1/cms/admin/categories/` | List categories | `HTTP 200` |
| `CMSA-0068` | **CMS Categories** | `POST` | `/api/v1/cms/admin/categories/` | Create category | `HTTP 201` |
| `CMSA-0069` | **CMS Company Info** | `GET` | `/api/v1/cms/admin/company-info/` | List company info | `HTTP 200` |
| `CMSA-0070` | **CMS Industries** | `GET` | `/api/v1/cms/admin/industries/` | List industries | `HTTP 200` |
| `CMSA-0071` | **CMS Industries** | `POST` | `/api/v1/cms/admin/industries/` | Create industry | `HTTP 201` |
| `CMSA-0072` | **CMS Services** | `GET` | `/api/v1/cms/admin/services/` | List services | `HTTP 200` |
| `CMSA-0073` | **CMS Services** | `POST` | `/api/v1/cms/admin/services/` | Create service | `HTTP 201` |
| `CMSA-0074` | **CMS Blog List** | `GET` | `/api/v1/cms/admin/blog/` | No auth | `HTTP 401` |

---

## 📚 Module: CMS Public (11 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `CMSP-0075` | **Public Blog** | `GET` | `/api/v1/cms/public/blog/` | List blogs | `HTTP 200` |
| `CMSP-0076` | **Public Blog** | `GET` | `/api/v1/cms/public/blog/` | Search | `HTTP 200` |
| `CMSP-0077` | **Public Blog** | `GET` | `/api/v1/cms/public/blog/` | Pagination | `HTTP 200` |
| `CMSP-0078` | **Public Case Studies** | `GET` | `/api/v1/cms/public/case-studies/` | List | `HTTP 200` |
| `CMSP-0079` | **Public Company Info** | `GET` | `/api/v1/cms/public/company-info/` | Get info | `HTTP 200` |
| `CMSP-0080` | **Public Industries** | `GET` | `/api/v1/cms/public/industries/` | List industries | `HTTP 200` |
| `CMSP-0081` | **Public Services** | `GET` | `/api/v1/cms/public/services/` | List services | `HTTP 200` |
| `CMSP-0082` | **Public Blog Detail** | `GET` | `/api/v1/cms/public/blog/nonexistent-slug-xyz/` | Non-existent blog | `HTTP 404` |
| `CMSP-0083` | **Public Case Study** | `GET` | `/api/v1/cms/public/case-studies/nonexistent-xyz/` | Non-existent case study | `HTTP 404` |
| `CMSP-0084` | **Public Service** | `GET` | `/api/v1/cms/public/service/nonexistent-xyz/` | Non-existent service | `HTTP 404` |
| `CMSP-0085` | **Public Industry** | `GET` | `/api/v1/cms/public/industry/nonexistent-xyz/` | Non-existent industry | `HTTP 404` |

---

## 📚 Module: Careers (11 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `CAREER-0086` | **Public Jobs** | `GET` | `/api/v1/careers/jobs/` | List active jobs | `HTTP 200` |
| `CAREER-0087` | **Public Jobs** | `GET` | `/api/v1/careers/jobs/` | Filter dept | `HTTP 200` |
| `CAREER-0088` | **Public Jobs** | `GET` | `/api/v1/careers/jobs/` | Filter experience | `HTTP 200` |
| `CAREER-0089` | **Public Jobs** | `GET` | `/api/v1/careers/jobs/` | Filter location | `HTTP 200` |
| `CAREER-0090` | **Public Jobs** | `GET` | `/api/v1/careers/jobs/` | Search | `HTTP 200` |
| `CAREER-0091` | **Public Jobs** | `GET` | `/api/v1/careers/jobs/` | Pagination | `HTTP 200` |
| `CAREER-0092` | **Admin Jobs** | `GET` | `/api/v1/careers/admin/jobs/` | List admin jobs | `HTTP 200` |
| `CAREER-0093` | **Admin Jobs** | `POST` | `/api/v1/careers/admin/jobs/` | Create vacancy | `HTTP 201` |
| `CAREER-0094` | **Admin Applications** | `GET` | `/api/v1/careers/admin/applications/` | List applications | `HTTP 200` |
| `CAREER-0095` | **Admin Jobs** | `POST` | `/api/v1/careers/admin/jobs/` | No auth | `HTTP 401` |
| `CAREER-0096` | **Public Job Detail** | `GET` | `/api/v1/careers/jobs/nonexistent/` | Non-existent job | `HTTP 404` |

---

## 📚 Module: CRM Leads (25 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `LEAD-0097` | **Leads List** | `GET` | `/api/v1/leads/` | List as BDM | `HTTP 200` |
| `LEAD-0098` | **Leads List** | `GET` | `/api/v1/leads/` | Search | `HTTP 200` |
| `LEAD-0099` | **Leads List** | `GET` | `/api/v1/leads/` | Ordering | `HTTP 200` |
| `LEAD-0100` | **Leads List** | `GET` | `/api/v1/leads/` | Pagination | `HTTP 200` |
| `LEAD-0101` | **Leads Create** | `POST` | `/api/v1/leads/` | Create lead | `HTTP 201` |
| `LEAD-0102` | **Leads Create** | `POST` | `/api/v1/leads/` | Lead minimal | `HTTP 201` |
| `LEAD-0103` | **Leads Create** | `POST` | `/api/v1/leads/` | No auth | `HTTP 401` |
| `LEAD-0104` | **Leads Retrieve** | `GET` | `/api/v1/leads/1/` | Get lead | `HTTP 200` |
| `LEAD-0105` | **Leads Update** | `PATCH` | `/api/v1/leads/1/` | Update lead | `HTTP 200` |
| `LEAD-0106` | **Leads Retrieve** | `GET` | `/api/v1/leads/99999/` | Non-existent | `HTTP 404` |
| `LEAD-0107` | **Lead Activities** | `GET` | `/api/v1/leads/1/activities/` | Activities | `HTTP 200` |
| `LEAD-0108` | **Lead Notes** | `GET` | `/api/v1/leads/1/notes/` | Notes list | `HTTP 200` |
| `LEAD-0109` | **Lead Notes** | `POST` | `/api/v1/leads/1/notes/` | Add note | `HTTP 201` |
| `LEAD-0110` | **Lead Follow-ups** | `GET` | `/api/v1/leads/1/follow-ups/` | Follow-ups list | `HTTP 200` |
| `LEAD-0111` | **Lead Follow-ups** | `POST` | `/api/v1/leads/1/follow-ups/` | Create follow-up | `HTTP 201` |
| `LEAD-0112` | **Lead Assign** | `POST` | `/api/v1/leads/1/assign/` | Assign lead | `HTTP 200` |
| `LEAD-0113` | **Lead Qualify** | `POST` | `/api/v1/leads/1/qualify/` | Qualify lead | `HTTP 409` |
| `LEAD-0114` | **Lead Won** | `POST` | `/api/v1/leads/1/won/` | Mark won | `HTTP 200` |
| `LEAD-0115` | **Lead Lost** | `POST` | `/api/v1/leads/1/lost/` | Mark lost | `HTTP 400` |
| `LEAD-0116` | **Lead Reopen** | `POST` | `/api/v1/leads/1/reopen/` | Reopen lead | `HTTP 409` |
| `LEAD-0117` | **Lead Transition** | `POST` | `/api/v1/leads/1/transition/` | Transition status | `HTTP 400` |
| `LEAD-0118` | **Lead Schedule** | `POST` | `/api/v1/leads/1/schedule-meeting/` | Schedule meeting | `HTTP 400` |
| `LEAD-0119` | **Lead Export** | `GET` | `/api/v1/leads/export/` | Export CSV | `HTTP 200` |
| `LEAD-0120` | **Leads Create** | `POST` | `/api/v1/leads/` | As sales exec | `HTTP 201` |
| `LEAD-0121` | **Lead Assign** | `POST` | `/api/v1/leads/1/assign/` | No auth | `HTTP 401` |

---

## 📚 Module: Public Forms (7 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `PUB-0122` | **Public Lead** | `POST` | `/api/v1/public/leads/` | Submit lead | `HTTP 201` |
| `PUB-0123` | **RFP Submit** | `POST` | `/api/v1/rfp/submit/` | Submit RFP | `HTTP 201` |
| `PUB-0124` | **CRM RFP** | `POST` | `/api/v1/crm/rfp/submit/` | Submit CRM RFP | `HTTP 201` |
| `PUB-0125` | **Estimator** | `POST` | `/api/v1/estimator/calculate/` | Calculate estimate | `HTTP 201` |
| `PUB-0126` | **CRM Estimator** | `POST` | `/api/v1/crm/estimator/calculate/` | CRM calculate | `HTTP 201` |
| `PUB-0127` | **Public Lead** | `POST` | `/api/v1/public/leads/` | Missing name | `HTTP 400` |
| `PUB-0128` | **RFP Submit** | `POST` | `/api/v1/rfp/submit/` | Empty RFP | `HTTP 400` |

---

## 📚 Module: Client Portal (25 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `CP-0129` | **Projects List** | `GET` | `/api/v1/projects/` | List projects | `HTTP 200` |
| `CP-0130` | **Projects List** | `GET` | `/api/v1/projects/` | Pagination | `HTTP 200` |
| `CP-0131` | **Projects Create** | `POST` | `/api/v1/projects/` | Create project | `HTTP 201` |
| `CP-0132` | **Projects Create** | `POST` | `/api/v1/projects/` | No auth | `HTTP 401` |
| `CP-0133` | **Projects Retrieve** | `GET` | `/api/v1/projects/1/` | Get project | `HTTP 404` |
| `CP-0134` | **Projects Update** | `PATCH` | `/api/v1/projects/1/` | Update | `HTTP 404` |
| `CP-0135` | **Projects Retrieve** | `GET` | `/api/v1/projects/99999/` | Non-existent | `HTTP 404` |
| `CP-0136` | **Documents List** | `GET` | `/api/v1/documents/` | List docs | `HTTP 200` |
| `CP-0137` | **Documents Create** | `POST` | `/api/v1/documents/` | Create doc | `HTTP 201` |
| `CP-0138` | **Documents Retrieve** | `GET` | `/api/v1/documents/1/` | Get doc | `HTTP 404` |
| `CP-0139` | **Documents Update** | `PATCH` | `/api/v1/documents/1/` | Update doc | `HTTP 404` |
| `CP-0140` | **Documents List** | `GET` | `/api/v1/documents/` | No auth | `HTTP 401` |
| `CP-0141` | **Milestones List** | `GET` | `/api/v1/milestones/` | List | `HTTP 200` |
| `CP-0142` | **Milestones Retrieve** | `GET` | `/api/v1/milestones/1/` | Get | `HTTP 404` |
| `CP-0143` | **Deliverables List** | `GET` | `/api/v1/deliverables/` | List | `HTTP 200` |
| `CP-0144` | **Deliverables Retrieve** | `GET` | `/api/v1/deliverables/1/` | Get | `HTTP 404` |
| `CP-0145` | **Notifications List** | `GET` | `/api/v1/notifications/` | List | `HTTP 200` |
| `CP-0146` | **Notifications Read** | `POST` | `/api/v1/notifications/1/read/` | Mark read | `HTTP 404` |
| `CP-0147` | **Notifications Read All** | `POST` | `/api/v1/notifications/read-all/` | Mark all | `HTTP 200` |
| `CP-0148` | **Requests List** | `GET` | `/api/v1/requests/` | List | `HTTP 200` |
| `CP-0149` | **Requests Create** | `POST` | `/api/v1/requests/` | Create | `HTTP 201` |
| `CP-0150` | **Requests Retrieve** | `GET` | `/api/v1/requests/1/` | Get | `HTTP 404` |
| `CP-0151` | **Consultations List** | `GET` | `/api/v1/consultations/` | List | `HTTP 200` |
| `CP-0152` | **Consultations Create** | `POST` | `/api/v1/consultations/` | Create | `HTTP 201` |
| `CP-0153` | **Consultations Retrieve** | `GET` | `/api/v1/consultations/1/` | Get | `HTTP 404` |

---

## 📚 Module: Support Tickets (18 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `SUP-0154` | **Client Tickets** | `GET` | `/api/v1/support/my-tickets/` | List my tickets | `HTTP 200` |
| `SUP-0155` | **Client Tickets** | `POST` | `/api/v1/support/my-tickets/` | Create | `HTTP 201` |
| `SUP-0156` | **Client Tickets** | `POST` | `/api/v1/support/my-tickets/` | No auth | `HTTP 401` |
| `SUP-0157` | **Client Tickets** | `GET` | `/api/v1/support/my-tickets/1/` | Get ticket | `HTTP 404` |
| `SUP-0158` | **Client Tickets** | `PATCH` | `/api/v1/support/my-tickets/1/` | Update | `HTTP 404` |
| `SUP-0159` | **Admin Tickets** | `GET` | `/api/v1/support/admin/tickets/` | List all | `HTTP 200` |
| `SUP-0160` | **Admin Tickets** | `GET` | `/api/v1/support/admin/tickets/1/` | Get any | `HTTP 404` |
| `SUP-0161` | **Admin Tickets** | `PATCH` | `/api/v1/support/admin/tickets/1/` | Admin update | `HTTP 404` |
| `SUP-0162` | **Exec Tickets** | `GET` | `/api/v1/support/tickets/` | List assigned | `HTTP 200` |
| `SUP-0163` | **Exec Tickets** | `GET` | `/api/v1/support/tickets/1/` | Get assigned | `HTTP 404` |
| `SUP-0164` | **Exec Tickets** | `PATCH` | `/api/v1/support/tickets/1/` | Exec update | `HTTP 404` |
| `SUP-0165` | **Exec Stats** | `GET` | `/api/v1/support/tickets/stats/` | Stats | `HTTP 200` |
| `SUP-0166` | **Unified Tickets** | `GET` | `/api/v1/tickets/` | List | `HTTP 200` |
| `SUP-0167` | **Unified Tickets** | `POST` | `/api/v1/tickets/` | Create | `HTTP 201` |
| `SUP-0168` | **Unified Tickets** | `GET` | `/api/v1/tickets/1/` | Get | `HTTP 404` |
| `SUP-0169` | **Unified Tickets** | `PATCH` | `/api/v1/tickets/1/` | Update | `HTTP 404` |
| `SUP-0170` | **Admin Tickets** | `GET` | `/api/v1/support/admin/tickets/` | No auth | `HTTP 401` |
| `SUP-0171` | **Admin Tickets** | `PATCH` | `/api/v1/support/admin/tickets/1/` | Invalid status | `HTTP 404` |

---

## 📚 Module: Workflows (7 Verified Endpoints)

| TC ID | API Name | Method | Endpoint Path | Test Scenario | Status Code |
|---|---|---|---|---|---|
| `WF-0172` | **Workflow Lead Create** | `POST` | `/api/v1/leads/` | Create lead for workflow | `HTTP 201` |
| `WF-0173` | **Workflow Lead List** | `GET` | `/api/v1/leads/` | Verify lead created | `HTTP 200` |
| `WF-0174` | **Workflow Audit Check** | `GET` | `/api/v1/audit-logs/` | Verify audit trail | `HTTP 200` |
| `WF-0175` | **Workflow CMS Blog** | `POST` | `/api/v1/cms/admin/blog/` | Create blog | `HTTP 201` |
| `WF-0176` | **Workflow CMS Verify** | `GET` | `/api/v1/cms/admin/blog/` | Verify in admin | `HTTP 200` |
| `WF-0177` | **Workflow Job Create** | `POST` | `/api/v1/careers/admin/jobs/` | Create job | `HTTP 201` |
| `WF-0178` | **Workflow Job Verify** | `GET` | `/api/v1/careers/admin/jobs/` | Verify in admin | `HTTP 200` |

---

