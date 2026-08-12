# Endpoint Performance Test Report

- **Date:** 2026-08-12 17:24:59 UTC
- **Target Limit:** < 500 ms (p95 response time)
- **Iterations:** 50 runs per endpoint

## Performance Metrics Table

| Endpoint | Method | Average Latency | p95 Latency | Min | Max | Status |
|---|---|---|---|---|---|---|
| Login (POST /api/v1/auth/login/) | POST | 27.45 ms | 62.45 ms | 17.96 ms | 80.07 ms | **PASS** |
| Me (GET /api/v1/auth/me/) | GET | 0.66 ms | 0.89 ms | 0.59 ms | 1.38 ms | **PASS** |
| User List (GET /api/v1/users/) | GET | 2.81 ms | 4.02 ms | 2.39 ms | 5.11 ms | **PASS** |
| Audit Log List (GET /api/v1/audit-logs/) | GET | 8.99 ms | 14.03 ms | 6.41 ms | 31.33 ms | **PASS** |

## Summary Findings

> [!NOTE]
> **All endpoints are fully compliant!** The response times are well under the 500ms threshold specified in the AGENTS.md execution guidelines.
