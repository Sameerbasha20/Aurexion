# Endpoint Performance Test Report

- **Date:** 2026-08-12 15:25:05 UTC
- **Target Limit:** < 500 ms (p95 response time)
- **Iterations:** 50 runs per endpoint

## Performance Metrics Table

| Endpoint | Method | Average Latency | p95 Latency | Min | Max | Status |
|---|---|---|---|---|---|---|
| Login (POST /api/v1/auth/login/) | POST | 179.11 ms | 183.37 ms | 174.26 ms | 183.75 ms | **PASS** |
| Me (GET /api/v1/auth/me/) | GET | 1.03 ms | 2.27 ms | 0.61 ms | 2.57 ms | **PASS** |
| User List (GET /api/v1/users/) | GET | 64.11 ms | 67.60 ms | 59.68 ms | 67.88 ms | **PASS** |
| Audit Log List (GET /api/v1/audit-logs/) | GET | 76.22 ms | 84.18 ms | 66.78 ms | 136.01 ms | **PASS** |

## Summary Findings

> [!NOTE]
> **All endpoints are fully compliant!** The response times are well under the 500ms threshold specified in the AGENTS.md execution guidelines.
