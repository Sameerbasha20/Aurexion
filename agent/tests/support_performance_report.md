# Support Module Performance Report

- **Date:** 2026-08-17 13:09:46 UTC
- **Backend:** PostgreSQL (sqlite)
- **Target:** average response < 500 ms
- **Iterations:** 50 per endpoint
- **N+1 check:** {1: 2, 5: 2, 15: 2}

| Endpoint | Avg | Min | Max | P50 | P95 | P99 | DB time avg | Query avg | Result |
|---|---|---|---|---|---|---|---|---|---|
| POST /api/v1/tickets/ | 11.87 ms | 9.99 ms | 16.39 ms | 11.52 ms | 15.32 ms | 16.35 ms | 2.12 ms | 4.0 | **PASS** |
| GET /api/v1/tickets/ | 9.47 ms | 6.48 ms | 22.42 ms | 8.73 ms | 13.75 ms | 19.11 ms | 0.00 ms | 2.0 | **PASS** |
| GET /api/v1/tickets/{id}/ | 5.18 ms | 2.87 ms | 8.76 ms | 4.79 ms | 8.21 ms | 8.61 ms | 0.02 ms | 2.0 | **PASS** |
| PATCH /api/v1/tickets/{id}/ | 12.75 ms | 9.63 ms | 19.63 ms | 11.69 ms | 18.40 ms | 19.53 ms | 4.72 ms | 4.0 | **PASS** |

**Overall: PASS**
