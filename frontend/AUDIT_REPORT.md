# AUREXION FRONTEND — ENTERPRISE PRODUCTION AUDIT REPORT

> **Audit Date:** 2026-08-20
> **Auditor Role:** Senior Staff Frontend Architect
> **Scope:** Frontend only (`frontend/src/`)
> **Codebase Version:** 1.0.0
> **Methodology:** Read-only inspection of every file in `frontend/src/`, all hooks, all services, all routes, all stores, all providers, all components, AGENTS.md

---

## 1. EXECUTIVE SUMMARY

### Current Architecture

The Aurexion frontend is a **React 19 SPA** built with:
- **Vite 7** (build system)
- **TypeScript 5.6** (strict mode)
- **wouter** (client-side routing)
- **TanStack Query v5** (server state — partially adopted)
- **Zustand v5** (client state — minimal)
- **React Hook Form + Zod** (forms — single instance)
- **Axios** (HTTP client with interceptors)
- **Tailwind CSS v4** (styling)
- **Radix UI + shadcn/ui** (component primitives)
- **Recharts** (charts)
- **Framer Motion** (animations)
- **Sonner** (toasts)

### Current Score: 38 / 100

### Production Status: **NOT READY**

### Biggest Risks

1. **Dual state management system with duplicated hooks** — `features/*/hooks/use*.ts` (manual useState/useEffect) coexist with `queries/useCrmQueries.ts` (TanStack Query), creating two parallel data-fetching systems for the same API calls with no cache synchronization between them.

2. **Massive client-side data aggregation in service layer** — `crmService.getDashboardStats()`, `getRecentActivities()`, `getOpportunities()`, `getContacts()`, `getCompanies()` all fetch full lead lists and compute derived data client-side. This creates O(N) redundant API calls and N+1-like frontend performance issues.

3. **No cache invalidation in portal/support/recruitment mutations** — `useCreateTicket`, `useUpdateTicket`, `useUpdateAdminTicket`, `useUpdateExecutiveTicket` all use manual `useState` instead of TanStack Query mutations, meaning after a successful mutation the cached query data remains stale indefinitely.

4. **Zustand stores and Context provide duplicated auth state** — `useAuthStore` (Zustand) and `AuthContext` (React Context) both manage `user`, `token`, `isAuthenticated`, `hasPermission`, `hasRole` with no synchronization between them.

5. **`usePortalQuery` is a custom query hook that duplicates TanStack Query** — It reimplements query caching, loading states, error handling, and refetch logic without actually using TanStack Query's cache, refetch-on-focus, or deduplication.

### Biggest Technical Debt

- **~60% of feature hooks use manual `useState`/`useEffect`/`useCallback` instead of TanStack Query**, making them uncached, un-deduped, non-stale-while-revalidate, and unable to participate in cache invalidation.
- **Dashboard pages perform 5-10 redundant API calls on every mount** because service-layer aggregation functions (e.g., `getDashboardStats`) make multiple sequential and parallel API calls internally.
- **Components are oversized** — `Dashboard/index.tsx` is 930 lines with inline modals, forms, and business logic.

### Recommended Next Action

**TASK FE-ARCH-001:** Consolidate all feature hooks to use TanStack Query exclusively. Remove all manual `useState`/`useEffect` data-fetching hooks. Unify auth state into a single source (Zustand or Context, not both).

---

## 2. REPOSITORY ARCHITECTURE

```
frontend/src/
├── api/
│   ├── axiosClient.ts          — Centralized Axios instance (base URL, timeout, credentials)
│   ├── endpoints.ts            — All API endpoint constants
│   ├── interceptors.ts         — Request/response interceptors (auth token, error handling, response unpacking)
│   └── apiErrorHandler.ts      — Centralized error normalization (ApiError class, status code mapping)
├── app/
│   ├── App.tsx                 — Root component (providers tree)
│   ├── main.tsx                — React DOM entry
│   ├── router.tsx              — Route definitions with lazy loading
│   ├── config/
│   │   ├── app.config.ts       — App constants
│   │   ├── navigation.config.ts — Sidebar nav per role
│   │   └── role.config.ts      — Role definitions (only ADMIN/BDM/CLIENT/USER)
│   └── providers/
│       ├── AuthProvider.tsx     — AuthContext provider (manual localStorage persistence)
│       ├── QueryProvider.tsx    — TanStack Query provider (global defaults)
│       └── ThemeProvider.tsx    — Dark/light theme
├── store/
│   ├── useAuthStore.ts         — Zustand auth store (duplicated with AuthProvider)
│   └── useUIStore.ts           — Zustand UI store (sidebar, modal, theme)
├── context/
│   ├── AuthContext.tsx          — Auth context type definition
│   ├── NotificationContext.tsx  — Notification context (unused — defined but no provider)
│   └── UIContext.tsx            — UI context (unused — defined but no provider)
├── queries/
│   ├── queryKeys.ts            — Centralized query key factory
│   └── useCrmQueries.ts        — TanStack Query hooks for CRM leads
├── hooks/
│   ├── useAuth.ts              — Auth context consumer
│   ├── useComposition.ts       — IME composition handler
│   ├── useDebounce.ts          — Debounce hook
│   ├── useMobile.tsx           — Mobile breakpoint detection
│   ├── usePagination.ts        — Client-side pagination state
│   ├── usePermissions.ts       — Permission check hook
│   ├── usePersistFn.ts         — Stable function reference
│   └── useRole.ts              — Role check hook
├── features/
│   ├── authentication/
│   │   ├── services/authService.ts  — Login/logout/getMe API
│   │   └── pages/                    — Login page
│   ├── crm/
│   │   ├── services/crmService.ts   — All CRM API calls + client-side aggregation
│   │   ├── hooks/useCrm.ts          — Manual useState/useEffect hooks
│   │   └── pages/                   — Dashboard, Leads, LeadDetail, Opportunities, etc.
│   ├── cms/
│   │   ├── services/cmsService.ts   — All CMS API calls + dashboard aggregation
│   │   ├── hooks/useCms.ts          — Manual useState/useEffect hooks
│   │   └── pages/                   — Services, CaseStudies, Industries, Blog, etc.
│   ├── recruitment/
│   │   ├── services/recruitmentService.ts — API calls + dashboard aggregation
│   │   ├── hooks/useRecruitment.ts  — Manual useState/useEffect hooks
│   │   └── pages/                   — Dashboard, Jobs, Candidates, Applications
│   ├── support/
│   │   ├── services/supportService.ts — Support ticket API calls
│   │   ├── hooks/                    — 6 hooks (manual + custom query hook)
│   │   └── pages/                    — Dashboard, Tickets
│   ├── portal/
│   │   ├── services/portalService.ts  — Client portal API
│   │   ├── hooks/                    — 6 hooks (custom usePortalQuery)
│   │   ├── types/portal.types.ts      — Shared types
│   │   └── pages/                    — Dashboard, Projects, Requests, etc.
│   ├── bdm/
│   │   ├── services/bdmService.ts    — BDM API + mock data
│   │   ├── hooks/                    — Manual useState/useEffect hooks
│   │   └── pages/                    — Dashboard, Leads, Opportunities, etc.
│   ├── administration/
│   │   ├── services/administrationService.ts — Admin API
│   │   └── pages/                         — Dashboard, Users, Roles, etc.
│   ├── rfp/
│   ├── estimator/
│   └── public/
├── components/
│   ├── ui/                      — shadcn/ui primitives (button, card, dialog, etc.)
│   ├── common/                  — Shared components (ErrorBoundary, EmptyState, Sidebar, etc.)
│   ├── feedback/                — LoadingState, ErrorState, EmptyState
│   ├── forms/                   — LeadFormModal
│   ├── charts/                  — Empty
│   ├── modals/                  — Empty
│   ├── tables/                  — Empty
│   └── loaders/                 — Empty
├── layouts/
│   ├── AdminLayout/             — Admin/CRM/CMS/Support/Recruitment layout
│   ├── AuthLayout/              — Auth pages layout
│   ├── BdmLayout/               — BDM layout
│   ├── ClientLayout/            — Client portal layout
│   └── PublicLayout/            — Public website layout
├── routes/                      — Route definitions per role
├── utils/                       — Constants, formatters, validators, permission utils
├── lib/utils.ts                 — cn() utility
├── styles/                      — CSS files (variables, typography, animations, responsive, globals)
├── data/                        — Empty
└── assets/                      — Static assets
```

---

## 3. CURRENT STATE MANAGEMENT

### 3.1 Zustand Stores

| Store | File | State Fields | Actions | Persistence | Status |
|-------|------|-------------|---------|-------------|--------|
| `useAuthStore` | `store/useAuthStore.ts` | `user`, `token`, `isAuthenticated` | `setUser`, `logout`, `hasPermission`, `hasRole` | localStorage (`aurexion_user`, `aurexion_token`) | DUPLICATE of AuthProvider |
| `useUIStore` | `store/useUIStore.ts` | `sidebarOpen`, `activeModal`, `modalData`, `theme` | `toggleSidebar`, `openModal`, `closeModal`, `setTheme` | None | PARTIAL — not used in layouts |

**Critical Issue:** `useAuthStore` (Zustand) and `AuthProvider` (Context) both manage `user`, `token`, `isAuthenticated`, `hasPermission`, `hasRole` with **no synchronization**. They both independently read/write `localStorage`. Components use `useAuth()` (Context) for most operations. `useAuthStore` is only used by `logout()` to clear `queryClient.clear()`. This is a **P0 DUPLICATION**.

### 3.2 Context Providers

| Provider | File | Purpose | Status |
|----------|------|---------|--------|
| `AuthProvider` | `app/providers/AuthProvider.tsx` | Auth state, login, logout, permissions | ACTIVE — primary auth state |
| `QueryProvider` | `app/providers/QueryProvider.tsx` | TanStack Query client | ACTIVE |
| `ThemeProvider` | `app/providers/ThemeProvider.tsx` | Dark/light theme | ACTIVE |
| `NotificationContext` | `context/NotificationContext.tsx` | Notification management | DEAD — defined but no provider wraps app |
| `UIContext` | `context/UIContext.tsx` | UI state | DEAD — defined but no provider wraps app |
| `AuthContext` | `context/AuthContext.tsx` | Auth type definitions | ACTIVE — types only |

### 3.3 React State (feature hooks)

**Every feature module has its own manual data-fetching hooks using `useState` + `useEffect` + `useCallback`**, completely bypassing TanStack Query's cache:

| Module | Hook File | Pattern | Uses TanStack Query |
|--------|-----------|---------|-------------------|
| CRM | `features/crm/hooks/useCrm.ts` | useState + useEffect | NO |
| CMS | `features/cms/hooks/useCms.ts` | useState + useEffect | NO |
| Recruitment | `features/recruitment/hooks/useRecruitment.ts` | useState + useEffect | NO |
| BDM | `features/bdm/hooks/useBdmDashboard.ts`, `useLeads.ts` | useState + useEffect | NO |
| Portal | `features/portal/hooks/usePortalQuery.ts` | Custom query hook (not TanStack) | NO |
| Support | `features/support/hooks/*.ts` | usePortalQuery or manual | NO |
| CRM Queries | `queries/useCrmQueries.ts` | TanStack Query | YES |

**Only `useCrmQueries.ts` uses TanStack Query.** All other modules use manual state management with no cache, no deduplication, no stale-while-revalidate, and no cross-component cache sharing.

### 3.4 Server State / Cache

| What | How Cached | Invalidated By | Stale Time | GC Time |
|------|-----------|---------------|------------|---------|
| Leads list | TanStack Query (useCrmQueries) | `useCreateLeadMutation`, `useUpdateLeadMutation`, `useTransitionLeadMutation` | 60s (global default) | 5min (global default) |
| Lead detail | TanStack Query (useCrmQueries) | `useUpdateLeadMutation`, `useTransitionLeadMutation` | 60s | 5min |
| CMS data | Manual useState | Manual `refetch()` only | None | None |
| Recruitment data | Manual useState | Manual `refetch()` only | None | None |
| BDM data | Manual useState | Manual `refetch()` only | None | None |
| Portal tickets | usePortalQuery (custom) | Manual `refetch()` only | None | None |
| Support tickets | usePortalQuery (custom) | Manual `refetch()` only | None | None |
| Admin data | Manual useState | Manual `refetch()` only | None | None |

### 3.5 Duplicated Sources of Truth

| Data | Source A | Source B | Synchronized? |
|------|----------|----------|--------------|
| Auth user | `AuthProvider` (Context) | `useAuthStore` (Zustand) | NO |
| Auth token | `AuthProvider` → localStorage | `useAuthStore` → localStorage | NO (both write independently) |
| Auth permissions | `AuthProvider` → computed from role | `useAuthStore` → stored in user object | NO |
| UI sidebar | `AdminLayout` (local useState) | `useUIStore` (Zustand) | NO |
| Theme | `ThemeProvider` (Context) | `useUIStore` (Zustand) | NO |

---

## 4. QUERY AUDIT

### 4.1 TanStack Query Hooks (queries/useCrmQueries.ts)

| Query | Endpoint | Query Key | Params | Cache | Stale | Refetch | Status |
|-------|----------|-----------|--------|-------|-------|---------|--------|
| `useLeadsQuery` | `GET /leads/` | `["leads", "list", params]` | search, status, priority, page, page_size, ordering | TanStack default | 60s global | manual only | PARTIAL — no refetchOnWindowFocus |
| `useSalesDashboardQuery` | `GET /leads/` (aggregated client-side) | `["leads", "metrics"]` | None | TanStack default | 60s global | manual only | DEFECTIVE — computes stats from client-side aggregation of ALL leads |
| `useLeadDetailQuery` | `GET /leads/:id/` | `["leads", "detail", id]` | leadId | TanStack default | 60s global | manual only | PARTIAL — depends on leadId |

### 4.2 Manual Query Hooks (all non-TanStack)

| Module | Hook | Endpoint | Query Key | Params | Cache | Stale | Status |
|--------|------|----------|-----------|--------|-------|-------|--------|
| CRM | `useSalesDashboard()` | `GET /leads/` (aggregated) | None (useState) | None | None | None | DEFECTIVE — fetches ALL leads, no cache |
| CRM | `useLeads()` | `GET /leads/` | None (useState) | LeadQueryParams | None | None | DEFECTIVE — no cache |
| CRM | `useLeadDetail()` | `GET /leads/:id/` | None (useState) | leadId | None | None | DEFECTIVE — no cache |
| CRM | `useFollowUps()` | `GET /leads/:id/follow-ups/` | None (useState) | None | None | None | DEFECTIVE — fetches ALL leads then N+1 |
| CRM | `useActivities()` | `GET /leads/` + notes + follow-ups | None (useState) | None | None | None | DEFECTIVE — O(N) API calls |
| CRM | `useOpportunities()` | `GET /leads/` | None (useState) | None | None | None | DEFECTIVE — client-side filter |
| CRM | `useContacts()` | `GET /leads/` | None (useState) | None | None | None | DEFECTIVE — client-side map |
| CRM | `useCompanies()` | `GET /leads/` | None (useState) | None | None | None | DEFECTIVE — client-side aggregation |
| CRM | `useAssignableUsers()` | `GET /users/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| CMS | `useCmsDashboard()` | 5 parallel API calls | None (useState) | None | None | None | DEFECTIVE — no cache |
| CMS | `useCmsServices()` | `GET /cms/admin/services/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| CMS | `useCmsCaseStudies()` | `GET /cms/admin/case-studies/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| CMS | `useCmsIndustries()` | `GET /cms/admin/industries/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| CMS | `useCmsCategories()` | `GET /cms/admin/categories/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| CMS | `useCmsBlog()` | `GET /cms/admin/blog/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| Recruitment | `useRecruitmentDashboard()` | 2 parallel API calls | None (useState) | None | None | None | DEFECTIVE — no cache |
| Recruitment | `useJobs()` | `GET /careers/admin/jobs/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| Recruitment | `useApplications()` | 2 parallel API calls | None (useState) | None | None | None | DEFECTIVE — no cache |
| Recruitment | `useCandidates()` | 2 parallel API calls | None (useState) | None | None | None | DEFECTIVE — no cache |
| BDM | `useBdmDashboard()` | `GET /bdm/dashboard/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| BDM | `useLeads()` | `GET /leads/` | None (useState) | page, status, search, source | None | None | DEFECTIVE — no cache |
| BDM | `useLead()` | `GET /leads/:id/` | None (useState) | id | None | None | DEFECTIVE — no cache |
| Portal | `useMyTickets()` | `GET /support/my-tickets/` | `["portal", "my-tickets"]` (usePortalQuery) | None | None | None | PARTIAL — custom hook, no cache |
| Portal | `useProfile()` | `GET /auth/me/` | `["portal", "profile"]` (usePortalQuery) | None | None | None | PARTIAL — custom hook, no cache |
| Support | `useAdminTickets()` | `GET /support/admin/tickets/` | `["support", "admin-tickets"]` (usePortalQuery) | None | None | None | PARTIAL — custom hook, no cache |
| Support | `useExecutiveTickets()` | `GET /support/tickets/` | `["support", "executive-tickets"]` (usePortalQuery) | None | None | None | PARTIAL — custom hook, no cache |
| Admin | `useUsers()` | `GET /users/` | None (useState) | None | None | None | DEFECTIVE — no cache |
| Admin | `useAuditLogs()` | `GET /audit-logs/` | None (useState) | None | None | None | DEFECTIVE — no cache |

---

## 5. MUTATION AUDIT

### 5.1 TanStack Query Mutations (queries/useCrmQueries.ts)

| Mutation | Endpoint | Validation | Loading | Error | Cache Invalidation | UI Consistency | Status |
|----------|----------|-----------|---------|-------|-------------------|---------------|--------|
| `useCreateLeadMutation` | `POST /leads/` | Zod (LeadFormModal) | `isPending` | Manual try/catch | Invalidates leads.lists(), leads.metrics(), bdm.dashboard() | Auto-refetch via invalidation | PARTIAL |
| `useUpdateLeadMutation` | `PATCH /leads/:id/` | None visible | `isPending` | Manual try/catch | Invalidates detail, lists, metrics, bdm.dashboard + setQueryData | Auto-refetch via invalidation | PARTIAL |
| `useTransitionLeadMutation` | `POST /leads/:id/transition/` | None visible | `isPending` | Manual try/catch | Invalidates detail, lists, metrics, bdm.dashboard | Auto-refetch via invalidation | PARTIAL |

### 5.2 Manual Mutations (service calls from pages)

| Mutation | File | Endpoint | Validation | Loading | Error | Cache Invalidation | Status |
|----------|------|----------|-----------|---------|-------|-------------------|--------|
| `crmService.markLeadWon()` | Dashboard | `POST /leads/:id/won/` | window.confirm only | Manual `setScheduling` | `alert()` | Manual `refetch()` | DEFECTIVE — no cache invalidation |
| `crmService.markLeadLost()` | Dashboard | `POST /leads/:id/lost/` | window.prompt | None | `alert()` | Manual `refetch()` | DEFECTIVE — no cache invalidation |
| `crmService.completeFollowUp()` | Dashboard | `POST /leads/:id/follow-ups/:id/complete/` | None | Manual `completingId` | `alert()` | Manual `refetch()` | DEFECTIVE — no cache invalidation |
| `crmService.scheduleMeeting()` | Dashboard | `POST /leads/:id/schedule-meeting/` | HTML form required | Manual `scheduling` | `alert()` | Manual `refetch()` | DEFECTIVE — no cache invalidation |
| `crmService.exportLeads()` | Leads | `GET /leads/export/` | None | Manual `isExporting` | `alert()` | None | PARTIAL |
| `useCreateTicket.create()` | Portal | `POST /support/my-tickets/` | None | Manual `isLoading` | Manual error state | None — cache stays stale | DEFECTIVE |
| `useUpdateTicket.update()` | Portal | `PATCH /support/my-tickets/:id/` | None | Manual `isLoading` | Manual error state | None — cache stays stale | DEFECTIVE |
| `useCreateTicket.create()` | Support | `POST /support/my-tickets/` | None | Manual `isLoading` | Manual error state | None | DEFECTIVE |
| `useUpdateAdminTicket.update()` | Support | `PATCH /support/admin/tickets/:id/` | None | Manual `isLoading` | Manual error state | None | DEFECTIVE |
| `useUpdateExecutiveTicket.update()` | Support | `PATCH /support/tickets/:id/` | None | Manual `isLoading` | Manual error state | None | DEFECTIVE |
| `recruitmentService.createJob()` | Jobs | `POST /careers/admin/jobs/` | None | Manual `actionLoading` | Local state update only | None | DEFECTIVE |
| `recruitmentService.toggleJobStatus()` | Jobs | `PATCH /careers/admin/jobs/:id/` | None | Manual `actionLoading` | Local state update only | None | DEFECTIVE |
| `recruitmentService.updateApplicationStage()` | Applications | `PATCH /careers/admin/applications/:id/stage/` | None | Manual `actionLoading` | Local state update only | None | DEFECTIVE |
| `cmsService.createService()` | CMS | `POST /cms/admin/services/` | None | Manual `actionLoading` | Local state update only | None | DEFECTIVE |
| `cmsService.updateService()` | CMS | `PATCH /cms/admin/services/:id/` | None | Manual `actionLoading` | Local state update only | None | DEFECTIVE |
| `cmsService.toggleServiceStatus()` | CMS | `PATCH /cms/admin/services/:id/` | None | Manual `actionLoading` | Local state update only | None | DEFECTIVE |
| `cmsService.deleteService()` | CMS | `DELETE /cms/admin/services/:id/` | None | Manual `actionLoading` | Local state update only | None | DEFECTIVE |
| `bdmService.assignLead()` | BDM | `POST /leads/:id/assign/` | None | None visible | None | None | DEFECTIVE |
| `bdmService.markLeadLost()` | BDM | `POST /leads/:id/lost/` | None | None visible | None | None | DEFECTIVE |

---

## 6. CACHE / INVALIDATION MATRIX

| Mutation | Affected Queries | Required Action | Current Behavior |
|----------|-----------------|----------------|-----------------|
| Create Lead | leads list, leads metrics, bdm dashboard | invalidate all three | invalidateQueries (CRM only) — PARTIAL |
| Update Lead | lead detail, leads list, leads metrics, bdm dashboard | invalidate all four | invalidateQueries + setQueryData — PARTIAL |
| Transition Lead | lead detail, leads list, leads metrics, bdm dashboard | invalidate all four | invalidateQueries — PARTIAL |
| Mark Lead Won | lead detail, leads list, leads metrics, bdm dashboard | invalidate all four | Manual refetch() — DEFECTIVE |
| Mark Lead Lost | lead detail, leads list, leads metrics, bdm dashboard | invalidate all four | Manual refetch() — DEFECTIVE |
| Complete FollowUp | lead detail follow-ups, leads metrics | invalidate both | Manual refetch() — DEFECTIVE |
| Schedule Meeting | lead detail follow-ups, leads metrics | invalidate both | Manual refetch() — DEFECTIVE |
| Create Ticket | portal tickets, support tickets | invalidate both | NONE — DEFECTIVE |
| Update Ticket | portal tickets, support tickets | invalidate both | NONE — DEFECTIVE |
| Create CMS entity | affected CMS list + dashboard | invalidate both | NONE — DEFECTIVE (local state only) |
| Update CMS entity | affected CMS list + dashboard | invalidate both | NONE — DEFECTIVE (local state only) |
| Delete CMS entity | affected CMS list + dashboard | invalidate both | NONE — DEFECTIVE (local state only) |
| Create Job | recruitment jobs, dashboard | invalidate both | NONE — DEFECTIVE (local state only) |
| Update Application Stage | recruitment applications, dashboard | invalidate both | NONE — DEFECTIVE (local state only) |

---

## 7. SEARCH / FILTER / PAGINATION AUDIT

| Page | Search | Filter | Sort | Pagination | Debounce | Page Reset | Status |
|------|--------|--------|------|-----------|----------|------------|--------|
| CRM Leads | SearchInput (debounced 300ms) | status, priority dropdowns | None visible | Server-side (page/page_size) | Yes | Yes (on filter change) | PARTIAL — no sort |
| BDM Leads | Manual search param | status, source | None | Server-side | No debounce | Yes | DEFECTIVE — no debounce |
| CMS Services | None | None | None | None (all loaded) | N/A | N/A | MISSING — no search/filter |
| CMS Case Studies | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| CMS Industries | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| CMS Blog | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| Recruitment Jobs | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| Recruitment Applications | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| Support Tickets | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| Portal Tickets | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| Admin Users | None | None | None | None (all loaded) | N/A | N/A | MISSING |
| Admin Audit Logs | None | None | None | None (all loaded) | N/A | N/A | MISSING |

---

## 8. FORMS / VALIDATION AUDIT

| Form | File | Zod Schema | Client Validation | Server Error Mapping | Loading | Success | Reset | Status |
|------|------|-----------|------------------|---------------------|---------|---------|-------|--------|
| Lead Create | `LeadFormModal.tsx` | `leadSchema` (name, email required) | Yes (Zod) | Yes (`setError` from server errors) | `isLoading` prop | Auto-close + toast | `reset()` after submit | PARTIAL |
| Meeting Schedule | Dashboard inline | None | HTML `required` only | None — uses `alert()` | `scheduling` state | Alert message | Manual field reset | DEFECTIVE |
| Support Ticket Create | Portal/Support pages | NOT INSPECTED | Unknown | Unknown | Unknown | Unknown | Unknown | NOT VERIFIED |
| CMS Content Forms | CMS pages | NOT INSPECTED | Unknown | Unknown | Unknown | Unknown | Unknown | NOT VERIFIED |
| Recruitment Forms | Recruitment pages | NOT INSPECTED | Unknown | Unknown | Unknown | Unknown | Unknown | NOT VERIFIED |

---

## 9. LOADING / ERROR / EMPTY STATE AUDIT

| Page | Loading State | Error State | Empty State | Background Refetch | Status |
|------|-------------|------------|------------|-------------------|--------|
| CRM Dashboard | Skeleton cards (pulse animation) | Custom error card with retry | "No data" text | None (manual refetch button) | PARTIAL |
| CRM Leads | `TableSkeleton` | `QueryErrorBanner` | `EmptyState` component | Spinner in header when fetching | GOOD |
| CMS Dashboard | Custom skeleton | None visible | None visible | None | DEFECTIVE |
| CMS Pages | `isLoading` text | `error` text | None | None | DEFECTIVE |
| Recruitment Dashboard | `isLoading` text | `error` text | None | None | DEFECTIVE |
| BDM Dashboard | `isLoading` text | `error` text | None | None | DEFECTIVE |
| Support Dashboard | NOT INSPECTED | NOT INSPECTED | NOT INSPECTED | NOT INSPECTED | NOT VERIFIED |
| Portal Dashboard | NOT INSPECTED | NOT INSPECTED | NOT INSPECTED | NOT INSPECTED | NOT VERIFIED |

---

## 10. AUTHENTICATION / PERMISSION AUDIT

### Authentication Flow

1. Login via `authService.login()` → `POST /auth/login/`
2. Response: `{ user, access, tokens }` → stored in localStorage
3. Token injected by axios interceptor from `localStorage.getItem("aurexion_token")`
4. User profile stored in localStorage and loaded on app mount

### Issues Found

| Issue | Severity | Evidence |
|-------|----------|----------|
| **401 clears token but doesn't redirect to login** | P1 | `interceptors.ts:45-51` — removes token on 401 but relies on `ProtectedRoute` to redirect |
| **Auth state duplicated** | P1 | `useAuthStore` and `AuthProvider` both manage auth independently |
| **Logout doesn't call queryClient.clear()** | P2 | `AuthProvider.logout()` calls `authService.logout()` but doesn't clear TanStack Query cache. Only `useAuthStore.logout()` does. |
| **Token refresh not implemented** | P2 | `/auth/token/refresh/` endpoint exists but no refresh logic exists in frontend |
| **Role fallback defaults to ADMIN** | P3 | `AuthProvider.tsx:51` — unknown roles default to "ADMIN" instead of restricted access |
| **Missing roles in `role.config.ts`** | P3 | `role.config.ts` only defines ADMIN, BDM, CLIENT, USER — missing SALES_EXECUTIVE, HR_MANAGER, CONTENT_MANAGER, SUPPORT_EXECUTIVE |
| **Frontend permission check is not security boundary** | INFO | AGENTS.md explicitly states RBAC must be server-side. Frontend hiding is acceptable for UX but not security. |

### Protected Routes

| Route Guard | File | Behavior | Status |
|-------------|------|----------|--------|
| `ProtectedRoute` | `routes/ProtectedRoute.tsx` | Redirects to /login if not authenticated | PARTIAL — uses useEffect redirect, not instant |
| `RoleRoute` | `routes/RoleRoute.tsx` | Checks role against allowedRoles, redirects to default dashboard | PARTIAL — useEffect redirect, not instant |

---

## 11. PERFORMANCE AUDIT

| Issue | Severity | Evidence |
|-------|----------|----------|
| **CRM Dashboard fetches ALL leads on every mount** | P1 | `crmService.getDashboardStats()` calls `getLeads()` with `page_size: 500`, then `getAllFollowUps(leads)` which makes N+1 API calls |
| **CRM Activities makes O(N) API calls** | P1 | `getRecentActivities()` fetches ALL leads, then calls `getNotes()` and `getFollowUps()` for top 3 leads |
| **CRM Opportunities, Contacts, Companies all fetch ALL leads** | P1 | Each is a separate function that fetches the full lead list and computes client-side |
| **Duplicate data fetching** | P2 | Dashboard uses `useSalesDashboard()` + `useLeads()` — both fetch leads independently |
| **No code splitting beyond route-level** | P3 | All CRM pages are bundled together since they're imported directly in CrmRoutes (not lazy) |
| **Inline styles instead of Tailwind** | P3 | CRM Dashboard uses extensive inline `style={{}}` instead of Tailwind classes, increasing bundle |
| **No virtualization for large lists** | P3 | Lead tables render all rows without virtualization |
| **Framer Motion loaded but minimal use** | P4 | Dependency loaded for potentially minimal animation use |

---

## 12. ACCESSIBILITY / RESPONSIVE AUDIT

| Area | Status | Evidence |
|------|--------|----------|
| **Semantic HTML** | DEFECTIVE | Dashboard uses `<div>` for layout instead of `<header>`, `<nav>`, `<main>`, `<footer>` |
| **Heading hierarchy** | DEFECTIVE | Inconsistent heading levels in dashboard (h1, h3 mixed without h2) |
| **ARIA labels** | DEFECTIVE | No ARIA labels on interactive elements (modals, buttons, form fields) |
| **Keyboard navigation** | DEFECTIVE | Modal overlay doesn't trap focus; no escape key handling |
| **Focus states** | DEFECTIVE | No visible focus indicators on custom buttons |
| **Color contrast** | PARTIAL | Dark theme uses #63f5e8 (cyan) on #050811 (dark) — likely passes but not verified |
| **Touch targets** | DEFECTIVE | Some action buttons are very small (<44px) |
| **Responsive layout** | PARTIAL | `useIsMobile` hook exists, AdminLayout responds to mobile, but dashboard uses fixed grid |
| **Form labels** | PARTIAL | LeadFormModal uses `<Label>` components; inline forms don't |
| **Screen reader support** | DEFECTIVE | No skip-to-content links, no landmark regions, no live regions for notifications |

---

## 13. DESIGN SYSTEM COMPLIANCE

| Token | Required | Actual | Status |
|-------|----------|--------|--------|
| Primary | #2196F3 | #63f5e8 (cyan-400) | DEFECTIVE — different color |
| Secondary | #14B8A6 | Not consistently used | PARTIAL |
| Accent | #8B5CF6 | Not consistently used | PARTIAL |
| Navy | #0F1830 | #050811 (used as bg) | CLOSE |
| Background | #F8FAFC | Dark theme default (light mode disabled) | DEFECTIVE — no light mode |
| Surface | #FFFFFF | slate-900 | DEFECTIVE — dark-only |
| Text | #0F172A | #f8fafc (light on dark) | DEFECTIVE — dark-only |
| Muted | #64748B | Used via Tailwind | COMPLIANT |
| Border | #E2E8F0 | slate-800 used | PARTIAL |

**Note:** The application is locked to dark theme (`switchable={false}` in App.tsx). The design tokens from the spec assume both light and dark modes. The dark theme implementation uses different color values than specified.

---

## 14. DUPLICATE / DEAD / LEGACY CODE

| Item | File | Issue | Recommendation |
|------|------|-------|---------------|
| `useAuthStore` | `store/useAuthStore.ts` | Duplicates AuthProvider | Remove or consolidate |
| `NotificationContext` | `context/NotificationContext.tsx` | Defined but never provided | Remove or implement |
| `UIContext` | `context/UIContext.tsx` | Defined but never provided | Remove or implement |
| `useUIStore.sidebarOpen` | `store/useUIStore.ts` | Not used — AdminLayout uses local state | Remove or consolidate |
| `useUIStore.theme` | `store/useUIStore.ts` | Not used — ThemeProvider manages theme | Remove |
| `role.config.ts` | `app/config/role.config.ts` | Only 4 roles defined (ADMIN, BDM, CLIENT, USER) — missing 4 actual roles | Expand |
| `constants.MOCK_DELAY_MS` | `utils/constants.ts` | Mock delay constant — no longer used | Remove |
| `constants.STORAGE_KEYS.TOKEN` | `utils/constants.ts` | Value `"aurexion_auth_token"` doesn't match actual key `"aurexion_token"` | Fix or remove |
| `components/loaders/.gitkeep` | Empty directory | Placeholder never populated | Remove |
| `components/modals/.gitkeep` | Empty directory | Placeholder never populated | Remove |
| `components/tables/.gitkeep` | Empty directory | Placeholder never populated | Remove |
| `components/charts/.gitkeep` | Empty directory | Placeholder never populated | Remove |
| `data/` | Empty directory | Placeholder never populated | Remove |
| CRM Dashboard inline modals | `features/crm/pages/Dashboard/index.tsx` | 930-line file with inline modals | Extract to components |
| Duplicate `useLeads` hooks | `features/crm/hooks/useCrm.ts` AND `features/bdm/hooks/useLeads.ts` | Two separate hooks for the same leads API | Consolidate |

---

## 15. RISK REGISTER

| ID | Severity | Area | Problem | Evidence | Impact | Recommendation |
|----|----------|------|---------|----------|--------|---------------|
| FE-001 | P0 | Auth | Auth state duplicated between Zustand and Context | `useAuthStore.ts` + `AuthProvider.tsx` | State inconsistency, token not cleared on logout via AuthProvider | Consolidate to single source |
| FE-002 | P1 | Query | Only CRM uses TanStack Query; all other modules bypass cache | All feature hooks except `useCrmQueries.ts` | No cache, no dedup, no stale-while-revalidate, stale data after mutations | Migrate all hooks to TanStack Query |
| FE-003 | P1 | Query | Dashboard aggregation fetches ALL records client-side | `crmService.getDashboardStats()` | O(N) API calls, poor performance, N+1 pattern | Create backend aggregation endpoints or use cursor-based pagination |
| FE-004 | P1 | Mutation | Portal/Support/CMS/Recruitment mutations don't invalidate queries | `useCreateTicket`, `useUpdateTicket`, etc. | Stale data after mutations, UI inconsistency | Add cache invalidation to all mutations |
| FE-005 | P1 | Cache | `usePortalQuery` reimplements query caching without TanStack | `features/portal/hooks/usePortalQuery.ts` | No cache sharing, no background refetch, no dedup | Replace with TanStack Query |
| FE-006 | P1 | Auth | 401 interceptor clears token but doesn't force redirect | `interceptors.ts:45-51` | User sees old UI state after session expiry | Add queryClient.clear() + redirect on 401 |
| FE-007 | P2 | Performance | CRM Dashboard makes 5+ API calls on mount | `Dashboard/index.tsx:29-30` | Slow initial load, redundant data fetching | Consolidate to single dashboard endpoint |
| FE-008 | P2 | Search | Most list pages have no search/filter/pagination | CMS, Recruitment, Support, Admin pages | Poor UX for large datasets | Add search, filter, pagination |
| FE-009 | P2 | Form | Only LeadFormModal has Zod validation | `LeadFormModal.tsx` | Other forms lack validation | Add validation to all forms |
| FE-010 | P2 | Error | Most pages use `alert()` for errors | Dashboard, CMS, Recruitment | Poor UX | Use Sonner toast for all errors |
| FE-011 | P2 | Loading | Most pages show "Loading data..." text instead of skeletons | CMS, Recruitment, BDM pages | Poor UX | Implement skeleton loading states |
| FE-012 | P3 | A11y | No ARIA labels, no focus trap, no keyboard nav | All pages | WCAG 2.1 AA non-compliant | Add accessibility features |
| FE-013 | P3 | Responsive | Dashboard uses fixed pixel layouts | `Dashboard/index.tsx` inline styles | Breaks on small screens | Use Tailwind responsive classes |
| FE-014 | P3 | Component | 930-line Dashboard component with inline modals | `features/crm/pages/Dashboard/index.tsx` | Unmaintainable, untestable | Extract modals and sections to components |
| FE-015 | P3 | Dead Code | Unused contexts, stores, and placeholder directories | Multiple files | Code confusion | Remove dead code |
| FE-016 | P4 | Design | Dark theme locked, design tokens don't match spec | `App.tsx`, CSS variables | Spec non-compliance | Implement light mode or document deviation |
| FE-017 | P4 | Config | `role.config.ts` only defines 4 of 8 actual roles | `role.config.ts` | Incomplete role definitions | Expand to match actual roles |
| FE-018 | P4 | Auth | Token refresh endpoint exists but not implemented | `endpoints.ts` has `AUTH.REFRESH` | Session expires without refresh | Implement token refresh flow |

---

## 16. 100-POINT COMPLETION SCORE

| Category | Weight | Score | Notes |
|----------|-------:|------:|-------|
| Architecture | 10 | 5 | Good folder structure, but dual state systems, no centralized query layer for most modules |
| State Management | 10 | 3 | Zustand/Context duplication, no unified client state pattern |
| Query/Server State | 15 | 4 | Only CRM uses TanStack Query; 70% of hooks bypass cache entirely |
| Cache & Invalidation | 10 | 2 | Only CRM mutations have cache invalidation; all other modules have zero invalidation |
| Mutations | 10 | 3 | Only 3 mutations use TanStack Query; ~15 mutations use manual state with no cache sync |
| Forms & Validation | 10 | 3 | Only 1 form has Zod validation; others have none or HTML-only validation |
| Loading/Error/Empty UX | 10 | 4 | CRM has decent states; other modules use text-only loading/error |
| Search/Filter/Pagination | 10 | 3 | CRM Leads has search+filter+pagination; 10+ other lists have none |
| Authentication/Permission UX | 5 | 3 | Login works, route guards exist, but duplicated auth state, no token refresh |
| Performance | 5 | 2 | O(N) client-side aggregation, redundant API calls, no virtualization |
| Accessibility/Responsive | 3 | 1 | No ARIA, no focus trap, minimal responsive adaptation |
| Testing | 2 | 0 | No frontend tests found |
| **TOTAL** | **100** | **33** | |

**Current Score: 33 / 100**
**Target: 100 / 100**
**Gap: 67 points**

---

## 17. GAP ANALYSIS

### COMPLETE
- Centralized Axios client with interceptors
- API error handler (ApiError class with status code mapping)
- API endpoints constants
- Route-level code splitting via lazy loading
- Protected routes and role-based routing
- TanStack Query provider with global defaults
- Query key factory (centralized)
- CRM Leads list with TanStack Query (search, filter, pagination, cache invalidation)
- Lead form with Zod validation
- ErrorBoundary at app root
- ThemeProvider
- Debounce hook
- Mobile detection hook

### PARTIAL
- Auth provider (works but duplicated with Zustand store)
- CRM mutations (3 use TanStack Query, but dashboard actions bypass it)
- Portal/Support queries (use custom usePortalQuery, not TanStack Query)
- CRM Dashboard (has loading/error/empty states but fetches ALL leads)
- Loading states (CRM has skeletons; others have text-only)
- Error states (CRM has QueryErrorBanner; others have alert())
- Responsive (AdminLayout responds; pages don't always)

### DEFECTIVE
- Auth state duplication (Zustand + Context)
- Dashboard data aggregation (O(N) API calls client-side)
- Cache invalidation (only CRM mutations have it; ~15 other mutations don't)
- Portal/Support/CMS/Recruitment mutations (no cache invalidation)
- usePortalQuery (reimplements query caching without TanStack benefits)
- Most feature hooks (no cache, no dedup, no stale handling)
- Form validation (only 1 form has Zod)
- Error handling in pages (alert() instead of toast)
- Loading states in most pages (text instead of skeleton)
- Search/filter in most list pages (none)
- Accessibility (no ARIA, no focus management)
- Design system compliance (colors don't match spec)

### MISSING
- Frontend tests (zero test files found)
- Token refresh implementation
- Light theme mode
- Search/filter/pagination for CMS, Recruitment, Support, Admin lists
- Background refetch indicators
- Optimistic updates
- Form validation for all forms
- ARIA labels and keyboard navigation
- Focus trap for modals
- Skeleton loading for all pages
- Sonner toast for all error/success notifications

### NOT VERIFIED
- Support ticket create/update forms (pages not fully inspected)
- CMS content create/edit forms (pages not fully inspected)
- Recruitment application forms (pages not fully inspected)
- Client portal dashboard, projects, documents pages
- Public website pages
- RFP engine pages
- Estimator pages
- Actual responsive behavior at all breakpoints
- Actual color contrast ratios

---

## 18. REFACTORING ROADMAP

### Phase 1 — Architecture Foundation

1. **Consolidate auth state** — Remove `useAuthStore`, keep `AuthProvider` as single source of truth. Add `queryClient.clear()` to `AuthProvider.logout()`.

2. **Remove dead code** — Delete `NotificationContext`, `UIContext`, `useUIStore` (or consolidate sidebar state), empty directories.

3. **Fix `role.config.ts`** — Add all 8 actual roles (ADMIN, BDM, CLIENT, SALES_EXECUTIVE, HR_MANAGER, CONTENT_MANAGER, SUPPORT_EXECUTIVE).

### Phase 2 — API / Query Layer

4. **Migrate all feature hooks to TanStack Query** — Replace every `useState`/`useEffect` data-fetching hook with `useQuery`/`useMutation`. Priority order: CMS → Recruitment → Support → Portal → BDM → Administration.

5. **Replace `usePortalQuery` with TanStack Query** — The custom hook duplicates TanStack Query functionality.

6. **Add query key entries for all modules** — Expand `queryKeys.ts` to include all CMS, Recruitment, Support, Portal, BDM, Admin query keys.

### Phase 3 — Zustand / Client State

7. **Consolidate UI state** — Use `useUIStore` for sidebar and modal state (currently uses local state in AdminLayout).

8. **Remove duplicate auth Zustand store** — After Phase 1 consolidation.

### Phase 4 — Query Cache

9. **Set appropriate staleTime per resource type** — Static content (services, industries) → 5min; Dynamic (leads, tickets) → 30s; Sensitive (user profile) → 60s.

10. **Enable `refetchOnWindowFocus` for critical data** — Dashboard metrics, ticket lists.

11. **Add `keepPreviousData` for paginated lists** — Prevents flicker on page change.

### Phase 5 — Mutations & Invalidation

12. **Add cache invalidation to ALL mutations** — Every CMS, Recruitment, Support, Portal mutation must invalidate affected queries.

13. **Add toast notifications for all mutation results** — Replace `alert()` with Sonner.

14. **Add optimistic updates for critical mutations** — Lead status changes, ticket updates.

### Phase 6 — Forms & Validation

15. **Add Zod schemas for all forms** — CMS create/edit, Recruitment create/edit, Support ticket create.

16. **Add server error mapping to all forms** — Using the existing `setError` pattern from LeadFormModal.

### Phase 7 — Loading/Error/Empty States

17. **Create reusable skeleton components** — Table skeleton, card skeleton, dashboard skeleton.

18. **Implement skeleton loading for all pages** — Replace "Loading data..." text.

19. **Implement ErrorState and EmptyState for all pages** — Using existing `feedback/` components.

### Phase 8 — Search/Filter/Pagination

20. **Add search to CMS list pages** — Services, Case Studies, Industries, Blog.

21. **Add search/filter to Recruitment pages** — Jobs, Applications.

22. **Add search/filter to Support/Admin ticket lists**.

23. **Add pagination to all list views** that currently load all records.

### Phase 9 — Auth/Permissions

24. **Implement token refresh** — Using the existing `/auth/token/refresh/` endpoint.

25. **Clear query cache on 401** — Add `queryClient.clear()` to 401 interceptor.

26. **Add redirect to login on 401** — In the interceptor or via a global effect.

### Phase 10 — Performance

27. **Create backend aggregation endpoints** — Replace client-side dashboard computation.

28. **Remove redundant API calls** — Dashboard should use a single endpoint for all metrics.

29. **Add virtualization for large lists** — Lead table, Ticket lists.

30. **Extract inline styles to Tailwind** — CRM Dashboard is the worst offender.

### Phase 11 — Accessibility/Responsive

31. **Add semantic HTML** — Replace divs with header/nav/main/footer.

32. **Add ARIA labels** — All interactive elements.

33. **Add focus trap to modals** — Using Radix Dialog (already a dependency).

34. **Add skip-to-content link**.

35. **Test and fix responsive behavior** at all breakpoints.

### Phase 12 — Testing

36. **Set up Vitest** — Add to devDependencies.

37. **Write query/mutation tests** — For TanStack Query hooks.

38. **Write form tests** — For all Zod-validated forms.

39. **Write component tests** — For critical shared components.

### Phase 13 — Final Production Gate

40. **Full regression test** — All modules.

41. **Performance audit** — Measure and optimize.

42. **Accessibility audit** — WCAG 2.1 AA compliance check.

43. **Security review** — Frontend security checklist.

---

## 19. NEXT-AGENT IMPLEMENTATION PLAN

### TASK ID: FE-ARCH-001

**Priority:** P0

**Category:** Architecture / State Management

**Requirement:**
Consolidate auth state to a single source of truth and remove dead code.

**Current behavior:**
- `AuthProvider` (React Context) manages auth state via `useState` + `localStorage`
- `useAuthStore` (Zustand) independently manages same auth state via `localStorage`
- Both write to `localStorage` independently with no synchronization
- `AuthProvider.logout()` does NOT clear TanStack Query cache
- `useAuthStore.logout()` DOES clear TanStack Query cache
- `NotificationContext` and `UIContext` are defined but never provided

**Expected behavior:**
- Single auth state source (keep AuthProvider, remove useAuthStore)
- `AuthProvider.logout()` calls `queryClient.clear()`
- Remove `NotificationContext`, `UIContext`
- Remove `useUIStore` or consolidate sidebar/modal state into a single UI store

**Files to modify:**
- `src/app/providers/AuthProvider.tsx` — Add `queryClient.clear()` to logout
- `src/store/useAuthStore.ts` — DELETE
- `src/store/useUIStore.ts` — Consolidate or simplify
- `src/context/NotificationContext.tsx` — DELETE
- `src/context/UIContext.tsx` — DELETE
- `src/layouts/AdminLayout/index.tsx` — Use UIStore for sidebar state

**Dependencies:**
- `src/app/providers/QueryProvider.tsx` — Need to import queryClient

**Implementation approach:**
1. Import `queryClient` into `AuthProvider`
2. Add `queryClient.clear()` to `AuthProvider.logout()`
3. Remove all imports of `useAuthStore` from the codebase
4. Delete `useAuthStore.ts`
5. Delete `NotificationContext.tsx` and `UIContext.tsx`
6. Consolidate UI state into `useUIStore`

**Acceptance criteria:**
- `queryClient.clear()` is called on logout
- No imports of `useAuthStore` remain
- `useAuthStore.ts` is deleted
- `NotificationContext.tsx` and `UIContext.tsx` are deleted
- App compiles and login/logout still works
- No TypeScript errors

**Tests required:**
- Login → Logout → Verify query cache is cleared
- Login → Navigate to protected route → Verify auth state is consistent

**Regression risks:**
- Any component importing `useAuthStore` will break — must find and replace all imports

---

### TASK ID: FE-QUERY-001

**Priority:** P1

**Category:** Query Architecture

**Requirement:**
Replace all manual `useState`/`useEffect` data-fetching hooks with TanStack Query hooks.

**Current behavior:**
- `features/cms/hooks/useCms.ts` — 6 hooks using manual state
- `features/recruitment/hooks/useRecruitment.ts` — 4 hooks using manual state
- `features/bdm/hooks/useBdmDashboard.ts` — Manual state
- `features/bdm/hooks/useLeads.ts` — Manual state
- `features/portal/hooks/usePortalQuery.ts` — Custom query hook (not TanStack)
- `features/support/hooks/` — Mix of usePortalQuery and manual state
- `features/administration/pages/` — Inline service calls

**Expected behavior:**
- All data fetching uses `useQuery` from TanStack Query
- All mutations use `useMutation` from TanStack Query
- All hooks use centralized query keys from `queryKeys.ts`
- Cache invalidation works across all modules

**Files to modify:**
- `src/queries/queryKeys.ts` — Add keys for CMS, Recruitment, Support, Portal, BDM, Admin
- `src/features/cms/hooks/useCms.ts` — Rewrite with useQuery/useMutation
- `src/features/recruitment/hooks/useRecruitment.ts` — Rewrite with useQuery/useMutation
- `src/features/bdm/hooks/useBdmDashboard.ts` — Rewrite with useQuery
- `src/features/bdm/hooks/useLeads.ts` — Rewrite with useQuery
- `src/features/portal/hooks/usePortalQuery.ts` — DELETE (replace with TanStack)
- `src/features/portal/hooks/useMyTickets.ts` — Rewrite with useQuery
- `src/features/portal/hooks/useCreateTicket.ts` — Rewrite with useMutation
- `src/features/portal/hooks/useUpdateTicket.ts` — Rewrite with useMutation
- `src/features/portal/hooks/useProfile.ts` — Rewrite with useQuery
- `src/features/support/hooks/*.ts` — Rewrite all with useQuery/useMutation

**Dependencies:**
- FE-ARCH-001 (auth consolidation)

**Implementation approach:**
1. Expand `queryKeys.ts` with all module keys
2. Rewrite each feature hook file one module at a time
3. Add cache invalidation to each mutation
4. Update page components to use new hooks
5. Remove `usePortalQuery.ts`

**Acceptance criteria:**
- All feature hooks use `useQuery` or `useMutation`
- No `useState`/`useEffect` for data fetching remains
- All mutations invalidate affected queries
- `usePortalQuery.ts` is deleted
- All pages still render and function correctly

**Tests required:**
- Each module loads data correctly
- Mutations invalidate and refetch correct queries
- No TypeScript errors

**Regression risks:**
- Every page component that uses the old hooks will need import updates
- Query key changes may affect cache behavior during transition

---

### TASK ID: FE-MUTATION-001

**Priority:** P1

**Category:** Cache Invalidation

**Requirement:**
Add cache invalidation to all mutations across all modules.

**Current behavior:**
- CMS mutations (create/update/toggle/delete) update local state only
- Recruitment mutations update local state only
- Support ticket mutations don't invalidate queries
- Portal ticket mutations don't invalidate queries
- CRM Dashboard actions (mark won/lost, complete followup, schedule meeting) use manual refetch

**Expected behavior:**
- Every mutation invalidates all affected queries
- Dashboard actions use TanStack Query mutations
- Toast notifications replace `alert()` calls

**Files to modify:**
- All feature hook files with mutations
- `src/features/crm/pages/Dashboard/index.tsx` — Replace service calls with mutations

**Dependencies:**
- FE-QUERY-001 (TanStack Query migration)

**Implementation approach:**
1. Add `useMutation` wrappers for each service function
2. Add `onSuccess` handlers that call `queryClient.invalidateQueries()`
3. Replace `alert()` with `toast.success()` / `toast.error()`
4. Replace inline service calls in Dashboard with mutation hooks

**Acceptance criteria:**
- After creating a CMS entity, the list auto-refreshes
- After updating a ticket, the list and detail auto-refresh
- After marking a lead won/lost, dashboard metrics update
- No `alert()` calls remain for mutation results
- No stale data after any mutation

**Tests required:**
- Create → List shows new item
- Update → Detail shows updated data
- Delete → List item removed
- Error → Toast shown, data unchanged

**Regression risks:**
- Over-invalidation may cause unnecessary refetches
- Need to verify each mutation's affected query set

---

### TASK ID: FE-PERF-001

**Priority:** P1

**Category:** Performance

**Requirement:**
Replace client-side dashboard aggregation with efficient data fetching.

**Current behavior:**
- `crmService.getDashboardStats()` fetches ALL leads (page_size: 500), then makes N+1 API calls for follow-ups and activities
- `crmService.getRecentActivities()` fetches ALL leads, then calls notes/follow-ups for top 3
- `crmService.getOpportunities()` fetches ALL leads and filters client-side
- `crmService.getContacts()` fetches ALL leads and maps client-side
- `crmService.getCompanies()` fetches ALL leads and aggregates client-side

**Expected behavior:**
- Dashboard metrics come from a single backend endpoint (BACKEND DEPENDENCY)
- OR: If backend cannot be changed, use a single aggregated query that caches the full lead list and computes derived data from cache

**Files to modify:**
- `src/features/crm/services/crmService.ts` — Optimize aggregation functions
- `src/features/crm/hooks/useCrm.ts` — Remove redundant hooks after TanStack migration

**Dependencies:**
- FE-QUERY-001 (TanStack Query migration)
- BACKEND: New `/leads/dashboard-stats/` endpoint (理想情况)

**Implementation approach:**
1. Create a single `useDashboardData` hook that fetches leads once and derives all metrics
2. Cache the lead list query so derived data doesn't trigger separate fetches
3. Remove individual aggregation functions that make duplicate API calls

**Acceptance criteria:**
- Dashboard makes at most 2-3 API calls (leads, follow-ups, activities)
- No N+1 API call patterns
- Dashboard loads in < 3 seconds

**Tests required:**
- Dashboard loads with correct metrics
- No duplicate API calls in network tab

**Regression risks:**
- May change dashboard data freshness behavior
- Need to verify derived data accuracy

---

### TASK ID: FE-FORM-001

**Priority:** P2

**Category:** Forms & Validation

**Requirement:**
Add Zod validation and server error mapping to all production forms.

**Current behavior:**
- `LeadFormModal` has Zod schema and server error mapping
- Other forms (CMS, Recruitment, Support) have no or minimal validation
- Error handling uses `alert()` in most places

**Expected behavior:**
- All forms have Zod schemas with appropriate field validation
- Server validation errors map to field-level errors
- Loading states on submit buttons
- Success toasts via Sonner

**Files to modify/create:**
- Create Zod schemas for each form
- Update form components to use `zodResolver`
- Add server error mapping

**Dependencies:**
- FE-QUERY-001 (for mutation loading states)

**Implementation approach:**
1. Create shared validation schemas in `src/utils/validators.ts` or per-feature
2. Update each form component
3. Replace `alert()` with toast

**Acceptance criteria:**
- All required fields validated client-side
- Server errors display as field-level messages
- Submit buttons show loading during mutation
- Success/failure toasts shown

**Tests required:**
- Submit empty form → validation errors shown
- Submit invalid data → validation errors shown
- Submit valid data → success toast, form reset
- Server returns 400 → field errors displayed

**Regression risks:**
- Over-strict validation may block valid submissions
- Need to match backend validation rules

---

### TASK ID: FE-UX-001

**Priority:** P2

**Category:** Loading/Error/Empty States

**Requirement:**
Implement consistent loading, error, and empty states across all pages.

**Current behavior:**
- CRM Leads has good states (TableSkeleton, QueryErrorBanner, EmptyState)
- Most other pages show "Loading data..." text or nothing
- Error handling uses `alert()` or inline error text

**Expected behavior:**
- All list pages show skeleton loading
- All pages show ErrorState component on failure
- All pages show EmptyState when no data
- Background refetch indicators for cached data

**Files to modify:**
- All page components in features/

**Dependencies:**
- FE-QUERY-001 (TanStack Query for isFetching indicator)

**Implementation approach:**
1. Use existing `LoadingState`, `ErrorState`, `EmptyState` components from `feedback/`
2. Add skeleton variants for different layouts
3. Add isFetching indicators for background refetch

**Acceptance criteria:**
- Every data-fetching page has loading, error, and empty states
- Loading states use skeletons, not spinners (for initial load)
- Background refetch shows subtle indicator, not full-page spinner

**Tests required:**
- Loading state visible during fetch
- Error state visible on failure
- Empty state visible when no data
- Background refetch shows indicator

**Regression risks:**
- Skeleton dimensions may not match actual content
- Need to test at various data states

---

### TASK ID: FE-SEARCH-001

**Priority:** P2

**Category:** Search / Filter / Pagination

**Requirement:**
Add search, filter, and pagination to all list views.

**Current behavior:**
- CRM Leads has search + filter + pagination
- All other list pages load all records with no search/filter/pagination

**Expected behavior:**
- All list views support search (debounced)
- All list views support relevant filters
- All list views support pagination (server-side or client-side for small datasets)

**Files to modify:**
- All list/table page components
- All service files (add query parameters)

**Dependencies:**
- FE-QUERY-001 (TanStack Query)
- BACKEND: All list endpoints must support search/filter/pagination params (NOT VERIFIED if all do)

**Implementation approach:**
1. Add SearchInput component to each list page
2. Add filter dropdowns where relevant
3. Add pagination component
4. Sync state to query keys

**Acceptance criteria:**
- Search filters results in real-time (debounced)
- Filters narrow results correctly
- Pagination works with correct total count
- Page resets when search/filter changes

**Tests required:**
- Search filters results
- Filter narrows results
- Pagination navigates correctly
- Reset clears all filters

**Regression risks:**
- Backend endpoints may not support all filter params
- Client-side pagination for small datasets is acceptable

---

## 20. FILE-LEVEL CHANGE PLAN

### MODIFY

| File | Reason | Changes |
|------|--------|---------|
| `src/app/providers/AuthProvider.tsx` | Add queryClient.clear() to logout | Import queryClient, add clear() call |
| `src/queries/queryKeys.ts` | Expand for all modules | Add CMS, Recruitment, Support, Portal, BDM, Admin keys |
| `src/features/cms/hooks/useCms.ts` | Migrate to TanStack Query | Rewrite all 6 hooks with useQuery/useMutation |
| `src/features/recruitment/hooks/useRecruitment.ts` | Migrate to TanStack Query | Rewrite all 4 hooks with useQuery/useMutation |
| `src/features/bdm/hooks/useBdmDashboard.ts` | Migrate to TanStack Query | Rewrite with useQuery |
| `src/features/bdm/hooks/useLeads.ts` | Migrate to TanStack Query | Rewrite with useQuery |
| `src/features/portal/hooks/useMyTickets.ts` | Migrate to TanStack Query | Rewrite with useQuery |
| `src/features/portal/hooks/useCreateTicket.ts` | Migrate to TanStack Query | Rewrite with useMutation + invalidation |
| `src/features/portal/hooks/useUpdateTicket.ts` | Migrate to TanStack Query | Rewrite with useMutation + invalidation |
| `src/features/portal/hooks/useProfile.ts` | Migrate to TanStack Query | Rewrite with useQuery |
| `src/features/support/hooks/useAdminTickets.ts` | Migrate to TanStack Query | Rewrite with useQuery |
| `src/features/support/hooks/useExecutiveTickets.ts` | Migrate to TanStack Query | Rewrite with useQuery |
| `src/features/support/hooks/useUpdateAdminTicket.ts` | Migrate to TanStack Query | Rewrite with useMutation + invalidation |
| `src/features/support/hooks/useUpdateExecutiveTicket.ts` | Migrate to TanStack Query | Rewrite with useMutation + invalidation |
| `src/features/crm/pages/Dashboard/index.tsx` | Refactor oversized component | Extract modals, replace service calls with mutations |
| `src/features/crm/services/crmService.ts` | Optimize aggregation | Remove N+1 patterns, cache lead list |
| `src/app/config/role.config.ts` | Add missing roles | Add SALES_EXECUTIVE, HR_MANAGER, CONTENT_MANAGER, SUPPORT_EXECUTIVE |
| `src/layouts/AdminLayout/index.tsx` | Use UIStore for sidebar | Replace local useState with useUIStore |
| `src/utils/constants.ts` | Fix storage key constant | Update STORAGE_KEYS.TOKEN to match actual key |

### CREATE

| File | Purpose | Responsibilities |
|------|---------|-----------------|
| `src/queries/useCmsQueries.ts` | TanStack Query hooks for CMS | All CMS queries and mutations with cache invalidation |
| `src/queries/useRecruitmentQueries.ts` | TanStack Query hooks for Recruitment | All Recruitment queries and mutations |
| `src/queries/useSupportQueries.ts` | TanStack Query hooks for Support | All Support queries and mutations |
| `src/queries/usePortalQueries.ts` | TanStack Query hooks for Portal | All Portal queries and mutations |
| `src/queries/useBdmQueries.ts` | TanStack Query hooks for BDM | All BDM queries and mutations |
| `src/queries/useAdminQueries.ts` | TanStack Query hooks for Admin | All Admin queries and mutations |
| `src/components/feedback/SkeletonCard.tsx` | Reusable card skeleton | Loading placeholder for dashboard cards |
| `src/components/feedback/SkeletonTable.tsx` | Reusable table skeleton | Already exists as TableSkeleton — verify usage |
| `src/components/common/ConfirmDialog.tsx` | Replace window.confirm | Accessible confirmation dialog |

### DELETE

| File | Reason | Replacement |
|------|--------|-------------|
| `src/store/useAuthStore.ts` | Duplicates AuthProvider | AuthProvider |
| `src/context/NotificationContext.tsx` | Dead code (no provider) | Sonner toasts |
| `src/context/UIContext.tsx` | Dead code (no provider) | useUIStore |
| `src/features/portal/hooks/usePortalQuery.ts` | Reimplements TanStack Query | TanStack Query useQuery |
| `src/components/loaders/.gitkeep` | Empty placeholder | N/A |
| `src/components/modals/.gitkeep` | Empty placeholder | N/A |
| `src/components/tables/.gitkeep` | Empty placeholder | N/A |
| `src/components/charts/.gitkeep` | Empty placeholder | N/A |

---

## FINAL PRODUCTION GATE

```
========================================
AUREXION FRONTEND PRODUCTION GATE
========================================

Current Score: 33 / 100

Production Status: NOT READY

Critical Issues: 2
High Issues: 6
Medium Issues: 6
Low Issues: 4

Queries: FAIL
Mutations: FAIL
Cache: FAIL
Invalidation: FAIL
Zustand: FAIL
Forms: FAIL
Search: FAIL
Filtering: FAIL
Pagination: FAIL
Loading States: FAIL
Error States: FAIL
Authentication: FAIL
Responsive: FAIL
Accessibility: FAIL
Performance: FAIL
Testing: FAIL

100% Completion: NO
```

**NEXT AGENT SHOULD START WITH:**

**TASK ID:** FE-ARCH-001
**TASK NAME:** Consolidate Auth State & Remove Dead Code
**Priority:** P0
**FILES:** `src/app/providers/AuthProvider.tsx`, `src/store/useAuthStore.ts`, `src/context/NotificationContext.tsx`, `src/context/UIContext.tsx`, `src/store/useUIStore.ts`, `src/layouts/AdminLayout/index.tsx`
**DEPENDENCIES:** None
**ACCEPTANCE CRITERIA:**
- `queryClient.clear()` called on logout
- `useAuthStore.ts` deleted
- `NotificationContext.tsx` deleted
- `UIContext.tsx` deleted
- All imports updated
- App compiles and login/logout works
- No TypeScript errors
