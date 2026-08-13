# Endpoint Performance Test Report

- **Date:** 2026-08-13 15:30:33 UTC
- **Target Limit:** < 500 ms (p95 response time)
- **Iterations:** 50 runs per endpoint

## Performance Metrics Table

| Endpoint | Method | Average Latency | p95 Latency | Min | Max | Status |
|---|---|---|---|---|---|---|
| Login (POST /api/v1/auth/login/) | POST | 22.58 ms | 32.34 ms | 19.56 ms | 46.49 ms | **PASS** |
| Me (GET /api/v1/auth/me/) | GET | 0.77 ms | 1.42 ms | 0.61 ms | 1.71 ms | **PASS** |
| User List (GET /api/v1/users/) | GET | 3.71 ms | 5.42 ms | 2.51 ms | 27.90 ms | **PASS** |
| Audit Log List (GET /api/v1/audit-logs/) | GET | 21.46 ms | 23.78 ms | 19.95 ms | 25.62 ms | **PASS** |
| Role List (GET /api/v1/roles/) | GET | 3.91 ms | 5.20 ms | 3.12 ms | 5.41 ms | **PASS** |
| CMS Service Detail (GET /api/v1/cms/public/services/perf-service/) | GET | 1.27 ms | 2.39 ms | 0.95 ms | 3.03 ms | **PASS** |
| CMS Industry Detail (GET /api/v1/cms/public/industries/perf-industry/) | GET | 1.78 ms | 1.79 ms | 0.94 ms | 34.90 ms | **PASS** |
| CMS Case Study List (GET /api/v1/cms/public/case-studies/) | GET | 1.50 ms | 2.30 ms | 1.24 ms | 3.04 ms | **PASS** |
| CMS Blog List (GET /api/v1/cms/public/blog/) | GET | 1.34 ms | 1.60 ms | 1.26 ms | 1.70 ms | **PASS** |

## Summary Findings

> [!NOTE]
> **All endpoints are fully compliant!** The response times are well under the 500ms threshold specified in the AGENTS.md execution guidelines.
