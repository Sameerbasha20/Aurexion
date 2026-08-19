# Endpoint Performance Test Report

- **Date:** 2026-08-17 13:09:26 UTC
- **Target Limit:** < 500 ms (p95 response time)
- **Iterations:** 50 runs per endpoint

## Performance Metrics Table

| Endpoint | Method | Average Latency | p95 Latency | Min | Max | Status |
|---|---|---|---|---|---|---|
| Login (POST /api/v1/auth/login/) | POST | 8.39 ms | 10.63 ms | 5.74 ms | 36.28 ms | **PASS** |
| Me (GET /api/v1/auth/me/) | GET | 0.71 ms | 1.17 ms | 0.54 ms | 1.48 ms | **PASS** |
| User List (GET /api/v1/users/) | GET | 2.97 ms | 4.94 ms | 2.10 ms | 6.10 ms | **PASS** |
| Audit Log List (GET /api/v1/audit-logs/) | GET | 7.57 ms | 12.70 ms | 4.65 ms | 13.79 ms | **PASS** |
| Role List (GET /api/v1/roles/) | GET | 1.14 ms | 1.76 ms | 0.86 ms | 2.13 ms | **PASS** |
| CMS Service Detail (GET /api/v1/cms/public/services/perf-service/) | GET | 1.33 ms | 2.06 ms | 0.96 ms | 2.55 ms | **PASS** |
| CMS Industry Detail (GET /api/v1/cms/public/industries/perf-industry/) | GET | 1.28 ms | 2.04 ms | 0.97 ms | 2.41 ms | **PASS** |
| CMS Case Study List (GET /api/v1/cms/public/case-studies/) | GET | 1.67 ms | 3.04 ms | 1.27 ms | 4.60 ms | **PASS** |
| CMS Blog List (GET /api/v1/cms/public/blog/) | GET | 2.90 ms | 3.86 ms | 1.27 ms | 48.13 ms | **PASS** |

## Summary Findings

> [!NOTE]
> **All endpoints are fully compliant!** The response times are well under the 500ms threshold specified in the AGENTS.md execution guidelines.
