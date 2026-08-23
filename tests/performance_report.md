# Endpoint Performance Test Report

- **Date:** 2026-08-23 21:08:56 UTC
- **Target Limit:** < 500 ms (p95 response time)
- **Iterations:** 20 runs per endpoint

## Performance Metrics Table

| Endpoint | Method | Average Latency | p95 Latency | Min | Max | Status |
|---|---|---|---|---|---|---|
| Login (POST /api/v1/auth/login/) | POST | 268.27 ms | 302.23 ms | 247.21 ms | 302.99 ms | **PASS** |
| Me (GET /api/v1/auth/me/) | GET | 0.87 ms | 1.18 ms | 0.73 ms | 1.18 ms | **PASS** |
| User List (GET /api/v1/users/) | GET | 179.18 ms | 201.90 ms | 166.16 ms | 202.39 ms | **PASS** |
| Audit Log List (GET /api/v1/audit-logs/) | GET | 185.69 ms | 207.95 ms | 165.35 ms | 208.28 ms | **PASS** |
| Role List (GET /api/v1/roles/) | GET | 255.51 ms | 288.41 ms | 230.03 ms | 288.43 ms | **PASS** |
| CMS Service Detail (GET /api/v1/cms/public/services/perf-service/) | GET | 89.37 ms | 101.58 ms | 82.54 ms | 101.84 ms | **PASS** |
| CMS Industry Detail (GET /api/v1/cms/public/industries/perf-industry/) | GET | 261.43 ms | 295.72 ms | 247.84 ms | 295.72 ms | **PASS** |
| CMS Case Study List (GET /api/v1/cms/public/case-studies/) | GET | 90.09 ms | 96.44 ms | 85.69 ms | 96.45 ms | **PASS** |
| CMS Blog List (GET /api/v1/cms/public/blog/) | GET | 1.12 ms | 1.87 ms | 0.86 ms | 1.89 ms | **PASS** |

## Summary Findings

> [!NOTE]
> **All endpoints are fully compliant!** The response times are well under the 500ms threshold specified in the AGENTS.md execution guidelines.
